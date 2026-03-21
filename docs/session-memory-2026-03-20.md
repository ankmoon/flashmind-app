# FlashMind Session Memory — 2026-03-20

## 🎯 Session Summary
User Feedback Sprint — 11 improvements implemented & deployed to **flashmind-psi.vercel.app**

---

## ✅ Changes Implemented

### StudyMode.js — 5 Bug Fixes
| Fix | Mô tả |
|-----|-------|
| F5 Unflip | Click card lần 2 → lật về mặt trước |
| F7 Back button | `_history[]` stack — pop để quay lại thẻ trước |
| F8 Off-by-one | Queue slice chính xác theo newLimit |
| F9 Stale finish | `_resetFinishScreen()` mỗi lần `open()` |
| F10 Hide show-answer | Ẩn nút "Xem đáp án" trên finish screen |

### Terminology Rename
- `StudyLauncher.js` + `index.html`: "SRS" → "Ôn tập thông minh", "SM-2 SRS" → "Học theo lịch"

### PdfImport.js — Edit/Delete Rows
- `_buildConfirmStep()`: thêm cột ✏️/🗑 buttons
- `_handleEditRow()`: inline editing cells → `data-edited` attribute
- `_handleDelRow()`: xóa row khỏi DOM
- `_doImport()`: đọc `data-edited` từ DOM thay vì `_parsedRows`
- **Bug fix extra**: `$(document)` trong `_bindEvents` là null → crash app → đã fix

### CSS & Visual
- `cards.css`: fix card title bị cắt
- `main.css`: CSS variables cho light theme
- Light/Dark mode: `localStorage.fm_theme` + `data-theme` attribute trên `<html>`
- Toggle button: `#btn-theme-toggle` trong header

### Auto-Save SRS (Feature)
```
StudyMode._finish()
  → bus.emit('study:finished')
  → app.js: bus.on('study:finished', () => fileManager.save())
  → toast "💾 SRS đã lưu tự động"
```
**Guard**: chỉ save nếu `fileHandle` tồn tại (tránh auto-download trên Firefox/Safari)

---

## 🧠 SRS Logic (SM-2)

```js
RATING_MAP = { 1:1, 2:2, 3:3, 4:5 }  // Dễ skip rating 4 → map thành 5 (max E-factor gain)
```

| Rating | Repetitions | Interval |
|--------|-------------|----------|
| Quên/Khó (<3) | reset = 0 | 1 ngày |
| rep=0, rating≥3 | → 1 | 1 ngày |
| rep=1, rating≥3 | → 2 | 6 ngày |
| rep>1, rating≥3 | → +1 | prev × E-Factor |

- **Due query**: `WHERE repetitions > 0 AND due_date <= now`
- **New cards**: `repetitions=0` → vào "New" queue theo `daily_new_cards`
- **card_reviews** row tạo khi `createCard()` → Import dùng createCard() nên OK
- **Root cause bug cũ**: `auto_save: true` trong settings là dummy — không có code chạy

---

## 🚀 Deploy

- **URL**: https://flashmind-psi.vercel.app
- **Method**: `npx vercel --prod --yes` (không có GitHub remote)
- Git identity: `Tank / tank@flashmind.app` (local repo config)

---

## 📝 Files Modified
- `src/js/components/StudyMode.js`
- `src/js/components/StudyLauncher.js`  
- `src/js/components/PdfImport.js`
- `src/js/app.js`
- `src/css/cards.css`
- `src/css/main.css`
- `src/css/study.css`
- `index.html`
- `system_context.md` (History updated)
