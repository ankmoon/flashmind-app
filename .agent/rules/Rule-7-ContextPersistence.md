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

## 5. Cập nhật LOB Brain (Tầng 4)

> Ghi vào brain khi session có **giá trị recall** — không ghi noise.

### 5a. brain_store — Lưu project context

**Ghi KHI session có:**
- Thay đổi file / code / config
- Quyết định kiến trúc hoặc ADR
- Bug analysis hoặc research có kết quả
- Hỏi đáp nghiệp vụ/kỹ thuật ≥ 3 turns có kết luận

**BỎ QUA KHI session chỉ có:**
- 1-2 turns hỏi-đáp đơn giản (hỏi port, hỏi path, hỏi status)
- Đọc thông tin mà không tạo quyết định hay thay đổi gì

```
brain_store(
  content:     <Tóm tắt 3-5 câu: việc đã làm + quyết định + kết quả>,
  summary:     <1-2 câu ngắn nhất>,
  essence:     <≤15 từ — tag style>,
  importance:  <1-5>,
  tags:        [tên_project, domain, keyword],
  project:     <tên project>,
  memory_type: "knowledge" | "decision" | "architecture" | "learning",
  context_log: <TÓM TẮT 5-10 dòng: yêu cầu → phân tích → kết quả → file thay đổi. KHÔNG paste toàn bộ conversation.>
)
```

> ⚡ `context_log` chỉ ghi TÓM TẮT, không ghi nguyên conversation — tiết kiệm storage + token khi recall.

### 5b. brain_log_session — Lưu conversation history

Gọi sau session có nội dung đáng nhớ (cùng tiêu chí với 5a):

```
brain_log_session(
  title:        <Tên session 1 dòng>,
  project:      <tên project>,
  memory_hash:  <hash từ brain_store ở bước 5a nếu có>,
  turns: [
    { role: "user", content: "<yêu cầu chính — 1 dòng>" },
    { role: "assistant", content: "<kết quả chính — 1-2 dòng>" }
  ]
)
```

> 💡 Các agent khác đang đọc brain qua SSE. Ghi lại để tránh context lỗi thời.

## ✅ Commit Gate
Trước khi kết thúc response, Agent xác nhận:
> "✅ Đã cập nhật: [danh sách file đã ghi + brain_store hash nếu có]"
