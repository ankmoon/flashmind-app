---
trigger: start_coding_task
description: Đảm bảo FE và BE đồng bộ thông qua API Contract.
---

# Rule — Contract-First Development (Đồng bộ hóa)

## 1. Điều kiện tiên quyết (Pre-requisites)
Cấm FE Dev và BE Dev bắt đầu viết code nếu trong thư mục `docs/` của dự án chưa có file `api-contract.json` hoặc `swagger.yaml`.

## 2. Trách nhiệm của SA/BA
- Trước khi bẻ task cho Dev, phải định nghĩa rõ:
  - Endpoint (VD: `/api/v1/staff`)
  - Method (GET, POST, PUT, DELETE)
  - Cấu trúc Request Body và Response JSON.
  - Các mã lỗi (400, 401, 500).

## 3. Trách nhiệm của Dev
- **BE Dev**: Viết code phải map chính xác 100% với file Contract.
- **FE Dev**: Sử dụng Mock Data dựa trên file Contract để dựng UI trước khi BE xong.

## 4. Xử lý khi có thay đổi
Nếu BE muốn đổi logic API, PHẢI yêu cầu BA cập nhật lại file Contract trước, sau đó mới được sửa code. Tuyệt đối không tự ý đổi "ngầm".
