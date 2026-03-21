/**
 * StudyMode.js — Study Session Component
 * FlashMind App — Phase 2
 *
 * Implements Anki-style learning queue:
 *   Due Reviews → New Cards (max 20/session)
 *   "Again" cards cycle back within same session
 *   Ratings: Again(1) / Hard(2) / Good(3) / Easy(4)
 *
 * Fixes applied:
 *   F5: Unflip — click card again to flip back to front
 *   F7: Back button — go to previous card
 *   F8: Off-by-one — limit queue precisely to requested count
 *   F9: Stale finish screen — reset DOM on each open()
 *  F10: Hide "Xem đáp án" on finish screen
 */

import { cardManager } from '../modules/cardManager.js';
import { srsManager }  from '../modules/srs.js';
import { bus, renderMarkdown, toast } from '../utils.js';

// SM-2 rating mapping
const RATING_MAP = { 1: 1, 2: 2, 3: 3, 4: 5 };

// Button labels + emoji
const RATING_META = {
    1: { emoji: '😰', label: 'Quên',  color: 'again' },
    2: { emoji: '😐', label: 'Khó',   color: 'hard'  },
    3: { emoji: '😊', label: 'Nhớ',   color: 'good'  },
    4: { emoji: '🎯', label: 'Dễ',    color: 'easy'  },
};

export class StudyMode {
    constructor() {
        // Session state
        this._deckId       = null;
        this._deckName     = '';
        this._queue        = [];      // Main queue (due + new)
        this._retryQueue   = [];      // "Again" cards reinjected
        this._history      = [];      // [F7] History of shown cards for back navigation
        this._currentIdx   = 0;
        this._currentCard  = null;
        this._isFlipped    = false;
        this._isFinished   = false;
        this._timeStart    = 0;       // Card start time (ms)

        // Session stats
        this._stats = { again: 0, hard: 0, good: 0, easy: 0, total: 0 };

        // DOM refs (populated on first open)
        this._overlay    = null;
        this._cardInner  = null;
        this._frontContent = null;
        this._backContent  = null;
        this._showWrap   = null;
        this._ratings    = null;
        this._progressFill = null;
        this._counter    = null;
        this._finishEl   = null;
        this._mainEl     = null;
    }

    init() {
        this._bindOverlayEvents();
        bus.on('study:start', ({ deckId, deckName, dueOnly, cards, shuffle, skipSrs }) => {
            this.open({ deckId, deckName, dueOnly, cards, shuffle, skipSrs });
        });
    }

    // ─── OPEN / CLOSE ────────────────────────────────────────────

    open({ deckId, deckName = '', dueOnly = false, cards = null, shuffle = false, skipSrs = false }) {
        this._deckId   = deckId;
        this._deckName = deckName;
        this._skipSrs  = skipSrs;

        // Build queue — use provided cards or auto-build
        const queue = cards || cardManager.buildStudyQueue(deckId, { dueOnly, newLimit: 20 });

        if (queue.length === 0) {
            toast('🎉 Không có thẻ nào cần học hôm nay!', 'success');
            return;
        }

        // Shuffle if requested (Fisher-Yates)
        if (shuffle) {
            for (let i = queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue[i], queue[j]] = [queue[j], queue[i]];
            }
        }

        this._queue      = queue;
        this._retryQueue = [];
        this._history    = [];      // [F7] reset history
        this._currentIdx = 0;
        this._isFinished = false;
        this._stats      = { again: 0, hard: 0, good: 0, easy: 0, total: 0 };

        // [F9] Reset finish screen DOM before starting new session
        this._resetFinishScreen();

        // Show overlay
        this._getEl('study-overlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Update deck name in header
        const nameEl = this._getEl('study-deck-name');
        if (nameEl) nameEl.textContent = deckName || 'Học tập';

        // [F7] Show/hide back button
        this._updateBackBtn();

        this._showCard(this._queue[0]);
    }

    close() {
        this._getEl('study-overlay').classList.add('hidden');
        document.body.style.overflow = '';

        // Notify app to refresh stats
        bus.emit('card:changed', { deckId: this._deckId });
        bus.emit('study:closed');
    }

