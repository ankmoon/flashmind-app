---
description: Quy trình chuyển đổi yêu cầu nghiệp vụ (BA) thành sản phẩm code hoàn chỉnh, bao gồm phân tích logic và thực thi.
---

# 🚀 Workflow: Từ Yêu Cầu (BA) đến Website Hoàn Chỉnh

Quy trình này hướng dẫn cách tiếp nhận yêu cầu từ khách hàng, phân tích nghiệp vụ và triển khai thành một sản phẩm website chuyên nghiệp.

---

## 📋 Giai đoạn 1: Phân tích & Thu thập Yêu cầu (Discovery)
Mục tiêu: Hiểu rõ "Nỗi đau" của khách hàng và xác định phạm vi dự án.

1. **Tiếp nhận Brief**: Đọc hiểu yêu cầu ban đầu của người dùng.
2. **Khám phá hệ thống**: Tìm kiếm các tài liệu, code có sẵn hoặc context liên quan.
3. **Phỏng vấn/Làm rõ**: Đặt câu hỏi để lấp đầy khoảng trống thông tin.

- **Rules áp dụng**:
  - `Rule-0-ContextCheck.md`: Luôn kiểm tra context trước khi bắt đầu.
  - `Rule-HITL.md`: Xác nhận với người dùng ở các điểm quan trọng.
- **Skills sử dụng**:
  - `ba-agent`: Phân tích nghiệp vụ chuyên sâu.
  - `business-analyst`: Trình bày yêu cầu dưới dạng User Story/Feature List.

---

## 🏗️ Giai đoạn 2: Thiết kế Hệ thống & Context (Architecture)
Mục tiêu: Xây dựng "Bản đồ" cho dự án để AI và Con người cùng hiểu.

1. **Khởi tạo System Context**: Tạo file `system_context.md` để lưu trữ tech stack, folder structure.
2. **Thiết kế Database (nếu có)**: Phác thảo lược đồ dữ liệu.
3. **Quy ước dự án**: Thiết lập các rule riêng cho dự án nếu cần.

- **Rules áp dụng**:
  - `Rule-Project-Structure.md`: Tuân thủ cấu trúc thư mục tiêu chuẩn.
  - `Rule-Contract-First.md`: Thiết kế interface/API trước khi code.
- **Skills sử dụng**:
  - `architecture`: Thiết kế phân tầng hệ thống.
  - `database-design`: Tối ưu hóa cấu trúc dữ liệu.

---

## 🎨 Giai đoạn 3: UI/UX & Giao diện (Design)
Mục tiêu: Tạo ra trải nghiệm người dùng "Wow" ngay từ cái nhìn đầu tiên.

1. **Phác thảo Mockup**: Sử dụng `generate_image` để tạo concept visuals.
2. **Xây dựng Design System**: Định nghĩa màu sắc, typography trong `index.css`.
3. **Thiết kế Component**: Chia nhỏ giao diện thành các thành phần tái sử dụng.

- **Rules áp dụng**:
  - `Rule-FB-Phase3-Visual.md`: Đảm bảo thẩm mỹ cao cấp.
- **Skills sử dụng**:
  - `ui-ux-pro-max`: Kỹ năng thiết kế đỉnh cao.
  - `design-agent`: Tư vấn về bố cục và màu sắc.

---

## 💻 Giai đoạn 4: Thực thi & Coding (Implementation)
Mục tiêu: Viết code sạch, hiệu quả và đúng logic.

1. **Tạo khung (Scaffolding)**: Khởi tạo project (Vite, Next.js...).
2. **Lập trình Logic**: Viết các chức năng theo thứ tự ưu tiên.
3. **Tối ưu hóa**: Đảm bảo code tuân thủ Clean Code.

- **Rules áp dụng**:
  - `Rule-Code-Standard.md`: Chuẩn mực coding.
  - `Rule-Absolute-Path.md`: Luôn dùng đường dẫn tuyệt đối.
  - `coding-style.md`: Style guide của dự án.
- **Skills sử dụng**:
  - `fe-agent` & `be-agent`: Chuyên gia frontend/backend.
  - `clean-code`: Đảm bảo code dễ bảo trì.

---

## 🧪 Giai đoạn 5: Kiểm thử & Xác minh (QA)
Mục tiêu: Đảm bảo không có lỗi và đúng yêu cầu ban đầu.

1. **Chạy Test**: Unit test, Integration test.
2. **Kiểm tra UI/UX**: Check responsive và các hiệu ứng động.
3. **Review Code**: Rà soát lỗi bảo mật và hiệu suất.

- **Rules áp dụng**:
  - `testing.md`: Quy trình test tiêu chuẩn.
  - `security.md`: Rà soát các lỗ hổng.
- **Skills sử dụng**:
  - `qc-agent`: Đảm bảo chất lượng sản phẩm.
  - `verification-loop`: Vòng lặp kiểm thử tự động.

---

## 🚀 Giai đoạn 6: Triển khai (Deployment)
Mục tiêu: Đưa sản phẩm lên môi trường live.

1. **Build**: Tạo bản build production.
2. **Deploy**: Đẩy lên hosting/server (Vercel, Netlify, VPS...).
3. **Hướng dẫn**: Viết README và hướng dẫn sử dụng.

- **Rules áp dụng**:
  - `git-workflow.md`: Quy trình commit và đẩy code.
- **Skills sử dụng**:
  - `devops-agent`: Cấu hình môi trường.
  - `deployment-procedures`: Quy trình deploy an toàn.
