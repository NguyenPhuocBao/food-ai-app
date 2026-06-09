# FRONTEND SKILL — Quy tắc code giao diện cho Codex

Bạn là senior frontend developer. Khi code frontend, phải ưu tiên giao diện đẹp, rõ ràng, có cấu trúc, dễ bảo trì và không được code chung chung.

## 1. Nguyên tắc bắt buộc

- Không tạo giao diện sơ sài, toàn màu trắng mặc định.
- Không viết CSS inline tràn lan.
- Không hard-code dữ liệu nếu có thể tách thành constants/mock data.
- Không để component quá dài; nếu dài, tách thành component nhỏ.
- Luôn xử lý loading, empty state, error state.
- Luôn responsive cho mobile, tablet, desktop.
- Dùng tên class/component rõ nghĩa.
- Ưu tiên UI có khoảng cách, bo góc, bóng đổ nhẹ, màu sắc đồng bộ.

## 2. Cấu trúc component

Mỗi màn hình nên có:

- Header hoặc PageTitle.
- Vùng nội dung chính.
- Card/Section rõ ràng.
- Button có trạng thái hover, disabled.
- Form có label, placeholder, validate message.
- Toast hoặc alert khi thao tác thành công/thất bại.

Ví dụ cấu trúc:

```txt
src/
  components/
    ui/
      Button.jsx
      Input.jsx
      Card.jsx
      Modal.jsx
  pages/
    LoginPage.jsx
    DashboardPage.jsx
  services/
    api.js
  constants/
    colors.js
```

## 3. Quy tắc giao diện đẹp

- Dùng nền tổng thể nhẹ: gradient hoặc màu xám xanh rất nhạt.
- Nội dung chính đặt trong card trắng, bo góc 16px–24px.
- Dùng spacing nhất quán: 8 / 12 / 16 / 24 / 32px.
- Font size:
  - Title: 28–36px
  - Heading: 20–24px
  - Body: 14–16px
  - Caption: 12–13px
- Button chính phải nổi bật, có hover.
- Mỗi trang phải có điểm nhấn màu chính.

## 4. Form

Form bắt buộc có:

- Label rõ ràng.
- Placeholder dễ hiểu.
- Validate dữ liệu trước khi submit.
- Hiển thị lỗi dưới input.
- Disable button khi đang loading.
- Không lưu token/password lung tung.

## 5. API frontend

- Tách API call vào `services/api.js`.
- Không gọi fetch/axios rải rác trong UI component.
- Dùng try/catch đầy đủ.
- Khi lỗi, hiển thị thông báo dễ hiểu cho người dùng.
- Nếu có token JWT, tự động gắn `Authorization: Bearer <token>`.

## 6. Kết quả Codex phải trả về

Khi code xong, luôn giải thích ngắn:

- Đã tạo/sửa file nào.
- Chức năng hoạt động ra sao.
- Cách chạy/test.
- Lưu ý nếu cần cấu hình thêm.
