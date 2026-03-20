---
description: Quy trình tự động soạn thảo và đăng bài lên Facebook sử dụng Antigravity Agent.
---

# /facebook-post — Quy Trình Đăng Bài Facebook (AI-Powered)

$ARGUMENTS

---

## 🎯 Mục Tiêu

Tự động hóa toàn bộ quy trình từ ý tưởng → soạn nội dung → review → đăng bài Facebook thông qua chuỗi agent phối hợp.

---

## 📋 PHASE 1: THU THẬP YÊU CẦU (Agent: Planner)

Agent phải hỏi user các thông tin sau TRƯỚC KHI làm bất cứ điều gì:

```
📌 Để tạo bài đăng Facebook, tôi cần biết:

1. **Chủ đề / Nội dung chính** là gì?
   (VD: ra mắt sản phẩm mới, event, chia sẻ kiến thức, quảng cáo...)

2. **Mục tiêu bài đăng** là gì?
   [ ] Tăng engagement (like, comment, share)
   [ ] Quảng bá sản phẩm/dịch vụ
   [ ] Xây dựng thương hiệu cá nhân / doanh nghiệp
   [ ] Thông báo sự kiện / tin tức

3. **Tone of Voice** mong muốn?
   [ ] Chuyên nghiệp & Tin cậy
   [ ] Vui vẻ & Gần gũi
   [ ] Cảm hứng & Động lực
   [ ] Hài hước & Sáng tạo

4. **Target Audience** (đối tượng chính)?
   (VD: Gen Z, dân văn phòng, startup founders, mẹ bỉm sữa...)

5. **Có hashtag / CTA cụ thể không?**
   (Nếu không, agent sẽ tự đề xuất)

6. **Kèm hình ảnh không?**
   [ ] Có — cung cấp link/file ảnh
   [ ] Có — nhờ AI tạo ảnh minh họa
   [ ] Không cần
```

> 🔴 **CHECKPOINT**: Không tiếp tục nếu chưa có đủ thông tin từ câu 1-3.

---

## ✍️ PHASE 2: SOẠN NỘI DUNG (Agent: Content Writer)

Dựa trên thông tin thu thập được, agent soạn **3 phiên bản nội dung** theo cấu trúc:

### Cấu Trúc Bài Đăng (AIDA Framework)

```
[HOOK — Câu mở đầu thu hút, 1-2 dòng]

[BODY — Nội dung chính, 3-5 dòng]
- Giải quyết pain point hoặc chia sẻ giá trị
- Sử dụng bullet points hoặc emoji để dễ đọc

[CTA — Lời kêu gọi hành động rõ ràng]

[HASHTAGS — 5-10 hashtag phù hợp]
```

### Yêu Cầu Nội Dung

- ✅ Hook phải gây tò mò hoặc đặt câu hỏi trong 3 giây đầu
- ✅ Viết cho mobile-first (đoạn ngắn, nhiều xuống dòng)
- ✅ Emoji được dùng có chủ đích, không spam
- ✅ CTA cụ thể (comment, share, click link, tag bạn bè...)
- ✅ Hashtag research: mix phổ biến + niche-specific
- ❌ Tránh dùng ngôn từ quá formal hoặc marketing lộ liễu

### Output Format — 3 Phiên Bản

```markdown
## 📝 Phiên Bản 1 — [Tone: ...]
[Nội dung đầy đủ]
Hashtags: #...

## 📝 Phiên Bản 2 — [Tone: ...]
[Nội dung đầy đủ]
Hashtags: #...

## 📝 Phiên Bản 3 — [Tone: ...]
[Nội dung đầy đủ]
Hashtags: #...
```

---

## 🖼️ PHASE 3: TẠO ẢNH MINH HỌA (Nếu cần — Agent: Visual Creator)

Nếu user yêu cầu ảnh AI:

1. Agent phân tích nội dung bài đăng để xác định visual theme
2. Tạo prompt ảnh phù hợp với:
   - Brand color / style của user (nếu đã cung cấp)
   - Tỉ lệ **1:1** (post vuông) hoặc **4:5** (portrait) — tối ưu cho Facebook Feed
   - Tone: Photorealistic / Illustrated / Minimalist / Bold Typography

3. Generate ảnh bằng `generate_image` tool

> ⚠️ Nếu user cung cấp ảnh sẵn, bỏ qua bước này.

---

## ✅ PHASE 4: REVIEW & CHỈNH SỬA (Checkpoint với User)

Sau khi có nội dung và ảnh (nếu có), agent trình bày:

