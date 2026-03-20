---
description: Quy trình kiểm tra bảo mật chuyên sâu (Security Penetration Audit).
---

# Workflow — Systematic Security Audit

### Bước 1: Kiểm tra Xác thực & Phân quyền (Auth & Authz)
- **Check-list**: 
    - Có API nào đang để mở (Public) mà lẽ ra phải khóa không?
    - Token (JWT/Session) có được gửi qua Header an toàn không?
    - Phân quyền (RBAC): Nhân viên thường có thể gọi API của Admin không?

### Bước 2: Kiểm tra Lỗ hổng Trình duyệt (Frontend Security)
- **Check-list**: 
    - Có nguy cơ XSS (Cross-Site Scripting) khi hiển thị dữ liệu người dùng nhập không?
    - Các file nhạy cảm (.env, log) có bị lộ qua folder `static` không?

### Bước 3: Kiểm tra Logic Backend (Backend Security)
- **Check-list**: 
    - **SQL Injection**: Các câu lệnh Query có được parameterized không?
    - **Data Leakage**: API có trả về quá nhiều thông tin nhạy cảm (như Password Hash) không?
    - **Validation**: Server có check dữ liệu đầu vào không hay tin tưởng hoàn toàn vào FE?

### Bước 4: Kiểm tra Cấu hình (Environment Security)
- **Check-list**: 
    - API Key, Secret có bị hardcode trong code không?
    - Có đang sử dụng các thư viện (npm) bị cảnh báo lỗ hổng bảo mật không?

### Bước 5: Báo cáo & Vá (Red-team Report)
- Viết file `security-audit.md` phân loại lỗi theo mức độ: **CRITICAL, HIGH, MEDIUM, LOW**.
- Trực tiếp thực hiện các bản vá (Security Patch).
