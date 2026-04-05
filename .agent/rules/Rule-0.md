---
trigger: always_on
glob:
description: Context Check — đọc đúng tầng context trước khi làm việc.
---
Thực thi: Trước khi làm bất cứ điều gì, Agent phải sử dụng thẻ <context_check>:

**Bước 0 — Brain Shortcut** (ưu tiên nếu `lob-brain` MCP khả dụng):
- Gọi `brain_context(project=<tên project>, char_budget=4000)`
- Có kết quả → **dùng ngay, BỎ QUA Tầng 1-2**. Chỉ đọc file source code cụ thể khi cần edit.
- Không có kết quả → chuyển sang đọc file (Tầng 1-2).

**Tầng 1 — Office level** (đọc khi brain trống hoặc không khả dụng):
- Đọc `E:\My office\system_context.md` để biết có những dự án nào và path của chúng.

**Tầng 2 — Project level** (đọc khi brain trống hoặc không khả dụng):
- Đọc `{project_path}\system_context.md` để nắm tech stack, kiến trúc, module map.
- Đọc `{project_path}\modules\{module_name}\context.md` nếu làm việc với module cụ thể.

**Tầng 3 — Task level** (đọc khi cần):
- Đọc `E:\My office\office\tasks.json` để nắm trạng thái task hiện tại.

**Quy tắc chống lãng phí**:
- KHÔNG đọc brain_context() VÀ file system_context.md cùng lúc — chọn MỘT.
- SKILL.md của agent chỉ đọc KHI CẦN (lazy load), không đọc trước.

**Dependency check**: Xác định module hiện tại ảnh hưởng đến module nào trong cùng dự án.

Mục tiêu: Đảm bảo code mới không phá vỡ logic đã có, luôn làm việc đúng scope dự án. **Tiết kiệm token**.