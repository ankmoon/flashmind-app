---
trigger: always_on
description: Context Persistence — Ghi nhận thay đổi vào đúng tầng context sau mỗi task hoàn thành.
---

Sau khi code xong và test pass, Agent PHẢI thực hiện theo thứ tự:

## 1. Cập nhật Office-level context (Tầng 1)
File: `E:\My office\system_context.md`

CHỈ cập nhật khi:
- Có **dự án mới** được tạo (thêm vào bảng danh sách dự án)
- Có **dự án hoàn thành** hoặc đổi status
- KHÔNG ghi tech detail, KHÔNG ghi logic nghiệp vụ vào đây

> ⚠️ File này chỉ là **bản đồ index**, không phải nơi lưu kiến thức kỹ thuật.

## 2. Cập nhật Project-level context (Tầng 2)
File: `E:\My office\Projects\{project}\system_context.md`

Ghi nhận khi có thay đổi về:
- Tech stack, kiến trúc tổng thể của dự án
- Luồng nghiệp vụ liên module trong dự án
- Dependency mới phát sinh giữa các module
- Quyết định kiến trúc (ADR)
- Môi trường deploy (staging, production URL)

> ⚠️ TUYỆT ĐỐI không copy chi tiết code vào đây.

## 3. Cập nhật Module-level context (Tầng 3)
File: `E:\My office\Projects\{project}\modules\{module_name}\context.md`

Ghi chi tiết:
- Logic kỹ thuật mới được thêm
- Endpoints / functions mới
- Thay đổi cấu trúc dữ liệu nội bộ
- Gotchas / lưu ý cho developer sau này
- History of Change

## 4. Cập nhật tasks.json
File: `E:\My office\office\tasks.json`
- `status: "DONE"` nếu hoàn thành
- `status: "REVIEW"` nếu cần QC kiểm tra
- Ghi timestamp vào history của task

## ✅ Commit Gate
Trước khi kết thúc response, Agent phải xác nhận:
> "✅ Đã cập nhật: [danh sách file đã ghi]"

Nếu bỏ sót bước này, context sẽ bị lỗi thời và agent sau sẽ làm việc sai.
