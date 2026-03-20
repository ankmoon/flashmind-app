---
description: Quy trình phân tích và tạo Function List cho dự án phần mềm giai đoạn Presale (BA)
---

# 📋 Workflow: BA Presale – Phân tích & Tạo Function List

Quy trình này dành cho BA trong giai đoạn presale, từ tài liệu đầu vào đến Function List hoàn chỉnh với estimation.

---

## 🔵 BƯỚC 1: Thu thập & Đọc hiểu tài liệu đầu vào

1. Đọc **toàn bộ** tài liệu yêu cầu (Brief, RFP, DOCX mô tả nghiệp vụ, file Excel tính năng sơ bộ...)
2. Xác định:
   - **Mô hình kinh doanh** (B2B, B2C, Gov, marketplace...)
   - **Các bên tham gia** (Actor): Ai dùng hệ thống? Có bao nhiêu loại người dùng?
   - **Vấn đề cốt lõi** (Problem Statement): Hệ thống sinh ra để giải quyết vấn đề gì?
3. Ghi chú các từ khoá nghiệp vụ quan trọng (danh từ = object tiềm năng, động từ = function tiềm năng)

---

## 🟡 BƯỚC 2: Xác định Object chính của hệ thống (Object-First)

> **Nguyên tắc:** Bắt đầu từ VẤN ĐỀ, không bắt đầu từ solution.  
> Hỏi: *"Cái gì đang được quản lý trong nghiệp vụ này?"* → Câu trả lời = Object.

### 2.1 Cách xác định Object

- Liệt kê tất cả **danh từ quan trọng** xuất hiện trong tài liệu
- Hỏi: *"Cái này có cần CRUD không?"* → Có = Object
- Phân loại: **Object chính** (trung tâm của nghiệp vụ) vs **Object phụ** (phát sinh khi phân tích object chính)
- **KHÔNG vội phân tích object phụ** khi đang làm object chính – đánh dấu lại để quay lại sau

### 2.2 Ví dụ phân loại

| Loại | Ví dụ |
|:---|:---|
| Object chính | Đơn hàng, Bộ dữ liệu, Hồ sơ đăng ký, Hợp đồng |
| Object phụ | Thông báo, Ghi chú, File đính kèm, Lịch sử thao tác |
| Không phải Object | Màn hình, Nút bấm, Report (là function của object khác) |

---

## 🟠 BƯỚC 3: Phân tích CRUD + I/O Flow nhiều vòng (ITERATIVE)

> ⚠️ **QUAN TRỌNG:** Phải lặp nhiều vòng I/O Flow. Mỗi OUTPUT của bước trước là INPUT của bước tiếp theo.

### 3.1 Vòng phân tích CRUD cơ bản (Vòng 1)

Với mỗi Object, phân tích 4 UC cơ bản:

| CRUD | UC cơ bản | UC phát sinh thường gặp |
|:---|:---|:---|
| **C – Create** | Tạo mới [Object] | Import hàng loạt, Sao chép từ mẫu, Lưu nháp |
| **R – Read** | Xem chi tiết [Object] | Xem danh sách, Tìm kiếm, Lọc, Sắp xếp, Export |
| **U – Update** | Chỉnh sửa [Object] | Chỉnh sửa một phần, Đổi trạng thái (Status change) |
| **D – Delete** | Xóa [Object] | Xóa mềm (Soft delete), Lưu trữ (Archive), Khôi phục |

### 3.2 Vòng phân tích I/O Flow (Vòng 2+) – BẮT BUỘC LẶP

**Quy tắc:** Lấy từng OUTPUT từ vòng 1, tiếp tục đặt câu hỏi:
- *"Output này ai sẽ dùng tiếp?"*
- *"Output này sẽ trở thành Input cho UC nào?"*
- *"Sau khi [action], thì chuyện gì xảy ra tiếp theo?"*

**Ví dụ chuỗi I/O Flow lặp:**

```
[C] Tạo hồ sơ đăng ký
  → OUTPUT: Hồ sơ ở trạng thái "Chờ duyệt"
    → INPUT cho [U] Phê duyệt hồ sơ
      → OUTPUT: Hồ sơ "Đã duyệt" HOẶC "Từ chối"
        → (Nếu Từ chối) INPUT cho [U] Chỉnh sửa & Nộp lại hồ sơ
          → (Nếu Đã duyệt) INPUT cho [C] Kích hoạt tài khoản
            → OUTPUT: Tài khoản Active → Actor có thể đăng nhập, dùng chức năng tiếp theo
```

**Làm đến khi nào?** → Khi output không còn là input cho UC nào khác có ý nghĩa.

### 3.3 Phân tích theo Actor (Vòng 3)

