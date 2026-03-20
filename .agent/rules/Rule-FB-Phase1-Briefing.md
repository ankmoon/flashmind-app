---
trigger: facebook-post | /facebook-post | đăng bài facebook
description: Quy tắc bắt buộc khi bắt đầu quy trình soạn bài Facebook — Phase 1 Thu Thập Yêu Cầu.
---

# Rule — FB Phase 1: Briefing & Requirement Collection

## ⚠️ Bất Di Bất Dịch: Không Soạn Trước Khi Brief Xong

Agent **TUYỆT ĐỐI KHÔNG** được bắt đầu soạn nội dung bài đăng nếu chưa thu thập đủ 3 thông tin tối thiểu:

1. **Chủ đề / nội dung chính** — Bài đăng về cái gì?
2. **Mục tiêu bài đăng** — Muốn người đọc làm gì sau khi đọc?
3. **Tone of voice** — Cách nói chuyện như thế nào?

> 🔴 Thiếu bất kỳ 1 trong 3 → BẮT BUỘC hỏi lại. Không được tự suy luận.

---

## Quy Trình Brief (Bắt Buộc Theo Thứ Tự)

### Bước 1 — Gửi Brief Form
Trình bày toàn bộ brief form (6 câu hỏi theo workflow) cho user một lần duy nhất. Không hỏi lẻ tẻ từng câu.

### Bước 2 — Validate Đầu Vào
Sau khi user trả lời, kiểm tra:

| Thông tin | Đủ điều kiện | Cần làm rõ thêm |
|-----------|-------------|-----------------|
| Chủ đề | Cụ thể, có thể viết thành bài | Quá chung chung → hỏi ví dụ cụ thể |
| Mục tiêu | 1 mục tiêu rõ ràng | Nhiều mục tiêu → hỏi ưu tiên số 1 |
| Tone | 1 tone được chọn | Mâu thuẫn → đề xuất tone phù hợp nhất |
| Audience | Có/Không — OK đều được | Agent tự suy luận nếu không có |
| Hashtag/CTA | Có/Không — OK đều được | Agent sẽ đề xuất ở Phase 2 |
| Ảnh | Rõ ràng 1 trong 3 lựa chọn | Hỏi lại nếu không rõ |

### Bước 3 — Tạo Brief Summary
Trước khi chuyển sang Phase 2, agent phải tóm tắt lại brief:

```
📋 BRIEF SUMMARY — Xác nhận trước khi soạn bài

• Chủ đề: [...]
• Mục tiêu: [...]
• Tone: [...]
• Audience: [...]
• CTA mong muốn: [...]
• Ảnh: [...]

✅ Bắt đầu soạn nội dung? (Y để tiếp tục / N để chỉnh sửa brief)
```

> 🔴 Không tiếp tục nếu user chưa confirm Y.

---

## Các Lỗi Phổ Biến Cần Tránh

- ❌ Tự đoán tone là "vui vẻ" khi user chưa nói
- ❌ Soạn bài ngay khi user chỉ nói "viết bài về sản phẩm"
- ❌ Hỏi từng câu riêng lẻ thay vì gửi toàn bộ brief form 1 lần
- ❌ Bỏ qua bước Brief Summary trước khi chuyển phase

---

## Output Của Phase 1

File `fb_brief_[timestamp].json` được tạo trong thư mục hiện hành:

```json
{
  "timestamp": "2026-03-12T21:00:00+07:00",
  "topic": "...",
  "goal": "engagement | promotion | branding | event",
  "tone": "professional | friendly | inspirational | humorous",
  "audience": "...",
  "cta": "...",
  "image_option": "provided | ai_generate | none",
  "image_ref": "..." 
}
```
