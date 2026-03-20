---
trigger: always_on
description: Quy tắc Sửa lỗi Hệ thống và Truy vết Nguyên nhân.
---

1. **Reproduction Proof:** 
   - Không được sửa lỗi nếu chưa có bằng chứng tái hiện (log, script hoặc ảnh chụp).
   - Phải chạy script tái hiện này sau khi sửa để xác nhận thành công.

2. **Deep RCA (Root Cause Analysis):**
   - Phải tìm ra 3 "Tại sao" cho một lỗi.
   - Ví dụ: Lỗi không hiện ảnh -> Tại sao? URL sai -> Tại sao? Database lưu null -> Tại sao? Input validation bị hỏng.

3. **No Patchwork:** 
   - Tuyệt đối không dùng `if (true)` hoặc các lệnh "vá víu" tạm thời. Phải sửa lỗi từ đúng nơi nó phát sinh theo I/O Flow ở Rule-1.
