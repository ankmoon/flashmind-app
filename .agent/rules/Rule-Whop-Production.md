---
trigger: deploy, feature, bug, fix, update
description: Quy tắc bắt buộc test Local trước khi đưa lên Production (Whop).
---

## Rule — Whop Production (Local-First Development)

Áp dụng cho mọi tác vụ lập trình: phát triển tính năng mới, sửa lỗi (bug-fixing), kiểm thử (testing), tối ưu hóa hoặc cập nhật hệ thống.

### 1. Phân loại Môi trường
- **Production (Whop)**: Bất kỳ ứng dụng nào đã được đưa lên nền tảng **Whop** đều mặc định được xác định là đang ở môi trường **Production** (sản phẩm thương mại đang chạy thực tế).
- **Local (Development)**: Môi trường làm việc trên máy tính cá nhân (localhost, development server).

### 2. Nguyên tắc Local-First (BẮT BUỘC)
- Mọi thay đổi code — dù nhỏ gọn đến đâu — **BẮT BUỘC** phải được tiến hành, chạy thử và kiểm chứng chất lượng nghiệm ngặt ở môi trường **Local** trước tiên.
- Đối với bug fix hay tính năng mới, Agent luôn phải xác nhận kết quả qua dev server nội bộ (`npm run dev`, `vite`, `python server`).

### 3. Cổng Phê Duyệt (Production Approval Gate)
- Agent tuyệt đối **KHÔNG** tự ý can thiệp, sửa đổi trực tiếp trên môi trường Production, hoặc chạy các lệnh deploy thẳng lên Vercel/VPS/Host khi chưa qua bước phê duyệt.
- Mọi thao tác đưa ứng dụng lên Production (Whop) chỉ được phép thực hiện khi thỏa 2 điều kiện:
  1. Yêu cầu đã được Code và Verify trên Local (có Proof of Work/Screenshot nếu cần).
  2. Báo cáo bằng văn bản cho User và **ĐƯỢC USER (Tank) ĐỒNG Ý CHO PHÉP DEPLOY NHƯ LÀ BƯỚC CUỐI CÙNG.**
  (VD: "Tôi đã test ở Local ổn định, bạn có muốn deploy bản này lên Production/Vercel cho Whop chưa?")
