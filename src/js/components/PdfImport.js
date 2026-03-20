/**
 * DataImport.js — Universal Flashcard Importer
 * FlashMind App
 *
 * Supports:
 *  • Excel (.xlsx, .xls)  — via SheetJS
 *  • CSV / TSV            — via SheetJS
 *  • PDF (text-based)     — via PDF.js + rule-based parser
 *
 * No AI required.
 */

import { bus, toast } from '../utils.js';
import { cardManager } from '../modules/cardManager.js';
import { deckManager } from '../modules/deckManager.js';

// ── CDN URLs ─────────────────────────────────────────────────────────────────
const XLSX_CDN    = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const PDFJS_CDN   = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WRKR  = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ── Unicode helpers ───────────────────────────────────────────────────────────
const RE_KANJI    = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const RE_KANA     = /[\u3041-\u30ff]/;

// ╔══════════════════════════════════════════════════════════════╗
// ║  DATA IMPORT COMPONENT                                       ║
// ╚══════════════════════════════════════════════════════════════╝
class DataImportComponent {
    constructor() {
        this._xlsxReady    = false;
        this._pdfReady     = false;
        this._parsedRows   = [];
        this._headers      = [];
        this._targetDeckId = null;
        this._overlay      = null;
        this._fileName     = '';   // stored for auto deck-name
    }

    // ── INIT ─────────────────────────────────────────────────────
    init() {
        this._buildOverlay();
        this._bindEvents();
        this._loadXlsx();   // pre-load SheetJS silently
    }

    // ── OPEN / CLOSE ─────────────────────────────────────────────
    open(deckId = null) {
        this._targetDeckId = deckId;
        this._parsedRows   = [];
        this._headers      = [];
        this._overlay.classList.remove('hidden');
        this._resetUI();
        this._refreshDeckOptions();
        if (deckId) {
            const sel = this._q('#imp-deck-select');
            if (sel) sel.value = deckId;
        }
    }

    close() {
        this._overlay.classList.add('hidden');
    }

    // ── LAZY LOADERS ─────────────────────────────────────────────
    _loadXlsx() {
        if (window.XLSX) { this._xlsxReady = true; return Promise.resolve(); }
        return new Promise(res => {
            const s = document.createElement('script');
            s.src = XLSX_CDN;
            s.onload  = () => { this._xlsxReady = true; res(); };
            s.onerror = () => { console.warn('[Import] SheetJS load failed'); res(); };
            document.head.appendChild(s);
        });
    }

