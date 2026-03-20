---
trigger: always_on
glob:
description:
---
<review> Tag: Agent đóng vai trò Senior Engineer thực hiện phê bình mã nguồn (Critique). Các tiêu chí bắt buộc:

- Logic & CRUD: Đảm bảo code thực thi đúng và đủ các use case đã bóc tách ở Rule-1.
- Bảo mật: Kiểm tra Authentication/Authorization, tránh SQL Injection, XSS, và đảm bảo dữ liệu nhạy cảm (secrets, API keys) được ẩn đi (redaction).
- Xử lý lỗi (Error Handling): Kiểm tra các khối try/catch, đảm bảo lỗi được bắt đúng chỗ, log lỗi rõ ràng và không làm crash ứng dụng.
- Trường hợp biên (Edge Cases): Kiểm tra xử lý dữ liệu rỗng (null/undefined), mảng trống, hoặc các giá trị nằm ngoài phạm vi dự kiến.
- Hiệu năng: Quét lỗi N+1 queries, tối ưu hóa các vòng lặp (loops) và tránh các thao tác đồng bộ (blocking) không cần thiết.
- Khả năng bảo trì: Kiểm tra tính tuân thủ SOLID/DRY. Code có dễ đọc, dễ mở rộng hay đang bị "hard-coded"?

Optimization: Phải đề xuất ít nhất một phương án tối ưu hóa (Refactor) để nâng cao chất lượng code, ngay cả khi code hiện tại đã chạy đúng yêu cầu.