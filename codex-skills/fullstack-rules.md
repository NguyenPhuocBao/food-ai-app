# FULLSTACK RULES — Quy tắc kết nối frontend và backend

## 1. Không làm lệch API

Frontend phải gọi đúng endpoint backend đã có.

Nếu backend chưa có endpoint, phải tạo endpoint trước hoặc ghi rõ cần tạo.

## 2. Luồng chuẩn khi làm chức năng

Ví dụ chức năng Login:

1. Backend:
   - POST `/api/auth/login`
   - Validate email/password.
   - Check user.
   - Compare password.
   - Trả JWT + user info an toàn.

2. Frontend:
   - Form email/password.
   - Validate input.
   - Gọi API qua service.
   - Lưu token hợp lý.
   - Điều hướng sau login.
   - Hiển thị lỗi nếu sai tài khoản.

## 3. API service frontend

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Có lỗi xảy ra");
  }

  return data;
}
```

## 4. Checklist trước khi kết thúc

- Frontend không bị trắng/sơ sài.
- Có loading/error/empty state.
- Backend có validate/error handler.
- API path khớp giữa FE và BE.
- Có hướng dẫn chạy.
- Không lộ secret/token/password.
- Code chạy được, không thiếu import.
