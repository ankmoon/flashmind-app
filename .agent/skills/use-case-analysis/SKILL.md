---
name: use-case-analysis
description: "Phương pháp phân tích Business Rules và đặc tả Use Case chuẩn TankBAClass (tập trung CRUD, I/O Flow)"
---

# Kỹ năng Phân tích & Đặc tả Use Case

Skill này trang bị cho bạn cách viết Use Case Specification dựa trên tư duy dữ liệu (I/O, CRUD) thay vì mô tả bằng văn xuôi đơn thuần.

## 1. Cấu trúc một Use Case Specification
Tài liệu của bạn luôn phải chứa đủ các phần sau:
- **Use Case Name**: Tên UC (Hành động + Đối tượng. VD: Thêm vào giỏ hàng)
- **Objective**: Mục tiêu (UC dùng để làm gì?)
- **Actors**: Tác nhân (Ai/Hệ thống nào thực hiện?)
- **Pre-condition**: Điều kiện tiên quyết (VD: Đã đăng nhập, Đã ở màn hình X)
- **Trigger**: Hành động kích hoạt (VD: Bấm nút "Check-out")
- **Basic Flow (Activity)**: Các bước đi luồng chính (Happy case). BẮT BUỘC vẽ kèm sơ đồ Activity Diagram (dạng `stateDiagram-v2` hoặc `flowchart`) bằng ngôn ngữ `mermaid` để trực quan hóa luồng nghiệp vụ.
- **Exceptional Flows (Activity)**: Các luồng lỗi rẽ nhánh. Nên thể hiện đường đi của nhánh lỗi trong chính Activity Diagram ở trên để user dễ hình dung.
- **Business Rules**: Bảng/danh sách quy tắc thực thi (Core logic)
- **Post-condition**: Điều kiện kết thúc (Hệ thống lưu cái gì, thay đổi UI ra sao)

## 2. Phương pháp phân tích Business Rules (BR)
Với mỗi UC, bạn phải chạy phân tích I/O. Trả lời các câu hỏi:
- **Input của bước này là gì?** (Dữ liệu do người dùng nhập, Dữ liệu ẩn từ hệ thống).
- **Trạng thái lỗi (Failure) thì sao?** Nếu input rỗng, sai format, tồn kho không đủ, thẻ hết tiền?
- **Output là gì?** Hệ thống hiển thị message nào? Đổi màn hình nào? Lưu gì xuống DB?

### Cấu trúc 4 nhóm BR thần thánh (BẮT BUỘC):
Bạn phải chia BR theo 4 nhóm sau theo thứ tự:
1. **BR về Hiển thị (Display)**: Sau khi kích hoạt, màn hình hiển thị cái gì? Nút bị disable khi nào?
2. **BR về Xác minh (Validation)**:
   - Các trường bắt buộc rỗng (Empty check).
   - Format sai (Email, Số ĐT...).
   - Ràng buộc nghiệp vụ (Tồn kho < Số lượng mua, Hết hạn...).
3. **BR về Xử lý Nghiệp vụ (Processing)**: Gọi API bên thứ 3 (Thanh toán), tính toán công thức (Giảm giá, KPI, Thuế).
4. **BR về Tạo dữ liệu/CRUD (Creation/Update)**: Lưu gì xuống Database? Trạng thái (Status) đổi thành gì? AI được notification? Gửi Email gì?

## 3. Quy tắc hành văn BR
- **Ưu tiên**: Logic dễ (Validation) viết trước, Logic phức tạp (Xử lý, DB) viết sau.
- **Form chuẩn**: `Nếu [Điều kiện], hệ thống [Action / Hiển thị lỗi XYZ]`
- MỌI LỖI SAI đều phải đi kèm Nội Dung Message Lỗi (để dev biết đường fix và test).
