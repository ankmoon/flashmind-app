# Outline: Cấu trúc Multi-Agent Office System

## 1. Tổng quan kiến trúc

Hệ thống được xây dựng theo mô hình **"Văn phòng ảo"** — AI đóng nhiều vai trò chuyên môn khác nhau, phối hợp qua một **Dashboard trung tâm** và file dữ liệu chung.

```
Sếp (Người dùng)
    │
    ▼
┌─────────────────────────────┐
│   Dashboard (localhost:3001) │  ← Giao diện điều phối
│   Kanban: BACKLOG→TODO→     │
│   IN_PROGRESS→REVIEW→DONE   │
└──────────────┬──────────────┘
               │ tasks.json / projects.json
               ▼
┌─────────────────────────────┐
│     Dispatcher / AI Agent   │  ← Một AI đọc task & thực thi
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       │   .agents/      │
       │  rules/         │  ← Luật nền tảng
       │  skills/        │  ← Kỹ năng chuyên sâu
       │  workflows/     │  ← Quy trình hành động
       └────────────────┘
```

---

## 2. Các thành phần cốt lõi

### 2.1 Dashboard (Bộ phận điều phối)
- **File**: `E:\My office\office-app\server\dashboard.html`
- **Server**: `index.js` (Port 3001)
- **Chức năng**:
  - Kanban Board: Theo dõi trạng thái task theo pipeline.
  - Backlog View: Quản lý task chưa được kích hoạt.
  - Project Selector: Gắn task vào dự án cụ thể.
  - Review Buttons: Sếp Approve/Reject trực tiếp trên card.
  - Output Links: Xem file kết quả ngay trên Dashboard.
  - Real-time SSE: Tự động reload khi `tasks.json` thay đổi.
  - Static Serving `/projects`: Hiển thị asset dự án qua HTTP.

### 2.2 Dữ liệu (Bộ nhớ chung)
| File | Vai trò |
|---|---|
| `tasks.json` | Trạng thái và thông tin của tất cả task |
| `projects.json` | Danh sách dự án |

**Cấu trúc một Task:**
```json
{
  "id": "TASK-CMS-SA",
  "project": "CMS",
  "assigned_to": "SA",
  "status": "REVIEW",
  "type": "design",
  "title": "[ARCH] Database Schema & API Contract",
  "dependency": ["TASK-CMS-BA"],
  "output_links": "E:\\Projects\\CMS\\docs\\architecture\\"
}
```

**Pipeline trạng thái:**
```
BACKLOG → TODO → IN_PROGRESS → REVIEW → DONE
                                  ↓
                              (Rework) → IN_PROGRESS
```

### 2.3 Cấu trúc dự án chuẩn (Project Structure)
```
E:\My projects\{project-name}\
├── docs\
│   ├── prd.md              ← BA viết
│   └── architecture\
│       ├── db-schema.sql   ← SA viết
│       └── api-contract.md ← SA viết
├── design\
│   └── mockup.png          ← Design Agent tạo
├── src\
│   ├── backend\            ← BE Code
│   └── frontend\           ← FE Code
└── tests\
    ├── qa-report.md        ← QC viết
    └── security-audit.md   ← Security Audit
```

---

## 3. Hệ thống Agent & Vai trò

```
Yêu cầu của Sếp
      │
      ▼
[BA Agent] ──────── Phân tích nghiệp vụ, viết PRD, bẻ task
      │
      ▼
[SA Agent] ──────── Thiết kế DB Schema + API Contract ← GATE (Sếp duyệt)
      │
      ├────────────────────┐
      ▼                    ▼
[Design Agent]         [BE Dev]
Vẽ UI Mockup           Code API thực tế
      │                    │
      └────────┬───────────┘
               ▼
          [FE Dev] ──────── Code giao diện + kết nối API
               │
               ▼
          [QC Agent] ────── Test End-to-End, viết báo cáo
               │
               ▼
      [Security Audit] ──── Quét lỗ hổng, vá bảo mật
               │
               ▼
     [DevOps/Integration] ─ Deploy, mount vào Server
```

