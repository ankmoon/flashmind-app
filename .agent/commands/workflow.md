---
name: workflow
description: Chuyển đổi yêu cầu nghiệp vụ (BA) thành website hoàn chỉnh (UI/UX + Code)
invokes: planner
---

# /workflow

> **Purpose**: Quy trình từ A-Z để build một website từ yêu cầu BA, tích hợp đầy đủ Rules & Skills.

---

## Usage

```
/workflow [mô tả yêu cầu website]
```

## Examples

```
/workflow Xây dựng landing page cho khóa học AI Engineering
/workflow Tạo website giới thiệu công ty dịch vụ vệ sinh công nghiệp
/workflow Build dashboard quản lý kho hàng (WMS)
```

---

## Behavior

1. **Invoke Planner Agent** để phân tích yêu cầu BA.
2. **Follow Workflow** tại `.agent/workflows/workflow.md`.
3. **Phase 1: Discovery** - Làm rõ yêu cầu (Socratic Gate).
4. **Phase 2: Architecture** - Thiết lập system context.
5. **Phase 3: Design** - Tạo UI/UX concept (Premium).
6. **Phase 4: Implementation** - Thực thi code sạch.
7. **Phase 5: Verification** - Kiểm thử và bàn giao.

---

## Output

Một website hoàn chỉnh với đầy đủ documentation, design system và source code chất lượng cao.
