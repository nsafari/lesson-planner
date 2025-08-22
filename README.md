# راهنمای پروژه درس‌پلنر (Lesson Planner)

این مخزن شامل دو بخش اصلی است: بک‌اند (NestJS + TypeORM + SQLite) و فرانت‌اند (HTML/CSS/JS ساده). هدف سیستم مدیریت دانش‌آموز، درس، تکلیف روزانه و ارسال روزانه است، با نمودارهای پیشرفت هر دو هفته.

## 🎯 هدف پروژه

سیستم درس‌پلنر برای مدیریت فرآیند آموزش روزانه دانش‌آموزان طراحی شده است:
- **تکالیف روزانه**: هر دانش‌آموز تکالیف روزانه دریافت می‌کند
- **ارسال فایل**: امکان آپلود فایل‌های صوتی و مستندات
- **نمودار پیشرفت**: نمایش پیشرفت هر دو هفته
- **مدیریت دوره‌ها**: سیستم مدیریت کامل دوره‌ها و تکالیف

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

## 👥 فرآیند کار برای کاراموزان

### 🔄 فرآیند کامل سیستم

#### 1. **ثبت‌نام کاربر جدید**
کاربر جدید درخواست ثبت‌نام می‌دهد:
```bash
POST /auth/register
{
  "username": "newstudent",
  "password": "password123",
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "phoneNumber": "09123456789"
}
```
→ کاربر با وضعیت `pending` ایجاد می‌شود

#### 2. **تایید توسط مدیر**
مدیر سیستم کاربر را تایید می‌کند:
```bash
POST /admin/users/5/approve
{
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "phoneNumber": "09123456789",
  "studentId": "ST004",
  "courseIds": [1, 2]
}
```
→ دانش‌آموز ایجاد و در دوره‌ها ثبت‌نام می‌شود

#### 3. **ورود کاربر**
کاربر تایید شده وارد سیستم می‌شود:
```bash
POST /auth/login
{
  "username": "newstudent",
  "password": "password123"
}
```
→ اطلاعات دانش‌آموز و دسترسی به تکالیف

#### 4. **مشاهده و ارسال تکالیف**
دانش‌آموز تکالیف را مشاهده و ارسال می‌کند:
```bash
GET /students/4/progress          # مشاهده پیشرفت
POST /students/4/assignments/1/submit  # ارسال تکلیف با فایل
```

### 📊 جریان داده (Data Flow)

```
User Signup → Pending Approval → Admin Review → Student Creation → Course Enrollment → Assignment Access → File Submission → Progress Tracking
```

## 🛠️ نحوه اجرا (توسعه)

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

## 🔗 نحوه ارتباط بک‌اند و فرانت‌اند

### API Service
فرانت‌اند از طریق `ApiService` با آدرس پایه `http://localhost:3000` به بک‌اند متصل می‌شود:
- **فایل**: `frontend/assets/js/api/api.service.js`
- **متدهای کلیدی**:
  - `getActiveCourses()` - دریافت دوره‌های فعال
  - `getCourseAssignments(courseId)` - دریافت تکالیف روزانه هر دوره (به همراه ضمیمه‌ها)
  - `getStudentSubmissions(studentId)` - دریافت ارسال‌های دانش‌آموز
  - `getAssignmentProgress(studentId, assignmentId)` - دریافت پیشرفت در یک تکلیف روزانه
  - `submitDailyWork(studentId, assignmentId, data)` - ارسال کار روزانه

### بخش‌های اصلی UI
- **`render-user.js`**: 
  - منو دوره‌ها
  - تایم‌لاین تکالیف روزانه 
  - نمایش آیکون صوت برای ضمیمه‌ها
  - مدال جزئیات تکلیف
  - دکمه ثبت ارسال
- **نمودار**: نمایش «میانگین نمرات هر دو هفته» بر اساس تجمیع ۱۲ روزه

### احراز هویت
- **توکن**: تمام درخواست‌ها نیاز به توکن احراز هویت دارند
- **ذخیره**: توکن در localStorage ذخیره می‌شود
- **نوع کاربر**: سیستم بین دانش‌آموز و مدیر تمایز قائل می‌شود

## 📊 مدل داده (خلاصه)

