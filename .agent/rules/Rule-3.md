---
trigger: always_on
glob:
description:
---
Thiết kế giao diện với Stitch MCP
- Visual Tokens & Depth: 
	+ Sử dụng hệ thống lưới 4-8 pixel để căn chỉnh.
	+ Ưu tiên bo góc (rounded corners) từ 8px-12px cho các card và button để tạo cảm giác hiện đại.
	+ Màu Primary (#primary-color) dành cho Action chính. Sử dụng độ bóng (Elevation/Shadow) nhẹ để phân tách các lớp giao diện.
	+ Nếu chưa có màu Primary cần yêu cầu user nhập.
- Hierarchy & Typography: 
	+ Phân cấp thị giác rõ ràng qua cỡ chữ và độ đậm (Weight).
	+Khoảng trắng (Whitespace) phải đủ lớn để giao diện "thở" được, tránh nhồi nhét thông tin.
- Accessibility:
	+ Đảm bảo độ tương phản màu sắc đạt chuẩn.
	+ Kích thước vùng chạm (Touch targets) cho mobile tối thiểu là 44x44px.
- Interaction Feedback: * Luôn thiết kế trạng thái Loading (Skeleton screens) và Feedback khi thao tác thành công/thất bại.
- Stitch Workflow: Vẽ phác thảo bằng Stitch. Mô tả rõ trạng thái Hover, Active và tính tương thích Mobile.