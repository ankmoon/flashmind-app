---
trigger: always_on
description: Quy tắc Thẩm định Giao diện và Trải nghiệm Người dùng.
---

1. **Aesthetic Tokens:**
   - Padding/Margin: Gội hệ thống 8px/16px/24px/32px.
   - Border Radius: Standard 8pt, Large 12pt, Full for pill buttons.
   - Shadows: Dùng `box-shadow` nhẹ để tạo chiều sâu (Depth).

2. **Micro-interactivity:**
   - Mọi nút bấm/link phải có `:hover` state (biến đổi màu 10-15%).
   - Sử dụng `transition: all 0.2s ease` cho mọi hiệu ứng động.

3. **Content Hierarchy:**
   - Một trang chỉ có DUY NHẤT một thẻ `<h1>`.
   - Các tiêu đề phải có độ tương phản rõ rệt với Body text.
