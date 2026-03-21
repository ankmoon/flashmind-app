
# Rule — Full-Coverage Testing (Multi-Tab / Multi-Dataset Consistency)

## Mục tiêu
Ngăn chặn lỗi "đầu voi đuôi chuột" — khi agent update một phần của dữ liệu/UI mà quên update các phần tương ứng.

---

## ❌ Anti-Pattern phổ biến

Thay thế data cho Tab 1 nhưng không update Tab 2, Tab 3 → user thấy data không nhất quán và build/test được coi là FAIL.

---

## ✅ Quy tắc BẮT BUỘC khi cập nhật "grouped data" (data nhiều phần cùng nhau)

### 1. Nhận diện "grouped data"

Trước khi sửa bất kỳ constant / dataset / config nào, agent phải hỏi:
> "Đây là 1 bộ data, hay là data đại diện cho nhiều tab / nhiều view?"

**Ví dụ không nên sửa lẻ:**
- `DEMO_DATA` + `DEMO_ERD_DATA` + `DEMO_FLOW_DATA` → phải update cả 3
- CSS theme tokens → phải check cả dark mode và light mode
- i18n strings (vi / en) → phải update cả 2 ngôn ngữ
- `app.js` + `app.html` → phải check HTML vẫn match sau khi sửa JS

### 2. Checklist trước khi tuyên bố "Done"

Sau khi sửa xong, agent phải tự hỏi từng câu:
```
□ Đã grep theo keyword cũ để kiểm tra còn sót chỗ nào không?
□ Mỗi tab / view đang dùng data mới hay vẫn còn data cũ?
□ Tên project / persona / entity có nhất quán xuyên suốt không?
□ Đã kiểm tra trong browser TẤT CẢ các tab (không chỉ tab đầu)?
□ File nào CÙNG nhóm với file đang sửa? Tất cả đã được update chưa?
```

### 3. Browser Verification Protocol (BẮT BUỘC với UI tasks)

Sau khi code xong, agent **phải** dùng browser subagent để:
1. Click **từng tab** trong UI và chụp screenshot
2. Xác nhận **mỗi tab** đều hiển thị đúng data mới — không phải chỉ tab mặc định
3. Báo cáo: "Tab X: ✅ data mới | Tab Y: ✅ data mới | Tab Z: ✅ data mới"

Nếu không có đủ browser access → phải ghi rõ trong response: "⚠️ Chưa verify tab X, tab Y — cần user confirm"

### 4. Grep Consistency Check

Sau khi update xong bất kỳ demo data / config nào, chạy:
```
grep -r "TenCũ" --include="*.js" --include="*.html" project/
```
Nếu còn tên cũ (ví dụ: "FreshCart", "Tuan", "farmers") xuất hiện trong code → chưa done.

---

## Severity

Lỗi "partial update" (update 1 bỏ 2) = Severity HIGH
- Làm user mất tin tưởng vào chất lượng agent work
- Phải tự review bằng browser trước khi report DONE

---

## Rút kinh nghiệm (2026-03-20)

**Lỗi xảy ra:** Đã update `DEMO_DATA` (Feature Map tab) sang Mini Mart POS nhưng giữ nguyên `DEMO_ERD_DATA` và `DEMO_FLOW_DATA` là FreshCart cũ.

**Root cause:** Thiếu bước grep để tìm tất cả data liên quan + thiếu bước browser check từng tab.

**Fix:** Luôn grep theo tên project cũ sau khi update để xác nhận không còn orphaned data nào.