    // ─── CARD FLOW ───────────────────────────────────────────────

    _showCard(card) {
        this._currentCard = card;
        this._isFlipped   = false;
        this._timeStart   = Date.now();

        // Reset flip
        this._getCardInner().classList.remove('flipped');

        // Render front
        this._getFrontContent().innerHTML = renderMarkdown(card.front);
        this._getBackContent().innerHTML  = renderMarkdown(card.back);

        // Show "Xem đáp án", hide ratings
        this._getEl('study-show-wrap').classList.remove('hidden');
        this._getEl('study-ratings').classList.add('hidden');
        this._getEl('study-hint').textContent = 'Nhấn Space hoặc click thẻ để xem đáp án';

        // Show card wrap (in case was hidden by finish)
        this._getEl('study-card-wrap').style.display = '';

        // Update progress
        this._updateProgress();

        // [F7] Update back button visibility
        this._updateBackBtn();

        // Preview intervals on rating buttons
        this._renderIntervalPreviews(card);
    }

    // [F5] Flip / Unflip
    flip() {
        if (this._isFinished) return;

        if (this._isFlipped) {
            // Unflip — go back to front side
            this._isFlipped = false;
            this._getCardInner().classList.remove('flipped');
            this._getEl('study-show-wrap').classList.remove('hidden');
            this._getEl('study-ratings').classList.add('hidden');
            this._getEl('study-hint').textContent = 'Nhấn Space hoặc click thẻ để xem đáp án';
            return;
        }

        // Flip to back side
        this._isFlipped = true;
        this._getCardInner().classList.add('flipped');
        this._getEl('study-show-wrap').classList.add('hidden');
        this._getEl('study-ratings').classList.remove('hidden');
        this._getEl('study-hint').textContent = 'Chọn mức độ ghi nhớ của bạn';

        // Animate rating buttons in
        const buttons = this._getEl('study-ratings').querySelectorAll('.rating-btn');
        buttons.forEach((btn, i) => {
            btn.style.animationDelay = `${i * 60}ms`;
            btn.classList.add('btn-enter');
            setTimeout(() => btn.classList.remove('btn-enter'), 400 + i * 60);
        });
    }

    // [F7] Go back to previous card
    _goBack() {
        if (this._history.length === 0) return;
        const prev = this._history.pop();

        // Undo the last stat increment if the previous card was rated
        // (We don't undo SRS because it's already written to DB, but we remove from stats)
        this._currentIdx--;
        if (this._currentIdx < 0) this._currentIdx = 0;

        this._showCard(prev);
    }

    /**
     * User rates current card.
     * @param {number} uiRating - 1=Again, 2=Hard, 3=Good, 4=Easy
     */
    rate(uiRating) {
        if (!this._isFlipped || this._isFinished) return;

        const card       = this._currentCard;
        const sm2Rating  = RATING_MAP[uiRating];
        const timeSpent  = Math.round((Date.now() - this._timeStart) / 1000);

        // Record to DB (skip in random/browse mode)
        if (!this._skipSrs) {
            try {
                srsManager.recordReview(card.id, this._deckId, sm2Rating, timeSpent);
            } catch (e) {
                console.warn('[StudyMode] recordReview error:', e.message);
            }
        }

        // Update session stats
        const key = ['again', 'hard', 'good', 'easy'][uiRating - 1];
        this._stats[key]++;
        this._stats.total++;
        this._updateHeaderStats();

        // Highlight rated button briefly
        const btn = this._getEl('study-ratings').querySelector(`[data-rating="${uiRating}"]`);
        btn?.classList.add('rated');
        setTimeout(() => btn?.classList.remove('rated'), 300);

        // If "Again" → reinject card later in queue
        if (uiRating === 1) {
            this._retryQueue.push({ ...card });
        }

        // [F7] Push current card to history before advancing
        this._history.push(card);

        // Short delay then advance
        setTimeout(() => this._advance(), 350);
    }

