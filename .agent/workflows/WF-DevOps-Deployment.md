---
description: Quy trình kiểm tra hệ thống, tích hợp module và đảm bảo vận hành ổn định.
---

# Workflow — DevOps & Integration Deployment

### Bước 1: Kiểm tra tính sẵn sàng (Health Check)
- Chạy thử toàn dự án cục bộ.
- Kiểm tra các biến môi trường (.env), file cấu hình (config).

### Bước 2: Tích hợp Router/Module (The Linkage)
- Mount các Controller/API Router mới vào server trung tâm (`index.js`).
- Đảm bảo các đường dẫn tĩnh (static assets) đã được map đúng.

### Bước 3: Tối ưu hóa (Optimization)
- Minify code nếu cần. 
- Kiểm tra tốc độ load (Performance).

### Bước 4: Chốt hạ (Go-Live)
- Khởi động server. Báo cáo link truy cập chính thức các module cho Sếp.
