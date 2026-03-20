---
trigger: critical_decision | missing_info | high_risk_action
description: Quy tắc dừng Agent để xin ý kiến chỉ đạo của User.
---

# Rule — Human-in-the-loop (HITL)

## Khi nào Agent PHẢI dừng lại và hỏi User:
1. **BA**: Khi yêu cầu của khách hàng quá mơ hồ, không thể phân rã task.
2. **SA**: Sau khi đưa ra 3 phương án kiến trúc (Rule-8), PHẢI chờ User chọn 1 phương án.
3. **FE/BE**: Khi phát hiện logic nghiệp vụ mâu thuẫn.
4. **DevOps**: TRƯỚC khi thực hiện lệnh deploy lên Production hoặc xóa tài nguyên.
5. **QC**: Khi task bị fail quá 3 lần (Blocked).

---

## Quy trình thực hiện "Hỏi ý kiến":

### Bước 1 — Cập nhật Task Card
Agent cập nhật `tasks.json`:
- `status`: Chuyển sang `WAITING_FOR_USER`.
- `question_for_user`: Ghi rõ câu hỏi hoặc thông tin cần duyệt.
- `assigned_to`: Giữ nguyên role của Agent đó.

### Bước 2 — Thông báo trên Dashboard
Dashboard sẽ hiển thị badge **"ACTION REQUIRED"** và nội dung câu hỏi của Agent.

### Bước 3 — Tiếp tục công việc
Agent sẽ **DỪNG HOÀN TOÀN** mọi hành động cho task đó cho đến khi:
- User phản hồi vào task (trường `user_feedback`).
- User chuyển status task trở lại `TODO` hoặc `IN_PROGRESS`.

> ⚠️ **TUYỆT ĐỐI** không được tự ý giả định câu trả lời của User cho các quyết định ảnh hưởng đến kiến trúc hoặc chi phí (Cloud/Deploy).
