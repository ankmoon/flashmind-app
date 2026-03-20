---
trigger: always_on
description: Quy tắc khởi tạo cấu trúc thư mục khi bắt đầu dự án mới.
---

# Rule — Project Folder Structure

## Khi nào áp dụng
Áp dụng khi BA Agent tiếp nhận một yêu cầu **dự án mới** (phân biệt với task đơn lẻ).
Dấu hiệu nhận biết: yêu cầu có scope đủ lớn để cần nhiều agent cùng tham gia.

---

## Bước 1 — Xác nhận tên dự án
Hỏi user nếu chưa rõ: **"Tên dự án này là gì? (dùng dấu gạch ngang, không dấu, ví dụ: crm-system)"**

## Bước 2 — Tạo cấu trúc thư mục

Tạo toàn bộ cấu trúc sau bằng lệnh terminal (PowerShell):

```powershell
$project = "TEN-DU-AN"     # thay thế bằng tên thật
$base    = "E:\My office\Projects\$project"

New-Item -ItemType Directory -Force -Path @(
  "$base\src\frontend",
  "$base\src\backend",
  "$base\docs\meetings",
  "$base\design",
  "$base\tests\unit",
  "$base\tests\e2e",
  "$base\deploy",
  "$base\modules"
)
```

## Bước 3 — Tạo các file context cơ bản

Tạo `E:\My office\Projects\{project}\docs\prd.md`:
```markdown
# PRD — {Tên dự án}
- **Ngày tạo**: {ngày hôm nay}
- **BA phụ trách**: BA Agent
- **Status**: Draft

## Mục tiêu dự án
_(BA điền vào dựa trên yêu cầu của khách hàng)_

## Tính năng cần build
_(Liệt kê sau khi phân tích xong)_
```

Tạo `E:\My office\Projects\{project}\system_context.md`:
```markdown
# System Context — {Tên dự án}

## Tech Stack
_(Chưa xác định — SA Agent sẽ điền)_

## Module Map
_(Cập nhật khi có module mới)_

## Deploy Environment
_(Cập nhật khi DevOps setup)_

## History
| Ngày | Agent | Thay đổi |
|------|-------|---------|
| {ngày} | BA | Khởi tạo dự án |
```

## Bước 4 — Cập nhật system_context.md của văn phòng

Ghi vào `E:\My office\system_context.md` mục **Dự án Hiện tại**:
- Tên dự án
- Đường dẫn: `E:\My office\Projects\{project}\`
- Ngày bắt đầu

## Bước 5 — Tạo entry trong projects.json

Ghi vào `E:\My office\office\projects.json`:
```json
{
  "id": "PROJ-XXX",
  "name": "{project-name}",
  "display_name": "{Tên hiển thị}",
  "status": "active",
  "path": "E:\\My office\\Projects\\{project}",
  "created_at": "{ISO timestamp}",
  "team": {
    "BA": "assigned",
    "FE": "pending",
    "BE": "pending",
    "SA": "pending",
    "DevOps": "pending",
    "QC": "pending",
    "Design": "pending"
  }
}
```

## Bước 6 — Xác nhận với user

Báo cáo:
> ✅ Đã khởi tạo dự án **{tên}** tại `E:\My office\Projects\{tên}\`
> Cấu trúc thư mục đã sẵn sàng. SA Agent có thể bắt đầu thiết kế kiến trúc.
