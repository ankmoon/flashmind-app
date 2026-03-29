# Antigravity AI Kit — Agents

> **Purpose**: Specialized agents for task delegation & domain expertise
> **Count**: 27 Agents (17 custom + 10 utility)

---

## Overview

Agents are specialized personas that handle delegated tasks with focused expertise. Each agent has:

- **Defined responsibilities** — What it handles
- **Quy trình làm việc** — Step-by-step process
- **Constraints** — What it cannot do

**Trigger mechanism**: Orchestrator (`/orchestrate`) auto-routes via keyword matching → reads agent `.md` → executes.

---

## Agent Roster

### 🏗️ Development Agents

| Agent | File | Purpose |
|---|---|---|
| 📋 **BA Agent** | `ba-agent.md` | Phân tích nghiệp vụ, PRD, bẻ task |
| 🏛️ **SA Agent** | `sa-agent.md` | Kiến trúc, DB Schema, API Contract |
| 🎨 **Design Agent** | `design-agent.md` | UI/UX Mockup, Design Spec |
| 💻 **FE Agent** | `fe-agent.md` | Frontend development |
| ⚙️ **BE Agent** | `be-agent.md` | Backend development |
| 🚀 **DevOps Agent** | `devops-agent.md` | CI/CD, deployment, Docker |
| 🧪 **QC Agent** | `qc-agent.md` | Testing, QA, bug analysis |

### 📣 Marketing & Content Agents

| Agent | File | Purpose |
|---|---|---|
| 📢 **Marketing Agent** | `marketing-agent.md` | Content strategy, social media, copywriting |
| ✍️ **Content Writer** | `content-writer-agent.md` | Blog, Facebook content |
| 🔬 **Research Agent** | `research-agent.md` | Research & deep analysis |

### 🎮 Game Agents

| Agent | File | Purpose |
|---|---|---|
| 🎲 **Game Designer** | `game-designer-agent.md` | GDD, mechanics, balancing |
| 🎨 **Game Artist** | `game-artist-agent.md` | Visual assets, art direction |
| 🖥️ **Game UI/UX** | `game-ui-ux-agent.md` | HUD, menus, game interface |
| 🤖 **Godot Developer** | `godot-developer-agent.md` | Godot 4 / GDScript |

### 🎓 Teaching Agents (TankBAClass)

| Agent | File | Purpose |
|---|---|---|
| 👨‍🏫 **BA Instructor** | `ba-instructor-agent.md` | Giảng dạy, warm-up, Q&A |
| 📝 **Assignment Grader** | `assignment-grader-agent.md` | Chấm bài, feedback |
| 📚 **Course Builder** | `course-builder-agent.md` | Xây dựng khóa học |

### 🔧 Utility Agents (from Antigravity Kit)

| Agent | File | Purpose |
|---|---|---|
| 🔐 **Security Reviewer** | `security-reviewer.md` | Vulnerability analysis |
| 🧪 **TDD Guide** | `tdd-guide.md` | Test-driven development |
| 🎭 **E2E Runner** | `e2e-runner.md` | End-to-end testing |
| ⚡ **Performance Optimizer** | `performance-optimizer.md` | Core Web Vitals |
| 📱 **Mobile Developer** | `mobile-developer.md` | React Native/Expo |
| 🔧 **Build Error Resolver** | `build-error-resolver.md` | Rapid build fixes |
| 🧹 **Refactor Cleaner** | `refactor-cleaner.md` | Dead code cleanup |
| 📚 **Doc Updater** | `doc-updater.md` | Documentation sync |
| 🧠 **Knowledge Agent** | `knowledge-agent.md` | RAG retrieval |
| 🔭 **Explorer Agent** | `explorer-agent.md` | Codebase discovery |

---

## How to Use

Agents are invoked automatically by `/orchestrate` based on keyword matching. You can also request them explicitly:

```
/orchestrate tôi cần viết blog về kỹ năng BA
→ Route: Content Writer Agent + WF-Content-Writing

/orchestrate fix lỗi API trả về 500
→ Route: QC Agent + WF-Bug-Fixing
```

---

## Adding New Agents

1. Create a new `.md` file in this directory
2. Include: Identity, Capabilities, Workflow, Constraints
3. Add routing keywords to `orchestrate.md`
