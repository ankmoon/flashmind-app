# Rule — Demo Mode Isolation

## Vấn đề đã gặp (Prodweave, 2026-03-21)

Khi implement "demo mode" cho SaaS app có Whop auth, code đặt `S.demoMode = true` bên trong `loadDemoProject()` — một function được gọi bởi CẢ HAI:
- URL param `?demo=true` (web visitor chưa mua)
- Button "See a demo" từ màn hình app (Whop user đã mua)

→ Kết quả: Whop user bị **chặn toàn bộ AI features** sau khi click "See a demo".

---

## Nguyên tắc: LUÔN dùng 2 flag riêng biệt

```javascript
// ✅ ĐÚNG — 2 flag riêng biệt
S.viewingDemo = true;   // Always true khi demo data được load
S.demoMode    = !hasWhopAuth; // Chỉ true với unauth visitor

// ❌ SAI — 1 flag blanket
S.demoMode = true; // Đặt bên trong loadDemo() → block paying users
```

### Mapping logic:

| Flag | Mục đích | Set khi nào |
|------|----------|-------------|
| `S.viewingDemo` | Demo data đang được hiển thị | Trong `loadDemoProject()`, mọi trường hợp |
| `S.demoMode` | User là public visitor (chưa mua) | Chỉ khi `!hasWhopAuth` — trong `loadDemoProject()` |

---

## Checklist khi implement Demo Mode cho SaaS app

- [ ] **Tách 2 flag**: `viewingDemo` (UI state) vs `demoMode` (auth state)
- [ ] **Detect auth TRƯỚC khi set demoMode**: `const hasWhopAuth = !!(S.licenseKey || S.whopToken)`
- [ ] **AI feature guards**: check `S.demoMode` (không phải `S.viewingDemo`)
- [ ] **UI guards** (header buttons, nav): check `S.viewingDemo` hoặc `S.demoMode` tùy context
- [ ] **Nút Back/Restart**: dynamic text dựa trên `hasWhopAuth`
- [ ] **KHÔNG set `demoMode = true` unconditionally** trong shared function

---

## Template chuẩn

```javascript
function loadDemoProject() {
  S.viewingDemo = true;
  const hasWhopAuth = !!(S.licenseKey || S.whopToken || S.whopExperienceId);
  S.demoMode = !hasWhopAuth; // Block AI only for unauthenticated visitors

  // Load demo data...
  
  // Update UI: hide header buttons for web visitors only
  document.querySelectorAll('header .icon-btn').forEach(btn => {
    btn.style.display = S.demoMode ? 'none' : '';
  });

  // Update Back/Restart button text
  const newBtn = document.querySelector('.toolbar .back-btn');
  if (newBtn) {
    newBtn.textContent = hasWhopAuth ? '← Back' : '↺ Restart Demo';
  }
}

// AI feature guard pattern:
async function someAIFeature() {
  if (S.demoMode) {
    showToast('🔒 Demo mode — purchase to use AI features', 'info');
    window.open(PURCHASE_URL, '_blank');
    return;
  }
  // ... rest of function
}
```

---

## Áp dụng cho

Mọi SaaS app có:
- Auth gate (Whop, Stripe, Supabase auth, etc.)
- Demo mode / Preview mode
- Freemium / Trial features

---

## History

| Ngày | Dự án | Vấn đề | Fix |
|------|-------|--------|-----|
| 2026-03-21 | Prodweave | `demoMode = true` bên trong `loadDemoProject()` block cả Whop user | Tách thành `viewingDemo` + `demoMode` với auth check |
