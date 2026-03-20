# 📦 Hướng dẫn Sync Agent Kit lên Global

> Chạy file này mỗi khi bạn update bất kỳ thứ gì trong `E:\My office\.agent\`
> để toàn bộ thay đổi có hiệu lực ở **mọi workspace/dự án**.

---

## 🗺️ Kiến trúc

```
E:\My office\.agent\        ← Nơi bạn EDIT, thêm skills/rules/workflows
        │
        │ (sync)
        ▼
C:\Users\ankmo\.gemini\antigravity\.agent\   ← Global, áp dụng cho MỌI workspace
C:\Users\ankmo\.gemini\antigravity\global_workflows\  ← Autocomplete shortcuts
```

---

## ▶️ Lệnh Sync (yêu cầu Agent chạy lệnh này)

```powershell
$src        = "E:\My office\.agent"
$globalAgent = "C:\Users\ankmo\.gemini\antigravity\.agent"
$globalWF    = "C:\Users\ankmo\.gemini\antigravity\global_workflows"

# Tạo thư mục nếu chưa có
New-Item -ItemType Directory -Force -Path @(
  "$globalAgent\agents",
  "$globalAgent\skills",
  "$globalAgent\rules",
  "$globalAgent\workflows",
  "$globalAgent\commands",
  "$globalAgent\checklists"
) | Out-Null

# Sync tất cả
Copy-Item "$src\agents\*"     "$globalAgent\agents\"     -Recurse -Force
Copy-Item "$src\skills\*"     "$globalAgent\skills\"     -Recurse -Force
Copy-Item "$src\rules\*"      "$globalAgent\rules\"      -Recurse -Force
Copy-Item "$src\workflows\*"  "$globalAgent\workflows\"  -Recurse -Force
Copy-Item "$src\commands\*"   "$globalAgent\commands\"   -Recurse -Force
Copy-Item "$src\checklists\*" "$globalAgent\checklists\" -Recurse -Force

# Sync global_workflows (dùng cho autocomplete shortcuts)
Copy-Item "$src\workflows\orchestrate.md"  "$globalWF\orchestrate.md"  -Force
Copy-Item "$src\workflows\brainstorm.md"   "$globalWF\brainstorm.md"   -Force
Copy-Item "$src\workflows\create.md"       "$globalWF\create.md"       -Force
Copy-Item "$src\workflows\debug.md"        "$globalWF\debug.md"        -Force
Copy-Item "$src\workflows\plan.md"         "$globalWF\plan.md"         -Force
Copy-Item "$src\workflows\deploy.md"       "$globalWF\deploy.md"       -Force
Copy-Item "$src\workflows\test.md"         "$globalWF\test.md"         -Force

Write-Host "✅ Sync hoàn tất!"
Write-Host "Skills:" (Get-ChildItem "$globalAgent\skills" -Directory).Count
Write-Host "Agents:" (Get-ChildItem "$globalAgent\agents" -File).Count
Write-Host "Rules :" (Get-ChildItem "$globalAgent\rules"  -File).Count
```

---

## 📋 Khi nào cần Sync?

| Tình huống | Cần Sync? |
|---|---|
| Thêm skill mới vào `skills/` | ✅ Có |
| Sửa nội dung rule | ✅ Có |
| Thêm workflow mới | ✅ Có |
| Sửa trong `session-context.md` | ❌ Không |
| Sửa trong `system_context.md` | ❌ Không |

---

## 💡 Cách yêu cầu Agent sync

Nói với Agent (trong bất kỳ conversation nào):

> **"Đọc `E:\My office\.agent\SYNC-GUIDE.md` và chạy lệnh sync cho tôi"**

---

## 🎁 Cài đặt cho bạn bè (từ file agent-kit.zip)

Bạn bè nhận được `agent-kit.zip`, nhờ Agent chạy prompt sau:

```
Tôi có file agent-kit.zip tại [đường dẫn đến file zip].
Hãy đọc file SYNC-GUIDE.md bên trong zip và:
1. Giải nén vào thư mục workspace của tôi
2. Sync lên global theo hướng dẫn trong SYNC-GUIDE.md
3. Đổi các path E:\My office\ thành đường dẫn workspace của tôi
```

---

## 📝 History

| Ngày | Thay đổi |
|---|---|
| 2026-03-12 | Khởi tạo — Merge Old Kit + Antigravity Kit hoàn tất, đưa lên global |
