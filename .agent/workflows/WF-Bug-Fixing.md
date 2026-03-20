---
description: Quy trình tiếp nhận, phân tích nguyên nhân gốc rễ và sửa lỗi (Bug Fixing).
---

# Workflow — Professional Bug Fixing (RCA Focus)

### Bước 1: Tái hiện (Reproduce)
- Thu thập bằng chứng: Screenshot, Log lỗi từ Browser Console hoặc Server Log.
- Viết kịch bản tái hiện lỗi vào `docs/bug-reports/{bug-id}.md`.

### Bước 2: Phân tích nguyên nhân gốc rễ (Root Cause Analysis)
- Kiểm tra lại logic tại 3 nơi: 
  - 1. Frontend: Sai logic hiển thị?
  - 2. Backend: Sai logic xử lý/API trả về?
  - 3. Database: Dữ liệu đang bị sai format/quan hệ?
- Trả lời câu hỏi: "Tại sao lỗi này xảy ra?" trước khi sửa.

### Bước 3: Triển khai bản vá (Hotfix)
- Sửa code. Phải đảm bảo không phá vỡ các tính năng liên quan (No regression).

### Bước 4: Kiểm thử lại (Re-test)
- Chạy lại kịch bản ở Bước 1.
- Nếu pass, cập nhật báo cáo QC xác nhận lỗi đã được diệt tận gốc.
