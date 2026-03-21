/**
 * Sidebar.js — Deck Tree Component
 * FlashMind App
 */

import { deckManager } from '../modules/deckManager.js';
import { dbManager }   from '../db/database.js';
import { bus, openModal, closeModal, toast } from '../utils.js';

export class Sidebar {
    constructor() {
        this.container       = document.getElementById('deck-tree');
        this.emptyState      = document.getElementById('sidebar-empty');
        this.activeDeckId    = null;
        this._expandedIds    = new Set();
        // Exposed for app.js
        this.currentDeckId   = null;
        this.currentDeckName = '';
    }

    init() {
        this._bindStaticEvents();
        bus.on('db:ready', () => this.render());
        bus.on('deck:changed', () => this.render());
    }

    // ─── RENDER ──────────────────────────────────────────────────

    render() {
        const tree = deckManager.getDeckTree();
        const isEmpty = tree.length === 0;

        this.emptyState?.classList.toggle('hidden', !isEmpty);

        // Clear previous deck items (keep empty state)
        const oldItems = this.container.querySelectorAll('.deck-item');
        oldItems.forEach(el => el.remove());

        if (!isEmpty) {
            const frag = document.createDocumentFragment();
            for (const deck of tree) {
                frag.appendChild(this._buildDeckItem(deck, 0));
            }
            this.container.appendChild(frag);
        }
    }

    /**
     * Build a deck item DOM node (recursive).
     * @param {Object} deck
     * @param {number} depth
     * @returns {HTMLElement}
     */
    _buildDeckItem(deck, depth) {
        const hasChildren = deck.children && deck.children.length > 0;
        const isExpanded  = this._expandedIds.has(deck.id);
        const isActive    = deck.id === this.activeDeckId;
        const hasDue      = deck.dueCount > 0;

        const item = document.createElement('div');
        item.className = 'deck-item';
        item.dataset.id = deck.id;

        // Row
        const row = document.createElement('div');
        row.className = `deck-row${isActive ? ' active' : ''}`;

        // Indent for depth
        if (depth > 0) {
            row.style.paddingLeft = `${depth * 14 + 8}px`;
        }

        // Expand button
        if (hasChildren) {
            const expandBtn = document.createElement('button');
            expandBtn.className = `deck-expand-btn${isExpanded ? ' expanded' : ''}`;
            expandBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>`;
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggleExpand(deck.id, item, expandBtn);
            });
            row.appendChild(expandBtn);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'deck-expand-spacer';
            row.appendChild(spacer);
        }

        // Color dot
        const dot = document.createElement('span');
        dot.className = 'deck-color-dot';
        dot.style.background = deck.color || '#7c5cfc';
        row.appendChild(dot);

        // Icon
        const icon = document.createElement('span');
        icon.className = 'deck-row-icon';
        icon.textContent = deck.icon || '📚';
        row.appendChild(icon);

        // Name
        const name = document.createElement('span');
        name.className = 'deck-name';
        name.textContent = deck.name;
        name.title = deck.name;
        row.appendChild(name);

        // Due badge (if any)
        if (hasDue) {
            const dueBadge = document.createElement('span');
            dueBadge.className = 'deck-due-badge';
            dueBadge.textContent = deck.dueCount;
            row.appendChild(dueBadge);
        }

        // Card count badge
        const countBadge = document.createElement('span');
        countBadge.className = 'deck-count';
        countBadge.textContent = deck.cardCount;
        row.appendChild(countBadge);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'deck-actions';
        actions.innerHTML = `
            <button class="deck-action-btn add"  title="Thêm sub-deck">+</button>
            <button class="deck-action-btn edit" title="Sửa deck">✏️</button>
            <button class="deck-action-btn del"  title="Xóa deck">🗑</button>
        `;
        actions.querySelector('.add').addEventListener('click', (e) => {
            e.stopPropagation();
            bus.emit('deck:create-child', { parentId: deck.id });
        });
        actions.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            bus.emit('deck:edit', deck);
        });
        actions.querySelector('.del').addEventListener('click', (e) => {
            e.stopPropagation();
            bus.emit('deck:delete', deck);
        });
        row.appendChild(actions);

        // Click to select
        row.addEventListener('click', () => this.selectDeck(deck.id));

        item.appendChild(row);

        // Children container
        if (hasChildren) {
            const childrenEl = document.createElement('div');
            childrenEl.className = `deck-children${isExpanded ? ' open' : ''}`;
            for (const child of deck.children) {
                childrenEl.appendChild(this._buildDeckItem(child, depth + 1));
            }
            item.appendChild(childrenEl);
        }

        return item;
    }

    // ─── INTERACTIONS ─────────────────────────────────────────────

    selectDeck(deckId) {
        this.activeDeckId    = deckId;
        this.currentDeckId   = deckId;

        // Update active class
        this.container.querySelectorAll('.deck-row').forEach(row => {
            row.classList.toggle('active', row.closest('.deck-item')?.dataset.id === deckId);
        });

        const deck = deckManager.getDeck(deckId);
        if (deck) {
            this.currentDeckName = deck.name;
            bus.emit('deck:selected', deck);

            // Show / enable buttons
            const studyBtn = document.getElementById('btn-study-now');
            const vocabBtn = document.getElementById('btn-view-vocab');
            const addBtn   = document.getElementById('btn-add-card');

            if (studyBtn) studyBtn.style.display = '';
            if (vocabBtn) vocabBtn.style.display = '';
            if (addBtn)   addBtn.style.display   = '';

            // Note: event listeners for studyBtn are handled in app.js now 
            // to avoid duplication and keep logic centralized.
        }

        // Clear subview if switching decks
        bus.emit('view:reset-subview');
    }

    _toggleExpand(deckId, itemEl, btnEl) {
        if (this._expandedIds.has(deckId)) {
            this._expandedIds.delete(deckId);
        } else {
            this._expandedIds.add(deckId);
        }
        const isExpanded = this._expandedIds.has(deckId);
        btnEl.classList.toggle('expanded', isExpanded);
        const children = itemEl.querySelector('.deck-children');
        if (children) children.classList.toggle('open', isExpanded);
    }

    // ─── STATIC EVENT BINDINGS ────────────────────────────────────

    _bindStaticEvents() {
        // "New Deck" button in sidebar header
        document.getElementById('btn-new-deck-root')?.addEventListener('click', () => {
            bus.emit('deck:create-child', { parentId: null });
        });

        // "Create first deck" in empty state
        document.getElementById('btn-create-first-deck')?.addEventListener('click', () => {
            bus.emit('deck:create-child', { parentId: null });
        });

        // Stats nav
        document.getElementById('btn-stats-nav')?.addEventListener('click', () => {
            this.activeDeckId = null;
            this.container.querySelectorAll('.deck-row').forEach(r => r.classList.remove('active'));
            bus.emit('view:stats');
        });
    }
}
