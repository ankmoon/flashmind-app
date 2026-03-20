---
trigger: fb-visual | phase-3-facebook | tạo ảnh facebook
description: Quy tắc tạo và xử lý hình ảnh cho bài đăng Facebook — Phase 3 Visual Creation.
---

# Rule — FB Phase 3: Visual Asset Creation

## Khi Nào Kích Hoạt Phase Này

| Điều kiện | Hành động |
|-----------|----------|
| User cung cấp ảnh sẵn | Bỏ qua Phase 3, dùng ảnh có sẵn |
| User chọn "AI tạo ảnh" | Thực hiện đầy đủ Phase 3 |
| User chọn "Không cần ảnh" | Bỏ qua Phase 3, ghi chú vào brief |

---

## Tiêu Chuẩn Ảnh Facebook

### Tỉ Lệ & Kích Thước

| Loại bài | Tỉ lệ | Pixel đề xuất |
|----------|-------|--------------|
| Feed post thường | 1:1 hoặc 4:5 | 1080×1080 hoặc 1080×1350 |
| Link preview | 1.91:1 | 1200×628 |
| Story/Reels cover | 9:16 | 1080×1920 |

> ✅ **Mặc định**: Tỉ lệ **4:5 (portrait)** — chiếm nhiều diện tích feed nhất.

### Visual Style Guidelines

Agent phải chọn 1 trong 4 style dựa trên tone của bài:

| Tone bài đăng | Visual Style |
|--------------|-------------|
| Chuyên nghiệp | Clean, minimal, corporate. Màu sắc trầm, typography sắc nét |
| Vui vẻ & Gần gũi | Bright colors, illustrations, warm tones |
| Cảm hứng | Cinematic, bold contrast, dramatic lighting |
| Hài hước | Playful, cartoon-ish, unexpected composition |

---

## Quy Trình Tạo Ảnh AI

### Bước 1 — Phân Tích Brief → Xác Định Visual Concept

Đọc `fb_brief_[timestamp].json` để xác định:
- Sản phẩm/chủ thể chính trong ảnh là gì?
- Màu sắc chủ đạo (nếu user có brand colors)
- Cảm xúc ảnh cần truyền tải

### Bước 2 — Xây Dựng Image Prompt

Cấu trúc prompt bắt buộc:
```
[Subject/Main element] + [Setting/Background] + [Lighting] + 
[Color palette] + [Style] + [Composition] + [Quality keywords]
```

Ví dụ tốt:
```
"A modern Vietnamese coffee shop interior, warm golden lighting, 
latte art on wooden table, bokeh background, rich brown and cream 
tones, top-down flat lay, professional product photography, 
4:5 aspect ratio, high detail"
```

### Bước 3 — Generate & Validate

Sau khi generate ảnh:
- Kiểm tra: Không có text bị lỗi, không có tay/ngón tay dị thường
- Kiểm tra: Màu sắc phù hợp với tone bài viết
- Nếu ảnh không đạt → regenerate với prompt điều chỉnh (tối đa 3 lần)

---

## Overlay Text (Nếu Cần)

Nếu bài đăng cần text trên ảnh, tuân theo:
- Text không được chiếm quá 20% diện tích ảnh (Facebook policy)
- Font: Bold, Sans-serif, dễ đọc trên mobile
- Contrast chữ với nền: Tối thiểu 4.5:1 (WCAG AA)

> ⚠️ Facebook giới hạn text trên ảnh quảng cáo — Nếu ảnh dùng cho boost/ads, tối thiểu hóa text.

---

## Output Của Phase 3

- File ảnh được lưu tại đường dẫn agent xác định
- Ghi nhận đường dẫn vào `fb_brief_[timestamp].json`:
  ```json
  "image_path": "absolute/path/to/image.webp",
  "image_style": "minimal | vibrant | cinematic | playful",
  "image_ratio": "1:1 | 4:5 | 16:9"
  ```
