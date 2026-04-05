---
description: Requirement Tracking — Bám sát yêu cầu gốc qua nhiều turns
---

# WF-Requirement-Tracking

Áp dụng khi: session dài (>5 turns), task có nhiều component, hoặc user đề cập nhiều yêu cầu theo thời gian.

## Bước 1 — Tạo Requirement Anchor khi bắt đầu

Ngay đầu session hoặc khi nhận task mới phức tạp, tạo danh sách cố định:

```
REQ-01: [tên] — [mô tả 1 dòng] — STATUS: pending
REQ-02: ...
```

Ghi vào task.md hoặc nhắc lại trong response đầu tiên.

## Bước 2 — Check Requirements TRƯỚC khi code

Trước mỗi lần thay đổi code/file, đối chiếu lại danh sách REQ:
- REQ nào đang giải quyết?
- REQ nào chưa làm?
- Thay đổi này có mâu thuẫn với REQ nào không?

## Bước 3 — Khi user phát sinh yêu cầu MỚI giữa chừng

Không bỏ qua, không merge im lặng. Phải:
1. Đặt tên REQ mới (REQ-0X)
2. Kiểm tra xem nó ảnh hưởng REQ cũ nào
3. Xác nhận lại toàn bộ REQ list với user nếu có conflict

## Bước 4 — Summary check trước khi kết thúc session

Trước khi đóng session, liệt kê:

| REQ | Mô tả | Status |
|-----|-------|--------|
| REQ-01 | ... | ✅ Done |
| REQ-02 | ... | ⏳ Partial |
| REQ-03 | ... | ❌ Missed |

Nếu có REQ bị Missed hoặc Partial → PHẢI nêu rõ lý do và hướng xử lý tiếp theo.

## Anti-patterns cần tránh

- ❌ Viết lại file mà không check xem đã đủ REQ chưa
- ❌ Thêm tính năng mới trong khi REQ cũ chưa verify
- ❌ Trả lời câu hỏi lẻ mà quên mất task đang dở
- ❌ Thay đổi architecture giữa chừng mà không thông báo conflict với REQ cũ

## Ứng dụng với LOB Brain (case study session này)

REQ gốc bị miss:
- REQ-03: Máy trạm có brain riêng (spoke mode), KHÔNG chỉ relay lên hub
  → Bị miss vì tập trung quá vào installer UX
- REQ-04: Dashboard accessible ngay sau install để xem/sửa config
  → Implement xong nhưng chưa verify được trên client thật
- REQ-05: Installer phải KHÔNG tắt ngay — user phải đọc được kết quả
  → Bị lỗi `$ErrorActionPreference='Stop'` làm crash im lặng
