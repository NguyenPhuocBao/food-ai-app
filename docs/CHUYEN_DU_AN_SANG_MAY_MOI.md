# Huong Dan Chuyen Du An Sang May Moi (Food AI App)

Tai lieu nay dung cho Windows + PowerShell, phu hop repo hien tai.

## 1) Can chuan bi gi truoc khi chuyen may

- Quyen truy cap repo GitHub (SSH key hoac PAT).
- File env:
  - `backend/.env` (quan trong nhat)
  - `backend/.env.example` (mau tham chieu)
- Backup du lieu:
  - Database PostgreSQL
  - Thu muc anh upload: `backend/uploads`
- API keys (OpenAI/XAI/Gemini/SMTP) con hieu luc.

## 2) May moi can cai nhung gi

- `Git`
- `Node.js` (khuyen nghi Node 20 LTS)
- `Docker Desktop` (de chay Postgres + AI service nhanh nhat)
- (Tuy chon) `PostgreSQL client tools` neu ban muon dump/restore bang local thay vi docker.

## 3) Buoc tren may cu (backup + day code len GitHub)

## 3.1 Day code len repo

```powershell
cd d:\food-ai-app
git add .
git commit -m "backup before moving machine"
git push
```

## 3.2 Backup database (neu Postgres chay trong Docker)

```powershell
cd d:\food-ai-app
New-Item -ItemType Directory -Force backups | Out-Null
docker exec -t food_app_postgres pg_dump -U admin -d food_app_db > backups\food_app_db.sql
```

## 3.3 Backup uploads

```powershell
cd d:\food-ai-app
Compress-Archive -Path backend\uploads\* -DestinationPath backups\uploads.zip -Force
```

## 3.4 Backup env (khong commit len GitHub)

```powershell
Copy-Item backend\.env backups\backend.env.backup -Force
```

Sao chep thu muc `backups` sang may moi (USB/Drive).

## 4) Buoc tren may moi

## 4.1 Clone repo

```powershell
cd d:\
git clone <URL_REPO_GITHUB> food-ai-app
cd d:\food-ai-app
```

## 4.2 Cai dependencies

```powershell
cd d:\food-ai-app\backend
npm install

cd d:\food-ai-app\frontend
npm install
```

## 4.3 Tao file env

```powershell
cd d:\food-ai-app\backend
Copy-Item .env.example .env
```

Sau do mo `backend/.env` va dien:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- API keys (`OPENAI_API_KEY`/`XAI_API_KEY`/`GEMINI_API_KEY`) neu can demo chatbot
- `SMTP_*` neu can demo forgot password/reminder

## 4.4 Khoi dong services phu tro bang Docker

```powershell
cd d:\food-ai-app
docker compose up -d postgres pgadmin food_ai_api
```

Neu chi can DB:

```powershell
docker compose up -d postgres
```

## 4.5 Restore database (neu co file backup)

Copy file `backups\food_app_db.sql` vao may moi, roi chay:

```powershell
cd d:\food-ai-app
Get-Content backups\food_app_db.sql | docker exec -i food_app_postgres psql -U admin -d food_app_db
```

Neu khong co backup thi chay migrate + seed:

```powershell
cd d:\food-ai-app\backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 4.6 Restore uploads (neu co)

```powershell
cd d:\food-ai-app
Expand-Archive -Path backups\uploads.zip -DestinationPath backend -Force
```

## 4.7 Chay backend + frontend

Terminal 1:

```powershell
cd d:\food-ai-app\backend
npm run dev
```

Terminal 2:

```powershell
cd d:\food-ai-app\frontend
npm run dev
```

## 5) Kiem tra sau khi setup

- API health:
  - `http://localhost:5000/health`
  - `http://localhost:5000/health/live`
  - `http://localhost:5000/health/ready`
- Frontend:
  - `http://localhost:5173`
- Dang nhap user/admin thanh cong.
- Scan AI hoat dong (neu da chay `food_ai_api`).

## 6) Checklist nhanh (copy dung ngay)

- [ ] Clone repo thanh cong.
- [ ] `backend/.env` da cau hinh dung.
- [ ] Docker services da chay (`postgres`, tuy chon `food_ai_api`).
- [ ] DB da restore hoac migrate + seed.
- [ ] `backend/uploads` da co du lieu (neu can).
- [ ] Backend chay `npm run dev`.
- [ ] Frontend chay `npm run dev`.
- [ ] Health check OK.

## 7) Loi thuong gap

- `JWT_SECRET` thieu/sai -> loi auth.
- `DATABASE_URL` sai host/port/password -> backend khong connect DB.
- Chua chay `docker compose up -d postgres` -> API health `DEGRADED`.
- Chua restore `uploads` -> anh cu khong hien.
- API key chatbot rong -> chat fallback/bao loi provider.

