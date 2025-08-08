# راهنمای پروژه درس‌پلنر (Lesson Planner)

این مخزن شامل دو بخش اصلی است: بک‌اند (NestJS + TypeORM + SQLite) و فرانت‌اند (HTML/CSS/JS ساده). هدف سیستم مدیریت دانش‌آموز، درس، تکلیف روزانه و ارسال روزانه است، با نمودارهای پیشرفت هر دو هفته.

## ساختار کلی پروژه

```
lesson-planner/
├─ backend/            # سرویس بک‌اند با NestJS
│  ├─ src/
│  │  ├─ entities/     # مدل‌های پایگاه‌داده (TypeORM)
│  │  ├─ services/     # منطق تجاری
│  │  ├─ controllers/  # APIهای REST
│  │  ├─ seeders/      # ایجاد داده‌های نمونه (Seeder)
│  │  ├─ app.module.ts # پیکربندی اصلی ماژول
│  │  ├─ main.ts       # راه‌اندازی برنامه + CORS
│  │  └─ ...
│  ├─ API_ENDPOINTS.md # مستندات API
│  └─ README.md        # راهنمای اختصاصی بک‌اند
│
└─ frontend/
   ├─ assets/
   │  ├─ js/
   │  │  ├─ api/api.service.js        # سرویس ارتباط با بک‌اند
   │  │  ├─ users/render-user.js      # رندر منو، تایم‌لاین و نمودار
   │  │  └─ index.js                  # مقداردهی اولیه برنامه
   │  ├─ styles/                      # فایل‌های CSS
   │  └─ vendor/                      # کتابخانه‌های جانبی (Highcharts، Bootstrap، ...)
   ├─ users/index.html                # صفحه داشبورد کاربر
   └─ admin/index.html                # (در صورت استفاده) صفحه مدیریت
```

## نحوه اجرا (توسعه)

### پیش‌نیازها
- Node.js 18+
- npm 9+
- سیستم‌عامل سازگار (Linux/WSL توصیه می‌شود)

### اجرای بک‌اند
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
   - پایگاه‌داده SQLite با نام `lesson-planner.db` در مسیر `backend/` ساخته می‌شود
   - جداول به‌صورت خودکار همگام‌سازی می‌شوند (synchronize: true)
   - کاربر پیش‌فرض `test` با رمز `password` ساخته می‌شود
   - داده‌های نمونه (دانش‌آموز، دوره، ۳۶ تکلیف روزانه، ضمیمه‌های صوتی روز اول، ارسال‌های نمونه) به‌صورت خودکار Seed می‌شوند

سرور به طور پیش‌فرض روی `http://localhost:3000` اجرا خواهد شد.

### اجرای فرانت‌اند
1. کافی است فایل‌های HTML را با یک سرور استاتیک اجرا کنید (یا مستقیم در مرورگر باز کنید). پیشنهاد:
   - با VSCode افزونه Live Server
   - یا با یک سرور ساده Node:
     ```bash
     # از ریشه مخزن
     npx http-server frontend -p 8080 -c-1
     ```
2. صفحه اصلی کاربر: `frontend/users/index.html`

توجه: اگر فرانت‌اند روی پورت دیگری اجرا شود (مثلاً 8080)، به دلیل فعال بودن CORS در بک‌اند، درخواست‌ها مجاز هستند.

## نحوه ارتباط بک‌اند و فرانت‌اند
- فرانت‌اند از طریق `ApiService` با آدرس پایه `http://localhost:3000` به بک‌اند متصل می‌شود:
  - فایل: `frontend/assets/js/api/api.service.js`
  - متدهای کلیدی:
    - `getActiveCourses()` دریافت دوره‌های فعال
    - `getCourseAssignments(courseId)` دریافت تکالیف روزانه هر دوره (به همراه ضمیمه‌ها)
    - `getStudentSubmissions(studentId)` دریافت ارسال‌های دانش‌آموز
    - `getAssignmentProgress(studentId, assignmentId)` دریافت پیشرفت در یک تکلیف روزانه
    - `submitDailyWork(studentId, assignmentId, data)` ارسال کار روزانه
- بخش‌های اصلی UI:
  - `render-user.js`: منو، تایم‌لاین تکالیف روزانه با نمایش آیکون صوت در صورت وجود ضمیمه، مدال جزئیات تکلیف و دکمه ثبت ارسال
  - نمودار: نمایش «میانگین نمرات هر دو هفته» بر اساس تجمیع ۱۲ روزه

## مدل داده (خلاصه)
- Student (دانش‌آموز)
- Course (درس)
- Assignment (تکلیف روزانه) — فیلد کلیدی: `assignmentDate`
- AssignmentAttachment (ضمیمه تکلیف) — چند فایل/لینک برای هر تکلیف (مثلاً فایل‌های صوتی راهنما)
- AssignmentSubmission (ارسال روزانه) — نمره روزانه، وضعیت تکمیل، فایل صوتی ارسال‌شده
- StudentCourse (ثبت‌نام دانش‌آموز در درس)

روابط مهم:
- هر Course شامل چند Assignment (روزانه)
- هر Assignment می‌تواند چند Attachment داشته باشد
- هر Student برای هر Assignment می‌تواند یک ارسال روزانه داشته باشد

## نقاط انتهایی مهم (API)
- Students:
  - GET `/students/:id/progress`
  - GET `/students/:id/assignments/:assignmentId/progress`
  - GET `/students/:id/submissions?assignmentId=...`
  - POST `/students/:id/assignments/:assignmentId/submit`
- Courses:
  - GET `/courses`
  - GET `/courses/active`
  - GET `/courses/:id`
  - GET `/courses/:id/assignments`
  - POST `/courses/:id/assignments`
  - (اختیاری) POST `/courses/:id/assignments/daily-series` برای ساخت سری‌های روزانه

جزئیات کامل‌تر در `backend/API_ENDPOINTS.md` موجود است.

## نکات توسعه
- برای پاک‌سازی و شروع دوباره داده‌ها، فایل پایگاه‌داده `backend/lesson-planner.db` را حذف کنید و سرویس را مجدد اجرا کنید تا Seed دوباره انجام شود.
- برای جلوگیری از Seed خودکار در محیط غیرتوسعه، می‌توان شرط محیطی اضافه کرد (مثلاً `SEED_ON_STARTUP=true`).
- لاگ‌ها در حالت توسعه فعال هستند (SQL و رویدادها).

## مشکلات رایج
- اگر فرانت‌اند داده‌ای نشان نمی‌دهد:
  - اطمینان از اجرای بک‌اند روی `http://localhost:3000`
  - بررسی خطاهای کنسول مرورگر (CORS یا خطای شبکه)
  - بررسی فایل پایگاه‌داده و جداول

در صورت نیاز، می‌توان لاگین واقعی و مدیریت توکن را پیاده‌سازی کرد و شناسه دانش‌آموز را از نشست کاربر دریافت نمود. 