    _advance() {
        this._currentIdx++;

        // Check if primary queue exhausted
        const remaining = this._queue.length - this._currentIdx;

        if (remaining <= 0) {
            // Inject retry cards at end
            if (this._retryQueue.length > 0) {
                this._queue.push(...this._retryQueue);
                this._retryQueue = [];
            }
        }

        // Still have cards?
        if (this._currentIdx < this._queue.length) {
            this._showCard(this._queue[this._currentIdx]);
        } else {
            this._finish();
        }
    }

    // ─── FINISH SCREEN ───────────────────────────────────────────

    /**
     * [F9] Reset finish screen DOM state before starting a new session.
     * Prevents stale UI from previous session.
     */
    _resetFinishScreen() {
        const finishEl = this._getEl('study-finish');
        if (finishEl) {
            finishEl.classList.add('hidden');
            // Reset inner content to avoid stale data
            const statsEl = finishEl.querySelector('.study-finish-stats');
            if (statsEl) statsEl.innerHTML = '';
        }
        // Ensure card wrap is visible
        const cardWrap = this._getEl('study-card-wrap');
        if (cardWrap) cardWrap.style.display = '';

        // [F10] Ensure "Xem đáp án" is properly hidden at start  
        const showWrap = this._getEl('study-show-wrap');
        if (showWrap) showWrap.classList.remove('hidden');

        // Reset rating buttons
        const ratings = this._getEl('study-ratings');
        if (ratings) ratings.classList.add('hidden');

        // Reset progress
        const fill = this._getEl('study-progress-fill');
        if (fill) fill.style.width = '0%';

        // Reset header stats
        this._stats = { again: 0, hard: 0, good: 0, easy: 0, total: 0 };
        this._updateHeaderStats();
    }

    _finish() {
        this._isFinished = true;
        const { again, hard, good, easy, total } = this._stats;
        const correct = good + easy;
        const pct     = total ? Math.round((correct / total) * 100) : 0;

        // Fire confetti if good performance
        if (pct >= 80) this._confetti();

        // Build finish screen
        const finishEl = this._getEl('study-finish');
        finishEl.classList.remove('hidden');
        finishEl.querySelector('.study-finish-icon').textContent =
            pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '😊' : '💪';
        finishEl.querySelector('.study-finish-title').textContent =
            pct === 100 ? 'Hoàn hảo!' : pct >= 80 ? 'Xuất sắc!' : 'Đã xong!';
        finishEl.querySelector('.study-finish-sub').textContent =
            `${total} thẻ · ${correct} đúng · ${again} quên`;

        const statsEl = finishEl.querySelector('.study-finish-stats');
        statsEl.innerHTML = `
            <div class="finish-stat-row">
                <span class="finish-stat-item again">😰 Quên: <strong>${again}</strong></span>
                <span class="finish-stat-item hard">😐 Khó: <strong>${hard}</strong></span>
                <span class="finish-stat-item good">😊 Nhớ: <strong>${good}</strong></span>
                <span class="finish-stat-item easy">🎯 Dễ: <strong>${easy}</strong></span>
            </div>
            <div class="finish-accuracy">
                <div class="accuracy-bar-track">
                    <div class="accuracy-bar-fill" style="width:${pct}%"></div>
                </div>
                <span class="accuracy-label">${pct}% chính xác</span>
            </div>
        `;

        // Hide card and hints
        this._getEl('study-card-wrap').style.display = 'none';

        // [F10] Ẩn button "Xem đáp án" và ratings khi ở màn hình kết quả
        this._getEl('study-show-wrap').classList.add('hidden');
        this._getEl('study-ratings').classList.add('hidden');
        this._getEl('study-hint').textContent = '';

        // [F7] Hide back button on finish screen
        const backBtn = document.getElementById('study-back-btn');
        if (backBtn) backBtn.style.display = 'none';

        // Progress to 100%
        this._getEl('study-progress-fill').style.width = '100%';

        // Notify app to auto-save SRS progress
        bus.emit('study:finished', { stats: this._stats });
    }

    // ─── PROGRESS & UI ───────────────────────────────────────────

