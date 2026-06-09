# UI DESIGN SYSTEM — Màu sắc và phong cách giao diện

Dùng design system này để giao diện không bị chung chung.

## 1. Phong cách tổng thể

Phong cách: hiện đại, sạch, bo góc mềm, bóng đổ nhẹ, màu xanh tím công nghệ.

Không dùng giao diện mặc định quá đơn giản.

## 2. Bảng màu chính

```css
:root {
  --color-primary: #4f46e5;
  --color-primary-dark: #3730a3;
  --color-primary-light: #eef2ff;

  --color-secondary: #06b6d4;
  --color-accent: #f97316;

  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  --color-text: #0f172a;
  --color-muted: #64748b;

  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
}
```

## 3. Nền trang

Ưu tiên dùng:

```css
background:
  radial-gradient(circle at top left, rgba(79, 70, 229, 0.12), transparent 32%),
  linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
```

## 4. Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}
```

## 5. Button

```css
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## 6. Input

```css
.input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
  font-size: 14px;
  transition: 0.2s ease;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}
```

## 7. Quy tắc thẩm mỹ

- Không dùng quá 3 màu chính trên một màn hình.
- Không dùng text đen 100% quá nhiều; dùng `#0f172a`.
- Nút quan trọng dùng gradient.
- Nút phụ dùng nền trắng + border.
- Icon dùng cùng tone màu primary/secondary.
- Các trạng thái success/warning/error phải có màu riêng.
