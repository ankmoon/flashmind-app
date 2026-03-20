---
trigger: every_file_write
description: Quy định bắt buộc về đường dẫn để tránh bị code nhầm chỗ.
---

# Rule — Path Absolute Authority

Mọi Agent (FE, BE, SA, DevOps, BA) khi sử dụng tool `write_to_file` hoặc `run_command` PHẢI tuân thủ:

1. **Sử dụng Đường dẫn Tuyệt đối (Absolute Path)**:
   - Sai: `src/main.js`
   - Đúng: `E:\My office\Projects\{tên-dự án}\src\frontend\main.js`

2. **Xác minh Thư mục**:
   - Trước khi ghi bất kỳ file code nào, hãy kiểm tra xem thư mục `E:\My office\Projects\{tên-dự án}` đã tồn tại chưa bằng `list_dir`.
   - Nếu chưa có, hãy báo lỗi và yêu cầu BA Agent tạo folder dự án trước.

3. **Workspace Awareness**:
   - Nếu mày thấy đang ở trong một workspace tạm hoặc workspace mặc định của Antigravity (C:\Users\...), hãy chủ động chuyển hướng làm việc sang ổ `E:\My office\Projects\`.
   - Kết quả công việc CHỈ được tính là hoàn thành khi nó nằm ở đúng thư mục dự án trên ổ E.

4. **Khai báo Output**:
   - Sau khi tạo file, hãy báo cáo rõ: *"✅ Đã lưu kết quả tại [Link tuyệt đối]"*.
