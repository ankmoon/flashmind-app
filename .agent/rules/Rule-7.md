---
trigger: always_on
glob:
description: Context Persistence — ghi đúng tầng, đúng scope sau mỗi task.
---
0. <diff> Tag: Hiển thị nội dung thay đổi.

- Context Persistence (QUAN TRỌNG): Sau khi code xong và test pass, Agent phải ghi vào ĐÚNG tầng:

**Tầng 1 — Office context** (`E:\My office\system_context.md`):
- Chỉ update khi có dự án mới hoặc dự án đổi status.
- File này là INDEX danh sách dự án, không chứa tech detail.

**Tầng 2 — Project context** (`{project_path}\system_context.md`):
- Ghi thay đổi kiến trúc, tech stack, module map, deploy env của dự án.
- Tuyệt đối không copy chi tiết code vào đây.

**Tầng 3 — Module context** (`{project_path}\modules\{name}\context.md`):
- Ghi chi tiết: logic kỹ thuật, API mới, thay đổi data structure, gotchas, history.

- <reflection> Tag: Đúc kết kinh nghiệm làm việc để tối ưu cho session sau.
- Approval Gate: Phải có xác nhận trực tiếp cho các lệnh nhạy cảm.

1. Office context (`E:\My office\system_context.md`)
- Danh sách dự án + path + status.
- KHÔNG chứa tech detail. Chỉ là bản đồ index.

2. Project context (`{project}\system_context.md`)
- Tech stack, module map, cross-module dependencies.
- Deploy environment (staging, production URL).
- ADR — Architecture Decision Records.

3. Module context (`{project}\modules\{name}\context.md`)
- Technical Logic: cách module xử lý dữ liệu.
- API/Function Docs: danh sách interface quan trọng.
- Local Constraints: ràng buộc đặc thù.
- History of Change: nhật ký thay đổi logic lớn.

4. CD Orchestration: Sau khi người dùng duyệt, Agent kích hoạt lệnh deploy (hoặc push code để trigger CD).