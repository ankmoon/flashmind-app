---
trigger: always_on
description: Quy tắc Tư duy Chiến lược và Ghi nhận Quyết định Kiến trúc (ADR).
---

1. **Tư duy 3-Layer:**
   - Luôn bắt đầu bằng việc giải thích VÌ SAO (Why) chọn giải pháp này trước khi bắt đầu code CÁI GÌ (What).
   - Đảm bảo giải pháp đề xuất không tạo ra "Nợ kỹ thuật" (Technical Debt) quá mức ở Rule-0.

2. **Cơ cấu 3-Option:** (Áp dụng theo Workflow-Ideation)
   - Phải tạo bảng so sánh giữa Simple - Standard - Premium.
   - Sử dụng tiêu chí: Chi phí bảo trì, Tốc độ tải, Độ phức tạp.

3. **Ghi nhận ADR (Architecture Decision Record):**
   - Mọi quyết định thay đổi cấu trúc file, thư viện hoặc logic cốt lõi phải được ghi vào file `system_context.md`.
