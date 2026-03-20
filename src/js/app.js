/**
 * app.js — Main Application Controller
 * FlashMind App — Phase 1 & 2
 *
 * Orchestrates: DB init, File I/O, UI components, Event Bus
 */

import { dbManager }   from './db/database.js';
import { fileManager } from './modules/fileManager.js';
import { deckManager } from './modules/deckManager.js';
import { cardManager } from './modules/cardManager.js';
import { srsManager }  from './modules/srs.js';
import { Sidebar }     from './components/Sidebar.js';
import { CardGrid }    from './components/CardGrid.js';
import { CardEditor }  from './components/CardEditor.js';
import { DeckModal }   from './components/DeckModal.js';
import { studyMode }   from './components/StudyMode.js';
import { studyLauncher } from './components/StudyLauncher.js';
import { quizMode }    from './components/QuizMode.js';
import { statistics }  from './components/Statistics.js';
import { pdfImport }   from './components/PdfImport.js';
import {
    bus, toast, openModal, closeModal,
    setVisible, debounce, renderMarkdown,
} from './utils.js';

// ═══════════════════════════════════════════════════════════════
// APPLICATION CLASS
// ═══════════════════════════════════════════════════════════════

class FlashMindApp {
    constructor() {
        this.sidebar     = new Sidebar();
        this.cardGrid    = new CardGrid();
        this.cardEditor  = new CardEditor();
        this.deckModal   = new DeckModal();
        this.studyMode   = studyMode;
        this.studyLauncher = studyLauncher;
        this.quizMode    = quizMode;
        this.statistics  = statistics;
        this.pdfImport   = pdfImport;
    }

    // ─── BOOTSTRAP ───────────────────────────────────────────────

    async init() {
        try {
            // Phase 1: Load SQL engine
            this._engineReady = false;
            this._setLoadingStatus('Đang tải SQLite engine...', 20);
            await dbManager.initEngine();
            this._engineReady = true;

            // Phase 2: Init components
            this._setLoadingStatus('Khởi tạo giao diện...', 50);
            this.sidebar.init();
            this.cardGrid.init();
            this.cardEditor.init();
            this.deckModal.init();
            this.studyMode.init();   // Phase 2
            this.studyLauncher.init(); // Study Launcher
            this.quizMode.init();    // Quiz Mode
            this.pdfImport.init();   // PDF Import

            // Phase 3: Bind global events
            this._setLoadingStatus('Cấu hình sự kiện...', 75);
            this._bindGlobalEvents();
            this._bindFileEvents();
            this._bindKeyboard();

            // Phase 4: Done
            this._setLoadingStatus('Sẵn sàng! ✨', 100);

            // Apply saved theme (do this before showing UI)
            this._initTheme();

            await this._sleep(400);
            this._showWelcomeScreen();

        } catch (err) {
            console.error('[FlashMind] Init error:', err);
            this._setLoadingStatus(`❌ Lỗi: ${err.message}`, 100);
        }
    }

    // ─── SCREEN TRANSITIONS ───────────────────────────────────────

    _showWelcomeScreen() {
        const loading = document.getElementById('loading-screen');
        loading.classList.add('fade-out');
        loading.addEventListener('transitionend', () => loading.remove(), { once: true });
        setVisible('welcome-screen', true);
    }

    _showApp() {
        setVisible('welcome-screen', false);
        setVisible('app', true);
        this._updateStatusBar();
        this._updateStreak();
    }

    // ─── FILE OPERATIONS ──────────────────────────────────────────

    async _newFile() {
        if (fileManager.isDirty) {
            const confirmed = await this._confirmUnsaved();
            if (!confirmed) return;
        }
        await fileManager.createNew('Untitled');
        this._onFileLoaded();
        toast('✨ Đã tạo file mới', 'success');
    }

    async _openFile() {
        // CRITICAL: showOpenFilePicker() must be called SYNCHRONOUSLY from
        // a user gesture (click). Any await before it breaks the gesture chain.
        // So we call openFile() FIRST, then handle unsaved state AFTER.
        try {
            // Ensure SQLite engine is ready before loading a file
            await this._ensureEngineReady();

            // If dirty, we need to show confirm AFTER file pick but before load.
            // For now: trigger file picker immediately (gesture chain intact),
            // then warn if dirty.
            if (fileManager.isDirty) {
                // Custom non-blocking confirm — show toast info then open picker
                // The FSA picker itself acts as user confirmation of intent
                toast('⚠️ Bạn có thay đổi chưa lưu. Mở file mới sẽ đè lên dữ liệu hiện tại.', 'warning');
            }

            const opened = await fileManager.openFile();
            if (opened) {
                this._onFileLoaded();
                toast(`📂 Đã mở: ${fileManager.fileName}`, 'success');
            }
        } catch (err) {
            if (err.name === 'AbortError') return; // user cancelled
            console.error('[FlashMind] Open file error:', err);
            toast(`Không thể mở file: ${err.message}`, 'error');
        }
    }

