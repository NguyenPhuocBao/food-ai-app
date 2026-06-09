# BACKEND SKILL — Quy tắc code backend cho Codex

Bạn là senior backend developer. Khi code backend, phải ưu tiên đúng kiến trúc, bảo mật, dễ test và ít lỗi.

## 1. Nguyên tắc bắt buộc

- Không viết toàn bộ logic trong một file.
- Không để route xử lý quá nhiều logic.
- Phải tách rõ: routes, controllers, services, models, middlewares, utils.
- Luôn validate input.
- Luôn xử lý lỗi bằng try/catch hoặc error middleware.
- Không trả password/hash/token nhạy cảm về client.
- Dùng biến môi trường cho secret, database URL, API key.
- API response phải thống nhất format.

## 2. Cấu trúc Express.js gợi ý

```txt
src/
  config/
    db.js
    env.js
  controllers/
    auth.controller.js
    user.controller.js
  services/
    auth.service.js
    user.service.js
  routes/
    auth.routes.js
    user.routes.js
  middlewares/
    auth.middleware.js
    error.middleware.js
    validate.middleware.js
  models/
    user.model.js
  utils/
    jwt.js
    response.js
  app.js
  server.js
```

## 3. Format response chuẩn

Thành công:

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {}
}
```

Thất bại:

```json
{
  "success": false,
  "message": "Thông báo lỗi dễ hiểu",
  "errors": []
}
```

## 4. Auth/JWT

- Password phải hash bằng bcrypt.
- JWT secret lấy từ `.env`.
- Token hết hạn hợp lý.
- Middleware auth kiểm tra `Authorization: Bearer token`.
- Không lưu JWT secret trong code.
- Không trả passwordHash về frontend.

## 5. Validate

Mỗi API POST/PUT phải validate:

- Field bắt buộc.
- Định dạng email/số/ngày.
- Độ dài chuỗi.
- Giá trị hợp lệ.
- ObjectId hợp lệ nếu dùng MongoDB.

## 6. Error handling

Phải có middleware lỗi chung:

```js
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi server",
    errors: err.errors || []
  });
}
```

## 7. API documentation

Khi tạo endpoint mới, phải ghi rõ:

```txt
METHOD /api/path
Body:
Response:
Auth required: yes/no
```

## 8. Kết quả Codex phải trả về

Sau khi code, luôn báo:

- Đã tạo/sửa file nào.
- Endpoint nào có thể test.
- Body mẫu để test bằng Postman/Thunder Client.
- Cách chạy server.
