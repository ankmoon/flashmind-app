---
description: Quy trình thiết kế game mechanics, GDD, balancing và progression system.
---

# Workflow — Game Design

Sử dụng khi cần thiết kế hoặc cải thiện game mechanics, progression, balancing cho game hoặc gamified app.

### Bước 1: Phân tích Core Loop
- Xác định Core Loop hiện tại (hoặc thiết kế mới)
- Test bằng "30-second test": Action → Feedback → Reward → Repeat
- Xác định target player type (Achiever / Explorer / Socializer / Killer)
*Checkpoint: Xin user confirm Core Loop trước khi đi tiếp.*

### Bước 2: Draft GDD
- Viết/update `docs/gdd.md` với: Pitch, Core Loop, Mechanics, Progression, Economy
- Nếu gamification → dùng Gamification Checklist từ skill `game-designer-agent`
- Define XP formula: `xp_needed(level) = base_xp * level^exponent`

### Bước 3: Balancing & Reward Schedule
- Tạo balance table: level → XP needed → rewards → unlocks
- Mix reward types: Fixed (milestones) + Variable (random) + Streak
- Thiết kế Difficulty Curve: easy start → gradual increase → rest beats → peaks

### Bước 4: Review & Iterate
- Tự review theo Player Psychology matrix (4 types)
- Kiểm tra anti-patterns (punishment loops, grind vô nghĩa, inflation)
- Xin user feedback

### Bước 5: Bàn giao
- Update `system_context.md` với decisions
- Tạo task cho FE/BE implement mechanics
- Update `tasks.json`