### موجودیت‌های اصلی
- **Student** (دانش‌آموز) - اطلاعات شخصی و تحصیلی
- **Course** (درس) - دوره‌های آموزشی
- **Assignment** (تکلیف روزانه) - فیلد کلیدی: `assignmentDate`
- **AssignmentAttachment** (ضمیمه تکلیف) - چند فایل/لینک برای هر تکلیف
- **AssignmentSubmission** (ارسال روزانه) - نمره روزانه، وضعیت تکمیل، فایل ارسال‌شده
- **StudentCourse** (ثبت‌نام دانش‌آموز در درس) - رابطه دانش‌آموز-دوره
- **User** (کاربر) - احراز هویت و تایید

### روابط مهم
- هر **Course** شامل چند **Assignment** (روزانه)
- هر **Assignment** می‌تواند چند **Attachment** داشته باشد
- هر **Student** برای هر **Assignment** می‌تواند یک **Submission** داشته باشد
- هر **User** می‌تواند یک **Student** باشد (پس از تایید)

### وضعیت‌های کاربر
- **pending**: در انتظار تایید مدیر
- **approved**: تایید شده و دانش‌آموز ایجاد شده
- **rejected**: رد شده

## 🔌 نقاط انتهایی مهم (API)

### 🔐 احراز هویت
- `POST /auth/login` - ورود کاربر (بررسی وضعیت تایید)
- `POST /auth/register` - ثبت‌نام کاربر جدید (وضعیت pending)

### 👨‍🎓 دانش‌آموزان
- `GET /students/:id/progress` - پیشرفت دانش‌آموز
- `GET /students/:id/assignments/:assignmentId/progress` - پیشرفت در تکلیف خاص
- `GET /students/:id/submissions` - لیست ارسال‌ها
- `POST /students/:id/assignments/:assignmentId/submit` - ارسال کار روزانه (با آپلود فایل)
- `POST /students/:id/submissions/:submissionId/upload` - آپلود فایل برای ارسال موجود

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
- `POST /admin/assignments/:assignmentId/attachments` - آپلود فایل ضمیمه
- `GET /admin/statistics` - آمار سیستم

**جزئیات کامل‌تر در `backend/API_ENDPOINTS.md` موجود است.**

## 💡 نکات توسعه

### 🔄 مدیریت داده‌ها
- **پاک‌سازی**: فایل `backend/lesson-planner.db` را حذف کنید و سرویس را مجدد اجرا کنید
- **Seed خودکار**: داده‌های نمونه به‌صورت خودکار ایجاد می‌شوند
- **لاگ‌ها**: در حالت توسعه فعال هستند (SQL و رویدادها)

### 🛠️ توسعه Frontend
- **API Service**: از `frontend/assets/js/api/api.service.js` استفاده کنید
- **احراز هویت**: توکن را در localStorage ذخیره کنید
- **فایل‌ها**: آپلود فایل با FormData انجام می‌شود

### 🔧 توسعه Backend
- **Entities**: در `backend/src/entities/` تعریف می‌شوند
- **Services**: منطق تجاری در `backend/src/services/`
- **Controllers**: API endpoints در `backend/src/controllers/`

## 🚨 مشکلات رایج

### فرانت‌اند داده نشان نمی‌دهد
- ✅ بک‌اند روی `http://localhost:3000` اجرا شود
- ✅ خطاهای کنسول مرورگر بررسی شود
- ✅ فایل پایگاه‌داده و جداول بررسی شود
- ✅ CORS فعال باشد

### خطاهای احراز هویت
- ✅ توکن معتبر استفاده شود
- ✅ وضعیت تایید کاربر بررسی شود
- ✅ نوع کاربر (student/admin) صحیح باشد

### خطاهای آپلود فایل
- ✅ نوع فایل مجاز باشد (MP3, PDF, DOC, etc.)
- ✅ حجم فایل کمتر از 10MB باشد
- ✅ پوشه‌های uploads وجود داشته باشد

## 📚 مستندات تکمیلی

### فایل‌های راهنما
- `backend/API_ENDPOINTS.md` - مستندات کامل API
- `backend/SIGNUP_APPROVAL_WORKFLOW.md` - فرآیند ثبت‌نام و تایید
- `backend/USER_STUDENT_RELATIONSHIP.md` - رابطه کاربر و دانش‌آموز
- `backend/ADMIN_API_EXAMPLES.md` - مثال‌های API مدیریت
- `backend/STUDENT_FILE_UPLOAD_GUIDE.md` - راهنمای آپلود فایل

### نکات امنیتی
- تمام APIها نیاز به احراز هویت دارند
- کاربران pending نمی‌توانند وارد شوند
- فایل‌ها محدودیت نوع و حجم دارند
- دسترسی‌ها بر اساس نوع کاربر کنترل می‌شود 