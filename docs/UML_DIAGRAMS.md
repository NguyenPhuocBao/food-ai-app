# Food AI Project - Bo so do nghiep vu va kien truc

Tai lieu nay tong hop cac so do chinh cho du an: Use Case, Activity, Sequence, ERD, Component va Deployment.

## 1) Use Case Diagram (Tong quan he thong)

```mermaid
flowchart LR
    user([Nguoi dung])
    admin([Admin])
    ai([AI Service])
    email([SMTP Email])

    subgraph System[Food AI System]
        uc1([Dang ky / Dang nhap])
        uc2([Quan ly ho so & muc tieu suc khoe])
        uc3([Xem / tim kiem mon an])
        uc4([Scan anh mon an bang AI])
        uc5([Ghi nhat ky bua an])
        uc6([Xem thong ke dinh duong])
        uc7([Nhan goi y mon an / meal plan])
        uc8([Chatbot tu van dinh duong])
        uc9([Danh gia / yeu thich mon an])
        uc10([Nhan thong bao / nhac nho])
        uc11([Ho tro CSKH])

        ad1([Quan tri nguoi dung])
        ad2([Quan tri noi dung: foods/recipes/reviews])
        ad3([Quan tri chatbot ops & train data])
        ad4([Xem audit logs / system settings])
        ad5([Tra loi ticket ho tro])
    end

    user --> uc1
    user --> uc2
    user --> uc3
    user --> uc4
    user --> uc5
    user --> uc6
    user --> uc7
    user --> uc8
    user --> uc9
    user --> uc10
    user --> uc11

    admin --> ad1
    admin --> ad2
    admin --> ad3
    admin --> ad4
    admin --> ad5

    uc4 -.goi model nhan dien.-> ai
    uc8 -.goi LLM provider.-> ai
    uc10 -.gui mail nhac nho.-> email
```

## 2) Activity Diagram (Luong Scan anh -> Xac nhan -> Luu bua an)

```mermaid
flowchart TD
    A([Bat dau]) --> B[User tai anh mon an]
    B --> C[Backend nhan file va goi AI predict]
    C --> D{AI service san sang?}
    D -- Co --> E[Lay foodName + confidence]
    D -- Khong --> F[Fallback: tim mon theo candidate + DB]
    E --> G[Rank foods trong DB, tra suggestions]
    F --> G
    G --> H[Tra ket qua scan cho frontend]
    H --> I{User chon mon de xac nhan?}
    I -- Khong --> Z([Ket thuc])
    I -- Co --> J[POST /analyze/:scanId/confirm]
    J --> K[Update scanHistory.isConfirmed]
    K --> L[POST /meals tao ban ghi bua an]
    L --> M[Cap nhat DailyNutrition/Thong ke]
    M --> Z([Ket thuc])
```

## 3) Activity Diagram (Forgot Password)

```mermaid
flowchart TD
    A([Bat dau]) --> B[User nhap email quen mat khau]
    B --> C[Backend tim user]
    C --> D{User ton tai va active?}
    D -- Khong --> E[Tra thong bao chung, khong lo email ton tai]
    D -- Co --> F[Tao reset token + hash + expiresAt]
    F --> G[Luu password_reset_tokens]
    G --> H[Gui email reset link]
    H --> E
    E --> I[User mo link reset]
    I --> J[Nhap mat khau moi]
    J --> K{Token hop le + chua het han?}
    K -- Khong --> L[Tra loi token khong hop le]
    K -- Co --> M[Hash mat khau moi, update users.password]
    M --> N[Danh dau token da dung + huy token khac]
    N --> O([Ket thuc])
    L --> O
```

## 4) Sequence Diagram (Dang nhap)

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL

    U->>FE: Nhap email/password
    FE->>BE: POST /api/auth/login
    BE->>DB: find user by email
    DB-->>BE: user record
    BE->>BE: bcrypt.compare(password)
    alt Mat khau dung
        BE->>BE: jwt.sign(token)
        BE->>DB: ghi audit log + mark active
        BE-->>FE: 200 + token + profile
        FE-->>U: Dang nhap thanh cong
    else Sai thong tin
        BE-->>FE: 401 Invalid credentials
        FE-->>U: Bao loi dang nhap
    end
