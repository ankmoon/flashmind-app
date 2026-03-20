---
description: Quy trình kiểm tra chất lượng tổng thể dự án (Technical Audit).
---

# Workflow — Systematic Project Auditing

### Bước 1: Audit Kiến trúc (Arch Review)
- Đối soát: Code thực tế có đang chạy đúng theo `db-schema.sql` và `api-contract.md` không?

### Bước 2: Audit Code Quality & Security
- Kiểm tra tính bảo trì (Clean code), trùng lặp code.
- **BẮT BUỘC**: Chạy đồng thời **`WF-Security-Audit`** để quét các lỗ hổng (SQLi, XSS, Auth leaks).
- Kiểm tra tính bảo mật (Security holes) tại tầng Logic ứng dụng.

### Bước 3: Đánh giá tiến độ (Progress Audit)
- So sánh các task trong `tasks.json` với file thực tế. Có task nào báo Done nhưng file chưa có không?

### Bước 4: Báo cáo tổng hợp
- Viết file `audit-report.md` chỉ ra các điểm tốt và các điểm cần khắc phục ngay.
