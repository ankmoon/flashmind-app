---
description: Quy trình xây dựng khoá học BA mới cho TankBAClass — từ xác định target learner đến thiết kế nội dung và bài tập
---

# /WF-CourseBuilder — Course Building Workflow

// turbo-all

## Chuẩn bị

1. Đọc skill: `D:\My office\.agent\skills\course-builder-agent\SKILL.md`

---

## Quy trình 5 bước

### Bước 1 — Define Target Learner
2. Thu thập thông tin:
   - Đối tượng học viên? (fresher / BA 1-2 năm / BA middle / PM / non-tech)
   - Background của họ? (IT / business / finance / operations?)
   - Pain point hiện tại của họ?
   - Sau khoá học, họ muốn làm được gì?

3. Tạo **Learner Persona**:
```markdown
## 👤 Target Learner
- **Who**: [Mô tả ngắn]
- **Background**: [Kinh nghiệm hiện tại]
- **Pain points**: [Họ đang khó khăn gì]
- **Goal**: [Họ muốn đạt được gì]
- **Prerequisites**: [Cần biết gì trước khi học khoá này]
```

### Bước 2 — Define Learning Outcomes
4. Tạo 3-5 learning outcomes đo được theo Bloom's:
```markdown
## 🎯 Learning Outcomes
Sau khoá học này, học viên có thể:
1. **[Biết]**: Nhận biết và giải thích được [X]
2. **[Hiểu]**: Mô tả được cách [Y] hoạt động trong dự án thực
3. **[Áp dụng]**: Thực hiện [Z] cho dự án của mình
4. **[Phân tích]**: Phân tích và đánh giá [W]
```

### Bước 3 — Design Curriculum
5. Tạo cấu trúc modules và sessions:
```
[Tên khoá học]
├── Module 1: [Tên] ([X buổi])
│   ├── Buổi 1: [Topic] — [Objective]
│   ├── Buổi 2: [Topic] — [Objective]
│   └── Assignment 1: [Mô tả]
├── Module 2: [Tên]
│   └── ...
└── Capstone Project: [Mô tả]
```

6. Hỏi Tank review và approve structure → điều chỉnh nếu cần

### Bước 4 — Design Session Details
7. Với mỗi buổi đã được approve, tạo outline chi tiết:
```markdown
## Buổi [X]: [Tên buổi] (90-120 phút)

**Objective**: Sau buổi này HV sẽ...

**Warm-up (10 min)**:
- Câu hỏi kích hoạt tư duy

**Core Content (60 min)**:
- [Concept A] (20 min): Explain → Demo → Example
- [Concept B] (20 min): Explain → Demo → Example
- Mini Case Study (20 min): [tên case]

**Thực hành (30 min)**:
- [Mô tả bài tập tại lớp]

**Wrap-up (10 min)**:
- Key takeaways
- Homework: [Bài tập về nhà]
```

### Bước 5 — Design Assessment
8. Tạo bài tập cho từng loại:
   - **Quick Check** (sau buổi): 3-5 câu hỏi ngắn
   - **Module Assignment**: Bài thực hành tổng hợp
   - **Capstone**: Dự án tổng hợp toàn khoá

9. Lưu khoá học vào:
   `D:\My office\Nondev\{tên-khoá}\curriculum.md`

---

## Slash commands

```
/build [mô tả khoá]        → Bắt đầu từ Bước 1
/session [buổi X] [topic]  → Tạo chi tiết 1 buổi
/exercise [topic] [level]  → Tạo bài tập
/casestudy [domain]        → Tạo case study
/outcomes [mô tả]          → Chỉ tạo learning outcomes
```
