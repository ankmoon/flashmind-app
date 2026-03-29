---
name: Premium Presentation Builder
description: HTML/CSS Boilerplates and Component snippets for Reveal.js Professional Presentations.
---

# 📚 SKILL: Premium Presentation Builder

Kỹ năng này cung cấp các "khối xếp hình" (Building Blocks) chuyên nghiệp. Khi tạo Presentation bằng HTML/Reveal.js, hãy tận dụng các đoạn code sau:

## 1. Boilerplate / Base Setup (HTML Head & Scripts)
Sử dụng chuẩn Reveal.js 4.3.1. Luôn nhúng Font hiện đại.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>[Ten Du An] - Proposal</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reset.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
    <!-- Font Google -->
    <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap" rel="stylesheet">
    <style>
       /* CSS Tùy biến viết ở đây */
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
           <!-- Slides vào đây -->
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
    <script>
        Reveal.initialize({
            hash: true, transition: 'slide', width: 1300, height: 900
        });
    </script>
</body>
</html>
```

## 2. Component Snippet: Bento Box 
(Dùng để liệt kê tính năng/dịch vụ trực quan thay cho Bullet points)

```html
<style>
.bento-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}
.bento-card {
    background: #151515; border: 1px solid rgba(255,255,255,0.1); 
    padding: 30px; border-radius: 20px; text-align: left;
}
.bento-card.wide { grid-column: span 2; }
.bento-card h3 { color: #d9ff00; font-size: 1.5em; }
</style>

<div class="bento-grid">
    <div class="bento-card"><h3>Marketplace</h3><p>Tính năng giao dịch.</p></div>
    <div class="bento-card"><h3>Transactions</h3><p>Đấu giá trực tuyến.</p></div>
    <div class="bento-card wide"><h3>Compliance</h3><p>Pháp lý và bảo mật chuẩn NĐ13.</p></div>
</div>
```

## 3. Component Snippet: Pipeline / Flow Diagram
(Dùng cho luồng hệ thống hoặc quá trình)

```html
<style>
.pipeline { display: flex; justify-content: space-between; position: relative; }
.pipeline::before {
    content: ''; position: absolute; height: 3px; background: #333; left: 0; right: 0; top: 50%; z-index: 1;
}
.pipe-node {
    width: 60px; height: 60px; background: #222; border: 3px solid #d9ff00;
    border-radius: 50%; z-index: 2; display: flex; align-items: center; justify-content: center;
}
</style>

<div class="pipeline">
    <div><div class="pipe-node">1</div><p>Start</p></div>
    <div><div class="pipe-node">2</div><p>Process</p></div>
    <div><div class="pipe-node">3</div><p>End</p></div>
</div>
```

## 4. CSS Theme: Luxury Dark Base
(Chuẩn mực sang trọng, chữ lớn, phối màu tương phản)

```css
:root {
    --bg: #0a0a0a;
    --accent: #d9ff00; /* Có thể đổi thành Gold #ffd700 */
    --text: #ffffff;
}
.reveal h1 { font-size: 3.8em; font-weight: bold; }
.reveal h2 { font-size: 2.2em; border-bottom: 3px solid var(--accent); padding-bottom: 10px; }
.glow-text { color: var(--accent); text-shadow: 0 0 20px rgba(217, 255, 0, 0.5); }
.card {
    background: rgba(255,255,255,0.03); 
    border-radius: 20px; padding: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.5);
}
```
