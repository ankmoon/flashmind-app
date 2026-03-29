---
description: Universal Orchestrator — tự động nhận diện domain, chọn đúng agent và workflow mà không cần nhớ lệnh.
---

# /orchestrate — Universal Router

> **Triết lý**: Bạn chỉ cần mô tả việc muốn làm. Orchestrator sẽ tự phân tích và điều phối đúng agent + workflow.

$ARGUMENTS

---

## 🧠 BƯỚC -1 — λ-BRAIN RECALL + CONFLICT RESOLUTION (Chạy ĐẦUTIÊN, trước mọi thứ)

Nếu MCP tool `lambda-brain` khả dụng, thực hiện:

```
1. Xác định project từ yêu cầu (nếu có)
2. Gọi brain_context(project=<project nếu có>) // Tự động fit token budget
3. Nếu có kết quả → đọc nội dung bọc context và sử dụng tức thời
4. Nếu không có kết quả → tiếp tục bình thường
```

### Context Conflict Resolution

Sau khi có dữ liệu từ não, SO SÁNH với context file trên máy:

```
CASE 1: File trên máy tồn tại + brain có memory
   → So sánh nội dung:
     - File mới hơn hoặc chi tiết hơn → DÙNG FILE, silent update brain bằng brain_store
     - Giống nhau hoặc file quá dài → DÙNG brain (nhanh và tiết kiệm token)
     - Conflict thật (nội dung khác nhau, không rõ cái nào đúng)
       → HỎI USER: "File và não LOB Brain đang khác nhau. Dùng cái nào?"
       → Sau khi user chọn → update cái còn lại
       
CASE 2: Brain có memory, file KHÔNG tồn tại (máy trạm / máy mới)
   → DÙNG brain trực tiếp, KHÔNG hỏi user

CASE 3: File tồn tại, brain KHÔNG có
   → DÙNG file + tự động brain_store để sync vào não (silent)
```

> 💡 Mục đích: Agent tự quyết định được 90% trường hợp. Chỉ hỏi user khi conflict thật.
> Không hiện "raw data" ra cho user — dùng ngầm làm bộ nhớ đệm (context window).


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
| "API", "backend", "database", "server", "endpoint" | **BE Agent** | `agents/be-agent.md` | `/WF-Solid-Feature` |
| "UI", "giao diện", "component", "frontend", "page", "React" | **FE Agent** | `agents/fe-agent.md` | `/WF-Solid-Feature` |
| "thiết kế", "mockup", "design", "Stitch", "color", "layout" | **Design Agent** | `agents/design-agent.md` | `/WF-UX-Design-Review` |
| "kiến trúc", "database schema", "API contract", "system design" | **SA Agent** | `agents/sa-agent.md` | `/plan` |
| "deploy", "CI/CD", "Docker", "production", "server setup" | **DevOps Agent** | `agents/devops-agent.md` | `/WF-DevOps-Deployment` |
| "test", "bug", "lỗi", "fix", "crash", "không chạy" | **QC Agent** | `agents/qc-agent.md` | `/WF-Bug-Fixing` hoặc `/debug` |
| "security", "bảo mật", "auth", "JWT", "vulnerability" | **Security Agent** | `security-audit/SKILL.md` | `/WF-Security-Audit` |
| "tính năng mới", "feature", "build", "tạo mới" | **BA → SA → FE/BE → QC** | `agents/ba-agent.md` | `/WF-Solid-Feature` |

### 🎮 Game & Gamification

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "game mechanics", "GDD", "balancing", "XP", "quest", "progression" | **Game Designer** | `agents/game-designer-agent.md` | `/WF-Game-Design` |
| "art style", "visual", "sprite", "animation", "icon", "palette", "asset" | **Game Artist** | `agents/game-artist-agent.md` | `/WF-Game-Art-Pipeline` |
| "gamification", "level up", "badge", "streak", "leaderboard" | **Game Designer + FE Agent** | cả hai | `/WF-Game-Design` → `/WF-Solid-Feature` |
| "godot", "GDScript", "scene", "node", "signal", "tscn" | **Godot Developer** | `agents/godot-developer-agent.md` | `/WF-GodotDev` |
| "implement mechanic", "code game", "debug godot", "export game" | **Godot Developer** | `agents/godot-developer-agent.md` | `/WF-GodotDev` |
| "HUD", "game menu", "inventory UI", "health bar", "game interface" | **Game UI/UX Agent** | `agents/game-ui-ux-agent.md` | `/WF-GameUIUX` |
| "damage number", "tooltip game", "shop UI", "pause menu", "onboarding game" | **Game UI/UX Agent** | `agents/game-ui-ux-agent.md` | `/WF-GameUIUX` |

### 💡 Ý tưởng, Chiến lược & Nghiệp vụ

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "brainstorm", "ý tưởng", "sáng tạo", "gợi ý", "ideation" | **Brainstorm Agent** | `brainstorming/SKILL.md` | `/Workflow-Ideation` hoặc `/brainstorm` |
| "phân tích nghiệp vụ", "PRD", "user story", "requirements", "bẻ task" | **BA Agent** | `agents/ba-agent.md` | `/workflow` hoặc `/presale-ba-software` |
| "use case", "đặc tả UC", "phân tích UC", "UC spec", "business rule" | **UC Analyst Agent** | `agents/uc-analyst-agent.md` + `use-case-analysis/SKILL.md` | `/WF-UseCase-Spec` |
| "present", "slide", "báo cáo", "pitching", "thuyết trình" | **Marketing Agent + BA Agent** | `presentation-builder/SKILL.md` + `agents/marketing-agent.md` | `/design_presentation` |
| "kiểm tra dự án", "audit code", "rà soát", "chất lượng" | **QC + SA Agent** | `agents/qc-agent.md` + `agents/sa-agent.md` | `/WF-Project-Auditing` |

