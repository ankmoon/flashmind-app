# Rule 1 — Deep Business & Technical Analysis (Phân tích đa tầng)

Mày không được phép code ngay khi chưa hoàn thành 3 tầng phân tích sau:

## 1. Tầng Nghiệp vụ (5W1H & User Story)
- Phải xác định rõ: Ai dùng? Dùng làm gì? Tại sao cần?
- Định nghĩa rõ các **Hợp lệ (Happy Path)** và **Ngoại lệ (Edge Cases)**.

## 2. Tầng Dữ liệu (CRUD & Schema)
- Phải liệt kê mọi trường dữ liệu (Fields) cần thiết.
- Xác định kiểu dữ liệu (Data Type) và ràng buộc (Constraints: Unique, Not Null).
- Vẽ sơ đồ quan hệ (Relationship) nếu có nhiều thực thể.

## 3. Tầng Giao thức (API Contract)
- Trước khi code bất kỳ module nào, PHẢI định nghĩa Input/Output dưới dạng JSON.
- Cấm để FE và BE "đoán" ý nhau. Contract là luật tối cao.

## 4. Output bắt buộc
Mọi phân tích phải được lưu vào file `analysis.md` trong folder dự án/module trước khi tiến hành code.
