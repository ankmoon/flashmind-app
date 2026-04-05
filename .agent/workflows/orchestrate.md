---
description: Universal Orchestrator — tự động nhận diện domain, chọn đúng agent và workflow mà không cần nhớ lệnh.
---

# /orchestrate — Universal Router

> **Triết lý**: Bạn chỉ cần mô tả việc muốn làm. Orchestrator sẽ tự phân tích và điều phối đúng agent + workflow.
> **Token-efficiency**: Chỉ load context vừa đủ. Không đọc thừa.

$ARGUMENTS

---

## 🧠 BƯỚC -1 — SMART CONTEXT LOADING (3-Tier)

> Mục tiêu: Load context **vừa đủ**, không double-read. Tiết kiệm 3,000-6,000 token/session.

### Quy trình quyết định

```
1. Xác định project từ yêu cầu (file đang mở, từ khoá, user nói rõ)

2. Nếu MCP tool `lob-brain` khả dụng:
   → Gọi brain_context(project=<project>, char_budget=4000)
   → Kiểm tra kết quả:
   
   CÓ KẾT QUẢ (brain nhớ project này):
     → 🟢 FAST MODE — Dùng brain context, KHÔNG đọc file.
     → Chỉ đọc thêm file NẾU task yêu cầu code cụ thể trong module.
   
   KHÔNG CÓ KẾT QUẢ (project mới hoặc brain trống):
     → 🔴 FULL MODE — Đọc file theo Rule-0 (3 tầng).
     → Cuối session tự brain_store để lần sau dùng FAST.

3. Nếu MCP tool `lob-brain` KHÔNG khả dụng:
   → 🟡 STANDARD MODE — Đọc file theo Rule-0 như bình thường.
```

### Chi tiết từng mode

| Mode | Điều kiện | Hành động | Token ước tính |
|------|-----------|-----------|---------------|
| 🟢 **FAST** | Brain có context cho project | `brain_context()` only. Không đọc `system_context.md`, không đọc module context. | ~2,000 |
| 🟡 **STANDARD** | Brain không khả dụng | Đọc `E:\My office\system_context.md` + `{project}\system_context.md`. Không đọc module context trừ khi cần. | ~3,000 |
| 🔴 **FULL** | Project mới / brain trống / user yêu cầu "full context" | Đọc file Rule-0 đầy đủ (3 tầng) + brain_store để cache cho lần sau. | ~6,000-9,000 |

### Khi nào nâng cấp mode

```
FAST → STANDARD:  Khi brain context thiếu thông tin cần thiết cho task hiện tại
FAST → FULL:      Khi user nói "đọc lại hết", "full context", hoặc task thay đổi kiến trúc
STANDARD → FULL:  Khi cần cross-module dependency check
```

> ⚠️ **KHÔNG BAO GIỜ** đọc brain_context() VÀ đọc file system_context.md cùng lúc.
> Chọn MỘT trong hai. Conflict resolution chỉ chạy khi phát hiện bất thường.

---

## 🧠 BƯỚC 0 — AUTO-ROUTING

Phân tích yêu cầu người dùng → xác định Domain(s) → tra bảng Agent Selection Matrix bên dưới.

> ⚡ **KHÔNG đọc `intelligent-routing/SKILL.md`** — bảng matrix đã inline đầy đủ bên dưới.
> Chỉ đọc SKILL.md cụ thể của agent được chọn, KHÔNG đọc trước.

```
1. Parse yêu cầu → xác định từ khoá domain
2. Tra bảng matrix → chọn Agent(s) + Workflow
3. Phân loại: SIMPLE (1 agent) hay COMPLEX (≥2 agents)
4. → Chuyển sang Phase tương ứng
```

---

## 🗺️ AGENT SELECTION MATRIX

### 🏗️ Lập trình & Phát triển phần mềm

| Từ khóa nhận diện | Agent | Workflow gợi ý |
|---|---|---|
| "API", "backend", "database", "server", "endpoint" | **BE Agent** | `/WF-Solid-Feature` |
| "UI", "giao diện", "component", "frontend", "page", "React" | **FE Agent** | `/WF-Solid-Feature` |
| "thiết kế", "mockup", "design", "Stitch", "color", "layout" | **Design Agent** | `/WF-UX-Design-Review` |
| "kiến trúc", "database schema", "API contract", "system design" | **SA Agent** | `/plan` |
| "deploy", "CI/CD", "Docker", "production", "server setup" | **DevOps Agent** | `/WF-DevOps-Deployment` |
| "test", "bug", "lỗi", "fix", "crash", "không chạy" | **QC Agent** | `/WF-Bug-Fixing` hoặc `/debug` |
| "security", "bảo mật", "auth", "JWT", "vulnerability" | **Security Agent** | `/WF-Security-Audit` |
| "tính năng mới", "feature", "build", "tạo mới" | **BA → SA → FE/BE → QC** | `/WF-Solid-Feature` |

### 🎮 Game & Gamification

| Từ khóa nhận diện | Agent | Workflow gợi ý |
|---|---|---|
| "game mechanics", "GDD", "balancing", "XP", "quest", "progression" | **Game Designer** | `/WF-Game-Design` |
| "art style", "visual", "sprite", "animation", "icon", "palette", "asset" | **Game Artist** | `/WF-Game-Art-Pipeline` |
| "gamification", "level up", "badge", "streak", "leaderboard" | **Game Designer + FE** | `/WF-Game-Design` → `/WF-Solid-Feature` |
| "godot", "GDScript", "scene", "node", "signal", "tscn" | **Godot Developer** | `/WF-GodotDev` |
| "HUD", "game menu", "inventory UI", "health bar", "shop UI" | **Game UI/UX Agent** | `/WF-GameUIUX` |

