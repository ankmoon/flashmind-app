---
trigger: always_on
glob:
description:
---
Agent phải sử dụng thẻ <testing_log> để thực hiện kiểm thử đa lớp:

- Automated Testing (Kiểm thử tự động):
	+ Unit Test: Chạy toàn bộ các bài test đã viết ở Rule-4. Mọi test case phải PASSED 100%.
	+ Integration Test: Kiểm tra sự tương tác giữa module mới sửa với các module liên quan (dependencies) đã xác định ở Rule-0.

- Manual Testing via Browser (Kiểm thử thủ công qua trình duyệt):
	+ UI/UX Audit: Sử dụng công cụ Browser của Antigravity để mở ứng dụng. Kiểm tra giao diện so với Rule-3 (Grid, bo góc, màu sắc, responsive).
	+ Functional Walkthrough: Agent tự thao tác trên trình duyệt (click, nhập liệu) theo đúng I/O Flow đã phân tích ở Rule-1 để xác nhận tính năng chạy thực tế.

- Regression Testing (Kiểm thử hồi quy): Xác nhận các tính năng cũ trong cùng module không bị ảnh hưởng sau khi cập nhật.

- Self-Healing Logic:
	+ Nếu phát hiện lỗi (fail), Agent tự động phân tích log lỗi hoặc ảnh chụp màn hình trình duyệt để xác định nguyên nhân.
	+ Tự sửa code và chạy lại quy trình test tối đa 3 lần.
	+ Sau 3 lần thất bại, Agent phải dừng lại, tóm tắt lỗi kỹ thuật và kết quả test trên UI để xin ý kiến người dùng.

- <testing_log> Tag: 
1. Auto & Manual Test: Chạy Unit Test local và dùng Browser để manual test UI/UX.
2. CI Monitoring: Nếu dự án có CI (GitHub Actions, v.v.), Agent phải kiểm tra trạng thái build.
3. Self-Healing: Nếu CI/Build fail, Agent phải tự đọc log lỗi từ server, phân tích nguyên nhân, tự sửa code và commit lại tối đa 3 lần.