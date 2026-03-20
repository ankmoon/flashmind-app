/**
 * StudyLauncher.js — Study Setup Modal
 * FlashMind App
 *
 * Lets user choose study mode before starting:
 *   • Ôn tập (SRS review)
 *   • Random (shuffled, no SRS)
 *   • Kiểm tra (Quiz MCQ)
 *
 * Also: filter by mastery level + card count.
 */

import { cardManager } from '../modules/cardManager.js';
import { bus, toast } from '../utils.js';

const MODES = {
    review: { icon: '📖', label: 'Ôn tập thông minh', desc: 'Ôn đúng lúc, đúng thẻ — nhớ lâu hơn' },
    random: { icon: '🔀', label: 'Ngẫu nhiên',       desc: 'Xáo trộn, không tính lịch học' },
    quiz:   { icon: '📝', label: 'Kiểm tra',          desc: 'Trắc nghiệm 4 đáp án' },
};

const LEVELS = [
    { key: 'new',     label: 'Mới',       color: '#7c5cfc' },
    { key: 'due',     label: 'Đang học',  color: '#f59e0b' },
    { key: 'learned', label: 'Đã thuộc',  color: '#10b981' },
];

const LIMITS = [10, 20, 50, 100, 0]; // 0 = all

export class StudyLauncher {
    constructor() {
        this._deckId   = null;
        this._deckName = '';
        this._mode     = 'review';
        this._levels   = ['new', 'due'];
        this._limit    = 20;
        this._overlay  = null;
    }

    init() {
        this._buildOverlay();
        this._bindEvents();

        bus.on('study:launch', ({ deckId, deckName }) => {
            this.open(deckId, deckName);
        });
    }

    // ── OPEN / CLOSE ─────────────────────────────────────────────
    open(deckId, deckName = '') {
        this._deckId   = deckId;
        this._deckName = deckName;
        this._mode     = 'review';
        this._levels   = ['new', 'due'];
        this._limit    = 20;

        this._overlay.classList.remove('hidden');
        this._updateUI();
        this._updateCardCount();
    }

    close() {
        this._overlay.classList.add('hidden');
    }

    // ── BUILD OVERLAY ────────────────────────────────────────────
    _buildOverlay() {
        const el = document.createElement('div');
        el.id = 'study-launcher-overlay';
        el.className = 'modal-overlay hidden';
        el.innerHTML = `
        <div class="modal modal-sm" style="max-width:560px">
          <div class="modal-header">
            <h2 class="modal-title">📚 Thiết lập phiên học</h2>
            <button class="modal-close" id="sl-close-btn">✕</button>
          </div>
          <div class="modal-body">

            <!-- Deck name -->
            <div class="sl-deck-name" id="sl-deck-name"></div>

            <!-- Mode selector -->
            <div class="sl-section-label">Chế độ:</div>
            <div class="sl-mode-grid" id="sl-mode-grid">
              ${Object.entries(MODES).map(([key, m]) => `
                <button class="sl-mode-card ${key === 'review' ? 'active' : ''}" data-mode="${key}">
                  <div class="sl-mode-icon">${m.icon}</div>
                  <div class="sl-mode-label">${m.label}</div>
                  <div class="sl-mode-desc">${m.desc}</div>
                </button>
              `).join('')}
            </div>

            <!-- Level filter -->
            <div class="sl-section-label">Lọc theo cấp độ:</div>
            <div class="sl-levels" id="sl-levels">
              ${LEVELS.map(l => `
                <label class="sl-level-chip" data-level="${l.key}" style="--chip-color:${l.color}">
                  <input type="checkbox" ${l.key !== 'learned' ? 'checked' : ''} />
                  <span class="sl-chip-dot" style="background:${l.color}"></span>
                  ${l.label}
                </label>
              `).join('')}
            </div>

            <!-- Card count -->
            <div class="sl-row">
              <div class="sl-section-label" style="margin:0">Số thẻ:</div>
              <div class="sl-limit-group" id="sl-limit-group">
                ${LIMITS.map(n => `
                  <button class="sl-limit-btn ${n === 20 ? 'active' : ''}" data-limit="${n}">
                    ${n || 'Tất cả'}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Available count -->
            <div class="sl-available" id="sl-available">
              Có <strong id="sl-card-count">0</strong> thẻ phù hợp
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="sl-cancel">Hủy</button>
            <button class="btn btn-primary btn-lg" id="sl-start-btn">
              ▶ Bắt đầu
            </button>
          </div>
        </div>
        `;
        document.body.appendChild(el);
        this._overlay = el;
    }

    // ── EVENTS ───────────────────────────────────────────────────
    _bindEvents() {
        const $ = id => document.getElementById(id);

        // Close
        $('sl-close-btn').addEventListener('click', () => this.close());
        $('sl-cancel').addEventListener('click', () => this.close());
        this._overlay.addEventListener('click', e => { if (e.target === this._overlay) this.close(); });

        // Mode selection
        $('sl-mode-grid').addEventListener('click', e => {
            const card = e.target.closest('.sl-mode-card');
            if (!card) return;
            this._mode = card.dataset.mode;
            this._updateUI();
        });

        // Level checkboxes
        $('sl-levels').addEventListener('change', () => {
            this._levels = [...document.querySelectorAll('#sl-levels input:checked')]
                .map(cb => cb.closest('[data-level]').dataset.level);
            this._updateCardCount();
        });

        // Limit buttons
        $('sl-limit-group').addEventListener('click', e => {
            const btn = e.target.closest('.sl-limit-btn');
            if (!btn) return;
            this._limit = +btn.dataset.limit;
            $('sl-limit-group').querySelectorAll('.sl-limit-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this._updateCardCount();
        });

        // Start
        $('sl-start-btn').addEventListener('click', () => this._start());
    }

    // ── START SESSION ─────────────────────────────────────────────
    _start() {
        const limit   = this._limit || 9999;
        const cards   = cardManager.getCardsByLevel(this._deckId, { levels: this._levels, limit });

        if (!cards.length) {
            toast('Không có thẻ nào phù hợp bộ lọc!', 'warning');
            return;
        }

        this.close();

        if (this._mode === 'quiz') {
            bus.emit('quiz:start', {
                deckId:   this._deckId,
                deckName: this._deckName,
                cards,
                limit,
            });
        } else {
            bus.emit('study:start', {
                deckId:   this._deckId,
                deckName: this._deckName,
                cards,
                shuffle:  this._mode === 'random',
                skipSrs:  this._mode === 'random',
                dueOnly:  false,
            });
        }
    }

    // ── UI HELPERS ────────────────────────────────────────────────
    _updateUI() {
        // Deck name
        document.getElementById('sl-deck-name').textContent = this._deckName || 'All decks';

        // Mode cards
        document.querySelectorAll('.sl-mode-card').forEach(c => {
            c.classList.toggle('active', c.dataset.mode === this._mode);
        });

        this._updateCardCount();
    }

    _updateCardCount() {
        const limit = this._limit || 9999;
        const cards = cardManager.getCardsByLevel(this._deckId, { levels: this._levels, limit });
        document.getElementById('sl-card-count').textContent = cards.length;

        // Disable start if 0
        document.getElementById('sl-start-btn').disabled = cards.length === 0;
    }
}

export const studyLauncher = new StudyLauncher();
