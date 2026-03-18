/**
 * DeckModal.js — Deck Create/Edit Modal Component
 * FlashMind App
 */

import { deckManager }  from '../modules/deckManager.js';
import { bus, openModal, closeModal, toast } from '../utils.js';

export class DeckModal {
    constructor() {
        this._mode     = 'create';
        this._deckId   = null;
        this._parentId = null;
        this._selectedColor = '#7c5cfc';
        this._selectedEmoji = '📚';
    }

    init() {
        this._bindEvents();
        bus.on('deck:create-child', ({ parentId }) => this.openCreate(parentId));
        bus.on('deck:edit', deck => this.openEdit(deck));
        bus.on('deck:delete', deck => this.confirmDelete(deck));
    }

    // ─── OPEN ─────────────────────────────────────────────────────

    openCreate(parentId = null) {
        this._mode     = 'create';
        this._deckId   = null;
        this._parentId = parentId;

        document.getElementById('deck-name-input').value = '';
        document.getElementById('deck-edit-id').value    = '';
        document.getElementById('modal-deck-title').textContent = '✨ Tạo bộ thẻ mới';
        document.getElementById('btn-save-deck').textContent = 'Tạo bộ thẻ';

        this._setColor('#7c5cfc');
        this._setEmoji('📚');
        this._populateParentSelect(parentId);
        openModal('modal-deck');
        document.getElementById('deck-name-input')?.focus();
    }

    openEdit(deck) {
        this._mode   = 'edit';
        this._deckId = deck.id;

        document.getElementById('deck-name-input').value = deck.name;
        document.getElementById('deck-edit-id').value    = deck.id;
        document.getElementById('modal-deck-title').textContent = '✏️ Chỉnh sửa deck';
        document.getElementById('btn-save-deck').textContent = 'Lưu thay đổi';

        this._setColor(deck.color || '#7c5cfc');
        this._setEmoji(deck.icon  || '📚');
        this._populateParentSelect(deck.parent_id, deck.id);
        openModal('modal-deck');
        document.getElementById('deck-name-input')?.focus();
    }

    // ─── SAVE ─────────────────────────────────────────────────────

    save() {
        const name = document.getElementById('deck-name-input')?.value.trim();
        if (!name) {
            toast('Tên deck không được để trống', 'warning');
            document.getElementById('deck-name-input')?.focus();
            return false;
        }

        const parentId = document.getElementById('deck-parent-select')?.value || null;

        try {
            if (this._mode === 'create') {
                deckManager.createDeck({
                    name,
                    parentId,
                    color: this._selectedColor,
                    icon:  this._selectedEmoji,
                });
                toast(`Đã tạo deck "${name}" 🎉`, 'success');
            } else {
                deckManager.updateDeck(this._deckId, {
                    name,
                    color:    this._selectedColor,
                    icon:     this._selectedEmoji,
                    parentId,
                });
                toast('Đã cập nhật deck ✅', 'success');
            }
            bus.emit('deck:changed');
            closeModal('modal-deck');
            return true;
        } catch (err) {
            toast(err.message, 'error');
            return false;
        }
    }

    // ─── DELETE CONFIRM ───────────────────────────────────────────

    confirmDelete(deck) {
        document.getElementById('confirm-message').textContent =
            `Bạn có chắc muốn xóa deck "${deck.name}" và tất cả thẻ bên trong?`;

        const confirmBtn = document.getElementById('btn-confirm-delete');
        const handler = () => {
            try {
                deckManager.deleteDeck(deck.id);
                toast(`Đã xóa deck "${deck.name}"`, 'info');
                bus.emit('deck:changed');
                bus.emit('deck:deleted', deck);
                closeModal('modal-confirm');
            } catch (err) {
                toast(err.message, 'error');
            }
            confirmBtn.removeEventListener('click', handler);
        };

        confirmBtn.addEventListener('click', handler);
        openModal('modal-confirm');
    }

    // ─── HELPERS ─────────────────────────────────────────────────

    _populateParentSelect(selectedParentId = null, excludeId = null) {
        const select = document.getElementById('deck-parent-select');
        if (!select) return;

        const allDecks = deckManager.getAllDecks().filter(d => d.id !== excludeId);
        select.innerHTML = '<option value="">— Không có (Root) —</option>';

        for (const deck of allDecks) {
            const opt    = document.createElement('option');
            opt.value    = deck.id;
            opt.textContent = `${deck.icon || '📚'} ${deck.name}`;
            opt.selected = deck.id === selectedParentId;
            select.appendChild(opt);
        }
    }

    _setColor(color) {
        this._selectedColor = color;
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    }

    _setEmoji(emoji) {
        this._selectedEmoji = emoji;
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.emoji === emoji);
        });
    }

    // ─── EVENTS ───────────────────────────────────────────────────

    _bindEvents() {
        // Save button
        document.getElementById('btn-save-deck')?.addEventListener('click', () => this.save());

        // Enter to save
        document.getElementById('deck-name-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.save();
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => this._setColor(btn.dataset.color));
        });

        // Emoji picker
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.addEventListener('click', () => this._setEmoji(btn.dataset.emoji));
        });
    }
}
