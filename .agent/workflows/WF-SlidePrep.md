---
description: Quy trình chuẩn bị nội dung slide và talking points cho buổi dạy TankBAClass
---

# /WF-SlidePrep — Slide Preparation Workflow

// turbo-all

## Chuẩn bị

1. Đọc skill: `D:\My office\.agent\agents\ba-instructor-agent.md`

---

## Quy trình

### Bước 1 — Thu thập input
2. Hỏi Tank cung cấp:
   - Buổi mấy? Topic gì?
   - Có outline/nội dung sẵn không? (paste vào)
   - Thời lượng buổi dạy?
   - Level học viên?

### Bước 2 — Tạo Slide Structure
3. Convert nội dung → cấu trúc slide:

```markdown
## 📊 Slide Structure — Buổi [X]: [Topic]
Tổng số slide gợi ý: [N] slides

---

### SLIDE 1: Title slide
**Tiêu đề**: [Tên buổi]
**Subtitle**: [Tagline ngắn gọn]

---

### SLIDE 2-3: Recap buổi trước
**Layout**: Key points list
- [Point 1]
- [Point 2]
- [Point 3]
**Talking point**: "Hôm nay chúng ta sẽ build on top of..."

---

### SLIDE 4: Agenda hôm nay
**Layout**: Numbered list hoặc roadmap visual
- [Topic 1]
- [Topic 2]
- [Practice]

---

### SLIDE 5-X: Core Content
[Tạo từng slide với:]
- **Tiêu đề slide**
- **Nội dung chính** (max 5 bullet points, mỗi bullet ≤10 từ)
- **Visual gợi ý** (diagram / screenshot / icon)
- **Talking points** (Tank nói gì khi dạy slide này)
- **Example/Demo** (nếu có)

---

### SLIDE N-2: Case Study
**Layout**: Story format
- **Context**: [2 câu]
- **Challenge**: [Pain point]
- **Your task**: [Câu hỏi cho học viên]

---

### SLIDE N-1: Key Takeaways
**Layout**: 3 big points
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

---

### SLIDE N: Homework
**Layout**: Clean, single focus
- **Task**: [Mô tả bài tập]
- **Deadline**: [Khi nào nộp]
- **Submit via**: [Kênh nào]
```

### Bước 3 — Tạo Speaker Notes
4. Với mỗi slide quan trọng, tạo speaker notes:
   - Câu mở đầu để transition vào slide
   - Điểm nhấn cần nhắc đến
   - Câu hỏi gợi ý để hỏi học viên
   - Thời gian ước tính

### Bước 4 — Q&A Anticipation
5. Tạo danh sách **câu hỏi học viên hay hỏi** về topic này:
```markdown
## ❓ Anticipated Q&A

**Q**: [Câu hỏi phổ biến 1]
**A**: [Câu trả lời ngắn gọn]

**Q**: [Câu hỏi phổ biến 2]
**A**: [Câu trả lời]
```

### Bước 5 — Visual Suggestions
6. Với các concept trừu tượng, gợi ý visual/diagram:
   - Flowchart / BPMN diagram
   - Before/After comparison
   - Real screenshot từ tool (Figma, Jira, Confluence...)
   - Analogy diagram

---

## Slash commands

```
/slide [buổi] [topic]          → Tạo toàn bộ slide structure
/slide outline [content]       → Chỉ tạo outline từ nội dung có sẵn
/slide notes [tên slide]       → Tạo speaker notes cho 1 slide
/slide qa [topic]              → Tạo Q&A anticipation
/slide visual [concept]        → Gợi ý cách visualize concept
```
