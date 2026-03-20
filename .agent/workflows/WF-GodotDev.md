---
description: Quy trình phát triển game Godot 4 — từ setup project đến implement feature, debug và export
---

# /WF-GodotDev — Godot 4 Development Workflow

// turbo-all

## Chuẩn bị

1. Đọc skill: `D:\My office\.agent\skills\godot-developer-agent\SKILL.md`
2. Đọc GDD tại `{project}/docs/gdd.md` (nếu có)
3. Đọc `D:\My office\skills\skills\godot-gdscript-patterns\SKILL.md` (community patterns)

---

## MODE 1 — Setup Game Project Mới

Khi bắt đầu game mới từ đầu:

4. Tạo project structure chuẩn:
```
{game-name}/
├── scenes/main/ scenes/characters/ scenes/ui/ scenes/levels/
├── scripts/autoload/ scripts/characters/ scripts/systems/ scripts/utils/
├── assets/sprites/ assets/audio/ assets/fonts/ assets/shaders/
├── resources/items/ resources/enemies/ resources/save/
└── docs/gdd.md
```

5. Setup Autoloads bắt buộc trong Project Settings:
   - `GameManager.gd` — game state, pause, current level
   - `AudioManager.gd` — music + SFX management
   - `EventBus.gd` — global signals hub
   - `SaveManager.gd` — save/load data

6. Setup Input Map (Project → Project Settings → Input Map):
   - `move_left` / `move_right` / `move_up` / `move_down`
   - `jump` / `attack` / `interact` / `pause`
   - `ui_accept` / `ui_cancel`

7. Tạo `docs/gdd.md` nếu chưa có, sync với Game Designer

---

## MODE 2 — Implement Feature/Mechanic

Khi implement mechanic mới từ GDD:

8. Đọc GDD spec của mechanic cần làm
9. Thiết kế scene architecture:
   ```
   [Mechanic Name]
   ├── Node type?
   ├── Signals cần emit?
   ├── Dependencies (autoload nào)?
   └── Resource data cần?
   ```

10. Implement theo thứ tự:
    - [ ] Core logic (movement / physics / game rules)
    - [ ] Input handling
    - [ ] Signal connections
    - [ ] UI update
    - [ ] Audio & visual feedback

11. Self-test checklist:
    - [ ] Chạy scene isolated không lỗi?
    - [ ] Signals emit đúng?
    - [ ] Edge cases (null checks, out of bounds)?
    - [ ] Memory leak (orphan nodes)?

---

## MODE 3 — Debug

Khi gặp lỗi:

12. Xác định loại lỗi:
    - **Script error** → Check GDScript error line, null pointer
    - **Physics issue** → Check collision layers/masks
    - **Signal issue** → Check connection trong Remote tab khi running
    - **Performance** → Open Profiler tab, check ms per frame

13. Dùng Godot Debug tools:
    ```
    # In-script debug
    print("State: ", current_state)
    push_warning("Value unexpected: ", value)
    
    # Breakpoints: Click số dòng trong editor
    # Remote tab: Inspect live node properties
    # Profiler: Đo thời gian từng function
    ```

14. Apply fix → Test lại → Document gotcha nếu cần

---

## MODE 4 — Export & Build

Khi cần export game:

15. Check export templates đã cài chưa (Editor → Manage Export Templates)

16. Setup export presets:
    - **Windows Desktop**: `.exe` 
    - **Web (HTML5)**: `.html + .wasm` — cần CORS headers cho hosting
    - **Android**: Cần Android SDK + keystore
    - **macOS**: Cần Xcode (chỉ trên Mac)

17. Export checklist:
    - [ ] Icon đã set (Project Settings → Application → Config)
    - [ ] Launch screen thêm nếu cần
    - [ ] Debug mode tắt
    - [ ] Audio bus master volume = 1.0
    - [ ] Save path đúng platform (`user://` thay vì `res://`)

18. Test build trước khi distribute

---

## Workflow Tích Hợp

| Cần | Bàn giao sang |
|---|---|
| Thiết kế mechanic mới | **Game Designer** → `/WF-Game-Design` |
| Cần assets (sprite, audio) | **Game Artist** → `/WF-Game-Art-Pipeline` |
| Bug phức tạp | **QC Agent** → `/WF-Bug-Fixing` |
| Deploy web build | **DevOps Agent** → `/WF-DevOps-Deployment` |

---

## Slash Commands

```
/godot new [tên game]          → Mode 1: Setup project mới
/godot feature [tên mechanic]  → Mode 2: Implement feature
/godot debug [mô tả lỗi]      → Mode 3: Debug
/godot export [platform]       → Mode 4: Export game
```