    /**
     * Lazily initialize the SQLite engine if not already done.
     * Safe to call multiple times.
     */
    async _ensureEngineReady() {
        if (this._engineReady) return;
        this._setLoadingStatus('Đang tải SQLite engine...', 20);
        await dbManager.initEngine();
        this._engineReady = true;
        this._setLoadingStatus('Sẵn sàng!', 100);
    }

    async _saveFile() {
        try {
            await fileManager.save();
            this._updateDirtyIndicator();
            toast('💾 Đã lưu thành công', 'success');
        } catch (err) {
            toast(`Lỗi khi lưu: ${err.message}`, 'error');
        }
    }

    _onFileLoaded() {
        bus.emit('db:ready');
        this._showApp();
        this._updateHeaderFileName();
        this._updateStatusBar();
        this._updateDirtyIndicator();
    }

    _updateHeaderFileName() {
        const nameEl = document.getElementById('header-file-name');
        if (nameEl) nameEl.textContent = fileManager.fileName;
        const statusEl = document.getElementById('status-file');
        if (statusEl) statusEl.textContent = `📄 ${fileManager.fileName}`;
    }

    _updateDirtyIndicator() {
        const dot = document.getElementById('file-dirty-dot');
        if (dot) dot.classList.toggle('hidden', !fileManager.isDirty);
    }

    _updateStatusBar() {
        const deckCount = deckManager.getAllDecks().length;
        const cardCount = dbManager.getTotalCards();
        const dueCount  = cardManager.getDueCount();  // Phase 2: accurate due count

        const deckEl = document.getElementById('status-deck-count');
        const cardEl = document.getElementById('status-card-count');
        const dueEl  = document.getElementById('status-due');

        if (deckEl) deckEl.textContent = `${deckCount} deck${deckCount !== 1 ? 's' : ''}`;
        if (cardEl) cardEl.textContent = `${cardCount} thẻ`;
        if (dueEl)  dueEl.textContent  = `📅 ${dueCount} cần ôn`;

        // Stats view summary cards
        const setStatEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        setStatEl('stat-total-cards', cardCount);
        setStatEl('stat-due-today',   dueCount);
        setStatEl('stat-mastered',    dbManager.getMasteredCount?.() ?? 0);
        setStatEl('stat-streak',      srsManager.getStreak());

        // Due banner in deck view
        const banner = document.getElementById('due-banner');
        const bannerText = document.getElementById('due-banner-text');
        if (banner && bannerText) {
            const currentDeckId = this.sidebar?.currentDeckId;
            if (currentDeckId) {
                const deckDue = cardManager.getDueCount(currentDeckId);
                if (deckDue > 0) {
                    bannerText.textContent = `📅 ${deckDue} thẻ cần ôn hôm nay`;
                    banner.classList.remove('hidden');
                } else {
                    banner.classList.add('hidden');
                }
            } else {
                banner.classList.add('hidden');
            }
        }
    }

    _updateStreak() {
        const streak = srsManager.getStreak();
        document.getElementById('streak-count').textContent = streak;
    }

    // ─── VIEW MANAGEMENT ──────────────────────────────────────────

    _showCardGrid() {
        setVisible('card-grid',   true);
        setVisible('stats-view', false);
    }

    _showStats() {
        setVisible('card-grid',   false);
        setVisible('stats-view', true);
        this._updateStatusBar();
        // Phase 2: Render charts & heatmap
        requestAnimationFrame(() => this.statistics.render());
    }

    // ─── THEME MANAGEMENT (F4) ────────────────────────────────────

    _initTheme() {
        const saved = localStorage.getItem('fm_theme') || 'dark';
        this._applyTheme(saved);
    }

