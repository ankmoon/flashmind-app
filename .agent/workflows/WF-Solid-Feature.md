---
description: Quy trình thực hiện hoàn thiện 1 tính năng từ đầu đến cuối trong 1 phiên làm việc.
---

# Workflow — Solid Feature Implementation (One-Session)

Sử dụng quy trình này khi Sếp yêu cầu làm một module/tính năng mới:

### Bước 1: Phân tích & Thiết kế (The Blueprint)
- Đọc yêu cầu -> Viết `docs/analysis.md`.
- Thiết kế Database -> Viết `docs/db-schema.sql`.
- Thiết kế API -> Viết `docs/api-contract.md`.
*Dừng lại xác nhận với Sếp nếu yêu cầu quá phức tạp.*

### Bước 2: Triển khai Backend (The Core)
- Code Logic API thực tế tại `src/backend`.
- Test các Endpoint bằng lệnh `curl` hoặc `invoke`.

### Bước 3: Triển khai Frontend (The UI)
- Code giao diện thực tế tại `src/frontend` (Connect thẳng API ở Bước 2).
- Đảm bảo UI hiện đại, đẹp, mượt.

### Bước 4: Tích hợp hệ thống (The Link)
- Chỉnh sửa server chính để "mount" Router mới vào.

### Bước 5: Kiểm tra cuối cùng (The Audit)
- Tự chạy thử -> Viết `docs/qa-report.md` báo cáo kết quả thực tế.