### 📣 Marketing & Content

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "viết blog", "blog post", "blog long form", "blog short form", "bài viết dài", "bài viết ngắn" | **Content Writer Agent** | `agents/content-writer-agent.md` | `/WF-Content-Writing` |
| "viết facebook post", "facebook long form", "bài facebook dài", "post FB" | **Content Writer Agent** | `agents/content-writer-agent.md` | `/WF-Content-Writing` |
| "đăng bài", "caption", "hashtag", "social media quick post" | **Marketing Agent** | `agents/marketing-agent.md` | `/WF-Facebook-Post` |
| "landing page", "marketing site", "conversion", "copywriting" | **Marketing Agent + Design Agent** | `agents/marketing-agent.md` + `agents/design-agent.md` | `/ui-ux-pro-max` |
| "content calendar", "chiến lược nội dung", "brand voice" | **Marketing Agent** | `agents/marketing-agent.md` | `/Workflow-Ideation` |
| "slide", "pitching", "thuyết trình", "present", "báo cáo", "pitch deck", "reveal.js" | **Marketing Agent** | `presentation-builder/SKILL.md` + `agents/marketing-agent.md` | `/design_presentation` |

### 🔬 Nghiên cứu & Phân tích

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "nghiên cứu", "research", "tìm hiểu", "phân tích chuyên sâu" | **Research Agent** | `agents/research-agent.md` | `/WF-Research` |
| "so sánh", "benchmark", "đánh giá", "lựa chọn công nghệ" | **Research Agent** | `agents/research-agent.md` | `/WF-Research` |
| "báo cáo nghiên cứu", "research report", "deep dive" | **Research Agent** | `agents/research-agent.md` | `/WF-Research` |
| "tìm hiểu thị trường", "market research", "competitor analysis" | **Research Agent + Marketing Agent** | `agents/research-agent.md` + `agents/marketing-agent.md` | `/WF-Research` |

### 🎓 Giảng dạy & TankBAClass

| Từ khóa nhận diện | Agent | Skill cần đọc | Workflow gợi ý |
|---|---|---|---|
| "chuẩn bị buổi dạy", "warm-up", "buổi học", "giảng dạy", "teaching" | **BA Instructor** | `agents/ba-instructor-agent.md` | `/WF-Teaching` |
| "chấm bài", "grade", "review bài", "feedback học viên", "grading" | **Assignment Grader** | `agents/assignment-grader-agent.md` | `/WF-Grading` |
| "chuẩn bị slide", "slide deck", "talking points", "bài giảng" | **BA Instructor** | `agents/ba-instructor-agent.md` | `/WF-SlidePrep` |
| "build khoá học", "curriculum", "thiết kế khoá", "course mới" | **Course Builder** | `agents/course-builder-agent.md` | `/WF-CourseBuilder` |
| "giải thích concept", "trả lời học viên", "câu hỏi BA", "Q&A" | **BA Instructor** | `agents/ba-instructor-agent.md` | `/WF-Teaching` |

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

## 🧠 BƯỚC END — λ-BRAIN STORE (Chạy SAU KHI hoàn thành task)

> ⛔ **BẮT BUỘC TUYỆT ĐỐI — KHÔNG CÓ NGOẠI LỆ**: Áp dụng cho MỌI domain: dev, marketing, content, research, teaching, game, v.v. Bất kể task lớn hay nhỏ — phải ghi vào brain trước khi kết thúc.

Sau khi tất cả agents hoàn thành, gọi **CẢ HAI** bước sau:

### 5a. brain_store — Lưu project/session context
```
brain_store(
  content:      <Tóm tắt việc đã làm + quyết định + kết quả chính, 3-5 câu>,
  summary:      <1-2 câu ngắn gọn nhất>,
  essence:      <≤15 từ — tag-style>,
  importance:   <1-5>,
  tags:         <[tên_project, domain, keyword]>,
  project:      <tên project nếu xác định được>,
  memory_type:  <"decision" | "architecture" | "knowledge" | "learning">,
  sensitivity:  <"public" mặc định | "secret" cho thông tin nhạy cảm>,
  context_log:  <TOÀN BỘ cuộc thảo luận — yêu cầu, phân tích, kết quả, file đã tạo>
)
```

**Ghi cho MỌI loại session, bao gồm:**
- ✓ Dev: code, bug fix, architecture, deploy
- ✓ Marketing/Content: bài viết đã soạn, chiến lược content, caption
- ✓ Research: kết quả nghiên cứu, so sánh, báo cáo
- ✓ Teaching: buổi dạy, chấm bài, slide đã chuẩn bị
- ✓ Game: mechanics đã design, GDD, assets
- ✓ Bất kỳ session ≥ 2 turns thảo luận

### 5b. brain_log_session — Lưu conversation history (KHÔNG NGOẠI LỆ)
```
brain_log_session(
  title:        <Tóm tắt 1 dòng — mô tả rõ việc đã làm>,
  project:      <tên project>,
  memory_hash:  <hash từ brain_store ở bước 5a>,
  turns: [
    { role: "user", content: "<yêu cầu chính>" },
    { role: "assistant", content: "<tóm tắt việc đã làm + kết quả>" }
  ]
)
```

> 💡 **Lý do**: Các agent trên máy khác đang đọc brain qua SSE liên tục. Nếu không ghi lại sau mỗi session, họ sẽ làm việc với context lỗi thời — dẫn đến conflict và mất công.

> 🔒 `context_log` lưu trong Obsidian Vault `.md` — chỉ human đọc. AI chỉ load `essence`/`summary` theo decay score.

---


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
