# راهنمای پروژه درس‌پلنر (Lesson Planner)

این مخزن شامل چند بخش اصلی است: بک‌اند NestJS، بک‌اند ASP.NET Core، فرانت‌اند Angular، و فرانت‌اند کلاسیک. هدف سیستم مدیریت دانش‌آموز، درس، تکلیف روزانه و ارسال روزانه است، با نمودارهای پیشرفت هر دو هفته.

## 🎯 هدف پروژه

سیستم درس‌پلنر برای مدیریت فرآیند آموزش روزانه دانش‌آموزان طراحی شده است:
- **تکالیف روزانه**: هر دانش‌آموز تکالیف روزانه دریافت می‌کند
- **ارسال فایل**: امکان آپلود فایل‌های صوتی و مستندات
- **نمودار پیشرفت**: نمایش پیشرفت هر دو هفته
- **مدیریت دوره‌ها**: سیستم مدیریت کامل دوره‌ها و تکالیف

## ساختار کلی پروژه

```
lesson-planner/
├─ backend/                # سرویس بک‌اند NestJS (TypeORM + SQLite)
│  ├─ src/
│  │  ├─ entities/         # مدل‌های پایگاه‌داده (TypeORM)
│  │  ├─ services/         # منطق تجاری
│  │  ├─ controllers/      # APIهای REST
│  │  ├─ seeders/          # ایجاد داده‌های نمونه (Seeder)
│  │  ├─ app.module.ts     # پیکربندی اصلی ماژول
│  │  ├─ main.ts           # راه‌اندازی برنامه + CORS
│  │  └─ ...
│  ├─ API_ENDPOINTS.md     # مستندات API
│  └─ README.md            # راهنمای اختصاصی بک‌اند
│
├─ backend-dotnet/         # سرویس بک‌اند ASP.NET Core 8 (EF Core + SQLite)
│  └─ LessonPlanner.Api/
│     ├─ Models/           # موجودیت‌های EF Core
│     ├─ Data/             # AppDbContext
│     ├─ DTOs/             # مدل‌های درخواست/پاسخ
│     ├─ Services/         # منطق تجاری (interface + implementation)
│     ├─ Controllers/      # ۵ کنترلر (auth, student, course, admin, seeder)
│     ├─ Seeders/          # داده‌های نمونه
│     └─ Program.cs        # راه‌اندازی برنامه
│
├─ frontend-angular/       # فرانت‌اند Angular 17 (standalone)
│  ├─ src/app/
│  │  ├─ core/             # Models, Services, Guards, Interceptors
│  │  ├─ features/         # auth, dashboard, admin
│  │  └─ ...
│  └─ README.md
│
└─ frontend/               # فرانت‌اند کلاسیک (HTML/CSS/JS ساده)
   ├─ assets/
   │  ├─ js/
   │  │  ├─ api/api.service.js        # سرویس ارتباط با بک‌اند
   │  │  ├─ users/render-user.js      # رندر منو، تایم‌لاین و نمودار
   │  │  └─ index.js                  # مقداردهی اولیه برنامه
   │  ├─ styles/                      # فایل‌های CSS
   │  └─ vendor/                      # کتابخانه‌های جانبی (Highcharts، Bootstrap، ...)
   ├─ users/index.html                # صفحه داشبورد کاربر
   └─ admin/index.html                # صفحه مدیریت
```

## 🛠️ نحوه اجرا (توسعه)

### پیش‌نیازها
- Node.js 18+
- npm 9+
- .NET 8 SDK (برای `backend-dotnet`)
- سیستم‌عامل سازگار (Linux/WSL توصیه می‌شود)

### اجرای بک‌اند NestJS (`backend/`)
1. نصب وابستگی‌ها:
   ```bash
   cd backend
   npm install
   ```
2. اجرای توسعه:
   ```bash
   npm run start:dev
   ```
3. ویژگی‌ها هنگام راه‌اندازی:
   - CORS فعال است (ارتباط آزاد از فرانت‌اند روی پورت دیگر)
   - پایگاه‌داده SQLite (`lesson-planner.db`) ساخته می‌شود
   - جداول به‌صورت خودکار همگام‌سازی می‌شوند (`synchronize: true`)
   - کاربر پیش‌فرض `test` با رمز `password` ساخته می‌شود
   - داده‌های نمونه به‌صورت خودکار Seed می‌شوند

سرور به طور پیش‌فرض روی `http://localhost:3000` اجرا می‌شود.

### اجرای بک‌اند ASP.NET Core (`backend-dotnet/`)
```bash
cd backend-dotnet/LessonPlanner.Api
dotnet run
```
- سرور روی `http://localhost:5000` (پیش‌فرض) اجرا می‌شود
- پایگاه‌داده SQLite `lesson-planner.db` با `EnsureCreated()` ساخته می‌شود
- کاربر ادمین `test` / `password` و داده‌های نمونه به‌صورت خودکار ایجاد می‌شوند
- CORS کاملاً باز است (`AllowAnyOrigin`)
- API کاملاً مشابه نسخه NestJS است

### اجرای فرانت‌اند Angular (`frontend-angular/`)
```bash
cd frontend-angular
npm install
npm start
```
- سرور روی `http://localhost:4200` اجرا می‌شود
- API base به صورت پیش‌فرض `http://localhost:3000` است (NestJS)

