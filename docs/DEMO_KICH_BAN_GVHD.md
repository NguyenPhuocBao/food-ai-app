# BAI THUYET TRINH + DEMO DU AN FOOD AI (GVHD)

Tai lieu nay de ban trinh bay theo tung buoc, vua noi vua thao tac tren may tinh.

## 1) Muc tieu buoi bao cao (15-20 phut)

- Gioi thieu bai toan va pham vi du an.
- Trinh bay cong nghe, ngon ngu, co so du lieu da dung.
- Demo cac chuc nang chinh theo luong User -> Admin.
- Neu ro han che hien tai va huong nang cap cho tung nhom chuc nang.

---

## 2) Tong quan du an (phan noi 1-2 phut)

### 2.1 Loi mo dau goi y

- "Du an Food AI huong den viec ho tro nguoi dung theo doi bua an hang ngay, phan tich dinh duong va nhan goi y ca nhan hoa."
- "He thong co 2 doi tuong su dung chinh: User va Admin."
- "Gia tri cot loi la ket hop quan ly dinh duong voi AI scan mon an va chatbot tu van."

### 2.2 Bai toan du an giai quyet

- User thuong kho theo doi calories/macros de dat muc tieu suc khoe.
- Viec nhap lieu thu cong mat thoi gian.
- Can mot kenh tu van nhanh (chatbot) va goi y mon an phu hop muc tieu.

---

## 3) Cong nghe, ngon ngu, DB (phan noi 2-3 phut)

### 3.1 Kien truc tong the

- Frontend: ung dung web.
- Backend: REST API xu ly nghiep vu.
- AI service: nhan dien anh mon an + LLM chatbot.
- Database: luu user, meal, food, review, chat, audit...

### 3.2 Ngan xep cong nghe dang dung

- Frontend:
  - `React` + `TypeScript`
  - `Vite`
  - `TailwindCSS`
- Backend:
  - `Node.js` + `TypeScript`
  - `Express`
  - `Prisma ORM`
- AI:
  - Service classifier (Python) cho scan anh mon an
  - LLM providers cho chatbot (`OpenAI` / `Grok` / `Gemini`)
- Database:
  - `PostgreSQL` (DB chinh cua du an)

### 3.3 Cac bang/du lieu nghiep vu chinh trong DB

- `users`, `user_profiles`, `user_goals`
- `food_items`, `recipes`
- `meals`, `meal_plans`, `daily_nutrition`, `weekly_reports`
- `scan_history`, `reviews`, `favorites`
- `chat_sessions`, `chat_messages`
- `audit_logs`, `system_settings`

---

## 4) Chuan bi truoc khi demo (T-1 ngay)

### 4.1 Kiem tra moi truong

- `PostgreSQL` dang chay.
- File `backend/.env` co:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - it nhat 1 khoa chatbot: `OPENAI_API_KEY` hoac `XAI_API_KEY` hoac `GEMINI_API_KEY` (neu demo chatbot that)
  - `AI_API_URL` (neu demo scan AI that)

### 4.2 Chuan bi tai khoan va du lieu

- 1 tai khoan User demo.
- 1 tai khoan Admin demo.
- Co san data foods/recipes de tim kiem.
- Co 3-5 anh mon an de scan.

### 4.3 Lenh khoi dong he thong

Terminal 1 (Backend):

```powershell
cd d:\food-ai-app\backend
npm run dev
```

Terminal 2 (Frontend):

```powershell
cd d:\food-ai-app\frontend
npm run dev
```

