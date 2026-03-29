---
description: Quy trình chuẩn bị và hỗ trợ buổi dạy BA tại TankBAClass — warm-up, giải thích concept, Q&A, case study
---

# /WF-Teaching — Teaching Support Workflow

// turbo-all

## Trước khi làm bất kỳ điều gì

1. Đọc skill: `D:\My office\.agent\agents\ba-instructor-agent.md`

---

## MODE 1 — Chuẩn bị buổi dạy mới

Khi Tank cần chuẩn bị trước một buổi học:

2. Hỏi: **"Buổi mấy? Topic gì? Level học viên?"**
3. Tạo **Session Prep Pack** gồm:

```markdown
## 📚 Session Prep — Buổi [X]: [Topic]

### 🔄 Recap buổi trước (5 phút)
- [3 điểm chính buổi trước cần nhắc lại]
- [Kết nối với buổi hôm nay]

### 🎯 Learning Objectives hôm nay
Sau buổi này, học viên sẽ:
- [Biết được...]
- [Làm được...]

### ❓ Câu hỏi Warm-up kích hoạt tư duy (chọn 1-2)
1. [Câu hỏi gắn với pain point thực tế]
2. [Câu hỏi kiểm tra prior knowledge]

### 🧠 Core Content Flow
[Concept A] → [Demo/Example] → [Concept B] → [Mini Case]

### 📝 Mini Case Study
[Case study Vietnam context phù hợp topic]

### 🏠 Homework
[Bài tập về nhà cụ thể]

### ⚠️ Điểm dễ nhầm (Heads up cho Tank)
- [Common mistake học viên hay gặp]
- [Cách giải thích để tránh confusion]
```

---

## MODE 2 — Giải thích concept tức thì

Khi Tank cần giải thích nhanh 1 concept:

4. Áp dụng template 5 bước:
   - **Định nghĩa**: 1-2 câu, không jargon
   - **Tại sao**: Link to real project pain
   - **Ví dụ**: Vietnam context
   - **Sai lầm phổ biến**: Học viên hay mắc gì
   - **Câu hỏi kiểm tra**: Để học viên tự verify

---

## MODE 3 — Trả lời câu hỏi học viên

Khi Tank forward câu hỏi của học viên:

5. Format trả lời:
   - **Direct answer** (không vòng vo)
   - **Ví dụ minh họa** (nếu abstract)
   - **Follow-up question** (khuyến khích học viên nghĩ tiếp)
   - **Nếu câu hỏi hay**: Flag để đưa vào FAQ hoặc bài giảng

---

## MODE 4 — Tạo câu hỏi kiểm tra

Khi cần tạo quiz / test:

6. Tạo theo cấu trúc:
   - 40% câu hỏi **nhận biết** (Lý thuyết cơ bản)
   - 40% câu hỏi **áp dụng** (Scenario-based)
   - 20% câu hỏi **phân tích** (Mở, không có đáp án duy nhất)

---

## Slash commands

```
/teach prep [buổi] [topic]    → Mode 1: Tạo Session Prep Pack
/teach explain [concept]      → Mode 2: Giải thích 5 bước
/teach qa [câu hỏi HV]        → Mode 3: Trả lời câu hỏi
/teach quiz [topic] [số câu]  → Mode 4: Tạo câu hỏi kiểm tra
```
