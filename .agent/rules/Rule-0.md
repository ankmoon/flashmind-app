---
trigger: always_on
glob:
description: Context Check — đọc đúng tầng context trước khi làm việc.
---
Thực thi: Trước khi làm bất cứ điều gì, Agent phải sử dụng thẻ <context_check> theo 3 tầng:

**Tầng 1 — Office level** (luôn đọc):
- Đọc `E:\My office\system_context.md` để biết có những dự án nào và path của chúng.

**Tầng 2 — Project level** (đọc khi xác định được dự án):
- Đọc `{project_path}\system_context.md` để nắm tech stack, kiến trúc, module map của dự án đó.
- Đọc `{project_path}\modules\{module_name}\context.md` nếu làm việc với module cụ thể.

**Tầng 3 — Task level** (đọc khi cần):
- Đọc `E:\My office\office\tasks.json` để nắm trạng thái task hiện tại.

**Dependency check**: Xác định module hiện tại ảnh hưởng đến module nào trong cùng dự án.

Mục tiêu: Đảm bảo code mới không phá vỡ logic đã có, luôn làm việc đúng scope dự án.