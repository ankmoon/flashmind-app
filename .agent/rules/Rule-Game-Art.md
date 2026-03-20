
## Rule — Game Art & Visual Consistency

Áp dụng khi cần tạo hoặc maintain visual assets cho game/gamification.

### 1. Art Style — Define Once, Follow Always
- Mỗi dự án CHỈ cần 1 art style duy nhất
- Phải define trong `docs/style-guide.md` TRƯỚC KHI tạo asset
- Mọi asset mới phải tuân thủ style guide
- Thay đổi style = phải update TẤT CẢ asset cũ

### 2. Color Palette — Max 7 Colors
- Tối đa 5-7 màu chính (primary, secondary, accent, stat colors)
- Mỗi category/stat → 1 color DUY NHẤT, nhất quán xuyên suốt
- Dùng CSS variables: `--hp-color`, `--mp-color`, v.v.
- Tuyệt đối không hardcode color values ngoài file tokens

### 3. Asset Naming Convention
```
[type]_[object]_[variant]_[state].[ext]
```
- `icon_health_full.svg`
- `bg_dashboard_dark.png`
- `avatar_mage_idle.png`
- `badge_streak_7day.svg`

### 4. Icon Grid System
- Base grid: 24×24px
- Sizes: 16 / 24 / 32 / 48 / 64px
- Stroke width: 2px nhất quán
- Corner radius: match UI system (8px hoặc theo token)
- 1 style: chọn Outlined HOẶC Filled, không mix

### 5. Animation Tokens
| Context | Duration | Easing |
|---------|----------|--------|
| Hover | 150-200ms | ease |
| State change | 250-300ms | ease-in-out |
| Entrance | 400-600ms | ease-out |
| Celebration | 800-1200ms | cubic-bezier(spring) |

Bắt buộc:
- `@media (prefers-reduced-motion: reduce)` → tắt animation
- Không animation trên element >50% viewport (gây motion sickness)

### 6. Accessibility Bắt Buộc
- Contrast ratio: ≥4.5:1 (text), ≥3:1 (large text/icons)
- Không dùng COLOR ALONE để truyền thông tin → thêm icon/text
- Touch target mobile: ≥44×44px
- Kiểm tra color-blind mode: test bằng Chrome DevTools