Mo trinh duyet:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`

---

## 4.4) Gioi thieu tung man hinh (User -> Admin)

Phan nay dung de mo ta nhanh "man hinh nao dung de lam gi" truoc khi vao demo thao tac.

### A. Cac man hinh User

1. `Login (/login)`: Dang nhap tai khoan User/Admin, chuyen huong theo role.
2. `Register (/register)`: Tao tai khoan moi cho nguoi dung.
3. `Forgot Password (/forgot-password)`: Gui yeu cau dat lai mat khau qua email.
4. `Reset Password (/reset-password)`: Dat mat khau moi bang token da gui.
5. `Onboarding (/onboarding)`: Khai bao thong tin ca nhan, muc tieu, chi so co ban de ca nhan hoa.
6. `Home (/)`: Tong quan nhanh, goi y nhanh, cac loi tat den tinh nang chinh.
7. `Foods (/foods)`: Tim kiem/loc danh sach mon an, xem calories/macros.
8. `Food Detail (/foods/:id)`: Xem chi tiet mon, cong thuc, thanh phan; them yeu thich, danh gia, phan hoi.
9. `Recipes (/recipes)`: Xem danh sach cong thuc va truy cap nhanh den mon an lien quan.
10. `Scan AI (/scan)`: Tai anh mon an, AI goi y ket qua, xac nhan mon va luu vao meal.
11. `Diary (/diary)`: Nhat ky bua an theo ngay; them/sua/xoa meal; theo doi tong calorie/macros.
12. `Statistics (/statistics)`: Bieu do thong ke dinh duong theo ngay/tuan va xu huong.
13. `Meal Plans (/meal-plans)`: Tao/chinh sua/active ke hoach bua an va ap dung theo ngay.
14. `Recommendations (/recommendations)`: Nhan de xuat mon an theo profile + lich su + muc tieu.
15. `Library (/library)`: Quan ly muc da luu, yeu thich, muc noi dung ca nhan.
16. `Weekly Reports (/weekly-reports)`: Bao cao tong ket tuan, danh gia muc do dat muc tieu.
17. `Chat AI (/chat-ai)`: Hoi dap dinh duong, huong dan su dung he thong, luu lich su chat session.
18. `Profile (/profile)`: Cap nhat thong tin ca nhan, chi so suc khoe va cau hinh user.

### B. Cac man hinh Admin

1. `Admin Dashboard (/admin)`: Tong quan KPI he thong, so lieu user/food/meal/scan/support.
2. `Admin Users (/admin/users)`: Tim kiem user, xem trang thai, doi role, khoa/mo khoa.
3. `Admin User Detail (/admin/users/:id)`: Xem chi tiet user, profile, lich su meal/chat/lien quan.
4. `Admin User Meal Plans (/admin/users/:userId/meal-plans)`: Quan ly meal plan cua 1 user.
5. `Admin Meal Detail (/admin/meals/:id)`: Xem chi tiet mot ban ghi bua an.
6. `Admin Foods (/admin/foods)`: Quan ly danh sach mon an, tim kiem, xoa/sua nhanh.
7. `Admin Food Detail (/admin/foods/:id)`: Xem/sua chi tiet mon, upload anh, dieu huong sang sua cong thuc.
8. `Admin Recipes (/admin/recipes)`: Quan ly thu vien cong thuc toan he thong.
9. `Admin Recipe Detail (/admin/recipes/:foodId)`: Xem noi dung cong thuc cua mon.
10. `Admin Recipe Edit (/admin/recipes/:foodId/edit)`: Tao moi/chinh sua cong thuc, ingredients, steps, tools.
11. `Admin Reviews (/admin/reviews)`: Duyet/loc/xoa review, theo doi chat luong phan hoi user.
12. `Admin Chat AI (/admin/chat-ai)`: Theo doi lich su chat, ho tro van hanh kenh hoi dap.
13. `Admin Chatbot Ops (/admin/chatbot-ops)`: Cau hinh/van hanh chatbot, tac vu nghiep vu AI.
14. `Admin Notifications (/admin/notifications)`: Gui thong bao den user, gui nhieu nguoi, broadcast.
15. `Admin Configs (/admin/configs)`: Quan ly cac cau hinh he thong muc ung dung.
16. `Admin Settings (/admin/settings)`: Dieu chinh system settings, thao tac du lieu/cau hinh nang cao.
17. `Admin Audit Logs (/admin/logs)`: Theo doi nhat ky hanh dong, truy vet su kien, kiem tra an toan.

Goi y cach noi trong 30-45 giay:
- "Phia User tap trung trai nghiem dinh duong: nhap lieu nhanh, scan AI, thong ke va goi y."
- "Phia Admin tap trung van hanh: quan ly du lieu, quan ly nguoi dung, kiem soat log va cau hinh he thong."

---

## 4.5) Phan tich chi tiet tung man hinh (kich ban 10-12 phut)

Muc tieu: di theo dung thu tu User -> Admin, moi man hinh deu tra loi 3 cau hoi:
- Man hinh nay dung de lam gi?
- User/Admin thao tac gi o day?
- Du lieu/ket qua sau thao tac la gi?

### A. Luong User (khoang 6-7 phut)

1. `Login (/login)` - 20-25 giay  
- Vai tro: diem vao he thong, xac thuc danh tinh.  
- Demo: nhap email/password, bam dang nhap.  
- Ket qua: neu role USER vao trang user, neu role ADMIN vao trang admin.

2. `Register (/register)` - 15-20 giay  
- Vai tro: tao tai khoan moi.  
- Demo: nhap ten, email, mat khau, submit.  
- Ket qua: tao user moi, chuyen tiep sang onboarding.

3. `Forgot Password (/forgot-password)` - 15-20 giay  
- Vai tro: khoi phuc truy cap tai khoan.  
- Demo: nhap email, gui yeu cau reset.  
- Ket qua: backend tao token reset + gui email.

4. `Reset Password (/reset-password)` - 15-20 giay  
- Vai tro: dat lai mat khau bang token.  
- Demo: nhap mat khau moi, xac nhan.  
- Ket qua: cap nhat mat khau, quay lai dang nhap.

5. `Onboarding (/onboarding)` - 20-25 giay  
- Vai tro: thu thap profile ban dau (muc tieu, chi so co the, thoi quen).  
- Demo: dien thong tin, luu ho so.  
- Ket qua: he thong co du lieu de goi y ca nhan hoa.

6. `Home (/)` - 25-30 giay  
- Vai tro: dashboard nhanh cho user.  
- Demo: trinh bay cac widget tong quan, cac loi tat den Foods/Scan/Diary/Chat.  
- Ket qua: user co diem bat dau ro rang cho moi luong chinh.

7. `Foods (/foods)` - 25-30 giay  
- Vai tro: thu vien mon an de tim kiem/loc.  
- Demo: nhap tu khoa, loc category, xem card mon an.  
- Ket qua: tim nhanh mon can quan tam truoc khi them vao bua an.

8. `Food Detail (/foods/:id)` - 30-35 giay  
- Vai tro: xem sau thong tin 1 mon an.  
- Demo: xem calories/macros, recipe, bam favorite, them review.  
- Ket qua: tao tuong tac user-content, tang chat luong de xuat.

9. `Recipes (/recipes)` - 20-25 giay  
- Vai tro: tra cuu cong thuc nau.  
- Demo: chon 1 cong thuc, chuyen sang mon an lien quan.  
- Ket qua: ket noi nhu cau "an gi" va "nau the nao".

10. `Scan AI (/scan)` - 35-40 giay  
- Vai tro: giam nhap lieu thu cong bang AI nhan dien anh.  
- Demo: upload anh -> nhan goi y -> xac nhan mon -> luu meal.  
- Ket qua: meal duoc ghi vao diary nhanh hon cach nhap tay.

11. `Diary (/diary)` - 30-35 giay  
- Vai tro: nhat ky bua an theo ngay.  
- Demo: them/sua/xoa 1 bua, doi so luong khau phan.  
- Ket qua: tong calories/macros cap nhat theo ngay.

12. `Statistics (/statistics)` - 25-30 giay  
- Vai tro: theo doi xu huong dinh duong.  
- Demo: xem bieu do ngay/tuan, so sanh muc tieu va thuc te.  
- Ket qua: user thay duoc tien do va do lech hanh vi an uong.

13. `Meal Plans (/meal-plans)` - 30-35 giay  
- Vai tro: lap ke hoach bua an co cau truc.  
- Demo: tao plan, add mon theo bua/ngay, active plan.  
- Ket qua: user co lich an ro rang thay vi quyet dinh tung bua.

14. `Recommendations (/recommendations)` - 25-30 giay  
- Vai tro: de xuat mon dua tren profile + lich su.  
- Demo: mo danh sach de xuat, giai thich vi sao duoc de xuat.  
- Ket qua: ca nhan hoa trai nghiem dinh duong.

15. `Library (/library)` - 20-25 giay  
- Vai tro: quan ly noi dung da luu cua user.  
- Demo: mo muc favorites/lich su lien quan.  
- Ket qua: tai su dung nhanh nhung mon user da quan tam.

16. `Weekly Reports (/weekly-reports)` - 20-25 giay  
- Vai tro: tong ket theo tuan.  
- Demo: xem tong quan ket qua tuan, muc dat/chua dat muc tieu.  
- Ket qua: ho tro danh gia dai han thay vi chi tung ngay.

17. `Chat AI (/chat-ai)` - 30-35 giay  
- Vai tro: tro ly hoi dap nhanh.  
- Demo: dat 1 cau hoi dinh duong, xem cau tra loi va lich su session.  
- Ket qua: user nhan huong dan tuc thoi trong app.

18. `Profile (/profile)` - 20-25 giay  
- Vai tro: cap nhat ho so ca nhan va thong so suc khoe.  
- Demo: sua thong tin, luu thay doi.  
- Ket qua: du lieu dau vao cho recommendation/statistics duoc chinh xac hon.

### B. Luong Admin (khoang 4-5 phut)

1. `Admin Dashboard (/admin)` - 25-30 giay  
- Vai tro: bang dieu khien van hanh tong quat.  
- Demo: KPI users, foods, scans, support, tang truong.  
- Ket qua: admin nam tinh trang he thong trong 1 man hinh.

2. `Admin Users (/admin/users)` - 25-30 giay  
- Vai tro: quan ly vong doi tai khoan.  
- Demo: tim user, doi role, khoa/mo khoa, reset.  
- Ket qua: dam bao dung quyen, dung doi tuong su dung.

3. `Admin User Detail (/admin/users/:id)` - 20-25 giay  
- Vai tro: xem 360 do theo tung user.  
- Demo: profile + lich su hoat dong lien quan.  
- Ket qua: de ho tro user va truy vet van de.

4. `Admin User Meal Plans (/admin/users/:userId/meal-plans)` - 15-20 giay  
- Vai tro: admin can thiep meal plan cua user khi can.  
- Demo: mo danh sach plan cua 1 user.  
- Ket qua: ho tro nghiep vu CSKH/cham soc dinh duong.

5. `Admin Meal Detail (/admin/meals/:id)` - 15-20 giay  
- Vai tro: xem chi tiet 1 ban ghi bua an.  
- Demo: mo record, kiem tra data dinh duong + thoi gian.  
- Ket qua: doi soat va phan tich du lieu.

6. `Admin Foods (/admin/foods)` - 25-30 giay  
- Vai tro: quan ly danh muc mon an he thong.  
- Demo: tim mon, mo chi tiet, xoa/sua nhanh.  
- Ket qua: du lieu mon an duoc duy tri dong bo.

7. `Admin Food Detail (/admin/foods/:id)` - 25-30 giay  
- Vai tro: cap nhat sau cho tung mon.  
- Demo: sua thong tin nutrition, upload anh, dieu huong sua cong thuc.  
- Ket qua: tang chat luong noi dung cho user-side.

8. `Admin Recipes (/admin/recipes)` - 20-25 giay  
- Vai tro: quan ly thu vien cong thuc.  
- Demo: loc/tim cong thuc, mo trang chi tiet.  
- Ket qua: dam bao du lieu recipe day du va nhat quan.

9. `Admin Recipe Detail (/admin/recipes/:foodId)` - 15-20 giay  
- Vai tro: kiem tra noi dung recipe dang gan cho mon.  
- Demo: xem ingredients/steps/tools.  
- Ket qua: de review chat luong cong thuc nhanh.

10. `Admin Recipe Edit (/admin/recipes/:foodId/edit)` - 25-30 giay  
- Vai tro: tao moi/chinh sua cong thuc.  
- Demo: cap nhat title, thanh phan, buoc nau, cong cu.  
- Ket qua: recipe duoc cap nhat tuc thi cho user.

11. `Admin Reviews (/admin/reviews)` - 20-25 giay  
- Vai tro: kiem duyet feedback cong dong.  
- Demo: loc theo rating, xoa review vi pham/noise.  
- Ket qua: giu chat luong noi dung va trai nghiem.

12. `Admin Chat AI (/admin/chat-ai)` - 15-20 giay  
- Vai tro: theo doi kenh hoi dap AI.  
- Demo: xem session, noi dung trao doi.  
- Ket qua: phat hien truong hop can support thu cong.

13. `Admin Chatbot Ops (/admin/chatbot-ops)` - 20-25 giay  
- Vai tro: khu van hanh chatbot.  
- Demo: cau hinh/tac vu lien quan den chatbot service.  
- Ket qua: de quan tri chat luong tra loi AI.

14. `Admin Notifications (/admin/notifications)` - 20-25 giay  
- Vai tro: truyen thong den user theo nhom/ca nhan/toan he thong.  
- Demo: tao thong bao, chon doi tuong, gui broadcast.  
- Ket qua: co kenh thong tin tap trung.

15. `Admin Configs (/admin/configs)` - 15-20 giay  
- Vai tro: quan ly cau hinh nghiep vu muc ung dung.  
- Demo: xem/chinh gia tri config.  
- Ket qua: thay doi hanh vi he thong khong can sua code.

16. `Admin Settings (/admin/settings)` - 20-25 giay  
- Vai tro: cai dat he thong nang cao.  
- Demo: sua settings, thao tac du lieu quan tri.  
- Ket qua: linh hoat van hanh trong moi truong that.

17. `Admin Audit Logs (/admin/logs)` - 20-25 giay  
- Vai tro: truy vet hanh dong va an toan he thong.  
- Demo: loc log theo action/entity/user/time.  
- Ket qua: ho tro kiem tra su co va bao mat.

### C. Cach chia thoi gian de dam bao >=10 phut

- Mo dau + muc tieu: 1 phut.  
- Luong User (18 man): 6-7 phut.  
- Luong Admin (17 man): 4-5 phut.  
- Chot gia tri + Q&A: 1 phut.  

Tong: 12-14 phut (co the rut gon con 10-11 phut bang cach gop cac man auth va recipe).

### D. Mau cau noi chuyen man (de trinh bay muot)

- "Sau khi xac thuc, user vao onboarding de he thong hieu profile ban dau."
- "Tu Home, em di vao thu vien mon an de tim mon phu hop, sau do mo chi tiet de xem nutrition."
- "Khi can nhap nhanh, user dung scan AI va luu meal vao diary."
- "Tu diary, du lieu duoc tong hop sang statistics va weekly report."
- "Sau luong user, em chuyen sang admin de minh hoa cach van hanh va kiem soat he thong."

---

## 5) Kich ban thuyet trinh + thao tac theo tung buoc

## Buoc 1 - Gioi thieu man hinh tong quan (1 phut)

### Noi

- "Day la giao dien chinh cua he thong Food AI."
- "Em se demo luong su dung thuc te cua User truoc, sau do qua luong Admin."

### Thao tac

- Mo trang Home/Login.
- Mo 1 tab `health` de cho thay backend dang hoat dong.

## Buoc 2 - Auth (Dang ky/Dang nhap/Quen mat khau) (2 phut)

### Noi

- "He thong ho tro day du vong doi tai khoan: dang ky, dang nhap, quen mat khau, doi mat khau."

### Thao tac

- Dang nhap user demo.
- Mo nhanh man hinh quen mat khau (chi can trinh bay luong, khong bat buoc thuc thi email neu khong can).

### Han che & nang cap

- Han che:
  - Chua co MFA/2FA.
  - Chua co social login.
- Nang cap:
  - Them OTP email/app-authenticator.
  - Them Google login.

## Buoc 3 - Thu vien mon an + chi tiet + yeu thich + review (3 phut)

### Noi

- "Nguoi dung co the tim mon an, xem thong tin macros, luu yeu thich va danh gia."

### Thao tac

- Vao Foods/Library.
- Tim theo tu khoa (pho/com/salad).
- Mo chi tiet 1 mon.
- Bam yeu thich.
- Them 1 review ngan.

### Han che & nang cap

- Han che:
  - Chat luong metadata mon an chua dong deu.
  - Chua co de xuat thong minh dua tren review sentiment.
- Nang cap:
  - Chuan hoa data nutrition theo nguon tham chieu.
  - Them ranking thong minh theo hanh vi + review.

## Buoc 4 - Scan mon an bang AI + luu meal log (3 phut)

### Noi

- "Tinh nang scan giup giam nhap lieu thu cong: tai anh, AI nhan dien, user xac nhan, sau do luu meal."

### Thao tac

- Vao trang Scan.
- Tai 1 anh mon an.
- Chon ket qua de xac nhan.
- Luu vao meal log.

### Han che & nang cap

- Han che:
  - Do chinh xac phu thuoc chat luong anh va model.
  - Chua uoc luong khau phan tu dong that chinh xac.
- Nang cap:
  - Fine-tune model theo tap mon Viet Nam.
  - Them estimation portion size bang vision model.

## Buoc 5 - Meal log + thong ke dinh duong (3 phut)

### Noi

- "Day la gia tri theo doi suc khoe hang ngay: ghi meal, tong hop calories/macros, xem xu huong."

### Thao tac

- Vao Diary/Meal log:
  - Them/Sua/Xoa nhanh 1 bua an.
- Vao Statistics:
  - Xem tong calories/macros theo ngay/tuan.

### Han che & nang cap

- Han che:
  - Chua co dashboard canh bao bat thuong nang cao.
  - Chua co du doan som nguy co vuot muc tieu.
- Nang cap:
  - Them anomaly detection.
  - Them canh bao thong minh theo profile va lich su.

## Buoc 6 - Meal plan + goi y (2 phut)

### Noi

- "Meal plan chuyen muc tieu dinh duong thanh ke hoach an uong cu the."

### Thao tac

- Tao meal plan (hoac auto-generate).
- Activate plan.
- Apply cho hom nay.

### Han che & nang cap

- Han che:
  - Chua toi uu da dang so thich/chi phi/nguyen lieu dia phuong.
- Nang cap:
  - Bo sung ranh buoc gia tien, thoi gian nau, nguyen lieu co san.
  - Hoc tu phan hoi user de toi uu de xuat.

## Buoc 7 - Chatbot AI (2 phut)

### Noi

- "Chatbot la tro ly hoi dap nhanh ve dinh duong va cach dung he thong."

### Thao tac

- Vao trang Chat.
- Gui 1 cau hoi mau ve dinh duong.
- Cho thay lich su chat session.

### Han che & nang cap

- Han che:
  - Chatbot co the tra loi chung chung o cau hoi qua dac thu.
  - Chua co danh gia chat luong tra loi tu dong theo KPI.
- Nang cap:
  - RAG voi knowledge base chuan.
  - Tracking KPI: helpful rate, fallback rate, hallucination checks.

## Buoc 8 - Luong Admin (3 phut)

### Noi

- "Admin giup van hanh he thong: quan ly user, noi dung, va theo doi audit."

### Thao tac

- Dang nhap Admin.
- Admin Users: xem users, doi role/ban-reset (neu UI dang mo).
- Admin Foods: tao/sua/xoa 1 mon.
- Mo nhanh Audit Logs hoac Settings.

### Han che & nang cap

- Han che:
  - Chua co phan quyen chi tiet theo role cap nho.
  - Chua co dashboard van hanh realtime day du.
- Nang cap:
  - RBAC chi tiet theo permission.
  - Dashboard monitoring + canh bao loi.

---

## 6) Tong ket cuoi bai (1 phut)

### Loi ket goi y

- "He thong da hoan thanh cac luong chinh tu User den Admin."
- "Gia tri noi bat: theo doi dinh duong, tu dong hoa nhap lieu bang AI, va tro ly chatbot."
- "Buoc tiep theo cua de tai: nang chat luong AI, tang test/CI, va bo sung monitoring de san sang production."

---

## 7) Ke hoach du phong khi demo loi

## Tinh huong A - AI scan loi

- Chuyen sang luong tim mon thu cong + add meal.
- Noi ro: "He thong co fallback de khong gian doan trai nghiem."

## Tinh huong B - Chatbot loi key/provider

- Trinh bay kien truc multi-provider.
- Demo support chat hoac lich su chat da co.

## Tinh huong C - Backend/DB tre

- Mo `http://localhost:5000/health`.
- Khoi dong lai backend.
- Dung data va tai khoan da chuan bi truoc.

---

## 8) Ban cuc ngan 8-10 phut (neu GV it thoi gian)

- 1 phut: Tong quan + cong nghe + DB.
- 1 phut: Dang nhap.
- 2 phut: Thu vien + review + favorite.
- 2 phut: Scan + luu meal.
- 1 phut: Statistics + meal plan.
- 1 phut: Chatbot.
- 1 phut: Admin + tong ket.