### 💡 Ý tưởng, Chiến lược & Nghiệp vụ

| Từ khóa nhận diện | Agent | Workflow gợi ý |
|---|---|---|
| "brainstorm", "ý tưởng", "sáng tạo", "gợi ý", "ideation" | **Brainstorm Agent** | `/Workflow-Ideation` hoặc `/brainstorm` |
| "phân tích nghiệp vụ", "PRD", "user story", "requirements" | **BA Agent** | `/workflow` hoặc `/presale-ba-software` |
| "use case", "đặc tả UC", "phân tích UC", "UC spec" | **UC Analyst Agent** | `/WF-UseCase-Spec` |
| "present", "slide", "báo cáo", "pitching", "thuyết trình" | **Marketing + BA** | `/design_presentation` |
| "kiểm tra dự án", "audit code", "rà soát", "chất lượng" | **QC + SA Agent** | `/WF-Project-Auditing` |

### 📣 Marketing & Content

| Từ khóa nhận diện | Agent | Workflow gợi ý |
|---|---|---|
| "viết blog", "blog post", "blog long/short form" | **Content Writer** | `/WF-Content-Writing` |
| "viết facebook post", "facebook long form", "post FB" | **Content Writer** | `/WF-Content-Writing` |
| "đăng bài", "caption", "hashtag", "social media" | **Marketing Agent** | `/WF-Facebook-Post` |
| "landing page", "marketing site", "conversion" | **Marketing + Design** | `/ui-ux-pro-max` |
| "content calendar", "chiến lược nội dung", "brand voice" | **Marketing Agent** | `/Workflow-Ideation` |
| "slide", "pitching", "pitch deck", "reveal.js" | **Marketing Agent** | `/design_presentation` |

### 🔬 Nghiên cứu & Phân tích

| Từ khóa nhận diện | Agent | Workflow gợi ý |
|---|---|---|
| "nghiên cứu", "research", "tìm hiểu", "phân tích chuyên sâu" | **Research Agent** | `/WF-Research` |
| "so sánh", "benchmark", "đánh giá", "lựa chọn công nghệ" | **Research Agent** | `/WF-Research` |
| "tìm hiểu thị trường", "market research", "competitor" | **Research + Marketing** | `/WF-Research` |

### 🎓 Giảng dạy & TankBAClass

| Từ khóa nhận diện | Agent | Workflow gợi ý |
|---|---|---|
| "chuẩn bị buổi dạy", "warm-up", "buổi học", "teaching" | **BA Instructor** | `/WF-Teaching` |
| "chấm bài", "grade", "review bài", "feedback học viên" | **Assignment Grader** | `/WF-Grading` |
| "chuẩn bị slide", "slide deck", "talking points" | **BA Instructor** | `/WF-SlidePrep` |
| "build khoá học", "curriculum", "thiết kế khoá" | **Course Builder** | `/WF-CourseBuilder` |
| "giải thích concept", "trả lời học viên", "Q&A" | **BA Instructor** | `/WF-Teaching` |

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
| 1 | Context đã load ở BƯỚC -1 (KHÔNG đọc lại) |
| 2 | Liệt kê agents cần gọi và thứ tự |
| 3 | Tạo plan ngắn gọn |
| ⏸️ | **Hỏi user**: "Approve plan? (Y/N)" — **KHÔNG làm tiếp nếu chưa có OK** |

### PHASE 2: IMPLEMENTATION

Với mỗi agent được chọn:
1. Đọc agent SKILL.md **lần đầu khi cần** (lazy load, không đọc trước)
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

> ⛔ **BẮT BUỘC** — Ghi vào brain sau mỗi session có nội dung đáng nhớ.

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
  context_log:  <Tóm tắt cuộc thảo luận — yêu cầu, kết quả, file thay đổi. KHÔNG paste toàn bộ conversation.>
)
```

> ⚡ `context_log` chỉ ghi TÓM TẮT (5-10 dòng), KHÔNG ghi nguyên conversation.
> Thông tin chi tiết đã lưu trong file context trên máy.

### 5b. brain_log_session — Lưu conversation history
```
brain_log_session(
  title:        <Tóm tắt 1 dòng>,
  project:      <tên project>,
  memory_hash:  <hash từ brain_store ở bước 5a>,
  turns: [
    { role: "user", content: "<yêu cầu chính — 1 dòng>" },
    { role: "assistant", content: "<kết quả chính — 1-2 dòng>" }
  ]
)
```

### Khi nào BỎ QUA brain_store

- Session chỉ có 1 turn hỏi-đáp đơn giản (ví dụ: "port mấy?", "file nào?")
- Session chỉ đọc thông tin, không tạo quyết định hay thay đổi gì

> 💡 Lý do: Ghi mọi thứ vào brain = noise. Chỉ ghi khi có **giá trị recall** cho session sau.

---

## 🎭 Orchestration Complete

```
### Context Mode: [🟢 FAST | 🟡 STANDARD | 🔴 FULL]

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
→ 🔴 FULL (multi-domain)
→ BA Agent → SA Agent → BE Agent → FE Agent → QC Agent

/orchestrate brainstorm tên cho sản phẩm mới
→ 🟢 FAST (no project context needed)
→ Brainstorm Agent + Workflow-Ideation

/orchestrate fix lỗi trang dashboard bị trắng
→ 🟢 FAST (brain có context)
→ QC Agent + WF-Bug-Fixing

/orchestrate viết blog về AI cho TankBAClass
→ 🟢 FAST (brain có context AG-Course)
→ Content Writer + WF-Content-Writing
```
