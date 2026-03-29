---
description: Quy trình viết content BA — từ chọn type đến output bài viết hoàn chỉnh (Blog Long Form, Blog Short Form, Facebook Long Form)
---

# /WF-Content-Writing — BA Content Writing Workflow

> Workflow này dành cho việc viết bài viết về nghề BA theo 3 loại văn phong: Blog Long Form, Blog Short Form, Facebook Long Form.

$ARGUMENTS

---

## BƯỚC 0 — Đọc Skill

Đọc `D:\My office\.agent\agents\content-writer-agent.md` trước khi bắt đầu.

---

## BƯỚC 1 — Intake (Xác nhận đầu vào)

Hỏi user (nếu chưa có đủ):

```
1. TOPIC: Chủ đề bài viết là gì?
2. TYPE: Blog Long Form / Blog Short Form / Facebook Long Form?
3. ANGLE: Góc nhìn — dành cho ai? (người mới / junior BA / BA có kinh nghiệm)
4. KEY POINT: Điểm chính muốn truyền đạt là gì? (1-2 câu)
```

> ⏸️ DỪNG nếu thiếu TOPIC hoặc TYPE — KHÔNG tiến hành nếu chưa có đủ.

---

## BƯỚC 2 — Research & Outline (Nếu cần)

Nếu chủ đề phức tạp hoặc cần chính xác:

- Tra cứu định nghĩa, framework BA liên quan
- Liệt kê 3-5 điểm chính sẽ đề cập
- Xác nhận outline với user nếu bài dài (LF-BLOG)

> Với SF-BLOG và LF-FB: thường không cần outline — viết thẳng.

---

## BƯỚC 3 — Draft

Dùng template tương ứng từ `agents/content-writer-agent.md`:

| Type đã chọn | Template cần dùng |
|---|---|
| Blog Long Form | TEMPLATE: LF-BLOG |
| Blog Short Form | TEMPLATE: SF-BLOG |
| Facebook Long Form | TEMPLATE: LF-FB |

Viết đầy đủ bài, không bỏ sót phần nào của template.

---

## BƯỚC 4 — Self-Review

Chạy Self-Review Checklist từ SKILL.md. Sửa nếu có vấn đề.

Đặc biệt kiểm tra:
- Đúng độ dài chưa? (3-4 trang / ½-1 trang / tone Facebook)
- Câu nào thừa → cắt
- Có chỗ nào không đúng tone → sửa

---

## BƯỚC 5 — Output

Trả ra bài viết hoàn chỉnh dưới dạng:

```
--- [TYPE: LF-BLOG / SF-BLOG / LF-FB] ---
--- [TOPIC] ---

[Toàn bộ nội dung bài viết]
```

> Nếu user muốn lưu file → tạo file `.md` hoặc `.txt` tại `D:\My office\Projects\Blog post\[folder tương ứng]\`

---

## BƯỚC 6 — Save (Tùy chọn)

Nếu user confirm bài ổn:

- Blog Long Form → lưu vào `D:\My office\Projects\Blog post\Blog Long Form\`
- Blog Short Form → lưu vào `D:\My office\Projects\Blog post\Blog Short Form\`
- Facebook Long Form → lưu vào `D:\My office\Projects\Blog post\Facebook Long Form\`

Format tên file: `[Tiêu đề rút gọn].md`

---

## Ví dụ kích hoạt

```
/WF-Content-Writing viết blog long form về kỹ năng đàm phán của BA
/WF-Content-Writing viết facebook post về 5 sai lầm của junior BA
/WF-Content-Writing viết short form về cách đọc ERD nhanh
```