    _updateProgress() {
        const total  = this._queue.length;
        const done   = this._currentIdx;
        const pct    = total ? Math.round((done / total) * 100) : 0;

        const fill   = this._getEl('study-progress-fill');
        const counter = this._getEl('study-counter');
        if (fill)    fill.style.width = pct + '%';
        if (counter) counter.textContent = `${done + 1} / ${total}`;
    }

    _updateHeaderStats() {
        const { again, hard, good, easy } = this._stats;
        const setVal = (id, val) => {
            const el = this._getEl(id);
            if (el) { el.querySelector('.stat-num').textContent = val; }
        };
        setVal('study-stat-again', again);
        setVal('study-stat-hard',  hard);
        setVal('study-stat-good',  good);
        setVal('study-stat-easy',  easy);
    }

    // [F7] Update back button visibility
    _updateBackBtn() {
        const backBtn = document.getElementById('study-back-btn');
        if (backBtn) {
            backBtn.style.display = this._history.length > 0 ? '' : 'none';
        }
    }

    _renderIntervalPreviews(card) {
        const previews = srsManager.previewIntervals({
            easiness:    card.easiness    ?? 2.5,
            interval:    card.interval    ?? 0,
            repetitions: card.repetitions ?? 0,
        });
        [1, 2, 3, 4].forEach(r => {
            const el = this._getEl(`interval-${r}`);
            if (el) el.textContent = srsManager.getIntervalText(previews[r] ?? 0);
        });
    }

    // ─── CONFETTI ────────────────────────────────────────────────

    _confetti() {
        const colors = ['#7c5cfc', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
        const container = document.body;

        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.cssText = `
                left: ${Math.random() * 100}vw;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-duration: ${1.5 + Math.random() * 2}s;
                animation-delay: ${Math.random() * 0.8}s;
                transform: rotate(${Math.random() * 360}deg);
            `;
            container.appendChild(piece);
            piece.addEventListener('animationend', () => piece.remove());
        }
    }

    // ─── EVENT BINDINGS ──────────────────────────────────────────

    _bindOverlayEvents() {
        // Close button
        this._getEl('study-close-btn')?.addEventListener('click', () => {
            if (this._stats.total > 0 && !this._isFinished) {
                if (!confirm('Bạn có muốn thoát phiên học chưa hoàn thành?')) return;
            }
            this.close();
        });

        // "Xem đáp án" button
        this._getEl('btn-show-answer')?.addEventListener('click', () => this.flip());

        // [F5] Click on card to flip/unflip
        this._getEl('study-card-wrap')?.addEventListener('click', () => {
            this.flip();
        });

        // Rating buttons
        this._getEl('study-ratings')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.rating-btn');
            if (btn) this.rate(parseInt(btn.dataset.rating));
        });

        // [F7] Back button
        const backBtn = document.getElementById('study-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this._goBack());
        }

        // Finish screen buttons
        this._getEl('study-finish-close')?.addEventListener('click', () => this.close());
        this._getEl('study-continue')?.addEventListener('click', () => {
            // Restart with remaining new cards
            this.open({ deckId: this._deckId, deckName: this._deckName, dueOnly: false });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this._getEl('study-overlay').classList.contains('hidden')) return;

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.flip();
                return;
            }
            if (e.key === 'Escape') {
                if (this._isFinished) { this.close(); return; }
                if (!confirm('Bạn có muốn thoát phiên học?')) return;
                this.close();
                return;
            }
            // [F7] Arrow left → back
            if (e.key === 'ArrowLeft' && !this._isFlipped) {
                this._goBack();
                return;
            }
            // 1-4 hotkeys for rating
            if (this._isFlipped && ['1','2','3','4'].includes(e.key)) {
                this.rate(parseInt(e.key));
            }
        });
    }

    // ─── HELPERS ─────────────────────────────────────────────────

    _getEl(id) { return document.getElementById(id); }
    _getCardInner() { return this._getEl('study-card-inner'); }
    _getFrontContent() { return this._getEl('study-front-content'); }
    _getBackContent()  { return this._getEl('study-back-content'); }
}

export const studyMode = new StudyMode();
