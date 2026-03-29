---
description: Quy trình tiếp nhận yêu cầu, phân tích I/O Flow/CRUD và xuất tài liệu Use Case Spec (Markdown & Word)
---

# /WF-UseCase-Spec — Đặc tả Use Case

Quy trình này hướng dẫn bạn cách phân tích và tạo tài liệu Use Case hoàn chỉnh theo chuẩn TankBAClass.

$ARGUMENTS 
Input thường gồm: Tên Use case, PRD, ERD, Flowchart, Mockups.

---

## 🟢 BƯỚC 1: TIẾP NHẬN & PHÂN TÍCH I/O FLOW

**Agent**: `UC Analyst Agent`
1. Đọc và hiểu kỹ Input.
2. Áp dụng skill `use-case-analysis` để mổ xẻ Input:
   - Xác định danh sách Input Fields.
   - Xác định Output States (Thành công, Lỗi 1, Lỗi 2...).
   - Nhận diện các Tables/Entities trong ERD bị ảnh hưởng (Thêm mới, Cập nhật trạng thái).

## 🟢 BƯỚC 2: VIẾT DRAFT TÀI LIỆU (MARKDOWN)

1. Sinh ra bản nháp markdown theo cấu trúc chuẩn:
   - Use Case Name, Objective, Actors, Pre-condition, Trigger, Post-condition.
   - Các luồng Flow (Basic / Exceptional). BẮT BUỘC vẽ kèm Activity Diagram bằng thẻ ```mermaid.
   - Danh sách Business Rules chia thành 4 nhóm (Display, Validation, Processing, Creation).
2. Xoát lỗi chéo dựa trên `Rule-UseCaseSpec` (Kiểm tra xem đã cover hết các Validation của Failure Case chưa? Đã dùng cấu trúc "Nếu... thì" chưa?).

## 🟢 BƯỚC 3: HIỂN THỊ KẾT QUẢ ĐỂ USER REVIEW

Trình bày tài liệu Markdown vừa viết ra khung chat, sử dụng Markdown Artifact (`use_case_spec.md`) để User dễ dàng đọc và đánh giá bề mặt.

## 🟢 BƯỚC 4: XUẤT RA FILE WORD (.DOCX)

Vì định dạng cuối cùng người dùng cần là Word, thực hiện các việc sau:
1. Lưu nội dung Markdown vào một thư mục tạm của dự án, ví dụ: `docs/use_cases/Tên_UC.md`. (Dùng tool `write_to_file`).
2. Viết một Python script nhỏ để chuyển đổi file `.md` đó thành `.docx` (Sử dụng thư viện `markdown2` và `python-docx`, hoặc dùng một script regex đơn giản tạo HTML rồi save thành `.doc`). 
   *Hoặc cách đơn giản, tin cậy nhất cho Agent:* Sinh ra một [Python Script Export Docx] (lưu dưới dạng `/tmp/export_docx.py`) và thực thi nó bằng `run_command` để tạo file `Tên_UC.docx` tại thư mục `docs/use_cases/` của dự án.
3. Thông báo cho User biết đường dẫn chính xác của file Word đã được lưu, ví dụ: `✅ Tài liệu đã được xuất ra file E:\My office\Projects\MyApp\docs\use_cases\UC_Dang-Ky.docx`

> 🔴 **Lưu ý:** Xin phép người dùng (nếu `run_command` cần approval) để tiến hành thao tác convert sang file Word. Đảm bảo cấu trúc thư mục được tạo qua lệnh Terminal (vd: `mkdir -p docs/use_cases`).
