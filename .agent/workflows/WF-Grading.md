---
description: Quy trình chấm bài học viên TankBAClass — rubric-based, feedback chi tiết, constructive
---

# /WF-Grading — Assignment Grading Workflow

// turbo-all

## Chuẩn bị

1. Đọc skill: `D:\My office\.agent\agents\assignment-grader-agent.md`

---

## Quy trình chấm bài

### Bước 1 — Thu thập thông tin
2. Hỏi Tank cung cấp (nếu chưa có):
   - Bài làm của học viên (paste hoặc mô tả)
   - Loại bài: BPMN / User Story / ERD / Use Case / Stakeholder Analysis / khác
   - Tên/ID học viên (nếu cần track)
   - Đề bài / yêu cầu gốc (nếu có)

### Bước 2 — Đọc và phân tích bài
3. Đọc toàn bộ bài làm **trước khi chấm**
4. Note lại:
   - ✅ Điểm làm đúng / tốt
   - ❌ Lỗi cụ thể (vị trí trong bài)
   - 💡 Điểm có thể cải thiện để lên level

### Bước 3 — Chấm điểm
5. Áp dụng rubric theo loại bài (từ SKILL.md)
6. Tính điểm tổng (100 điểm)
7. Xếp mức: Xuất sắc / Đạt / Cần cải thiện / Chưa đạt

### Bước 4 — Viết feedback
8. Dùng template feedback chuẩn:

```markdown
## 📋 Kết quả chấm — [Loại bài]
**Điểm**: [X]/100 — [Mức đánh giá]

### ✅ Điểm mạnh
- [Điều cụ thể học viên làm tốt]

### ⚠️ Cần cải thiện
| # | Vấn đề | Giải thích | Gợi ý fix |
|---|---|---|---|
| 1 | [lỗi] | [tại sao sai] | [cách sửa] |

### 💡 Để lên level tiếp theo
[Gợi ý cho học viên muốn xuất sắc]
```

### Bước 5 — Review trước khi gửi
9. Kiểm tra: Feedback có **cụ thể** không? (Tránh "cần cải thiện" chung chung)
10. Kiểm tra: Có ít nhất 1 **điểm mạnh** được công nhận không?
11. Kiểm tra: Mỗi lỗi có **hướng fix** không?

---

## Chấm batch (nhiều học viên)

Khi cần chấm nhiều bài cùng lúc:

12. Chấm lần lượt từng bài
13. Sau khi chấm xong tất cả, tạo **Class Summary**:

```markdown
## 📊 Class Summary — [Tên bài]

| Mức | Số HV | % |
|---|---|---|
| 🏆 Xuất sắc (90-100) | X | X% |
| ✅ Đạt (70-89) | X | X% |
| ⚠️ Cần cải thiện (50-69) | X | X% |
| ❌ Chưa đạt (<50) | X | X% |

### Lỗi phổ biến nhất (toàn lớp)
1. [Lỗi hay gặp nhất] — [X/Y học viên mắc]
2. ...

### Gợi ý cho buổi tiếp theo
[Concept nào cần giải thích lại dựa trên lỗi phổ biến]
```

---

## Slash commands

```
/grade [paste bài]                → Chấm 1 bài
/grade --type=bpmn [paste]        → Chấm bài BPMN
/grade --type=userstory [paste]   → Chấm bài User Story
/grade --type=erd [paste]         → Chấm bài ERD
/grade --batch                    → Bắt đầu chấm nhiều bài
/grade summary                    → Tạo Class Summary
```
