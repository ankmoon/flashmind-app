---
description: Universal Orchestrator — tự động nhận diện domain, chọn đúng agent và workflow mà không cần nhớ lệnh.
---

# /orchestrate — Universal Router

> **Triết lý**: Bạn chỉ cần mô tả việc muốn làm. Orchestrator sẽ tự phân tích và điều phối đúng agent + workflow.

$ARGUMENTS

---

## 🧠 BƯỚC 0 — AUTO-ROUTING (Chạy trước mọi thứ)

Đọc `intelligent-routing` skill và thực hiện phân tích tự động:

```
1. Đọc D:\My office\.agent\skills\intelligent-routing\SKILL.md
2. Phân tích yêu cầu người dùng → xác định Domain(s)
3. Tra bảng Agent Selection Matrix bên dưới
4. Chọn Phase phù hợp (Simple / Complex)
```

---

## 🗺️ AGENT SELECTION MATRIX (FULL)

### 🏗️ Lập trình & Phát triển phần mềm

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "API", "backend", "database", "server", "endpoint" | **BE Agent** | `be-agent/SKILL.md` | `/WF-Solid-Feature` |
| "UI", "giao diện", "component", "frontend", "page", "React" | **FE Agent** | `fe-agent/SKILL.md` | `/WF-Solid-Feature` |
| "thiết kế", "mockup", "design", "Stitch", "color", "layout" | **Design Agent** | `design-agent/SKILL.md` | `/WF-UX-Design-Review` |
| "kiến trúc", "database schema", "API contract", "system design" | **SA Agent** | `sa-agent/SKILL.md` | `/plan` |
| "deploy", "CI/CD", "Docker", "production", "server setup" | **DevOps Agent** | `devops-agent/SKILL.md` | `/WF-DevOps-Deployment` |
| "test", "bug", "lỗi", "fix", "crash", "không chạy" | **QC Agent** | `qc-agent/SKILL.md` | `/WF-Bug-Fixing` hoặc `/debug` |
| "security", "bảo mật", "auth", "JWT", "vulnerability" | **Security Agent** | `security-audit/SKILL.md` | `/WF-Security-Audit` |
| "tính năng mới", "feature", "build", "tạo mới" | **BA → SA → FE/BE → QC** | `ba-agent/SKILL.md` | `/WF-Solid-Feature` |

### 🎮 Game & Gamification

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "game mechanics", "GDD", "balancing", "XP", "quest", "progression" | **Game Designer** | `game-designer-agent/SKILL.md` | `/WF-Game-Design` |
| "art style", "visual", "sprite", "animation", "icon", "palette", "asset" | **Game Artist** | `game-artist-agent/SKILL.md` | `/WF-Game-Art-Pipeline` |
| "gamification", "level up", "badge", "streak", "leaderboard" | **Game Designer + FE Agent** | cả hai | `/WF-Game-Design` → `/WF-Solid-Feature` |
| "godot", "GDScript", "scene", "node", "signal", "tscn" | **Godot Developer** | `godot-developer-agent/SKILL.md` | `/WF-GodotDev` |
| "implement mechanic", "code game", "debug godot", "export game" | **Godot Developer** | `godot-developer-agent/SKILL.md` | `/WF-GodotDev` |
| "HUD", "game menu", "inventory UI", "health bar", "game interface" | **Game UI/UX Agent** | `game-ui-ux-agent/SKILL.md` | `/WF-GameUIUX` |
| "damage number", "tooltip game", "shop UI", "pause menu", "onboarding game" | **Game UI/UX Agent** | `game-ui-ux-agent/SKILL.md` | `/WF-GameUIUX` |

### 💡 Ý tưởng, Chiến lược & Nghiệp vụ

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "brainstorm", "ý tưởng", "sáng tạo", "gợi ý", "ideation" | **Brainstorm Agent** | `brainstorming/SKILL.md` | `/Workflow-Ideation` hoặc `/brainstorm` |
| "phân tích nghiệp vụ", "PRD", "user story", "requirements", "bẻ task" | **BA Agent** | `ba-agent/SKILL.md` | `/workflow` hoặc `/presale-ba-software` |
| "present", "slide", "báo cáo", "pitching", "thuyết trình" | **BA + Brainstorm Agent** | `ba-agent/SKILL.md` + `brainstorming/SKILL.md` | `/Workflow-Ideation` |
| "kiểm tra dự án", "audit code", "rà soát", "chất lượng" | **QC + SA Agent** | `qc-agent/SKILL.md` + `sa-agent/SKILL.md` | `/WF-Project-Auditing` |