### اجرای فرانت‌اند کلاسیک (`frontend/`)
فایل‌های HTML را با یک سرور استاتیک اجرا کنید:
```bash
npx http-server frontend -p 8080 -c-1
```
صفحه اصلی کاربر: `frontend/users/index.html`

توجه: به دلیل فعال بودن CORS در بک‌اند، درخواست‌ها از هر پورتی مجاز هستند.

## 🧪 تست سیستم

### کاربران نمونه موجود
سیستم به‌صورت خودکار کاربران زیر را ایجاد می‌کند:

| نوع | Username | Password | توضیحات |
|-----|----------|----------|---------|
| **دانش‌آموز** | `ali.ahmadi` | `password123` | علی احمدی |
| **دانش‌آموز** | `fateme.mohammadi` | `password123` | فاطمه محمدی |
| **دانش‌آموز** | `mohammad.rezaei` | `password123` | محمد رضایی |
| **مدیر** | `test` | `password` | مدیر سیستم |

### مراحل تست
1. **راه‌اندازی**: `npm run start:dev` در پوشه backend
2. **تست ورود**: از کاربران نمونه استفاده کنید
3. **تست ثبت‌نام**: کاربر جدید ثبت‌نام کنید
4. **تست تایید**: به عنوان مدیر وارد شوید و کاربر را تایید کنید
5. **تست تکالیف**: به عنوان دانش‌آموز وارد شوید و تکالیف را مشاهده کنید

## 📊 مدل داده

### موجودیت‌های اصلی
- **Student** (دانش‌آموز) - اطلاعات شخصی و تحصیلی
- **Course** (درس) - دوره‌های آموزشی
- **Assignment** (تکلیف روزانه) - فیلد کلیدی: `assignmentDate`
- **AssignmentAttachment** (ضمیمه تکلیف) - چند فایل/لینک برای هر تکلیف
- **AssignmentSubmission** (ارسال روزانه) - نمره روزانه، وضعیت تکمیل، فایل ارسال‌شده
- **StudentCourse** (ثبت‌نام دانش‌آموز در درس) - رابطه دانش‌آموز-دوره
- **User** (کاربر) - احراز هویت و تایید

### وضعیت‌های کاربر
- **pending**: در انتظار تایید مدیر
- **approved**: تایید شده و دانش‌آموز ایجاد شده
- **rejected**: رد شده

## 🔌 نقاط انتهایی مهم (API)

> تمام endpointها در هر دو بک‌اند (NestJS و ASP.NET Core) یکسان هستند.

### 🔐 احراز هویت
- `POST /auth/signin` - ورود کاربر (بررسی وضعیت تایید)
- `POST /auth/signup` - ثبت‌نام کاربر جدید (وضعیت pending)

### 👨‍🎓 دانش‌آموزان
- `GET /students/:id/progress` - پیشرفت دانش‌آموز
- `GET /students/me/profile` - پروفایل دانش‌آموز (username در body)
- `POST /students/:id/assignments/:assignmentId/submit` - ارسال کار روزانه (با آپلود فایل)

### 📚 دوره‌ها
- `GET /courses` - همه دوره‌ها
- `GET /courses/active` - دوره‌های فعال
- `GET /courses/:id/assignments` - تکالیف دوره
- `POST /courses/:id/assignments/daily-series` - ایجاد سری تکالیف روزانه

### 👨‍💼 مدیریت (Admin)
- `GET /admin/courses` - مدیریت دوره‌ها
- `GET /admin/users/pending` - کاربران در انتظار تایید
- `POST /admin/users/:userId/approve` - تایید کاربر و ایجاد دانش‌آموز
- `POST /admin/users/:userId/reject` - رد کردن کاربر
- `POST /admin/courses/:courseId/assignments/daily-series` - ایجاد سری تکالیف
- `POST /admin/assignments/:assignmentId/attachments` - آپلود فایل ضمیمه
- `GET /admin/statistics` - آمار سیستم

**جزئیات کامل‌تر در `backend/API_ENDPOINTS.md` موجود است.**

## 📚 مستندات تکمیلی

### فایل‌های راهنما
- `backend/API_ENDPOINTS.md` - مستندات کامل API
- `backend/SIGNUP_APPROVAL_WORKFLOW.md` - فرآیند ثبت‌نام و تایید
- `backend/USER_STUDENT_RELATIONSHIP.md` - رابطه کاربر و دانش‌آموز
- `backend/ADMIN_API_EXAMPLES.md` - مثال‌های API مدیریت
- `backend/STUDENT_FILE_UPLOAD_GUIDE.md` - راهنمای آپلود فایل
- `AGENTS.md` - راهنمای ساختار پروژه و معماری سیستم

### نکات امنیتی
- تمام APIها نیاز به احراز هویت دارند (به جز auth)
- کاربران pending نمی‌توانند وارد شوند
- فایل‌ها محدودیت نوع و حجم دارند
- دسترسی‌ها بر اساس نوع کاربر کنترل می‌شود
- AuthGuard در NestJS عملاً no-op است (توکن واقعی صادر نمی‌شود) 