```
✅ Nội dung bài đăng đã sẵn sàng!

📄 Xem 3 phiên bản bên trên.
🖼️ Ảnh minh họa: [đính kèm nếu có]

❓ Bạn muốn:
A) Chọn phiên bản X và đăng ngay
B) Chỉnh sửa phiên bản X (yêu cầu thay đổi gì?)
C) Viết lại hoàn toàn (cung cấp hướng mới)
D) Xuất ra file để tự đăng thủ công
```

> 🔴 **CHECKPOINT**: Chờ user xác nhận trước khi đăng hoặc export.

---

## 📤 PHASE 5: XUẤT / ĐĂNG BÀI (Agent: Publisher)

### Option A — Xuất File (Mặc định an toàn)

Agent tạo file `facebook_post_YYYYMMDD_HHMMSS.md` gồm:

```markdown
# Facebook Post — [Ngày giờ]

## Nội Dung Bài Đăng
[Phiên bản được chọn]

## Hashtags
[Danh sách hashtag]

## Hình Ảnh
[Đường dẫn file ảnh hoặc link]

## Ghi Chú Đăng Bài
- Thời điểm tối ưu: [Agent gợi ý giờ vàng]
- Nền tảng: Facebook Page / Personal / Group
- Boost bài: Có / Không

## Checklist Trước Khi Đăng
- [ ] Kiểm tra chính tả lần cuối
- [ ] Xem preview trên mobile
- [ ] Xác nhận link CTA hoạt động
- [ ] Lên lịch đúng giờ vàng
```

### Option B — Đăng Qua API (Nếu cấu hình sẵn)

> ⚠️ Yêu cầu: Facebook Page Access Token đã được cấu hình trong `.env`

Nếu user đã cấu hình Facebook Graph API:

```
Endpoint: POST https://graph.facebook.com/v19.0/{page-id}/feed
Params:
  - message: [nội dung bài]
  - access_token: [từ .env]
  - published: true/false (true = đăng ngay, false = schedule)
  - scheduled_publish_time: [Unix timestamp nếu schedule]
```

Agent sẽ:
1. Đọc `FB_PAGE_ID` và `FB_ACCESS_TOKEN` từ `.env`
2. Chuẩn bị payload
3. Xác nhận với user lần cuối
4. Gọi API và báo kết quả

---

## ⏰ PHASE 6: XÁC NHẬN & BÁO CÁO

Agent báo cáo kết quả cuối:

```markdown
## 🎉 Hoàn Thành!

### Bài Đăng
- Tiêu đề/Hook: [trích dẫn]
- Độ dài: X ký tự
- Số hashtag: X

### Kết Quả
- 📁 Đã xuất file: [đường dẫn]
- ✅ Đã đăng lên Facebook (nếu dùng API)
  - Post ID: [id]
  - Thời gian: [timestamp]

### Gợi Ý Tiếp Theo
- [ ] Lên lịch 3-5 bài cho tuần tới
- [ ] Tạo series nội dung liên quan
- [ ] Theo dõi performance sau 24h
```

---

## 🤖 Agent Matrix

| Phase | Agent Role | Công Việc |
|-------|-----------|-----------|
| 1 | `planner` | Thu thập yêu cầu, brief |
| 2 | `content-writer` | Soạn 3 phiên bản nội dung |
| 3 | `visual-creator` | Tạo/xử lý hình ảnh |
| 4 | `reviewer` | QC nội dung, check tone |
| 5 | `publisher` | Export file / gọi API |

---

## ⚡ Quick Start Examples

```
/facebook-post ra mắt sản phẩm áo thun mới cho Gen Z, tone vui vẻ
/facebook-post chia sẻ tips tăng năng suất làm việc, chuyên nghiệp
/facebook-post thông báo khai trương quán cà phê, kèm ảnh AI
/facebook-post event workshop AI tháng 4, cần CTA đăng ký link
```

---

## 📌 Lưu Ý Quan Trọng

1. **Giờ Vàng Đăng Bài**: 8-9h sáng, 12-13h trưa, 19-21h tối (giờ VN)
2. **Độ Dài Lý Tưởng**: 50-150 từ cho engagement cao nhất
3. **Emoji Rule**: Tối đa 5-7 emoji/bài, dùng đầu câu hoặc bullet
4. **Hashtag Facebook**: Khác Instagram, chỉ cần 3-5 hashtag relevant
5. **Mobile Preview**: 90% user đọc Facebook trên mobile — viết ngắn, ngắt dòng nhiều
