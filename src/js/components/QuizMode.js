/**
 * QuizMode.js — Multiple-Choice Quiz Engine
 * FlashMind App
 *
 * Shows definition/reading → user picks correct kanji/word from 4 options.
 * Also supports reverse direction (Front→Back).
 * No SRS recording — purely for testing.
 */

import { bus, renderMarkdown, toast } from '../utils.js';

// Shuffle helper (Fisher-Yates)
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ╔═══════════════════════════════════════════════════════╗
// ║  QUIZ MODE COMPONENT                                  ║
// ╚═══════════════════════════════════════════════════════╝
export class QuizMode {
    constructor() {
        this._deckId     = null;
        this._deckName   = '';
        this._allCards   = [];   // full card pool for distractor generation
        this._queue      = [];   // quiz questions
        this._currentIdx = 0;
        this._score      = 0;
        this._answers    = [];   // { correct, chosen, cardId }
        this._isAnswered = false;
        this._overlay    = null;
    }

    init() {
        this._buildOverlay();
        this._bindEvents();

        bus.on('quiz:start', ({ deckId, deckName, cards, limit }) => {
            this.open({ deckId, deckName, cards, limit });
        });
    }

    // ── OPEN / CLOSE ─────────────────────────────────────────────
    open({ deckId, deckName = '', cards = [], limit = 20 }) {
        this._deckId   = deckId;
        this._deckName = deckName;
        this._allCards = [...cards];

        if (cards.length < 4) {
            toast('Cần ít nhất 4 thẻ để tạo bài kiểm tra!', 'warning');
            return;
        }

        // Build quiz queue — shuffle and limit
        const shuffled = shuffle(cards).slice(0, limit || cards.length);
        this._queue = shuffled.map(card => this._buildQuestion(card));
        this._currentIdx = 0;
        this._score      = 0;
        this._answers    = [];
        this._isAnswered = false;

        this._overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        this._showQuestion();
    }

    close() {
        this._overlay.classList.add('hidden');
        document.body.style.overflow = '';
        bus.emit('card:changed', { deckId: this._deckId });
    }

    // ── BUILD QUESTION ───────────────────────────────────────────
    _buildQuestion(correctCard) {
        // Randomly choose direction: show back → pick front, or show front → pick back
        const showBack = Math.random() > 0.5;

        // Question text
        const questionText = showBack ? correctCard.back : correctCard.front;
        const correctAnswer = showBack ? correctCard.front : correctCard.back;
        const questionLabel = showBack ? 'Định nghĩa' : 'Từ vựng';

        // The "other side" of correct answer (for flip reveal)
        const correctFlip = showBack ? correctCard.back : correctCard.front;

        // Generate 3 wrong options from other cards
        const others = this._allCards.filter(c => c.id !== correctCard.id);
        const wrongCards = shuffle(others).slice(0, 3);

        // Combine and shuffle options — each has text + flipText (the other side)
        const options = shuffle([
            { text: correctAnswer, flipText: correctFlip, correct: true },
            ...wrongCards.map(c => ({
                text: showBack ? c.front : c.back,
                flipText: showBack ? c.back : c.front,
                correct: false,
            })),
        ]);

        return {
            cardId: correctCard.id,
            questionLabel,
            questionText,
            correctAnswer,
            options,
        };
    }

    // ── SHOW QUESTION ────────────────────────────────────────────
    _showQuestion() {
        const q = this._queue[this._currentIdx];
        this._isAnswered = false;

        // Update progress
        const total = this._queue.length;
        const current = this._currentIdx + 1;
        this._getEl('quiz-progress-fill').style.width = `${((current - 1) / total) * 100}%`;
        this._getEl('quiz-counter-current').textContent = current;
        this._getEl('quiz-counter-total').textContent = total;

        // Segmented progress
        const segWrap = this._getEl('quiz-segments');
        if (segWrap) {
            segWrap.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const seg = document.createElement('div');
                seg.className = 'quiz-seg';
                if (i < this._currentIdx) {
                    const ans = this._answers[i];
                    seg.classList.add(ans?.correct ? 'correct' : 'wrong');
                } else if (i === this._currentIdx) {
                    seg.classList.add('current');
                }
                segWrap.appendChild(seg);
            }
        }

