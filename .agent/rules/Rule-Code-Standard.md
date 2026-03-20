# Rule — Professional Code Standard (Solid & Real)

Mọi dòng code viết ra phải đạt tiêu chuẩn Production-Ready:

## 1. Nói KHÔNG với Dữ liệu giả (No Hardcoded Mock)
- Tuyệt đối không dùng `setTimeout` giả lập API trong code Frontend.
- Code FE phải sử dụng `fetch/axios` thực tế kết nối vào Endpoint Backend.

## 2. Xử lý lỗi (Error Handling)
- Mọi hàm API phải có `try-catch`.
- Phải có thông báo lỗi thân thiện cho người dùng trên UI (Toast/Alert).

## 3. Cấu trúc Module (Clean Architecture)
- Tách biệt logic API (Backend) và Logic Render (Frontend).
- Logic Backend phải tập trung tại `src/backend`, giao diện tại `src/frontend`.

## 4. Tích hợp (Integration)
- Sau khi code xong module, PHẢI tự động cập nhật file server chính (`index.js`) để "cắm" module đó vào hệ thống chạy thực tế.
