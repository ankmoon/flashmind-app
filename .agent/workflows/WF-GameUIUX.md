---
description: Quy trình thiết kế Game UI/UX — HUD, menu, inventory, shop, onboarding và player feedback
---

# /WF-GameUIUX — Game UI/UX Design Workflow

// turbo-all

## Chuẩn bị

1. Đọc skill: `D:\My office\.agent\skills\game-ui-ux-agent\SKILL.md`
2. Đọc GDD tại `{project}/docs/gdd.md` để hiểu game type và mechanics
3. Nắm platform target: PC / Mobile / Console (ảnh hưởng touch targets và layout)

---

## MODE 1 — Design HUD

Khi cần thiết kế HUD cho game:

4. Hỏi:
   - Game genre? (RPG / Platformer / Strategy / Shooter?)
   - Thông tin gì cần hiển thị real-time? (HP, MP, ammo, cooldown, score, timer...)
   - Platform chính? (PC → keyboard shortcuts OK / Mobile → large touch targets)

5. Tạo HUD Layout Spec:
```markdown
## HUD Spec — [Game Name]

### Zone Allocation
- Top-Left: [Minimap / HP bar]
- Top-Center: [Objective / Score]
- Top-Right: [Timer / Currency]
- Bot-Left: [Skills / Abilities]
- Bot-Center: [Hotbar / Actions]
- Bot-Right: [XP / Minibar]

### Critical Elements (luôn hiện)
- [element]: [vị trí, kích thước, màu sắc]

### Contextual Elements (hiện khi cần)
- [element]: [điều kiện xuất hiện]

### Godot Implementation
- Node tree: CanvasLayer → [các Control nodes]
- Update signal: [signal nào trigger update]
```

---

## MODE 2 — Design Menu System

Khi cần thiết kế menu:

6. Xác định menu loại gì: Main Menu / Pause / Settings / Game Over / Victory

7. Tạo Menu Spec:
```markdown
## [Menu Name] Spec

### Layout
[Wireframe text-based]

### Navigation Flow
[Menu A] → [click X] → [Menu B]
[Menu B] → [Esc/Back] → [Menu A]

### States
- Default
- Hover (highlight)
- Disabled (nếu có điều kiện)

### Transition
- Enter: [fade/slide/zoom] — duration [X]ms
- Exit: [fade/slide/zoom] — duration [X]ms

### Godot Nodes
- Root: Control / PanelContainer
- Background: ColorRect / TextureRect
- Buttons: Button với custom StyleBox
```

---

## MODE 3 — Design Inventory / Item UI

Khi cần thiết kế inventory:

8. Hỏi:
   - Item types? (weapons / armor / consumable / quest item?)
   - Max inventory size?
   - Drag & drop cần không?
   - Compare stats khi hover cần không?

9. Tạo Item UI Spec với: item card layout, grid dimensions, tooltip design, sort/filter system.

---

## MODE 4 — Design Feedback System

Khi cần thiết kế player feedback:

10. Map tất cả player actions → feedback tương ứng:

| Action | Visual | Audio | Haptic |
|---|---|---|---|
| Damage dealt | Damage number float | Hit SFX | Light |
| Damage received | Screen flash red | Impact SFX | Strong |
| Level up | Burst animation | Fanfare | — |
| Item pickup | Icon float up | Pickup SFX | — |
| ... | ... | ... | ... |

11. Tạo Feedback Spec cho Godot: node type, animation duration, position logic.

---

## MODE 5 — Design Onboarding/Tutorial UI

12. Map player journey:
```
Session 1: Chỉ dạy Core Loop (di chuyển + action chính)
Session 2: Dạy Secondary mechanics
Session 3+: Dạy advanced systems
```

13. Thiết kế từng tutorial element: control hint, contextual prompt, tooltip content.

---

## Handoff to Godot Developer

Sau khi design xong, tạo **Godot Implementation Spec**:

```markdown
## Godot UI Implementation Spec — [Component]

### Node Structure
CanvasLayer (UI)
└── [ComponentName] (PanelContainer)
    ├── ...

### Required Signals
- [signal_name]: emit khi [condition]

### Update Logic
- Cập nhật khi: [event/signal nào]
- Animation: Tween với duration [X]s

### Theme
- Font: [font name, size]
- Colors: [primary, accent]
- StyleBox: [flat/texture, border radius]
```

→ Bàn giao sang **Godot Developer** để implement: `/WF-GodotDev`

---

## Slash Commands

```
/gameui hud [genre]       → Mode 1: Design HUD
/gameui menu [type]       → Mode 2: Design menu
/gameui inventory         → Mode 3: Design inventory
/gameui feedback          → Mode 4: Design feedback system
/gameui tutorial          → Mode 5: Design onboarding
/gameui spec [component]  → Tạo Godot implementation spec
```