        // Question
        this._getEl('quiz-q-label').textContent = q.questionLabel;
        this._getEl('quiz-q-text').innerHTML = renderMarkdown(q.questionText);

        // Options
        const optWrap = this._getEl('quiz-options');
        optWrap.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.dataset.idx = i;
            btn.innerHTML = `
                <span class="quiz-opt-num">${i + 1}</span>
                <span class="quiz-opt-text">${this._esc(opt.text)}</span>
            `;
            optWrap.appendChild(btn);
        });

        // Hide next button, show feedback area empty
        this._getEl('quiz-feedback').classList.add('hidden');
        this._getEl('quiz-next-btn').classList.add('hidden');

        // Hide finish
        this._getEl('quiz-finish').classList.add('hidden');
        this._getEl('quiz-card-area').style.display = '';
    }

    // ── HANDLE ANSWER ────────────────────────────────────────────
    _handleAnswer(idx) {
        if (this._isAnswered) return;
        this._isAnswered = true;

        const q = this._queue[this._currentIdx];
        const chosen = q.options[idx];
        const isCorrect = chosen.correct;

        if (isCorrect) this._score++;
        this._answers.push({ correct: isCorrect, chosen: chosen.text, cardId: q.cardId });

        // Highlight buttons + reveal flip text for all options
        const buttons = this._getEl('quiz-options').querySelectorAll('.quiz-option-btn');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (q.options[i].correct) {
                btn.classList.add('correct');
            } else if (i === idx && !isCorrect) {
                btn.classList.add('wrong');
            }

            // Reveal the "other side" of each option
            const flipText = q.options[i].flipText;
            if (flipText) {
                const flipEl = document.createElement('div');
                flipEl.className = 'quiz-opt-flip';
                flipEl.textContent = flipText;
                btn.appendChild(flipEl);
            }
        });

        // Show feedback
        const fb = this._getEl('quiz-feedback');
        fb.classList.remove('hidden');
        fb.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
        fb.innerHTML = isCorrect
            ? '✅ Chính xác!'
            : `❌ Sai! Đáp án đúng: <strong>${this._esc(q.correctAnswer)}</strong>`;

        // Update segment
        const segs = this._getEl('quiz-segments')?.children;
        if (segs?.[this._currentIdx]) {
            segs[this._currentIdx].classList.remove('current');
            segs[this._currentIdx].classList.add(isCorrect ? 'correct' : 'wrong');
        }

        // Show next button
        this._getEl('quiz-next-btn').classList.remove('hidden');
    }

    // ── ADVANCE ──────────────────────────────────────────────────
    _next() {
        this._currentIdx++;
        if (this._currentIdx < this._queue.length) {
            this._showQuestion();
        } else {
            this._showFinish();
        }
    }

    // ── FINISH SCREEN ────────────────────────────────────────────
    _showFinish() {
        const total   = this._queue.length;
        const correct = this._score;
        const pct     = Math.round((correct / total) * 100);
        const wrong   = total - correct;

        // Confetti if good
        if (pct >= 80) this._confetti();

        this._getEl('quiz-card-area').style.display = 'none';
        this._getEl('quiz-next-btn').classList.add('hidden');
        this._getEl('quiz-feedback').classList.add('hidden');
        this._getEl('quiz-progress-fill').style.width = '100%';

        const finish = this._getEl('quiz-finish');
        finish.classList.remove('hidden');

        const icon = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '😊' : '💪';
        const title = pct === 100 ? 'Hoàn hảo!' : pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Tiếp tục cố gắng!';

        finish.innerHTML = `
            <div class="quiz-finish-inner">
                <div class="quiz-finish-icon">${icon}</div>
                <h2 class="quiz-finish-title">${title}</h2>
                <div class="quiz-finish-score">${pct}%</div>
                <div class="quiz-finish-detail">
                    <span class="qf-correct">✅ ${correct} đúng</span>
                    <span class="qf-sep">·</span>
                    <span class="qf-wrong">❌ ${wrong} sai</span>
                    <span class="qf-sep">·</span>
                    <span class="qf-total">${total} câu</span>
                </div>

                <div class="quiz-finish-bar">
                    <div class="quiz-finish-bar-fill" style="width:${pct}%;background:${pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)'}"></div>
                </div>

                <div class="quiz-finish-actions">
                    <button class="btn btn-ghost" id="quiz-retry-btn">🔄 Làm lại</button>
                    <button class="btn btn-primary" id="quiz-close-btn">Xong</button>
                </div>
            </div>
        `;

        // Bind finish buttons
        document.getElementById('quiz-retry-btn')?.addEventListener('click', () => {
            this.open({ deckId: this._deckId, deckName: this._deckName, cards: this._allCards, limit: this._queue.length });
        });
        document.getElementById('quiz-close-btn')?.addEventListener('click', () => this.close());
    }

    // ── BUILD OVERLAY ────────────────────────────────────────────
    _buildOverlay() {
        const el = document.createElement('div');
        el.id = 'quiz-overlay';
        el.className = 'modal-overlay hidden';
        el.innerHTML = `
        <div class="quiz-container">
          <!-- Header -->
          <div class="quiz-header">
            <div class="quiz-header-left">
              <button class="icon-btn" id="quiz-exit-btn" title="Thoát">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <span class="quiz-deck-name" id="quiz-deck-label"></span>
            </div>
            <div class="quiz-header-right">
              <span class="quiz-counter">
                <span id="quiz-counter-current">1</span> / <span id="quiz-counter-total">0</span>
              </span>
            </div>
          </div>

          <!-- Progress -->
          <div class="quiz-segments" id="quiz-segments"></div>

          <!-- Hidden bar fallback -->
          <div class="quiz-progress-track">
            <div class="quiz-progress-fill" id="quiz-progress-fill"></div>
          </div>

          <!-- Card area -->
          <div class="quiz-card-area" id="quiz-card-area">
            <div class="quiz-question-card">
              <div class="quiz-q-label" id="quiz-q-label">Định nghĩa</div>
              <div class="quiz-q-text" id="quiz-q-text"></div>
            </div>

            <div class="quiz-options" id="quiz-options"></div>
          </div>

          <!-- Feedback -->
          <div class="quiz-feedback hidden" id="quiz-feedback"></div>

          <!-- Next button -->
          <div class="quiz-nav">
            <button class="btn btn-primary hidden" id="quiz-next-btn">Tiếp theo →</button>
          </div>

          <!-- Finish screen -->
          <div class="quiz-finish hidden" id="quiz-finish"></div>
        </div>
        `;
        document.body.appendChild(el);
        this._overlay = el;
    }

    // ── EVENTS ───────────────────────────────────────────────────
    _bindEvents() {
        // Exit
        document.getElementById('quiz-exit-btn').addEventListener('click', () => {
            if (this._currentIdx > 0 && this._currentIdx < this._queue.length) {
                if (!confirm('Bạn có muốn thoát bài kiểm tra?')) return;
            }
            this.close();
        });

        // Options
        document.getElementById('quiz-options').addEventListener('click', e => {
            const btn = e.target.closest('.quiz-option-btn');
            if (btn) this._handleAnswer(+btn.dataset.idx);
        });

        // Next
        document.getElementById('quiz-next-btn').addEventListener('click', () => this._next());

        // Keyboard
        document.addEventListener('keydown', e => {
            if (this._overlay.classList.contains('hidden')) return;
            if (['1', '2', '3', '4'].includes(e.key) && !this._isAnswered) {
                this._handleAnswer(+e.key - 1);
            }
            if ((e.key === 'Enter' || e.key === ' ') && this._isAnswered) {
                e.preventDefault();
                this._next();
            }
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    // ── HELPERS ──────────────────────────────────────────────────
    _confetti() {
        const colors = ['#7c5cfc', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*0.6}s;`;
            document.body.appendChild(p);
            p.addEventListener('animationend', () => p.remove());
        }
    }

    _getEl(id) { return document.getElementById(id); }
    _esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}

export const quizMode = new QuizMode();