    _loadPdfJs() {
        if (window.pdfjsLib) { this._pdfReady = true; return Promise.resolve(); }
        return new Promise(res => {
            const s = document.createElement('script');
            s.src = PDFJS_CDN;
            s.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WRKR;
                this._pdfReady = true;
                res();
            };
            s.onerror = () => { console.warn('[Import] PDF.js load failed'); res(); };
            document.head.appendChild(s);
        });
    }

    // ── BUILD OVERLAY ─────────────────────────────────────────────
    _buildOverlay() {
        const el = document.createElement('div');
        el.id = 'data-import-overlay';
        el.className = 'modal-overlay hidden';
        el.innerHTML = `
        <div class="modal pdf-import-modal">
          <div class="modal-header">
            <h2 class="modal-title">📥 Import Flashcard</h2>
            <button class="modal-close-btn" id="imp-close-btn">✕</button>
          </div>
          <div class="pdf-import-body">

            <!-- ── STEP 1: Upload ── -->
            <div class="pdf-step" id="imp-step-upload">
              <div class="pdf-drop-zone" id="imp-drop-zone">
                <div class="pdf-drop-icon">📊</div>
                <p class="pdf-drop-title">Kéo & thả file vào đây</p>
                <p class="pdf-drop-sub">hoặc</p>
                <button class="btn btn-primary" id="imp-browse-btn">Chọn file</button>
                <input type="file" id="imp-file-input"
                  accept=".xlsx,.xls,.csv,.tsv,.pdf"
                  style="display:none">
                <div class="imp-format-badges">
                  <span class="imp-badge excel">Excel .xlsx</span>
                  <span class="imp-badge excel">.xls</span>
                  <span class="imp-badge csv">CSV</span>
                  <span class="imp-badge csv">TSV</span>
                  <span class="imp-badge pdf">PDF (text)</span>
                </div>
              </div>

              <!-- Tips -->
              <div class="imp-tips">
                <h4>📋 Định dạng Excel được khuyến nghị:</h4>
                <table class="imp-tip-table">
                  <thead><tr><th>Cột A (Front)</th><th>Cột B (Back)</th><th>Cột C (tùy chọn)</th></tr></thead>
                  <tbody>
                    <tr><td>漢字</td><td>かんじ / Hán tự</td><td>Reading</td></tr>
                    <tr><td>単語</td><td>たんご / Từ vựng</td><td>Ví dụ</td></tr>
                  </tbody>
                </table>
                <p class="imp-tip-note">💡 Dòng đầu tiên = tên cột (header). Dữ liệu từ dòng 2 trở đi.</p>
              </div>
            </div>

            <!-- ── STEP 2: Processing ── -->
            <div class="pdf-step hidden" id="imp-step-processing">
              <div class="pdf-processing-wrap">
                <div class="pdf-spinner"></div>
                <p id="imp-proc-msg">Đang đọc file...</p>
                <div class="pdf-progress-track">
                  <div class="pdf-progress-fill" id="imp-progress"></div>
                </div>
              </div>
            </div>

            <!-- ── STEP 3: Column mapping ── -->
            <div class="pdf-step hidden" id="imp-step-mapping">
              <div class="imp-mapping-header">
                <span class="pdf-stat">Tìm thấy <strong id="imp-row-count">0</strong> hàng,
                  <strong id="imp-col-count">0</strong> cột</span>
              </div>

              <!-- Column mapper -->
              <div class="imp-col-mapper">
                <div class="imp-col-row">
                  <div class="imp-col-label">✨ Mặt trước (Front)</div>
                  <select class="form-select" id="imp-sel-front"></select>
                  <label class="imp-combine-label">
                    <input type="checkbox" id="imp-front-combine"> + cột khác:
                  </label>
                  <select class="form-select" id="imp-sel-front2" disabled></select>
                </div>
                <div class="imp-col-row">
                  <div class="imp-col-label">🔄 Mặt sau (Back)</div>
                  <select class="form-select" id="imp-sel-back"></select>
                  <label class="imp-combine-label">
                    <input type="checkbox" id="imp-back-combine"> + cột khác:
                  </label>
                  <select class="form-select" id="imp-sel-back2" disabled></select>
                </div>
                <div class="imp-col-row">
                  <div class="imp-col-label">🏷️ Tags (tùy chọn)</div>
                  <select class="form-select" id="imp-sel-tags">
                    <option value="">-- Không --</option>
                  </select>
                </div>
              </div>

              <!-- Preview table -->
              <div class="imp-preview-label">Xem trước (5 hàng đầu):</div>
              <div class="pdf-table-wrap">
                <table class="pdf-preview-table" id="imp-preview-table">
                  <thead id="imp-preview-head"></thead>
                  <tbody id="imp-preview-body"></tbody>
                </table>
              </div>

              <div class="imp-mapping-actions">
                <button class="btn btn-ghost btn-sm" id="imp-back-btn">← Thay file</button>
                <button class="btn btn-secondary" id="imp-next-btn">Tiếp theo →</button>
              </div>
            </div>

            <!-- ── STEP 4: Confirm & Import ── -->
            <div class="pdf-step hidden" id="imp-step-confirm">
              <div class="pdf-preview-header">
                <div class="pdf-stats-row">
                  <span class="pdf-stat">Sẽ import <strong id="imp-total-count">0</strong> thẻ</span>
                </div>
                <div class="pdf-preview-actions">
                  <button class="btn btn-sm btn-ghost" id="imp-selall-btn">☑ Chọn tất cả</button>
                  <button class="btn btn-sm btn-ghost" id="imp-desel-btn">☐ Bỏ chọn</button>
                </div>
              </div>

              <!-- Full preview table with checkboxes -->
              <div class="pdf-table-wrap" style="max-height:340px">
                <table class="pdf-preview-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" id="imp-check-all" checked></th>
                      <th>Front</th>
                      <th>Back</th>
                      <th>Tags</th>
                      <th style="width:64px">Sửa/Xóa</th>
                    </tr>
                  </thead>
                  <tbody id="imp-confirm-tbody"></tbody>
                </table>
              </div>

                <div class="pdf-import-footer">
                <div class="pdf-deck-row">
                  <label>Import vào deck:</label>
                  <select class="form-select" id="imp-deck-select"></select>
                  <button class="btn btn-sm btn-secondary" id="imp-new-deck-btn">+ Mới</button>
                </div>
                <!-- Inline new-deck form (hidden by default) -->
                <div class="imp-new-deck-form hidden" id="imp-new-deck-form">
                  <input class="form-input" id="imp-new-deck-name" placeholder="Tên deck mới..." />
                  <button class="btn btn-primary btn-sm" id="imp-create-deck-ok">Tạo</button>
                  <button class="btn btn-ghost btn-sm" id="imp-create-deck-cancel">Hủy</button>
                </div>
                <!-- Warning shown when no deck exists -->
                <div class="imp-no-deck-warn hidden" id="imp-no-deck-warn">
                  ⚠️ Chưa có deck nào. Nhấn <strong>+ Mới</strong> để tạo deck trước khi import.
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center">
                  <button class="btn btn-ghost btn-sm" id="imp-back2-btn">← Quay lại</button>
                  <button class="btn btn-primary btn-lg" id="imp-do-import-btn" disabled>
                    ⬇ Import <span id="imp-checked-count">0</span> thẻ
                  </button>
                </div>
              </div>
            </div>

            <!-- ── STEP 5: Done ── -->
            <div class="pdf-step hidden" id="imp-step-done">
              <div class="pdf-done-wrap">
                <div class="pdf-done-icon">🎉</div>
                <h3>Import thành công!</h3>
                <p id="imp-done-msg"></p>
                <button class="btn btn-primary" id="imp-done-close">Xem thẻ ngay</button>
              </div>
            </div>

          </div><!-- /body -->
        </div>
        `;
        document.body.appendChild(el);
        this._overlay = el;
    }

    // ── EVENTS ───────────────────────────────────────────────────
    _bindEvents() {
        const $ = id => document.getElementById(id);

        // Close
        $('imp-close-btn').addEventListener('click', () => this.close());
        this._overlay.addEventListener('click', e => { if (e.target === this._overlay) this.close(); });

        // File pick
        $('imp-browse-btn').addEventListener('click', () => $('imp-file-input').click());
        $('imp-file-input').addEventListener('change', e => {
            const f = e.target.files?.[0];
            if (f) this._processFile(f);
        });

        // Drag & drop
        const dz = $('imp-drop-zone');
        dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag-over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
        dz.addEventListener('drop', e => {
            e.preventDefault();
            dz.classList.remove('drag-over');
            const f = e.dataTransfer.files?.[0];
            if (f) this._processFile(f);
            else toast('Không nhận được file', 'error');
        });

        // Combine checkboxes
        $('imp-front-combine').addEventListener('change', e => {
            $('imp-sel-front2').disabled = !e.target.checked;
            this._renderPreview5();
        });
        $('imp-back-combine').addEventListener('change', e => {
            $('imp-sel-back2').disabled = !e.target.checked;
            this._renderPreview5();
        });

        // Column selects → re-preview
        ['imp-sel-front','imp-sel-front2','imp-sel-back','imp-sel-back2','imp-sel-tags'].forEach(id => {
            $(id)?.addEventListener('change', () => this._renderPreview5());
        });

        // [F2] Delegate edit/delete on confirm table (attached once to document)
        document.addEventListener('click', e => {
            const editBtn = e.target.closest('.imp-edit-btn');
            const delBtn  = e.target.closest('.imp-del-btn');
            if (editBtn) this._handleEditRow(editBtn);
            if (delBtn)  this._handleDelRow(delBtn);
        });

        // Navigation
        $('imp-back-btn').addEventListener('click',  () => this._showStep('upload'));
        $('imp-next-btn').addEventListener('click',  () => this._buildConfirmStep());
        $('imp-back2-btn').addEventListener('click', () => this._showStep('mapping'));

        // Select all
        $('imp-selall-btn').addEventListener('click', () => this._setAllChecked(true));
        $('imp-desel-btn').addEventListener('click',  () => this._setAllChecked(false));
        $('imp-check-all').addEventListener('change', e => this._setAllChecked(e.target.checked));

        // New deck (show inline form)
        $('imp-new-deck-btn').addEventListener('click', () => {
            $('imp-new-deck-form').classList.remove('hidden');
            $('imp-new-deck-name').value = this._fileName || '';
            $('imp-new-deck-name').focus();
            $('imp-new-deck-name').select();
        });

        // Create deck confirm
        $('imp-create-deck-ok').addEventListener('click', () => {
            const name = $('imp-new-deck-name').value.trim();
            if (!name) { $('imp-new-deck-name').focus(); return; }
            const d = deckManager.createDeck({ name, color: '#7c5cfc', icon: '📚' });
            bus.emit('deck:changed');
            $('imp-new-deck-form').classList.add('hidden');
            this._refreshDeckOptions(d.id);
        });
        $('imp-new-deck-name').addEventListener('keydown', e => {
            if (e.key === 'Enter') $('imp-create-deck-ok').click();
            if (e.key === 'Escape') $('imp-create-deck-cancel').click();
        });
        $('imp-create-deck-cancel').addEventListener('click', () => {
            $('imp-new-deck-form').classList.add('hidden');
        });

        // Deck select → enable import btn
        $('imp-deck-select').addEventListener('change', () => this._updateImportBtn());

        // Import
        $('imp-do-import-btn').addEventListener('click', () => this._doImport());
        $('imp-done-close').addEventListener('click', () => {
            this.close();
            bus.emit('card:changed', { deckId: this._targetDeckId });
        });
    }

    // ── PROCESS FILE ─────────────────────────────────────────────
    async _processFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        this._fileName = file.name.replace(/\.[^.]+$/, '');  // store without extension
        this._showStep('processing');
        this._setProgress(10, `Đang đọc: ${file.name}`);

        try {
            if (ext === 'pdf') {
                await this._processPdf(file);
            } else {
                await this._processExcel(file);
            }
        } catch (err) {
            console.error('[Import]', err);
            toast(`Lỗi đọc file: ${err.message}`, 'error');
            this._showStep('upload');
        }
    }

    // ── EXCEL / CSV PROCESSOR ─────────────────────────────────────
    async _processExcel(file) {
        if (!this._xlsxReady) {
            this._setProgress(15, 'Đang tải SheetJS...');
            await this._loadXlsx();
            if (!this._xlsxReady) throw new Error('Không thể tải thư viện đọc Excel. Vui lòng kiểm tra internet.');
        }

        this._setProgress(30, 'Đang parse...');
        const buf = await file.arrayBuffer();
        const wb  = window.XLSX.read(buf, { type: 'array', cellText: true, cellDates: true });

        this._setProgress(60, 'Đang đọc sheet...');

        // Use first sheet
        const sheetName = wb.SheetNames[0];
        const ws        = wb.Sheets[sheetName];

        // Convert to array-of-arrays
        const aoa = window.XLSX.utils.sheet_to_json(ws, {
            header: 1,
            defval: '',
            raw: false,
        });

        if (!aoa || aoa.length < 2) throw new Error('File trống hoặc chỉ có header.');

        // First row = headers
        const raw = aoa[0].map((h, i) => h?.toString().trim() || `Cột ${i + 1}`);
        this._headers = raw;
        this._parsedRows = aoa.slice(1)
            .filter(row => row.some(cell => cell?.toString().trim()))
            .map(row => {
                const obj = {};
                raw.forEach((h, i) => { obj[h] = row[i]?.toString().trim() ?? ''; });
                return obj;
            });

        this._setProgress(90, `Tìm thấy ${this._parsedRows.length} hàng`);
        await this._sleep(300);
        this._setupMappingStep();
        this._showStep('mapping');
    }

    // ── PDF PROCESSOR ─────────────────────────────────────────────
    async _processPdf(file) {
        if (!this._pdfReady) {
            this._setProgress(15, 'Đang tải PDF.js...');
            await this._loadPdfJs();
            if (!this._pdfReady) throw new Error('Không thể tải PDF.js.');
        }

        this._setProgress(20, 'Đang phân tích PDF...');
        const buf  = await file.arrayBuffer();
        const pdf  = await window.pdfjsLib.getDocument({ data: buf }).promise;
        const pages = pdf.numPages;

        const allLines = [];
        for (let i = 1; i <= pages; i++) {
            const page    = await pdf.getPage(i);
            const content = await page.getTextContent();
            const rows    = new Map();
            content.items.filter(it => it.str?.trim()).forEach(it => {
                const key = Math.round(it.transform[5] / 4) * 4;
                if (!rows.has(key)) rows.set(key, []);
                rows.get(key).push({ x: it.transform[4], text: it.str });
            });
            [...rows.entries()]
                .sort((a, b) => b[0] - a[0])
                .forEach(([, cells]) => {
                    cells.sort((a, b) => a.x - b.x);
                    const line = cells.map(c => c.text).join('\t').trim();
                    if (line) allLines.push(line);
                });
            this._setProgress(20 + Math.round(55 * i / pages), `Trang ${i}/${pages}`);
        }

        // Try to detect columns: if many tab-separated lines → treat as table
        const tabLines = allLines.filter(l => l.includes('\t'));
        if (tabLines.length > 5) {
            // Treat like CSV
            const maxCols = Math.max(...tabLines.map(l => l.split('\t').length));
            this._headers = Array.from({ length: maxCols }, (_, i) => `Cột ${i + 1}`);
            this._parsedRows = tabLines.map(l => {
                const parts = l.split('\t');
                const obj = {};
                this._headers.forEach((h, i) => { obj[h] = parts[i]?.trim() ?? ''; });
                return obj;
            });
        } else {
            // Kanji-speed style: group every N lines
            this._headers = ['Kanji', 'Reading', 'Meaning'];
            this._parsedRows = [];
            let i = 0;
            while (i < allLines.length) {
                const line = allLines[i].trim();
                if (RE_KANJI.test(line)) {
                    const reading = (allLines[i+1] || '').trim();
                    const meaning = (allLines[i+2] || '').trim();
                    if (RE_KANA.test(reading) || reading.includes('・')) {
                        this._parsedRows.push({ Kanji: line, Reading: reading, Meaning: meaning });
                        i += meaning ? 3 : 2;
                        continue;
                    }
                }
                i++;
            }
        }

        if (!this._parsedRows.length) throw new Error('Không tìm thấy dữ liệu có cấu trúc. File này có thể là PDF scan (ảnh).');

        this._setProgress(90, `Tìm thấy ${this._parsedRows.length} hàng`);
        await this._sleep(300);
        this._setupMappingStep();
        this._showStep('mapping');
    }

    // ── MAPPING STEP ─────────────────────────────────────────────
    _setupMappingStep() {
        document.getElementById('imp-row-count').textContent = this._parsedRows.length;
        document.getElementById('imp-col-count').textContent = this._headers.length;

        // Populate column selects
        const selIds = ['imp-sel-front','imp-sel-front2','imp-sel-back','imp-sel-back2','imp-sel-tags'];
        selIds.forEach(sid => {
            const sel = document.getElementById(sid);
            sel.innerHTML = sid.includes('tags') || sid.includes('2')
                ? '<option value="">-- Không --</option>'
                : '';
            this._headers.forEach((h, i) => {
                const opt = document.createElement('option');
                opt.value = h;
                opt.textContent = `${h} (Cột ${i+1})`;
                sel.appendChild(opt);
            });
        });

        // Smart defaults: detect kanji/front/back by content
        this._autoSelectColumns();
        this._renderPreview5();
    }

    _autoSelectColumns() {
        const front  = document.getElementById('imp-sel-front');
        const back   = document.getElementById('imp-sel-back');
        const front2 = document.getElementById('imp-sel-front2');
        const sample = this._parsedRows.slice(0, 10);

        // Score each header
        const scores = this._headers.map(h => {
            const hl = h.toLowerCase();
            const vals = sample.map(r => r[h] || '');
            const hasKanji = vals.some(v => RE_KANJI.test(v));
            const hasKana  = vals.some(v => RE_KANA.test(v));
            return { h, hl, hasKanji, hasKana,
                avgLen: vals.reduce((s, v) => s + v.length, 0) / Math.max(vals.length, 1) };
        });

        // Front: prefer kanji / "question" / "word" / shortest
        const frontCand = scores.find(s => s.hasKanji && !s.hasKana)
            || scores.find(s => /kanji|word|term|question|front|q$/.test(s.hl))
            || scores[0];

        // Reading: prefer kana column
        const readingCand = scores.find(s => s.hasKana && s !== frontCand)
            || scores.find(s => /reading|yomi|kana|furigana/.test(s.hl));

        // Back: prefer meaning / answer / longest
        const backCand = scores.find(s => /mean|answer|back|definition|definition|viet|eng/.test(s.hl))
            || scores.find(s => s !== frontCand && s !== readingCand)
            || scores[scores.length - 1];

        if (frontCand) front.value = frontCand.h;
        if (backCand)  back.value  = backCand.h;

        // If there's a reading column, combine it with front
        if (readingCand && readingCand !== frontCand && readingCand !== backCand) {
            const fc = document.getElementById('imp-front-combine');
            fc.checked = true;
            front2.disabled = false;
            front2.value = readingCand.h;
        }
    }

    _renderPreview5() {
        const thead = document.getElementById('imp-preview-head');
        const tbody = document.getElementById('imp-preview-body');
        const cols = this._getSelectedCols();

        // Header row
        thead.innerHTML = `<tr>${['#', cols.frontLabel, cols.backLabel, cols.tagsCol || ''].filter(Boolean).map(h => `<th>${h}</th>`).join('')}</tr>`;

        // Preview 5 rows
        tbody.innerHTML = '';
        this._parsedRows.slice(0, 5).forEach((row, i) => {
            const front = this._buildVal(row, cols.frontCols);
            const back  = this._buildVal(row, cols.backCols);
            const tags  = cols.tagsCol ? row[cols.tagsCol] || '' : '';
            const cells = [`<td style="color:var(--text-muted);font-size:12px">${i+1}</td>`,
                `<td style="font-weight:600">${this._esc(front)}</td>`,
                `<td>${this._esc(back)}</td>`,
                cols.tagsCol ? `<td><span style="font-size:11px;color:var(--accent)">${this._esc(tags)}</span></td>` : ''].filter(Boolean);
            tbody.innerHTML += `<tr>${cells.join('')}</tr>`;
        });
    }

    _getSelectedCols() {
        const fMain = document.getElementById('imp-sel-front').value;
        const fComb = !document.getElementById('imp-sel-front2').disabled
            ? document.getElementById('imp-sel-front2').value : '';
        const bMain = document.getElementById('imp-sel-back').value;
        const bComb = !document.getElementById('imp-sel-back2').disabled
            ? document.getElementById('imp-sel-back2').value : '';
        const tagsCol = document.getElementById('imp-sel-tags').value;

        return {
            frontCols:  [fMain, fComb].filter(Boolean),
            backCols:   [bMain, bComb].filter(Boolean),
            tagsCol,
            frontLabel: [fMain, fComb].filter(Boolean).join(' + ') || 'Front',
            backLabel:  [bMain, bComb].filter(Boolean).join(' + ') || 'Back',
        };
    }

    _buildVal(row, cols) {
        return cols.map(c => row[c] || '').filter(Boolean).join('\n');
    }

    // ── CONFIRM STEP ─────────────────────────────────────────────
    _buildConfirmStep() {
        const cols  = this._getSelectedCols();
        const tbody = document.getElementById('imp-confirm-tbody');
        const frag  = document.createDocumentFragment();

        tbody.innerHTML = '';
        this._parsedRows.forEach((row, i) => {
            const front = this._buildVal(row, cols.frontCols);
            const back  = this._buildVal(row, cols.backCols);
            const tags  = cols.tagsCol ? row[cols.tagsCol] || '' : '';
            if (!front && !back) return;

            const tr = document.createElement('tr');
            tr.dataset.idx = i;
            tr.innerHTML = `
                <td><input type="checkbox" class="imp-row-chk" data-idx="${i}" checked></td>
                <td class="imp-cell-front" data-edited="${this._esc(front)}" style="font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._esc(front)}</td>
                <td class="imp-cell-back" data-edited="${this._esc(back)}" style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._esc(back)}</td>
                <td class="imp-cell-tags" style="font-size:11px;color:var(--accent)">${this._esc(tags)}</td>
                <td style="white-space:nowrap">
                    <button class="imp-edit-btn" title="Sửa" style="padding:2px 6px;border-radius:4px;border:1px solid var(--border);background:var(--surface-3);color:var(--text-muted);cursor:pointer;font-size:13px;margin-right:2px">✏️</button>
                    <button class="imp-del-btn" title="Xóa" style="padding:2px 6px;border-radius:4px;border:1px solid var(--border);background:var(--surface-3);color:var(--danger);cursor:pointer;font-size:13px">🗑</button>
                </td>
            `;
            frag.appendChild(tr);
        });

        tbody.appendChild(frag);
        tbody.addEventListener('change', () => this._updateImportBtn());

        document.getElementById('imp-total-count').textContent = this._parsedRows.length;
        this._refreshDeckOptions();
        this._updateImportBtn();
        this._showStep('confirm');
    }

    /** [F2] Inline edit front/back cells on ✏️ click */
    _handleEditRow(btn) {
        const tr = btn.closest('tr');
        if (!tr) return;
        ['.imp-cell-front', '.imp-cell-back'].forEach(sel => {
            const td = tr.querySelector(sel);
            if (!td || td.querySelector('input')) return;
            const orig = td.dataset.edited || td.textContent;
            const input = document.createElement('input');
            input.className = 'imp-inline-edit';
            input.value = orig;
            input.style.cssText = 'width:100%;border:1px solid var(--primary);border-radius:4px;padding:2px 5px;background:var(--surface-3);color:var(--text);font-size:13px;outline:none;box-sizing:border-box';
            input.addEventListener('blur', () => {
                const val = input.value.trim();
                td.dataset.edited = val;
                td.textContent = val || '(trống)';
            });
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') input.blur();
                if (e.key === 'Escape') { td.dataset.edited = orig; td.textContent = orig; }
            });
            td.textContent = '';
            td.appendChild(input);
            if (sel === '.imp-cell-front') setTimeout(() => input.focus(), 10);
        });
    }

    /** [F2] Remove row from confirm table on 🗑 click */
    _handleDelRow(btn) {
        btn.closest('tr')?.remove();
        this._updateImportBtn();
    }


    // ── IMPORT ───────────────────────────────────────────────────
    _doImport() {
        const deckId = document.getElementById('imp-deck-select').value;
        if (!deckId) { toast('Vui lòng chọn deck', 'warning'); return; }

        // [F2] Read directly from DOM — supports edited & deleted rows
        const checkedRows = [...document.querySelectorAll('.imp-row-chk:checked')]
            .map(cb => cb.closest('tr'))
            .filter(Boolean);

        let ok = 0, errors = 0;
        for (const tr of checkedRows) {
            const frontTd = tr.querySelector('.imp-cell-front');
            const backTd  = tr.querySelector('.imp-cell-back');
            const tagsTd  = tr.querySelector('.imp-cell-tags');

            const front   = (frontTd?.dataset.edited ?? frontTd?.textContent ?? '').trim();
            const back    = (backTd?.dataset.edited  ?? backTd?.textContent  ?? '').trim();
            const rawTags = (tagsTd?.textContent ?? '').trim();
            const tags    = rawTags
                ? rawTags.split(/[,;、，]/).map(t => t.trim()).filter(Boolean)
                : ['imported'];

            if (!front && !back) continue;
            try {
                cardManager.createCard({
                    deckId,
                    front:    front || '(trống)',
                    back:     back  || '(trống)',
                    cardType: 'basic',
                    tags,
                });
                ok++;
            } catch (e) {
                errors++;
                if (errors <= 3) console.warn('[Import] card error:', e);
            }
        }


        this._targetDeckId = deckId;
        const errMsg = errors ? ` (${errors} lỗi)` : '';
        document.getElementById('imp-done-msg').textContent = `Đã thêm ${ok} thẻ vào deck.${errMsg}`;
        bus.emit('card:changed', { deckId });
        bus.emit('deck:changed');
        this._showStep('done');
        toast(`✅ Import ${ok} thẻ thành công!`, 'success');
    }

    // ── UI HELPERS ────────────────────────────────────────────────
    _showStep(step) {
        ['upload','processing','mapping','confirm','done'].forEach(s => {
            document.getElementById(`imp-step-${s}`)?.classList.toggle('hidden', s !== step);
        });
    }

    _setProgress(pct, msg) {
        const el = document.getElementById('imp-progress');
        const mg = document.getElementById('imp-proc-msg');
        if (el) el.style.width = `${pct}%`;
        if (mg) mg.textContent = msg;
    }

    _resetUI() {
        this._showStep('upload');
        document.getElementById('imp-file-input').value = '';
        this._setProgress(0, '');
    }

    _setAllChecked(val) {
        document.querySelectorAll('.imp-row-chk').forEach(c => c.checked = val);
        document.getElementById('imp-check-all').checked = val;
        this._updateImportBtn();
    }

    _updateImportBtn() {
        const count  = document.querySelectorAll('.imp-row-chk:checked').length;
        const deckId = document.getElementById('imp-deck-select')?.value;
        const btn    = document.getElementById('imp-do-import-btn');
        const cnt    = document.getElementById('imp-checked-count');
        if (cnt) cnt.textContent = count;
        if (btn) btn.disabled = !(count > 0 && deckId);
    }

    _refreshDeckOptions(selectId = null) {
        const sel  = document.getElementById('imp-deck-select');
        const warn = document.getElementById('imp-no-deck-warn');
        if (!sel) return;

        const decks = deckManager.getAllDecks?.() || [];
        sel.innerHTML = decks.length ? '<option value="">-- Chọn deck --</option>' : '';

        for (const d of decks) {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.icon || '📚'} ${d.name}`;
            // auto-select: explicit id > targetDeckId > if only one deck, select it
            if (d.id === (selectId || this._targetDeckId)) opt.selected = true;
            sel.appendChild(opt);
        }

        // If only one deck and nothing pre-selected, auto-select it
        if (decks.length === 1 && !selectId && !this._targetDeckId) {
            sel.value = decks[0].id;
        }

        // Show/hide no-deck warning
        if (warn) warn.classList.toggle('hidden', decks.length > 0);

        this._updateImportBtn();
    }

    _q(id) { return document.getElementById(id); }
    _esc(s) {
        return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// ── SINGLETON ────────────────────────────────────────────────────────────────
export const pdfImport = new DataImportComponent();
