---
trigger: always_on
description: Khởi động mọi session — đọc context đúng tầng trước khi làm bất kỳ điều gì.
---

Trước khi làm bất cứ điều gì, Agent phải dùng thẻ <context_check> để:

## Tầng 1 — Office Overview (luôn đọc)
1. Đọc `E:\My office\system_context.md` — biết danh sách dự án đang tồn tại và path của từng dự án.

## Tầng 2 — Project Context (đọc khi xác định được dự án)
2. Xác định dự án đang làm việc từ yêu cầu của User hoặc file đang mở.
3. Đọc `E:\My office\Projects\{project}\system_context.md` — nắm kiến trúc kỹ thuật, tech stack, module map của riêng dự án đó.
4. Đọc `E:\My office\Projects\{project}\modules\{module_name}\context.md` nếu có — để hiểu chi tiết kỹ thuật module đang làm.

## Tầng 3 — Task State (đọc khi cần biết trạng thái)
5. Đọc `E:\My office\office\tasks.json` — để biết trạng thái hiện tại của các task.

## Quy tắc phân biệt scope
- `E:\My office\system_context.md` → CHỈ chứa danh sách dự án + link. KHÔNG chứa tech detail.
- `{project}\system_context.md` → Chứa tech stack, module map, deploy env của dự án đó.
- `{project}\modules\{name}\context.md` → Chi tiết kỹ thuật từng module.

Mục tiêu: Đảm bảo code/quyết định mới không phá vỡ logic đã có, đúng scope của từng dự án.