### 📣 Marketing & Content

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "đăng bài", "Facebook", "social media", "content", "caption", "hashtag" | **Marketing Agent** | `marketing-agent/SKILL.md` | `/WF-Facebook-Post` |
| "landing page", "marketing site", "conversion", "copywriting" | **Marketing Agent + Design Agent** | `marketing-agent/SKILL.md` + `design-agent/SKILL.md` | `/ui-ux-pro-max` |
| "content calendar", "chiến lược nội dung", "brand voice" | **Marketing Agent** | `marketing-agent/SKILL.md` | `/Workflow-Ideation` |
| "slide", "pitching", "thuyết trình", "present", "báo cáo" | **Marketing Agent + BA Agent** | `marketing-agent/SKILL.md` + `ba-agent/SKILL.md` | `/Workflow-Ideation` |

### 🔬 Nghiên cứu & Phân tích

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "nghiên cứu", "research", "tìm hiểu", "phân tích chuyên sâu" | **Research Agent** | `research-agent/SKILL.md` | `/WF-Research` |
| "so sánh", "benchmark", "đánh giá", "lựa chọn công nghệ" | **Research Agent** | `research-agent/SKILL.md` | `/WF-Research` |
| "báo cáo nghiên cứu", "research report", "deep dive" | **Research Agent** | `research-agent/SKILL.md` | `/WF-Research` |
| "tìm hiểu thị trường", "market research", "competitor analysis" | **Research Agent + Marketing Agent** | `research-agent/SKILL.md` + `marketing-agent/SKILL.md` | `/WF-Research` |

### 🎓 Giảng dạy & TankBAClass

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "chuẩn bị buổi dạy", "warm-up", "buổi học", "giảng dạy", "teaching" | **BA Instructor** | `ba-instructor-agent/SKILL.md` | `/WF-Teaching` |
| "chấm bài", "grade", "review bài", "feedback học viên", "grading" | **Assignment Grader** | `assignment-grader-agent/SKILL.md` | `/WF-Grading` |
| "chuẩn bị slide", "slide deck", "talking points", "bài giảng" | **BA Instructor** | `ba-instructor-agent/SKILL.md` | `/WF-SlidePrep` |
| "build khoá học", "curriculum", "thiết kế khoá", "course mới" | **Course Builder** | `course-builder-agent/SKILL.md` | `/WF-CourseBuilder` |
| "giải thích concept", "trả lời học viên", "câu hỏi BA", "Q&A" | **BA Instructor** | `ba-instructor-agent/SKILL.md` | `/WF-Teaching` |

---


## 🔴 2-PHASE EXECUTION

### Phân loại độ phức tạp

```
SIMPLE  → 1 domain, 1 agent, task rõ ràng
           → Bỏ qua Phase 1, làm thẳng

COMPLEX → ≥2 domains HOẶC task mơ hồ HOẶC cần nhiều agent
           → Bắt buộc Phase 1 Planning trước
```

### PHASE 1: PLANNING (chỉ cho task COMPLEX)

| Bước | Hành động |
|------|-----------|
| 1 | Đọc `D:\My office\system_context.md` (Rule-0) |
| 2 | Đọc project context nếu xác định được dự án |
| 3 | Liệt kê agents cần gọi và thứ tự |
| 4 | Tạo plan ngắn gọn |
| ⏸️ | **Hỏi user**: "Approve plan? (Y/N)" — **KHÔNG làm tiếp nếu chưa có OK** |

### PHASE 2: IMPLEMENTATION

Với mỗi agent được chọn:
1. Đọc `SKILL.md` tương ứng
2. Đọc workflow gợi ý nếu có
3. Thực thi theo đúng quy trình trong skill
4. Bàn giao kết quả cho agent tiếp theo (nếu pipeline)

---

## 📋 CONTEXT PASSING (BẮT BUỘC)

Khi chuyển từ agent này sang agent khác, luôn pass:
- Yêu cầu gốc của user
- Kết quả từ agent trước
- Trạng thái task hiện tại
- Constraints / decisions đã được thống nhất

---

## ✅ OUTPUT FORMAT

```
## 🎭 Orchestration Complete

### Agents Invoked
- `[agent-name]` → [tóm tắt việc đã làm]

### Deliverables
- [file/artifact đã tạo]

### Next Steps
- [gợi ý tiếp theo nếu có]
```

---

## 💡 VÍ DỤ SỬ DỤNG

```
/orchestrate tôi muốn thêm tính năng login vào app
→ Nhận diện: Backend + Frontend + Security
→ Gọi: BA Agent → SA Agent → BE Agent → FE Agent → QC Agent

/orchestrate brainstorm tên cho sản phẩm mới của tôi
→ Nhận diện: Ideation
→ Gọi: Brainstorm Agent + Workflow-Ideation

/orchestrate design game progression system cho Life is Game
→ Nhận diện: Game Design + Game Art
→ Gọi: Game Designer → Game Artist

/orchestrate fix lỗi trang dashboard bị trắng
→ Nhận diện: Bug + Frontend (SIMPLE)
→ Gọi thẳng: QC Agent + WF-Bug-Fixing

/orchestrate tôi cần slide pitching cho dự án
→ Nhận diện: Present + BA
→ Gọi: BA Agent + Brainstorm Agent + Workflow-Ideation
```
