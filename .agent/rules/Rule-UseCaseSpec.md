# BẮT BUỘC: Quy tắc viết Đặc tả Use Case (Rule-UseCaseSpec)

> **Luật này áp dụng cho mọi Agent khi viết hoặc kiểm duyệt tài liệu Use Case (UC) Spec.** Mọi hành vi làm trái đều bị coi là lỗi QA nghiêm trọng.

## 1. CẤM VIẾT BUSINESS RULE (BR) BẰNG VĂN XUÔI
- Không bao giờ viết: *"Hệ thống sẽ kiểm tra xem email có trống không, sau đó kiểm tra mật khẩu. Nếu sai thì nó báo lỗi cho người dùng biết là chưa nhập."*
- Bắt buộc chia nhỏ thành từng Bullet points có dòng logic đơn lẻ.

## 2. CẤU TRÚC LOGIC BẮT BUỘC (IF... THEN...)
Mọi BR phải viết theo định dạng: `Nếu [Điều kiện/Event], Hệ thống [Action/Outcome/Error Message]`. 
- Thêm Error Message bằng nháy kép `""` cho mọi Validation Fail.

*Ví dụ chuẩn:*
> - Nếu [Email] để trống, hệ thống hiển thị thông báo lỗi: "Vui lòng nhập email".
> - Nếu [Tuổi] < 18, hệ thống disable nút [Thanh Toán] và hiển thị cảnh báo: "Bạn chưa đủ tuổi mua hàng".

## 3. KHÔNG ĐƯỢC QUÊN FAILURE CASES
Tất cả các trường dữ liệu Input (Form fields) đều phải có ít nhất 1 dòng Validation Rule trước khi sang bước logic Processing.
- Empty check (Có để rỗng được không?)
- Format check (Kiểu chữ, số, ký tự đặc biệt?)
- Conflit check (Data đã tồn tại trong DB chưa?)

## 4. QUY TRÌNH THỨ TỰ BẮT BUỘC CỦA RULE
Quy tắc xử lý đơn giản phải nêu ra trước. Quy tắc dính líu DB/API/Bên thứ 3 được nêu ra sau cùng.
- Hiển thị (Display) -> Xác minh (Validation) -> Call API Xử lý (Processing) -> Cập nhật CSDL (CRUD).