```

## 5) ER Diagram (Rut gon tu Prisma)

PlantUML source day du: `docs/diagrams/puml/du_lieu_he_thong_erd.puml`
Rendered image: `docs/diagrams/images/du_lieu_he_thong_erd.png`

```mermaid
erDiagram
    USER ||--o| USER_PROFILE : has
    USER ||--o{ USER_GOAL : defines
    USER ||--o{ USER_HEALTH_METRIC : records
    USER ||--o{ MEAL : logs
    USER ||--o{ SCAN_HISTORY : creates
    USER ||--o{ FAVORITE : marks
    USER ||--o{ REVIEW : writes
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ CHAT_SESSION : opens
    USER ||--o{ DAILY_NUTRITION : aggregates
    USER ||--o{ WEEKLY_REPORT : has
    USER ||--o{ RECOMMENDATION : gets
    USER ||--o{ AUDIT_LOG : triggers
    USER ||--o{ PASSWORD_RESET_TOKEN : owns

    FOOD_ITEM ||--o| RECIPE : has
    FOOD_ITEM ||--o{ MEAL : used_in
    FOOD_ITEM ||--o{ REVIEW : reviewed_in
    FOOD_ITEM ||--o{ FAVORITE : favorited
    FOOD_ITEM ||--o{ RECOMMENDATION : recommended
    FOOD_ITEM ||--o{ MEAL_PLAN_DETAIL : planned

    RECIPE ||--o{ RECIPE_INGREDIENT : contains
    RECIPE ||--o{ RECIPE_STEP : contains
    RECIPE ||--o{ RECIPE_TOOL : uses

    MEAL_PLAN ||--o{ MEAL_PLAN_DETAIL : includes
    USER ||--o{ MEAL_PLAN : owns

    CHAT_SESSION ||--o{ CHAT_MESSAGE : contains
    REVIEW ||--o{ REVIEW_REPLY : has
```

## 6) Component Diagram (Backend/Frontend)

```mermaid
flowchart LR
    subgraph Client
        FE[React + Vite Frontend]
    end

    subgraph API[Node.js Express Backend]
        AUTH[Auth Module]
        FOOD[Food/Recipe Module]
        MEAL[Meal/Statistics/Health Module]
        AI_SCAN[Analyze Image Module]
        RECO[Recommendation/MealPlan Module]
        CHAT[Chatbot + Support Module]
        ADMIN[Admin + Audit + Settings]
    end

    subgraph Data
        DB[(PostgreSQL + Prisma)]
    end

    subgraph External
        AISVC[AI Classifier Service]
        LLM[LLM Providers: OpenAI/Grok/Gemini]
        SMTP[SMTP Server]
    end

    FE --> API
    AUTH --> DB
    FOOD --> DB
    MEAL --> DB
    AI_SCAN --> DB
    RECO --> DB
    CHAT --> DB
    ADMIN --> DB

    AI_SCAN --> AISVC
    CHAT --> LLM
    AUTH --> SMTP
    MEAL --> SMTP
```

## 7) Deployment Diagram (Moi truong trien khai)

```mermaid
flowchart TB
    U[User Browser/Mobile] --> NGINX[Reverse Proxy / Gateway]
    NGINX --> FE[Frontend Static Hosting]
    NGINX --> BE[Backend API Container]
    BE --> DB[(PostgreSQL)]
    BE --> UPLOADS[(Volume: uploads)]
    BE --> AISVC[AI Service Container :8000]
    BE --> LLM[External LLM APIs]
    BE --> SMTP[SMTP Provider]
```

## Ghi chu su dung

- Co the copy truc tiep vao README/bao cao va render bang Mermaid.
- Neu can ban ve PNG/SVG, co the dung Mermaid CLI hoac draw.io.
- Neu ban muon, minh co the tach so do theo tung chuong (Phan tich, Thiet ke, Trien khai) va doi style theo form bao cao tot nghiep.
