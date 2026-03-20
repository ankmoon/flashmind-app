---
trigger: status_change_to_todo (from REVIEW/TESTING)
description: Quy trình hồi phục và sửa lỗi khi QC phát hiện vấn đề.
---

# Rule — Task Recovery & Error Handling

## Khi nào áp dụng
Khi QC Agent kiểm thử và phát hiện lỗi (Functional, UI/UX, hoặc Security).

## Quy trình 3 bước cho QC

### 1. Phân tích nguyên nhân (RCA)
- QC mô tả lỗi bằng thẻ `<testing_log>`
- Ghi rõ: "Expected output" vs "Actual output"
- Ghi tên file và log lỗi từ Terminal/Browser Console

### 2. Cập nhật thẻ Task
QC cập nhật lại `tasks.json`:
- `status`: Chuyển từ `REVIEW` -> `TODO`
- `retry_count`: Tăng thêm 1
- `failure_notes`: Ghi vắn tắt lỗi vừa tìm thấy
- `assigned_to`: Giữ nguyên Developer đang code task đó

### 3. Ngưỡng chịu lỗi (Circuit Breaker)
Nếu `retry_count` >= 3:
- Chuyển `status` -> `BLOCKED`
- `assigned_to`: Đổi về **SA Agent** (Trưởng phòng Kiến trúc)
- Goal: SA phải vào đọc history để xem thiết kế có vấn đề gì dẫn đến lỗi lặp lại.

## Đối với Developer khi nhận lại task lỗi
- Phải đọc thẻ `<testing_log>` của QC trước khi code lại.
- Trả lời QC: "✅ Đã fix lỗi X bằng cách Y. Vui lòng test lại." (Rule-9: RCA)
