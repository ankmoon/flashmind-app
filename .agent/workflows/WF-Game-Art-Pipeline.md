---
description: Quy trình tạo visual assets, art direction, color system và animation cho game/gamification.
---

# Workflow — Game Art Pipeline

Sử dụng khi cần thiết kế visual style, tạo art assets, hoặc xây dựng hệ thống visual cho game / gamified app.

### Bước 1: Art Direction
- Xác định tonality: Retro / Premium / Casual / Dark / Custom
- Chọn art style phù hợp budget và platform
- Define color palette (max 5-7 colors + tints/shades)
*Checkpoint: Xin user confirm art direction trước khi tạo assets.*

### Bước 2: Style Guide
- Tạo `docs/style-guide.md` bao gồm:
  - Color palette + CSS variables
  - Typography: font families, sizes, weights
  - Icon system: grid, stroke width, corner radius
  - Spacing: 8/16/24/32px system
  - Animation tokens: durations, easing functions

### Bước 3: Asset Creation
- Icons & avatars: dùng `generate_image` tool hoặc emoji
- UI screens: dùng Stitch MCP (`mcp_StitchMCP_generate_screen_from_text`)
- Backgrounds & illustrations: dùng `generate_image`
- Follow naming convention: `[type]_[object]_[variant]_[state].[ext]`

### Bước 4: Animation & Effects
- Define animation tokens (hover, state change, entrance, celebration)
- CSS transitions cho UI elements
- Particles / visual effects cho game events (level up, quest done)
- Respect `prefers-reduced-motion`

### Bước 5: QA & Bàn giao
- Accessibility check: contrast ratios, touch targets, color-blind safe
- Export assets vào `src/assets/` hoặc `public/`
- Update `system_context.md` và style guide
- Tạo task cho FE agent implement
