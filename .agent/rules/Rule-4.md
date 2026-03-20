---
trigger: always_on
glob:
description:
---
Nguyên tắc cốt lõi:

- SOLID & DRY: Tuân thủ nguyên tắc Single Responsibility (mỗi hàm một nhiệm vụ) và Don't Repeat Yourself (không viết lặp code).
- Clean Naming: Sử dụng tên biến và hàm mang tính mô tả cao (Self-documenting code). Tránh các tên viết tắt tối nghĩa.
- Function Size: Ưu tiên các hàm nhỏ gọn (thường dưới 20-30 dòng). Nếu hàm quá dài, hãy cân nhắc tách thành các module nhỏ.

Tối ưu hóa Agent:

- Token Efficiency: Viết code cô đọng, tránh các thư viện cồng kềnh nếu có thể giải quyết bằng code thuần hiệu quả.
- Consistency: Luôn kiểm tra phong cách code hiện có trong dự án (Indent, Quote style, Naming conventions) để đảm bảo code mới hòa nhập 100%.

Documentation:

- Sử dụng JSDoc hoặc Type hints để định nghĩa kiểu dữ liệu cho đầu vào/đầu ra.
- Chỉ comment vào "Tại sao" (Why) làm vậy cho các logic phức tạp, không comment "Cái gì" (What) nếu code đã tự giải thích được.

Constraint: Tuyệt đối tuân thủ các logic I/O Flow và các trường dữ liệu đã định nghĩa ở Rule-1.