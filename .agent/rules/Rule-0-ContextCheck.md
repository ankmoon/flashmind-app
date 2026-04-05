---
trigger: always_on
description: Khởi động mọi session — đọc context đúng tầng trước khi làm bất kỳ điều gì.
---

Trước khi làm bất cứ điều gì, Agent phải dùng thẻ <context_check> để:

## Bước 0 — Brain Shortcut (ưu tiên nếu lob-brain khả dụng)

Nếu MCP tool `lob-brain` đang hoạt động:
1. Gọi `brain_context(project=<tên project>, char_budget=4000)`
2. Nếu KẾT QUẢ CÓ NỘI DUNG → **dùng ngay, BỎ QUA Tầng 1-2** bên dưới.
3. Nếu KẾT QUẢ TRỐNG → chuyển sang đọc file như bình thường (Tầng 1-2).

> ⚡ Brain context đã chứa sẵn tóm tắt project: tech stack, module map, quyết định kiến trúc.
> Không cần đọc lại file nếu brain đã có.

## Tầng 1 — Office Overview (chỉ đọc khi brain trống hoặc không khả dụng)
1. Đọc `E:\My office\system_context.md` — biết danh sách dự án đang tồn tại và path của từng dự án.

## Tầng 2 — Project Context (chỉ đọc khi brain trống hoặc không khả dụng)
2. Xác định dự án đang làm việc từ yêu cầu của User hoặc file đang mở.
3. Đọc `E:\My office\Projects\{project}\system_context.md` — nắm kiến trúc kỹ thuật, tech stack, module map.
4. Đọc `E:\My office\Projects\{project}\modules\{module_name}\context.md` nếu có — chi tiết module đang làm.

## Tầng 3 — Task State (đọc khi cần biết trạng thái)
5. Đọc `E:\My office\office\tasks.json` — để biết trạng thái hiện tại của các task.

## Quy tắc phân biệt scope
- `E:\My office\system_context.md` → CHỈ chứa danh sách dự án + link. KHÔNG chứa tech detail.
- `{project}\system_context.md` → Chứa tech stack, module map, deploy env của dự án đó.
- `{project}\modules\{name}\context.md` → Chi tiết kỹ thuật từng module.

## Quy tắc chống double-read
- KHÔNG đọc `brain_context()` VÀ file `system_context.md` cùng lúc.
- Brain đã có → chỉ đọc thêm file source code cụ thể khi cần edit.
- Brain trống → đọc file, rồi cuối session tự brain_store để lần sau dùng brain.

Mục tiêu: Đảm bảo code/quyết định mới không phá vỡ logic đã có, đúng scope của từng dự án. **Tiết kiệm token**.
