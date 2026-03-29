---
trigger: always_on
description: Context Persistence — Ghi nhận thay đổi vào đúng tầng context sau mỗi task hoàn thành.
---

Sau khi code xong và test pass, Agent PHẢI thực hiện theo thứ tự:

## 1. Cập nhật Office-level context (Tầng 1)
File: `E:\My office\system_context.md`

CHỈ cập nhật khi:
- Có **dự án mới** được tạo (thêm vào bảng danh sách dự án)
- Có **dự án hoàn thành** hoặc đổi status
- KHÔNG ghi tech detail, KHÔNG ghi logic nghiệp vụ vào đây

> ⚠️ File này chỉ là **bản đồ index**, không phải nơi lưu kiến thức kỹ thuật.

## 2. Cập nhật Project-level context (Tầng 2)
File: `E:\My office\Projects\{project}\system_context.md`

Ghi nhận khi có thay đổi về:
- Tech stack, kiến trúc tổng thể của dự án
- Luồng nghiệp vụ liên module trong dự án
- Dependency mới phát sinh giữa các module
- Quyết định kiến trúc (ADR)
- Môi trường deploy (staging, production URL)

> ⚠️ TUYỆT ĐỐI không copy chi tiết code vào đây.

## 3. Cập nhật Module-level context (Tầng 3)
File: `E:\My office\Projects\{project}\modules\{module_name}\context.md`

Ghi chi tiết:
- Logic kỹ thuật mới được thêm
- Endpoints / functions mới
- Thay đổi cấu trúc dữ liệu nội bộ
- Gotchas / lưu ý cho developer sau này
- History of Change

## 4. Cập nhật tasks.json
File: `E:\My office\office\tasks.json`
- `status: "DONE"` nếu hoàn thành
- `status: "REVIEW"` nếu cần QC kiểm tra
- Ghi timestamp vào history của task

## 5. Cập nhật LOB Brain (Tầng 4 - BẮT BUỘC TUYỆT ĐỐI)

> ⛔ **KHÔNG CÓ NGOẠI LỆ**: Bất kể task nhỏ hay lớn, bất kể có code hay không — Agent PHẢI ghi vào LOB Brain trước khi kết thúc session.

### 5a. brain_store — Lưu project context
Gọi `brain_store` sau MỌI session có làm việc với project:

```
brain_store(
  content:     <Tóm tắt những gì đã làm + quyết định + kết quả chính, 3-5 câu>,
  summary:     <1-2 câu ngắn nhất>,
  essence:     <≤15 từ — tag style>,
  importance:  <1-5>,
  tags:        [tên_project, domain, keyword],
  project:     <tên project>,
  memory_type: "knowledge" | "decision" | "architecture" | "learning",
  context_log: <Toàn bộ nội dung thảo luận — yêu cầu, phân tích, kết quả, ADR nếu có>
)
```

**Ghi khi session có bất kỳ điều sau:**
- Đọc/hiểu context dự án (dù không code)
- Hỏi đáp về nghiệp vụ hoặc kỹ thuật ≥ 2 turns
- Thay đổi file / code / config bất kỳ
- Quyết định kiến trúc hoặc ADR
- Bug analysis hoặc research

### 5b. brain_log_session — Lưu conversation history
Gọi `brain_log_session` sau MỌI session (không ngoại lệ):

```
brain_log_session(
  title:        <Tên session 1 dòng — mô tả rõ việc đã làm>,
  project:      <tên project>,
  memory_hash:  <hash từ brain_store ở bước 5a nếu có>,
  turns: [
    { role: "user", content: "<yêu cầu chính>" },
    { role: "assistant", content: "<tóm tắt việc đã làm + kết quả>" }
  ]
)
```

> 💡 **Lý do**: Các agent trên máy khác đang đọc brain liên tục (SSE sessions). Nếu không ghi lại, họ sẽ làm việc với context lỗi thời, dẫn đến conflict và mất công.

## ✅ Commit Gate
Trước khi kết thúc response, Agent phải xác nhận:
> "✅ Đã cập nhật: [danh sách file đã ghi + brain_store hash + brain_log_session]"

Nếu bỏ sót bước này, context sẽ bị lỗi thời và agent sau sẽ làm việc sai.
