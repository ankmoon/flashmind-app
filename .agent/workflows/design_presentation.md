---
description: Premium Presentation Generation — Quy trình tạo slide HTML/Reveal.js chuyên nghiệp từ tài liệu đầu vào
---

# /design_presentation - Premium Presentation Generation

$ARGUMENTS

---

## 🔴 CRITICAL: The 4-Phase Generation Process

### PHASE 1: CONTENT ANALYSIS & OUTLINE 

**Agent Focus:** `planner` or the primary Analyst
1. **Analyze input:** Đọc tài liệu đầu vào (Word, Markdown, text thô).
2. **Synthesize Structure:** Chia nội dung thành các phần logic. 
   - Nguyên tắc: Không nhồi nhét chữ. 1 Slide = 1 Key Message (Ví dụ: Slide về "Marketize" chỉ mô tả 3 điểm đắt nhất).
3. **Draft TOC:** Phác thảo Mục lục dạng 4-5 Chương rõ ràng. (VD: 01. Tầm nhìn, 02. Tính năng...).

> ⏸️ **CHECKPOINT 1:** Xuất Outline (TOC) và xin ý kiến User trước khi đi tiếp.

### PHASE 2: LAYOUT STRATEGY & VISUAL MAPPING

**Agent Focus:** `architect`
1. **Assign Components:** Với mỗi slide trong Outline, quy định rõ nó sẽ dùng Layout/Component nào trong bộ Skill `presentation_builder`:
   - *Slide số liệu*: Dùng **Bento Box**.
   - *Slide biểu đồ quy trình*: Dùng **Diagram Nodes/Pipeline**.
   - *Slide thông điệp đanh thép*: Dùng **HUGE TEXT** (font siêu lớn 3em - 4em).
2. **Select Theme:** Lựa chọn giữa *Luxury Dark* (Times New Roman + Gold/Lime) hoặc *Modern Tech* (Outfit + Gradients) tùy bối cảnh dự án.

### PHASE 3: HTML/CSS BAKE IN (Execution)

**Agent Focus:** `architect` / coder
1. **Load Boilerplate:** Trích xuất đoạn mã thư viện Reveal.js chuẩn từ file `presentation-builder/SKILL.md`.
2. **Inject Content:** Sinh mã HTML. Đảm bảo `<section>` chứa đầy đủ thẻ `<h2>`, `<h3>` chuẩn ngữ nghĩa SEO & UX.
3. **Typography Rule:** Kích hoạt thuộc tính Font size lớn. 
   > 🔴 CẤM: Tuyệt đối không để size chữ < 1.2em. Không dùng list `<ul>` `<li>` vượt quá 3 dòng một cách khô khan.

### PHASE 4: POLISHING & VERIFICATION

**Agent Focus:** `ui-reviewer`
1. Check độ tương phản sáng/tối (Glow effect trên nền tối).
2. Check các "Khoảng trắng" (White Space) - Bố cục không được nhồi nhét.
3. Chạy thử nghiệm file (nếu được) hoặc hướng dẫn User mở file để kiểm tra.
4. **BẮT BUỘC:** Ở bước cuối cùng, phải hỏi lại User xem họ có cần generate ra định dạng file PowerPoint (`.pptx`) không.

---

## Output Format Report

```markdown
## 🎨 Presentation Generated!

### Tóm tắt Thiết kế
- **Theme đã dùng:** [Luxury Dark / Modern Tech]
- **Số slide:** [X] slides (chia làm [Y] chương)
- **Visuals nổi bật:** [Đã dùng Bento Box cho phần Tính năng, Timeline cho Vận hành...]

### Deliverable:
- [Link tới file HTML]

### Hướng dẫn sử dụng & Tùy chọn:
1. Mở file bằng trình duyệt web.
2. Nhấn `F` để Fullscreen.
3. Dùng phím mũi tên lướt slide.
4. 🔴 **NHỚ HỎI:** "Bạn có cần hỗ trợ xuất slide này sang file `.pptx` không?"
```
