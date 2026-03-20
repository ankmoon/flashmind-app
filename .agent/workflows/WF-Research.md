---
description: Quy trình nghiên cứu chuyên sâu — phân rã vấn đề, đào sâu, tổng hợp báo cáo
---

# /WF-Research — Deep Research Workflow

// turbo-all

## Chuẩn bị

1. Đọc skill file: `D:\My office\.agent\skills\research-agent\SKILL.md`
2. Đọc `D:\My office\system_context.md` nếu research liên quan đến dự án cụ thể

---

## PHASE 1 — MAPPING (Phân rã vấn đề)

**Mục tiêu**: Tạo bản đồ tổng quan trước khi đào sâu

3. Nhận topic từ user
4. Đặt 1-3 câu hỏi làm rõ scope nếu topic mơ hồ:
   - Research để làm gì? (quyết định / học / build?)
   - Mức độ chuyên sâu? (overview / technical / academic?)
   - Ưu tiên góc nhìn nào?

5. Tạo **Research Map** với 5-10 sub-questions:
   ```
   ## Research Map: [Topic]
   
   1. [Sub-question 1] — [Tại sao quan trọng]
   2. [Sub-question 2] — [Tại sao quan trọng]
   ...
   
   💡 Gợi ý đào sâu: [sub-question quan trọng nhất]
   ```

6. Hỏi user: **"Bạn muốn đào sâu vào câu hỏi nào? (số thứ tự)"**
   - Chờ user chọn trước khi bước sang Phase 2

---

## PHASE 2 — DEEP DIVE (Nghiên cứu chuyên sâu)

**Mục tiêu**: Đào sâu vào sub-question được chọn

7. Search và collect thông tin theo 4 góc:
   - **Nền tảng**: Định nghĩa, khái niệm, lịch sử
   - **Thực tiễn**: Case studies, ví dụ thực tế, số liệu
   - **Tranh luận**: Ý kiến trái chiều, limitations, gotchas
   - **Tool/Framework**: Công cụ, thư viện, phương pháp liên quan

8. Phân tích và tổng hợp:
   - So sánh các quan điểm
   - Tìm pattern chung
   - Identify contradictions
   - Rút ra insight không hiển nhiên

9. Verify: Mỗi kết luận quan trọng phải có ≥1 bằng chứng/nguồn cụ thể

---

## PHASE 3 — REPORTING (Xuất báo cáo)

**Mục tiêu**: Báo cáo có cấu trúc, actionable

10. Viết báo cáo theo template:

```markdown
# Research Report: [Topic]
**Date**: [date] | **Focus**: [sub-question]
**Depth**: [overview/technical/deep]

## 🎯 TL;DR
[3-5 dòng tóm tắt kết quả chính]

## 🗺️ Context & Scope
[Tại sao câu hỏi này quan trọng, scope của research]

## 🔍 Key Findings

### Finding 1: [Tiêu đề]
[Detail + evidence/source]

### Finding 2: [Tiêu đề]
[Detail + evidence/source]

...

## ⚡ Insights
- [Insight quan trọng nhất — thường là điều bất ngờ]
- [Insight 2]

## 🚫 Open Questions
[Những gì còn chưa rõ / cần nghiên cứu thêm]

## ✅ Recommendations
1. [Hành động cụ thể 1]
2. [Hành động cụ thể 2]

## 📚 Sources
- [Source 1]
- [Source 2]
```

11. Hỏi user: **"Bạn muốn đào sâu thêm sub-question nào khác không?"**
    - Nếu có → quay lại Phase 2 với sub-question mới
    - Nếu không → lưu báo cáo

12. Lưu báo cáo:
    - Nếu liên quan project: `{project_path}\docs\research\{topic-slug}.md`
    - Nếu là research chung: `D:\My office\office\research\{date}-{topic-slug}.md`

---

## Slash Commands tắt

| Command | Action |
|---|---|
| `/research [topic]` | Bắt đầu từ Phase 1 |
| `/research deep [sub-question]` | Nhảy thẳng Phase 2 |
| `/research report` | Xuất báo cáo từ context hiện tại |
| `/research save` | Lưu báo cáo vào file |
