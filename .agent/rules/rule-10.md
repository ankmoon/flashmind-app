# Rule 10 — Media & Artifact Storage Policy

**Nguyên tắc cốt lõi: Tuyệt đối không lưu ảnh, video hay file media (generated files) vào ổ C hoặc thư mục mặc định của tác vụ (ví dụ: `.gemini/antigravity/brain/...`).**

**Checklist BẮT BUỘC khi Generate Media:**
1. Khi Agent thực hiện call tool `generate_image`, `generate_screen`, hoặc tạo file tài nguyên mới, **PHẢI** xác định xem đang làm việc cho Project/Domain nào.
2. Lưu file đó vào ĐÚNG cấu trúc thư mục của dự án đó (Tại ổ chứa Office, thường là `E:\My office\Projects\{project_name}\...`).
3. Nếu dự án chưa có thư mục chứa ảnh/media, Agent có quyền TỰ ĐỘNG tạo thư mục con (VD: `images`, `assets`, `media`) trong dự án để lưu trữ.
4. Tên file lưu phải rõ ràng, mang tính phân loại (VD: `prodweaver_promo_whop_ghost.png`).

**Mục đích:**
Đảm bảo toàn bộ tài nguyên số của dự án được gom về một cấu trúc duy nhất (Single Source of Truth), quản lý tập trung, chia sẻ dễ dàng và tránh làm "rác" ổ đĩa hệ thống.
