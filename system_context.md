# System Context — FlashMind (Flashcard App)

> **Đường dẫn**: `D:\My office\Projects\Flashcard\`
> **Cập nhật lần cuối**: 2026-03-19

---

## 🎯 Mô tả dự án

**FlashMind** — Ứng dụng flashcard premium, **local-first**, không cần backend/internet.
- Kết hợp triết lý Quizlet + Anki + Obsidian.
- Dữ liệu lưu cục bộ dưới dạng file `.flashcard` (ZIP chứa SQLite DB).
- Deployed trên Vercel dưới dạng static site.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML + CSS + ES Modules (không framework) |
| Database | `sql.js` v1.10.2 (SQLite WASM — chạy hoàn toàn trên browser) |
| File I/O | `JSZip` v3.10.1 — đóng gói SQLite bytes → `.flashcard` ZIP |
| Markdown | `marked` v9.1.6 + `DOMPurify` v3.0.6 |
| Charts | `Chart.js` v4.4.1 |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Deploy | Vercel (static site, không serverless) |
| PWA | manifest.json, theme-color #7c5cfc |

---

## 📐 Architecture

```
index.html                    ← Entry + all HTML structure (single-page app)
src/
  css/
    main.css                  ← Global tokens, layout, dark theme
    sidebar.css               ← Sidebar component
    cards.css                 ← Card grid & card items
    study.css                 ← Study mode overlay (3D flip)
    pdf-import.css            ← Import panel styles
    quiz.css                  ← Quiz mode styles
    vocab.css                 ← Vocabulary list table styles (P3-3)
  js/
    app.js                    ← Main controller (FlashMindApp class)
    utils.js                  ← EventBus, toast, modal helpers, debounce
    db/
      database.js             ← DatabaseManager (sql.js wrapper, singleton)
      schema.js               ← SQL schema, migrations, DEFAULT_SETTINGS
    modules/
      deckManager.js          ← CRUD decks, nested deck tree
      cardManager.js          ← CRUD cards, due-count queries
      fileManager.js          ← File open/save (.flashcard ZIP via JSZip + FSA API)
      srs.js                  ← SM-2 SRS algorithm + streak tracking
    components/
      Sidebar.js              ← Deck tree UI
      CardGrid.js             ← Card grid/list view
      CardEditor.js           ← Card create/edit modal
      DeckModal.js            ← Deck create/edit modal
      StudyMode.js            ← Study overlay (flip card, rating)
      StudyLauncher.js        ← Pre-study settings launcher
      QuizMode.js             ← Quiz mode (MCQ style)
      Statistics.js           ← Stats view (charts, heatmap, table)
      PdfImport.js            ← Import từ PDF / Excel / CSV
      Settings.js             ← Cấu hình SRS intervals (P3-4)
      VocabList.js            ← Detailed table view (P3-3)
test/
  index.html                  ← Test runner (standalone)
vercel.json                   ← Headers config (X-Frame-Options)
manifest.json                 ← PWA manifest
```

---

## 🗄️ Database Schema (SQLite, SCHEMA_VERSION = 1)

| Table | Mô tả |
|-------|-------|
| `app_meta` | Key-value metadata (schema_version) |
| `decks` | Deck hierarchy, hỗ trợ nested (parent_id) |
| `cards` | Flashcards (front, back, card_type: basic/cloze, tags) |
| `card_reviews` | SRS data per card (easiness, interval, repetitions, due_date) |
| `review_history` | Lịch sử ôn tập (per session rating) |
| `settings` | Key-value settings (theme, daily_new_cards, streak, whop_key, v.v.) |

---

## ⚙️ SRS Algorithm (SM-2)

- Rating scale: 1 (Quên) → 2 (Khó) → 3 (Nhớ) → 4 (Dễ)  
- Map to SM-2: 1=fail, 2=fail, 3=pass-good, 4=pass-easy  
- Easiness factor tối thiểu: 1.3  
- **SRS Intervals**: Có thể cấu hình trong Settings (mặc định: Again=10m, Hard=1d, Good=1d, Easy=4d).  
- Streak tracking: `settings.streak` + `settings.last_study_date`

---

## 🎨 Design System

- **Primary color**: `#7c5cfc` (Tím)
- **Theme**: Dark mode mặc định (`data-theme="dark"`)
- **Grid**: 8px base unit
- **Font**: Inter (body), JetBrains Mono (code)
- **Border radius**: 8px standard, 12px large
- **Micro-animation**: `transition: all 0.2s ease`

---

## 🚀 Deploy Environment

| Env | URL |
|-----|-----|
| Production | Vercel static site (auto-deploy từ git) |
| Local dev | Mở `index.html` trực tiếp qua browser (hoặc Live Server) |

> ⚠️ Cần server để load ES Modules — không thể mở `file://` trực tiếp.  
> Dùng `npx serve .` hoặc VS Code Live Server.

---

## 📋 Modules Map (Cross-module Dependencies)

```
app.js
├── dbManager (database.js)
├── fileManager → dbManager
├── deckManager → dbManager
├── cardManager → dbManager
├── srsManager → dbManager
├── Sidebar → deckManager, bus
├── CardGrid → cardManager, deckManager, bus
├── CardEditor → cardManager, deckManager, bus
├── DeckModal → deckManager, bus
├── StudyMode → srsManager, cardManager, bus
├── StudyLauncher → bus
├── QuizMode → cardManager, srsManager, bus
├── Statistics → srsManager, dbManager, deckManager
└── PdfImport → cardManager, deckManager, bus
```

**Event Bus** (`utils.js`) — key events:
- `db:ready` → trigger khi file load xong
- `deck:selected`, `deck:changed`
- `card:changed`
- `study:start`, `study:launch`, `study:closed`
- `view:stats`
- `card:delete`

---

## 🔐 Auth / License

- `whop_key` lưu trong settings table
- Có endpoint `/api/verify.js` (Vercel Serverless) — verify Whop license
- `license_validated_at` timestamp trong settings

---

## 📝 History

| Ngày | Thay đổi |
|------|---------|
| 2026-03-16 | Khởi tạo dự án FlashMind, Phase 1 (DB + File I/O + Card CRUD) |
| 2026-03-16 | Phase 2: StudyMode (SM-2 SRS), QuizMode, Statistics, PdfImport |
| 2026-03-18 | Deploy Vercel, setup Supabase schema cho users/license |
| 2026-03-19 | Tạo system_context.md, đọc lại toàn bộ context để chuẩn bị tiếp tục |
| 2026-03-19 | **User Feedback Sprint**: Fix 5 bugs StudyMode (unflip, back-btn, off-by-one, stale finish, hide show-answer); Rename SRS → tiếng Việt thân thiện; PdfImport thêm Edit/Delete rows inline; cards.css fix title cutoff; Light/Dark mode toggle (localStorage-based); |