Với mỗi function đã có, hỏi:
- *"Actor nào thực hiện action này?"*
- *"Actor nào xem được thông tin này?"*
- Nếu nhiều Actor → cần phân quyền → sinh thêm UC quản lý quyền

### 3.4 Phân tích Object phụ phát sinh

Trong quá trình phân tích, khi gặp object phụ (ví dụ: Thông báo, Lịch sử, File đính kèm):
- Đánh dấu vào danh sách "Object chờ phân tích"
- Hoàn thành object hiện tại rồi mới quay lại
- Áp dụng lại Bước 3 cho từng object phụ

---

## 🟢 BƯỚC 4: Rà soát & Loại trùng

1. Gom tất cả function đã phân tích
2. Đặt tên theo quy ước thống nhất: `[Động từ] + [Object]` (VD: "Tạo hồ sơ đăng ký", "Duyệt hồ sơ đăng ký")
3. Kiểm tra trùng lặp: Cùng tên → giữ 1, cùng nghĩa khác tên → hợp nhất
4. Kiểm tra tính hợp lý: Function có giải quyết vấn đề của khách hàng không? Hay chỉ là "nice to have"?

---

## 🔵 BƯỚC 5: Phân loại & Estimation

### 5.1 Phân loại

| Trường | Giá trị |
|:---|:---|
| **Platform** | Portal (end-user) / CMS/Admin (admin) / System (background) |
| **Object** | Tên object chính |
| **Type** | Screen / Function |
| **Complexity** | Very Simple / Simple / Medium / Complex / S Complex |
| **Phase** | Phase 1 (MVP) / Phase 2 (Advanced) |

### 5.2 Tiêu chí Complexity

| Độ khó | Đặc điểm |
|:---|:---|
| Very Simple | Xem static, hiển thị thông tin đơn, không có logic |
| Simple | CRUD đơn giản, 1-2 bước, không workflow, không tích hợp |
| Medium | Có workflow 2-3 bước, validation phức tạp, hoặc liên quan đến 2 object |
| Complex | Workflow nhiều bước, liên quan 3+ object, có notification, hoặc tích hợp API ngoài |
| S Complex | AI/ML, tích hợp phức tạp (CA, Blockchain, Payment gateway), real-time, security encryption |

### 5.3 Man-Hour theo Complexity (BA effort)

| Complexity | Clarification | Documentation | Review | Support | Total |
|:---|:---:|:---:|:---:|:---:|:---:|
| Very Simple | 0.25 | 0.375 | 0.125 | 0.075 | **~0.8** |
| Simple | 0.5 | 0.75 | 0.25 | 0.15 | **~1.65** |
| Medium | 2 | 3 | 1 | 0.6 | **~6.6** |
| Complex | 3 | 4.5 | 1.5 | 0.9 | **~9.9** |
| S Complex | 5 | 7.5 | 2.5 | 1.5 | **~16.5** |

### 5.4 Estimation tổng dự án (Ratio Model)

```
BA MM = Total BA MH / 8 / 22 (ngày/tháng)
Total Project MM = BA MM / 0.20  (BA chiếm ~20% tổng effort)
```

---

## 🔴 BƯỚC 6: GAP Analysis (đối chiếu với tài liệu đầu vào)

1. So sánh function list đã tạo với **tất cả tài liệu đầu vào**
2. Kiểm tra:
   - **Thiếu function** nào? (Tài liệu đề cập nhưng chưa có trong list)
   - **Thừa function** nào? (Có trong list nhưng không nằm trong phạm vi dự án)
   - **Function mâu thuẫn** nào? (Tài liệu A nói 1 cách, tài liệu B nói cách khác)
3. Bổ sung/loại bỏ và document lý do

---

## 📤 OUTPUT CHUẨN

File Excel gồm các sheet:
1. **Feature List (All)** – Danh sách đầy đủ tất cả UC với: STT, Platform, Object, Feature Name, Type, Complexity, Phase, Description, MH Breakdown, Total MH
2. **Phase 1 – MVP** – Chỉ các UC Phase 1
3. **Phase 2 – Advanced** – Chỉ các UC Phase 2
4. **Estimation Summary** – Tổng hợp effort theo Phase và toàn dự án

---

## 📌 Lưu ý quan trọng

> ⚠️ Phân tích Filter/Sort/Search KHÔNG phải là các UC riêng biệt – gộp vào R (Read) của object: "Tìm kiếm & Lọc [Object]" = 1 UC duy nhất.

> ⚠️ Dashboard/Report = 1-3 UC, không phải hàng chục UC. Một màn hình dashboard tổng hợp = 1 UC "Xem dashboard [Actor]".

> ⚠️ Notification = Object phụ thường phát sinh từ các UC quan trọng. Xử lý sau khi hoàn thành object chính.

> ⚠️ Mỗi trạng thái (Status) của object = 1 UC chuyển trạng thái, không phải object mới.
