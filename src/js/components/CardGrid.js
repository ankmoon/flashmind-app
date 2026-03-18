/**
 * CardGrid.js — Card List/Grid Component with Virtual Scroll
 * FlashMind App
 */

import { cardManager } from '../modules/cardManager.js';
import { srsManager }  from '../modules/srs.js';
import { bus, renderMarkdown, truncate, toast, openModal } from '../utils.js';

export class CardGrid {
    constructor() {
        this.container  = document.getElementById('card-grid');
        this.currentDeckId  = null;
        this.currentCards   = [];
        this.viewMode       = 'grid'; // 'grid' | 'list'
        this.searchQuery    = '';
    }

    init() {
        this._bindEvents();
        bus.on('deck:selected', deck => this.loadDeck(deck));
        bus.on('card:changed',  ()    => this.refresh());
    }

    // ─── LOAD DECK ────────────────────────────────────────────────

    loadDeck(deck) {
        this.currentDeckId = deck.id;
        this.searchQuery   = '';
        this.render();

        // Update header
        document.getElementById('deck-icon-display').textContent = deck.icon || '📚';
        document.getElementById('deck-title').textContent = deck.name;

        // Show action buttons
        document.getElementById('btn-add-card').style.display = '';
        document.getElementById('btn-study-now').style.display = '';

        // Update due banner
        this._updateDueBanner(deck.id);
    }

    refresh() {
        if (this.currentDeckId) this.render();
    }

    // ─── RENDER ───────────────────────────────────────────────────

    render() {
        if (!this.currentDeckId) return;

        // Load cards with optional search
        this.currentCards = cardManager.getCardsInDeck(this.currentDeckId, {
            search: this.searchQuery || undefined,
        });

        this._renderCards(this.currentCards);
        this._updateMeta();
    }

    _renderCards(cards) {
        // Clear container
        this.container.innerHTML = '';

        // Set view mode class
        this.container.className = `card-grid${this.viewMode === 'list' ? ' list-view' : ''}`;

        if (cards.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'content-empty-state';
            empty.innerHTML = `
                <div class="empty-state-icon">🃏</div>
                <h3>${this.searchQuery ? 'Không tìm thấy thẻ' : 'Chưa có thẻ nào'}</h3>
                <p>${this.searchQuery
                    ? 'Thử từ khóa khác hoặc xóa bộ lọc'
                    : 'Nhấn "+ Thêm thẻ" để bắt đầu tạo thẻ học'}</p>
            `;
            this.container.appendChild(empty);
            return;
        }

        const frag = document.createDocumentFragment();

        for (const card of cards) {
            frag.appendChild(this._buildCardEl(card));
        }

        // Add card tile at end
        const addTile = document.createElement('div');
        addTile.className = 'add-card-tile';
        addTile.innerHTML = `<span class="add-card-tile-icon">＋</span><span>Thêm thẻ mới</span>`;
        addTile.addEventListener('click', () => bus.emit('card:add', { deckId: this.currentDeckId }));
        frag.appendChild(addTile);

        this.container.appendChild(frag);
    }

    _buildCardEl(card) {
        const status    = cardManager.getSrsStatus(card);
        const frontText = truncate(this._stripMd(card.front), 120);
        const backText  = truncate(this._stripMd(card.back),  80);
        const tags = Array.isArray(card.tags) ? card.tags : [];

        const el = document.createElement('div');
        el.className = 'flash-card';
        el.dataset.id = card.id;

        const typeLabel = card.card_type === 'cloze' ? 'cloze' : 'basic';
        const tagsHtml  = tags.map(t => `<span class="card-tag">${t}</span>`).join('');

        el.innerHTML = `
            <span class="card-type-badge ${typeLabel}">${typeLabel}</span>
            <div class="card-front-preview">${frontText}</div>
            <div class="card-divider"></div>
            <div class="card-back-preview">${backText}</div>
            <div class="card-footer">
                <div class="card-tags">${tagsHtml}</div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span class="card-srs-dot ${status}" title="${this._statusLabel(status)}"></span>
                    <div class="card-actions">
                        <button class="card-action-btn edit" title="Sửa thẻ">✏️</button>
                        <button class="card-action-btn del"  title="Xóa thẻ">🗑</button>
                    </div>
                </div>
            </div>
        `;

        // Click card to open editor
        el.addEventListener('click', (e) => {
            if (e.target.closest('.card-actions')) return;
            bus.emit('card:open', card);
        });

        el.querySelector('.card-action-btn.edit')?.addEventListener('click', (e) => {
            e.stopPropagation();
            bus.emit('card:edit', card);
        });

        el.querySelector('.card-action-btn.del')?.addEventListener('click', (e) => {
            e.stopPropagation();
            bus.emit('card:delete', card);
        });

        return el;
    }

    _statusLabel(status) {
        return { new: 'Mới', due: 'Cần ôn', learned: 'Đã học', overdue: 'Quá hạn' }[status] || status;
    }

    /** Strip markdown syntax for clean grid preview */
    _stripMd(text) {
        if (!text) return '';
        return text
            .replace(/#{1,6}\s+/g, '')          // headings
            .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')  // bold/italic
            .replace(/`{1,3}[^`]+`{1,3}/g, (m) => m.replace(/`/g, ''))  // code
            .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')  // links/images
            .replace(/^[-*>]\s+/gm, '')          // lists/blockquote
            .replace(/\n+/g, ' ')                // newlines
            .trim();
    }
    _updateMeta() {
        const total = this.currentCards.length;
        const due   = this.currentCards.filter(c => cardManager.getSrsStatus(c) === 'due' || cardManager.getSrsStatus(c) === 'overdue').length;
        document.getElementById('deck-meta').textContent =
            `${total} thẻ · ${due} cần ôn hôm nay`;
    }

    _updateDueBanner(deckId) {
        const dueCount = cardManager.getDueCards(deckId).length;
        const banner   = document.getElementById('due-banner');
        const text     = document.getElementById('due-banner-text');
        if (banner && text) {
            banner.classList.toggle('hidden', dueCount === 0);
            text.textContent = `📅 ${dueCount} thẻ cần ôn hôm nay`;
        }
    }

    // ─── SEARCH ───────────────────────────────────────────────────

    search(query) {
        this.searchQuery = query;
        this.render();
    }

    // ─── EVENTS ───────────────────────────────────────────────────

    _bindEvents() {
        // View toggle
        document.getElementById('view-grid')?.addEventListener('click', () => this.setView('grid'));
        document.getElementById('view-list')?.addEventListener('click', () => this.setView('list'));

        // Add card button
        document.getElementById('btn-add-card')?.addEventListener('click', () => {
            if (this.currentDeckId) bus.emit('card:add', { deckId: this.currentDeckId });
        });

        // Study now button — handled by Sidebar.js after deck selection
        // (clones the button to add deckName to event payload)
        document.getElementById('btn-study-due')?.addEventListener('click', () => {
            if (this.currentDeckId) {
                const deckTitle = document.getElementById('deck-title')?.textContent || '';
                bus.emit('study:launch', { deckId: this.currentDeckId, deckName: deckTitle });
            }
        });
    }

    setView(mode) {
        this.viewMode = mode;
        document.getElementById('view-grid')?.classList.toggle('active', mode === 'grid');
        document.getElementById('view-list')?.classList.toggle('active', mode === 'list');
        this.render();
    }
}
