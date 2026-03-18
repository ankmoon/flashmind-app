/**
 * CardEditor.js — Card Create/Edit Modal Component
 * FlashMind App
 */

import { cardManager }  from '../modules/cardManager.js';
import { bus, renderMarkdown, openModal, closeModal, toast } from '../utils.js';

export class CardEditor {
    constructor() {
        this._mode    = 'create'; // 'create' | 'edit'
        this._deckId  = null;
        this._cardId  = null;
        this._addNext = false;

        this._frontInput = document.getElementById('card-front-input');
        this._backInput  = document.getElementById('card-back-input');
        this._tagsInput  = document.getElementById('card-tags-input');
        this._editIdEl   = document.getElementById('card-edit-id');
        this._titleEl    = document.getElementById('modal-card-title');
        this._prevFront  = document.getElementById('preview-front');
        this._prevBack   = document.getElementById('preview-back');
    }

    init() {
        this._bindModalEvents();
        this._bindInputEvents();

        // Listen for open requests
        bus.on('card:add',  ({ deckId }) => this.openCreate(deckId));
        bus.on('card:edit', card => this.openEdit(card));
        bus.on('card:open', card => this.openEdit(card));
    }

    // ─── OPEN ─────────────────────────────────────────────────────

    openCreate(deckId) {
        this._mode   = 'create';
        this._deckId = deckId;
        this._cardId = null;
        this._clear();
        this._titleEl.textContent = '✨ Thêm thẻ mới';
        document.getElementById('btn-save-card-next').style.display = '';
        openModal('modal-card');
        this._frontInput?.focus();
    }

    openEdit(card) {
        this._mode   = 'edit';
        this._deckId = card.deck_id;
        this._cardId = card.id;

        this._frontInput.value = card.front || '';
        this._backInput.value  = card.back  || '';
        this._tagsInput.value  = cardManager.stringifyTags(card.tags);
        this._editIdEl.value   = card.id;
        this._titleEl.textContent = '✏️ Chỉnh sửa thẻ';
        document.getElementById('btn-save-card-next').style.display = 'none';

        // Set card type tab
        const typeBtn = document.querySelector(`.tab-btn[data-type="${card.card_type || 'basic'}"]`);
        if (typeBtn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            typeBtn.classList.add('active');
        }

        this._updatePreview();
        openModal('modal-card');
        this._frontInput?.focus();
    }

    // ─── SAVE ─────────────────────────────────────────────────────

    save() {
        const front    = this._frontInput?.value.trim();
        const back     = this._backInput?.value.trim();
        const tagsStr  = this._tagsInput?.value || '';
        const tags     = cardManager.parseTags(tagsStr);
        const cardType = document.querySelector('.tab-btn.active')?.dataset.type || 'basic';

        if (!front) { toast('Mặt trước không được để trống', 'warning'); this._frontInput?.focus(); return false; }
        if (!back)  { toast('Mặt sau không được để trống',   'warning'); this._backInput?.focus();  return false; }

        try {
            if (this._mode === 'create') {
                cardManager.createCard({ deckId: this._deckId, front, back, cardType, tags });
                toast('Thêm thẻ thành công! 🎉', 'success');
            } else {
                cardManager.updateCard(this._cardId, { front, back, cardType, tags });
                toast('Đã cập nhật thẻ ✅', 'success');
            }
            bus.emit('card:changed', { deckId: this._deckId });
            return true;
        } catch (err) {
            toast(err.message, 'error');
            return false;
        }
    }

    // ─── EVENTS ───────────────────────────────────────────────────

    _bindModalEvents() {
        // Save button
        document.getElementById('btn-save-card')?.addEventListener('click', () => {
            if (this.save()) closeModal('modal-card');
        });

        // Save & next
        document.getElementById('btn-save-card-next')?.addEventListener('click', () => {
            if (this.save()) {
                this._clear();
                this._frontInput?.focus();
            }
        });

        // Close buttons (via data-close attribute – handled globally in app.js)
    }

    _bindInputEvents() {
        // Live preview
        const updatePreview = () => this._updatePreview();

        this._frontInput?.addEventListener('input', updatePreview);
        this._backInput?.addEventListener('input',  updatePreview);

        // Tab key inserts spaces (not switch focus)
        [this._frontInput, this._backInput].forEach(el => {
            el?.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = el.selectionStart;
                    const end   = el.selectionEnd;
                    el.value = el.value.slice(0, start) + '    ' + el.value.slice(end);
                    el.selectionStart = el.selectionEnd = start + 4;
                    updatePreview();
                }
                // Cmd/Ctrl + Enter to save
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    document.getElementById('btn-save-card')?.click();
                }
            });
        });

        // Card type tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    _updatePreview() {
        const frontMd = this._frontInput?.value || '';
        const backMd  = this._backInput?.value  || '';

        if (this._prevFront) {
            if (frontMd) {
                this._prevFront.innerHTML = renderMarkdown(frontMd);
            } else {
                this._prevFront.innerHTML = '<p class="preview-placeholder">Nhập nội dung để xem trước...</p>';
            }
        }
        if (this._prevBack) {
            if (backMd) {
                this._prevBack.innerHTML = renderMarkdown(backMd);
            } else {
                this._prevBack.innerHTML = '<p class="preview-placeholder">Nhập nội dung để xem trước...</p>';
            }
        }
    }

    _clear() {
        if (this._frontInput) this._frontInput.value = '';
        if (this._backInput)  this._backInput.value  = '';
        if (this._tagsInput)  this._tagsInput.value  = '';
        if (this._editIdEl)   this._editIdEl.value   = '';
        this._updatePreview();
    }
}