    _toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next    = current === 'dark' ? 'light' : 'dark';
        this._applyTheme(next);
        localStorage.setItem('fm_theme', next);
        toast(next === 'light' ? '☀️ Chế độ sáng' : '🌙 Chế độ tối', 'info');
    }

    _applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('theme-toggle-icon');
        if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    // ─── UNSAVED CONFIRMATION ─────────────────────────────────────

    _confirmUnsaved() {
        return Promise.resolve(
            window.confirm('Bạn có thay đổi chưa lưu. Tiếp tục sẽ mất dữ liệu. Bạn có chắc?')
        );
    }

    // ─── GLOBAL EVENT BINDINGS ────────────────────────────────────

    _bindGlobalEvents() {
        // Welcome screen buttons
        document.getElementById('btn-new-file')?.addEventListener('click', () => this._newFile());
        document.getElementById('btn-open-file')?.addEventListener('click', () => this._openFile());

        // Header buttons
        document.getElementById('btn-new-file-header')?.addEventListener('click', () => this._newFile());
        document.getElementById('btn-open-file-header')?.addEventListener('click', () => this._openFile());
        document.getElementById('btn-save')?.addEventListener('click', () => this._saveFile());
        document.getElementById('btn-import-pdf')?.addEventListener('click', () => {
            this.pdfImport.open(this.sidebar.currentDeckId || null);
        });

        // [F4] Theme toggle
        document.getElementById('btn-theme-toggle')?.addEventListener('click', () => this._toggleTheme());

        // Sidebar toggle
        document.getElementById('btn-toggle-sidebar')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const onSearch = debounce((e) => {
                this.cardGrid.search(e.target.value);
            }, 300);
            searchInput.addEventListener('input', onSearch);
        }

        // Modal close buttons (data-close attribute)
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => closeModal(btn.dataset.close));
        });

        // Click overlay to close modal
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal(overlay.id);
                }
            });
        });

        // Card delete confirmation
        bus.on('card:delete', card => {
            document.getElementById('confirm-message').textContent =
                `Bạn có chắc muốn xóa thẻ này không?`;
            const btn = document.getElementById('btn-confirm-delete');
            const handler = () => {
                try {
                    cardManager.deleteCard(card.id);
                    toast('Đã xóa thẻ', 'info');
                    bus.emit('card:changed', { deckId: card.deck_id });
                    this._updateStatusBar();
                    closeModal('modal-confirm');
                } catch (err) {
                    toast(err.message, 'error');
                }
                btn.removeEventListener('click', handler);
            };
            btn.addEventListener('click', handler);
            openModal('modal-confirm');
        });

        // View events
        bus.on('view:stats', () => this._showStats());
        bus.on('deck:selected', () => {
            this._showCardGrid();
            this._updateStatusBar();
        });
        bus.on('deck:changed', () => this._updateStatusBar());
        bus.on('card:changed', () => {
            this._updateStatusBar();
            this._updateDirtyIndicator();
        });

        // Study mode — Phase 2 integration
        // Note: studyMode.init() already listens to 'study:start' bus event.
        // We also handle it here for the "Học ngay" button and due-banner.
        bus.on('study:start', ({ deckId, deckName, dueOnly }) => {
            // studyMode.open is called by the bus listener inside StudyMode.init()
            // but we can also update status after session ends
        });
        bus.on('study:closed', () => {
            this._updateStatusBar();
            this._updateStreak();
            this._updateDirtyIndicator();
        });

        // "Ôn tập ngay" due banner button
        document.getElementById('btn-study-due')?.addEventListener('click', () => {
            const deckId   = this.sidebar?.currentDeckId;
            const deckName = this.sidebar?.currentDeckName;
            if (deckId) {
                bus.emit('study:launch', { deckId, deckName });
            } else {
                toast('Vui lòng chọn một deck trước', 'warning');
            }
        });

        // Stats nav
        document.getElementById('btn-stats-nav')?.addEventListener('click', () => {
            this._showStats();
            document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-stats-nav')?.classList.add('active');
        });
    }

    _bindFileEvents() {
        // Dirty indicator update
        bus.on('card:changed', () => this._updateDirtyIndicator());
        bus.on('deck:changed', () => this._updateDirtyIndicator());
    }

    // ─── KEYBOARD SHORTCUTS ───────────────────────────────────────

    _bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Escape → close topmost modal
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
                if (openModals.length) {
                    const last = openModals[openModals.length - 1];
                    closeModal(last.id);
                }
                return;
            }

            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const ctrl = e.ctrlKey || e.metaKey;

            if (ctrl && e.key === 's') { e.preventDefault(); this._saveFile();  return; }
            if (ctrl && e.key === 'o') { e.preventDefault(); this._openFile();  return; }
            if (ctrl && e.key === 'n') { e.preventDefault(); this._newFile();   return; }
            if (ctrl && e.key === 'f') { e.preventDefault(); document.getElementById('search-input')?.focus(); return; }
        });
    }

    // ─── AUTO-SAVE ────────────────────────────────────────────────

    _startAutoSave() {
        const interval = 5 * 60 * 1000; // 5 minutes
        setInterval(async () => {
            if (fileManager.isDirty && fileManager.fileHandle) {
                try {
                    await fileManager.save();
                    this._updateDirtyIndicator();
                } catch (_) { /* Silent */ }
            }
        }, interval);
    }

    // ─── HELPERS ─────────────────────────────────────────────────

    _setLoadingStatus(text, progress) {
        const statusEl  = document.getElementById('loading-status');
        const barEl     = document.getElementById('loading-bar');
        if (statusEl) statusEl.textContent  = text;
        if (barEl)    barEl.style.width     = `${progress}%`;
    }

    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════

const app = new FlashMindApp();

// Wait for DOM + CDN scripts to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (fileManager.isDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});
