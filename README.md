# راهنمای پروژه درس‌پلنر (Lesson Planner)

این مخزن شامل دو بخش اصلی است: بک‌اند ASP.NET Core و فرانت‌اند Angular. هدف سیستم مدیریت دانش‌آموز، درس، تکلیف روزانه و ارسال روزانه است، با نمودارهای پیشرفت هر دو هفته.

## 🎯 هدف پروژه

سیستم درس‌پلنر برای مدیریت فرآیند آموزش روزانه دانش‌آموزان طراحی شده است:
- **تکالیف روزانه**: هر دانش‌آموز تکالیف روزانه دریافت می‌کند
- **ارسال فایل**: امکان آپلود فایل‌های صوتی و مستندات
- **نمودار پیشرفت**: نمایش پیشرفت هر دو هفته
- **مدیریت دوره‌ها**: سیستم مدیریت کامل دوره‌ها و تکالیف

## ساختار کلی پروژه

```
lesson-planner/
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
└─ frontend-angular/       # فرانت‌اند Angular 17 (standalone)
   ├─ src/app/
   │  ├─ core/             # Models, Services, Guards, Interceptors
   │  ├─ features/         # auth, dashboard, admin
   │  └─ ...
   └─ README.md
```

## 🛠️ نحوه اجرا (توسعه)

### پیش‌نیازها
- Node.js 18+
- npm 9+
- .NET 8 SDK
- سیستم‌عامل سازگار (Linux/WSL توصیه می‌شود)

### اجرای بک‌اند ASP.NET Core (`backend-dotnet/`)
```bash
cd backend-dotnet/LessonPlanner.Api
dotnet run
```
- سرور روی `http://localhost:5253` اجرا می‌شود (پورت در `Properties/launchSettings.json`)
- پایگاه‌داده SQLite `lesson-planner.db` با `EnsureCreated()` ساخته می‌شود
- کاربر ادمین `test` / `password` و داده‌های نمونه به‌صورت خودکار ایجاد می‌شوند
- CORS کاملاً باز است (`AllowAnyOrigin`)
- API کاملاً مشابه نسخه NestJS است (همان endpointها، همان رفتار)
- **محدودیت**: فرانت‌اند Angular به صورت پیش‌فرض به `http://localhost:3000` متصل می‌شود — باید URL را در `frontend-angular/src/app/core/services/api.service.ts` و `auth.service.ts` به `http://localhost:5253` تغییر دهید

### اجرای فرانت‌اند Angular (`frontend-angular/`)
```bash
cd frontend-angular
npm install
npm start
```
- سرور روی `http://localhost:4200` اجرا می‌شود
- **محدودیت مهم**: API base در سراسر پروژه به صورت hardcoded روی `http://localhost:3000` تنظیم شده است (فایل‌های `api.service.ts`، `auth.service.ts`، `dashboard.component.ts`، و نسخه‌های JS قدیمی در `assets/js/`)
- برای تغییر بک‌اند مقصد، باید URL را در همه این فایل‌ها به‌روزرسانی کنید
- احراز هویت مبتنی بر localStorage با توکن ساختگی (`dummy-token`) است — توکن واقعی JWT صادر نمی‌شود

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
1. **راه‌اندازی بک‌اند**: `dotnet run` در پوشه `backend-dotnet/LessonPlanner.Api`
2. **راه‌اندازی فرانت‌اند**: `npm start` در پوشه `frontend-angular`
3. **تست ورود**: از کاربران نمونه استفاده کنید
4. **تست ثبت‌نام**: کاربر جدید ثبت‌نام کنید
5. **تست تایید**: به عنوان مدیر وارد شوید و کاربر را تایید کنید
6. **تست تکالیف**: به عنوان دانش‌آموز وارد شوید و تکالیف را مشاهده کنید

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

> تمام endpointها در بک‌اند ASP.NET Core پیاده‌سازی شده‌اند.

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

## 📚 مستندات تکمیلی

### فایل‌های راهنما
- `AGENTS.md` - راهنمای ساختار پروژه و معماری سیستم

### نکات امنیتی
- تمام APIها نیاز به احراز هویت دارند (به جز auth)
- کاربران pending نمی‌توانند وارد شوند
- فایل‌ها محدودیت نوع و حجم دارند
- دسترسی‌ها بر اساس نوع کاربر کنترل می‌شود 