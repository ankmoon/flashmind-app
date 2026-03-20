---
trigger: always_on
description: Quy tắc Đảm bảo Chất lượng Phần mềm (SQA).
---

1. **Test Coverage Mandatory:**
   - Unit Test cho logic business là bắt buộc.
   - Mocking: Phải giả lập (mock) các API bên thứ 3 hoặc DB để test chạy nhanh và độc lập.

2. **Negative Testing:**
   - Phải kiểm tra hệ thống sẽ hành xử thế nào khi dữ liệu SAI (ví dụ nhập chữ vào trường số, gửi token hết hạn...).

3. **Quality Gate:** (Refer Rule-6)
   - Code chưa Pass Test tự động thì không được phép chuyển sang bước Deploy ở Rule-7.
