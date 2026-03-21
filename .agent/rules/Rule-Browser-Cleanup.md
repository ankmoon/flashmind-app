---
trigger: always_on
glob:
description: Quy tắc dọn dẹp browser sau khi hoàn thành công việc liên quan tới trình duyệt.
---

## Rule — Browser Cleanup

Áp dụng khi Agent sử dụng Browser (browser_subagent / read_browser_page) cho bất kỳ mục đích nào: test, check bug, UI audit, manual QA, research, preview...

### 1. Nguyên tắc cốt lõi
> **Mở browser → Làm xong → Đóng browser.**
> Không bao giờ để tab/page browser mở sau khi task kết thúc.

### 2. Cleanup Checklist (BẮT BUỘC)
Trước khi kết thúc task có dùng browser, Agent PHẢI:

- [ ] **Đóng tất cả tab/page** đã mở trong phiên làm việc hiện tại
- [ ] **Tắt dev server** nếu Agent tự khởi chạy (`npm run dev`, `npx vite`, `python -m http.server`...) và không cần chạy tiếp
- [ ] **Lưu screenshot/recording** quan trọng vào artifacts TRƯỚC KHI đóng browser

### 3. Quy trình đóng browser
```
Bước 1: Chụp screenshot cuối cùng nếu cần làm bằng chứng (walkthrough)
Bước 2: Đóng từng page đã mở bằng browser tool
Bước 3: Nếu dev server do Agent tự start → terminate command
Bước 4: Xác nhận trong response: "✅ Đã đóng browser và dọn dẹp dev server."
```

### 4. Ngoại lệ
- **KHÔNG đóng** nếu user nói rõ "giữ browser mở" hoặc "để đó tôi xem"
- **KHÔNG đóng** tab/page mà user đã mở sẵn TRƯỚC KHI agent bắt đầu task
- **KHÔNG đóng** dev server nếu user đang dùng (kiểm tra Browser State metadata)

### 5. Self-check
Nếu Agent quên đóng browser, lần tiếp theo nó đọc Browser State và thấy có page cũ từ task trước → Agent PHẢI đóng page đó trước khi bắt đầu task mới.
