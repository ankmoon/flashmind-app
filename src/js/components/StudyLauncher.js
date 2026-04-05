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
        this._diffTags = []; // Array of string tags (e.g., 'diff:TOPIK 1-2')
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
        this._diffTags = [];

        this._overlay.classList.remove('hidden');
        
        // Load tags for this deck
        this._availableTags = cardManager.getTagsInDeck(this._deckId).filter(t => t.startsWith('diff:'));
        
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
                  <input type="checkbox" ${this._levels.includes(l.key) ? 'checked' : ''} />
                  <span class="sl-chip-dot" style="background:${l.color}"></span>
                  <span class="sl-chip-label">${l.label}</span>
                </label>
              `).join('')}
            </div>

            <!-- Diff Tag Filter -->
            <div id="sl-tags-section" style="display: none;">
              <div class="sl-section-label">Độ khó:</div>
              <div class="sl-levels" id="sl-tags">
                <!-- Injected in _updateUI -->
              </div>
            </div>

            <!-- Limit selector -->
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
              Có <strong id="sl-count-val">0</strong> thẻ phù hợp
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

        // Tag checkboxes
        $('sl-tags').addEventListener('change', (e) => {
            if (e.target.tagName !== 'INPUT') return;
            const tag = e.target.closest('[data-tag]').dataset.tag;
            if (e.target.checked) {
               if(!this._diffTags.includes(tag)) this._diffTags.push(tag);
            } else {
               this._diffTags = this._diffTags.filter(t => t !== tag);
            }
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
        const cards   = cardManager.getCardsByLevel(this._deckId, { levels: this._levels, limit, tags: this._diffTags });

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
        const $ = id => document.getElementById(id);
        // Deck name
        document.getElementById('sl-deck-name').textContent = this._deckName || 'All decks';

        // Mode cards
        document.querySelectorAll('.sl-mode-card').forEach(card => {
            card.className = `sl-mode-card ${card.dataset.mode === this._mode ? 'active' : ''}`;
        });
        
        // Tags rendering
        const tagsSection = $('sl-tags-section');
        const tagsContainer = $('sl-tags');
        if (this._availableTags && this._availableTags.length > 0) {
            tagsSection.style.display = 'block';
            tagsContainer.innerHTML = this._availableTags.map(tag => {
                const displayTag = tag.replace('diff:', '');
                const isChecked = this._diffTags.includes(tag);
                return `
                <label class="sl-level-chip" data-tag="${tag}" style="--chip-color:#1e293b; background: var(--bg-hover)">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} />
                  <span class="sl-chip-label" style="font-weight: 500">${displayTag}</span>
                </label>
                `;
            }).join('');
        } else {
            tagsSection.style.display = 'none';
        }

        this._updateCardCount();
    }

    _updateCardCount() {
        const $ = id => document.getElementById(id);
        $('sl-start-btn').disabled = true;
        $('sl-count-val').textContent = '...';

        // small defer logic to not block UI
        setTimeout(() => {
            const limit = this._limit || 9999;
            const cards = cardManager.getCardsByLevel(this._deckId, { levels: this._levels, limit, tags: this._diffTags });
            
            $('sl-count-val').textContent = cards.length;

            // Disable start if 0
            $('sl-start-btn').disabled = cards.length === 0;
        }, 0);
    }
}

export const studyLauncher = new StudyLauncher();
