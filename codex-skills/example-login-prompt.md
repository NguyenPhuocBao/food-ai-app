# Prompt mẫu: tạo Login đẹp + JWT

```txt
Hãy tạo chức năng Login fullstack.

Tuân thủ:
- codex-skills/frontend-skill.md
- codex-skills/backend-skill.md
- codex-skills/ui-design-system.md
- codex-skills/fullstack-rules.md

Yêu cầu backend:
- Tạo API POST /api/auth/login.
- Validate email/password.
- So sánh password bằng bcrypt.
- Trả JWT và user info, không trả password.
- Response theo format success/message/data.
- Có middleware xử lý lỗi.

Yêu cầu frontend:
- Tạo trang Login đẹp, hiện đại, responsive.
- Có background gradient, card bo góc, button gradient.
- Có loading khi đăng nhập.
- Có thông báo lỗi khi sai tài khoản.
- Gọi API qua file service, không gọi fetch trực tiếp trong component.
- Lưu token vào localStorage.
- Sau login chuyển đến dashboard.

Sau khi code xong:
- Liệt kê file đã sửa/tạo.
- Ghi body mẫu để test API.
- Ghi cách chạy frontend/backend.
```