---

## 4. Bộ Luật & Kỹ năng (Rules & Skills)

### 4.1 Rules (Luật không phá vỡ)
| Rule | Nội dung cốt lõi |
|---|---|
| `Rule-1` | Phải phân tích đa tầng (Nghiệp vụ → Dữ liệu → API) trước khi code |
| `Rule-Code-Standard` | Cấm Mock/Hardcode, phải tích hợp thực tế |
| `Rule-Contract-First` | BE & FE không được code nếu chưa có API Contract |
| `Rule-Absolute-Path` | Luôn dùng đường dẫn tuyệt đối khi lưu file |

### 4.2 Skills (Kỹ năng chuyên sâu)
| Skill | Năng lực chính |
|---|---|
| `Senior-Skill` | Full-stack: BA → SA → Dev → QC trong 1 agent |
| `ba-agent` | CRUD Matrix, User Story, bẻ task nguyên tử |
| `sa-agent` | DB 3NF, API Spec (Swagger), System Flow |
| `design-agent` | UI Mockup, Design Spec, Premium Aesthetics |
| `qc-agent` | Test Case, End-to-end Audit |

### 4.3 Workflows (Quy trình điều phối)
| Workflow | Khi nào dùng |
|---|---|
| `WF-Solid-Feature` | Làm mới tính năng từ đầu đến cuối |
| `WF-Bug-Fixing` | Sửa lỗi có RCA (Root Cause Analysis) |
| `WF-UX-Design-Review` | Thẩm định & nâng cấp UI/UX |
| `WF-DevOps-Deployment` | Tích hợp module vào hệ thống chung |
| `WF-Project-Auditing` | Kiểm tra toàn diện chất lượng dự án |
| `WF-Security-Audit` | Quét & vá lỗ hổng bảo mật (SQLi, XSS, Auth) |

---

## 5. Bài học kinh nghiệm (Lessons Learned)

### ❌ Những gì không hiệu quả:
- **Chia Agent quá nhỏ**: Nhiều Agent ngồi "báo cáo" lẫn nhau tạo ra overhead, không tạo ra giá trị thực.
- **Dispatcher chờ duyệt từng bước**: Mỗi bước nhỏ cũng cần Sếp bấm → luồng liên tục bị gián đoạn.
- **Mock Data + Hình thức**: Code Agent viết ra "cho có", dùng Mock data thay vì tích hợp thực tế → sản phẩm rỗng ruột.
- **Không có SA làm "xương sống"**: FE và BE tự đoán format dữ liệu → kết quả rời rạc, mâu thuẫn.

### ✅ Những gì hiệu quả:
- **1 Conversation — 1 AI đa năng**: Dùng bộ Rule/Skill để định hướng, tập trung vào output thực tế.
- **SA là cửa then chốt**: DB Schema và API Contract phải được duyệt trước khi Dev bắt đầu.
- **Sếp chỉ duyệt "Gate"**: Thay vì duyệt từng task nhỏ, Sếp chỉ cần duyệt tại các điểm then chốt (sau SA, sau QC).
- **Workflow làm "lệnh điều phối"**: Thay vì ra lệnh kỹ thuật, Sếp chỉ cần gọi tên Workflow là AI tự giác thực hiện đúng quy trình.

---

## 6. Mô hình vận hành tối ưu (Recommended Setup)

```
Sếp:  "Làm module X theo WF-Solid-Feature"
  ↓
AI:   [Tự đọc Rule-1] → Phân tích nghiệp vụ sâu → Viết PRD
  ↓
AI:   [Tự đọc Senior-Skill] → Thiết kế DB + API
  ↓
      ← Sếp duyệt kiến trúc (1 lần duy nhất) →
  ↓
AI:   Code BE → Code FE → Tích hợp → Security Check → QC
  ↓
Sếp:  Nhận link demo cuối cùng. DONE.
```

> **Thao tác của Sếp chỉ là**: Nêu yêu cầu → Duyệt kiến trúc → Nhận kết quả.
