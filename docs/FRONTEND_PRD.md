# سند نیازمندی محصول (PRD) — برنامه‌ریز درس (فرانت‌اند Angular)

## 1) هدف و محدوده

هدف، تکمیل کلاینت **Angular** برای یک سامانه **برنامه‌ریز درس / تکلیف روزانه** است؛ به‌طوری‌که دانش‌آموز بتواند درس‌ها و **تایم‌لاین تکالیف** را ببیند، تمرین خود را ضبط/ارسال کند و تاریخچه ارسال‌ها را مشاهده کند. مدیر نیز بتواند **درخواست‌های ثبت‌نام** را تایید/رد کند، **دوره‌ها**، **تکالیف** و **ضمیمه‌ها** را مدیریت کند و **آمار** ببیند.

**خارج از محدوده این PRD:** احراز هویت production (JWT)، پرداخت، ایمیل.
بک‌اند فعلی یک اپ NestJS توسعه‌ای روی **پورت 3000** است که **CORS** فعال دارد، از **SQLite** استفاده می‌کند و `AuthGuard` آن فعلا همه درخواست‌ها را مجاز می‌کند.

---

## 2) پرسوناها و نقش‌ها

| نقش | `userType` در بک‌اند | مسیرهای اصلی کاربر |
|-----|----------------------|---------------------|
| **دانش‌آموز** | `student` | ورود → داشبورد → انتخاب درس → تایم‌لاین تکلیف → مشاهده جزئیات تکلیف → ضبط/ارسال صوت → مشاهده ارسال‌ها |
| **مدیر** | `admin` | ورود → داشبورد مدیریت → کاربران در انتظار تایید (تایید/رد) → CRUD دوره → CRUD تکلیف، سری روزانه، ضمیمه‌ها → آمار |

**ثبت‌نام:** کاربر دانش‌آموز خودش ثبت‌نام می‌کند و وضعیت حساب تا قبل از تایید مدیر، **`pending`** است.

---

## 3) وضعیت فعلی UI در Angular (Baseline از `frontend-angular/`)

این موارد هم‌اکنون پیاده‌سازی شده‌اند و به‌عنوان پایه PRD در نظر گرفته می‌شوند.

### 3.1 مسیرها (`app.routes.ts`)

- `/` → ریدایرکت به `/auth/login`
- `/auth/*` — مسیرهای lazy برای احراز هویت
- `/dashboard` — محافظت‌شده با `AuthGuard`
- `/admin/*` — محافظت‌شده با `AuthGuard` و `AdminGuard`
- مسیر ناشناخته → ریدایرکت به login

### 3.2 احراز هویت (`features/auth/`)

- **Login:** فرم reactive (نام کاربری/رمز)، فراخوانی `POST /auth/signin`، ریدایرکت نقش‌محور: مدیر به `/admin` و دانش‌آموز به `/dashboard`.
- **Register:** فرم ثبت‌نام با اعتبارسنجی، فراخوانی `POST /auth/signup`، نمایش پیام موفقیت و انتقال به login.

### 3.3 داشبورد دانش‌آموز (`features/dashboard/`)

- هدر، منوی کاربر و خروج.
- سایدبار لیست درس‌های فعال.
- نمایش اطلاعات درس انتخاب‌شده.
- تایم‌لاین افقی تکالیف (گذشته/امروز/آینده) و باز شدن مودال جزئیات تکلیف.
- ضبط صدا با `MediaRecorder`، پیش‌نمایش، ارسال با `FormData` (فیلد `audioFile`).
- نمایش لیست ارسال‌ها و امکان پخش فایل صوتی ارسالی.
- بخش نمودار پیشرفت فعلا placeholder است.

### 3.4 پنل مدیریت (`features/admin/`)

- داشبورد مدیریت: کارت‌های آماری، عملیات سریع، و فعالیت‌های اخیر (بخشی mock/ساده‌سازی‌شده).
- مدیریت کاربران: لیست کاربران pending، تایید/رد، فرم تکمیل اطلاعات دانش‌آموز و انتخاب دوره.
- مدیریت دوره‌ها و مدیریت تکالیف: فعلا placeholder و نیازمند تکمیل.

### 3.5 سرویس‌های هسته

- `AuthService` و `ApiService` فعلا base URL را روی `http://localhost:3000` دارند.
- `authInterceptor` در صورت وجود token، هدر `Authorization` می‌فرستد.

---

## 4) قرارداد API هدف در بک‌اند (Nest — `backend/src/`)

Base URL: **`http://localhost:3000`** (در آینده configurable با environment).

### 4.1 احراز هویت

| متد | مسیر | ورودی | خروجی موفق |
|-----|------|-------|------------|
| POST | `/auth/signin` | `username`, `password` | `{ message, username, imageUrl?, userType, studentId?, studentInfo? }` |
| POST | `/auth/signup` | multipart + اختیاری `userImage` | `{ message, status: 'pending' }` |

### 4.2 seeder

| متد | مسیر | خروجی |
|-----|------|-------|
| POST | `/seeder/seed` | `{ message }` یا `{ error, details }` |

### 4.3 دوره‌ها (`/courses`)

- `POST /courses`
- `GET /courses`
- `GET /courses/active`
- `GET /courses/:id`
- `GET /courses/:id/assignments`
- `POST /courses/:id/assignments`
- `PUT /courses/:id`
- `DELETE /courses/:id`

### 4.4 دانش‌آموز (`/students`)

- `POST /students`
- `GET /students`
- `POST /students/findByEmail_Phone`
- `GET /students/:id`
- `GET /students/me/profile` (موقتی/نیازمند JWT واقعی)
- `GET /students/:id/progress`
- `GET /students/:id/assignments/:assignmentId/progress`
- `GET /students/:id/submissions?assignmentId=...`
- `POST /students/:id/assignments/:assignmentId/submit` (multipart + `audioFile`)
- `POST /students/:id/submissions/:submissionId/upload`
- `PUT /students/:id`
- `DELETE /students/:id`

### 4.5 مدیریت (`/admin`)

**Course Management**
- `GET|POST /admin/courses`
- `GET|PUT|DELETE /admin/courses/:id`
- `GET /admin/courses/search?q=...`
- `GET /admin/courses/filter?status=...`

**Assignment Management**
- `GET /admin/courses/:courseId/assignments`
- `GET /admin/assignments/:id`
- `POST /admin/courses/:courseId/assignments`
- `PUT|DELETE /admin/assignments/:id`
- `POST /admin/courses/:courseId/assignments/daily-series`

**Attachment Management**
- `GET /admin/assignments/:assignmentId/attachments`
- `POST /admin/assignments/:assignmentId/attachments` (multipart)
- `POST /admin/attachments/:id/upload`
- `PUT|DELETE /admin/attachments/:id`

**Statistics**
- `GET /admin/statistics`
- `GET /admin/courses/:courseId/statistics`

**Users**
- `GET /admin/users/pending`
- `POST /admin/users/:userId/approve`
- `POST /admin/users/:userId/reject`

### 4.6 مدل داده‌های کلیدی

- **Course:** `courseCode`, `title`, `description`, `instructor`, `status`, ...
- **Assignment:** `title`, `description`, `type`, `maxScore`, `assignmentDate`, `instructions`, ...
- **AssignmentSubmission:** `dailyScore`, `cumulativeScore`, `status`, `audioFileUrl`, `feedback`, `isCompleted`, ...
- **AssignmentAttachment:** `kind`, `url`, `title`, `description`, ...

فایل‌های استاتیک از `/public` سرو می‌شوند و مسیرهایی مثل `/uploads/...` باید با origin API resolve شوند.

---

## 5) نیازمندی‌های عملکردی (Definition of Done)

1. استفاده از `environment.apiUrl` به‌جای hardcode کردن `localhost`.
2. نمایش پیام خطای واقعی بک‌اند در login/register (از جمله پیام‌های pending/rejected).
3. تکمیل داشبورد دانش‌آموز: درس‌ها، تکالیف، جزئیات، ارسال صوت، مشاهده ارسال‌ها.
4. تکمیل پنل مدیریت: کاربران pending + پیاده‌سازی واقعی مدیریت دوره و تکلیف.
5. هماهنگی آمار مدیریت با خروجی واقعی بک‌اند (یا اصلاح بک‌اند/مپر فرانت).
6. هم‌راستا کردن مدل‌های TypeScript با قرارداد واقعی API.
7. در صورت نیاز محصول، افزودن آپلود تصویر در ثبت‌نام.

---

## 5.1) گردش‌کار الزامی کاربر در تکلیف (Student User Actions)

این بخش رفتار دقیق UX برای تکمیل تکلیف صوتی را تعریف می‌کند.

### A) باز کردن تکلیف و آماده‌سازی

- دانش‌آموز از تایم‌لاین وارد جزئیات تکلیف می‌شود.
- اگر تکلیف فایل صوتی آموزشی دارد، اولین فایل قابل‌پخش به‌عنوان **صدای آموزشی اصلی** در نظر گرفته می‌شود.

### B) قانون الزام شنیدن (3 بار کامل)

- تا وقتی دانش‌آموز صدای آموزشی اصلی را **3 بار کامل** گوش نکرده، دکمه ضبط باید غیرفعال باشد.
- هر بار گوش‌دادن فقط وقتی شمرده می‌شود که پخش به انتها برسد (یا حداقل 95٪ پیشروی واقعی داشته باشد).
- پرش مستقیم به انتهای فایل (seek) بدون پخش معتبر نباید شمارنده را افزایش دهد.
- UI باید شمارنده شفاف نمایش دهد: `تعداد گوش‌دادن: X / 3`.
- پس از رسیدن به `3/3`، ضبط برای همان تکلیف فعال شود.

### C) ضبط و ارسال

- بعد از باز شدن قفل ضبط، کاربر می‌تواند شروع/توقف ضبط، پیش‌نمایش و ارسال انجام دهد.
- ارسال باید با `multipart/form-data` و فیلد `audioFile` انجام شود.
- هنگام ارسال، کلیک مجدد (duplicate submit) غیرفعال شود.
- پس از موفقیت:
  - پیام موفقیت نمایش داده شود،
  - وضعیت پیشرفت تکلیف و لیست ارسال‌ها refresh شود،
  - وضعیت unlock تکلیف حفظ شود.

### D) ماندگاری و قوانین بازنشانی

- شمارنده گوش‌دادن و وضعیت unlock باید برای هر `studentId + assignmentId` مستقل باشد.
- در حالت mock، این وضعیت باید بعد از refresh باقی بماند (ذخیره local قابل قبول است).
- تغییر تکلیف، شمارنده مستقل همان تکلیف را نمایش دهد.
- در صورت تغییر نسخه فایل آموزشی توسط مدیر، شمارنده قبلی باید قابل invalid شدن باشد (نیازمندی future-ready).

### E) خطاها و حالت‌های مرزی

- اگر تکلیف فایل صوتی آموزشی نداشت، قانون 3 بار گوش‌دادن bypass شود و ضبط فعال باشد (قابل تنظیم).
- در خطای پخش صوت، پیام قابل فهم + امکان تلاش مجدد نمایش داده شود.
- خطاهای شبکه/mock نباید باعث کرش صفحه شوند.

---

## 6) راهبرد سرویس ساختگی (Dummy/Mock) تا آماده شدن بک‌اند

هدف: UI بدون تغییر در کامپوننت‌ها، بین API واقعی و mock قابل جابه‌جایی باشد.

### 6.1 معماری پیشنهادی

- تعریف interface/abstraction مشترک برای عملیات API.
- دو پیاده‌سازی:
  - `HttpLessonPlannerApi` (واقعی با HttpClient)
  - `MockLessonPlannerApi` (in-memory + delay)
- انتخاب پیاده‌سازی از طریق `environment.useMockApi`.

### 6.2 رفتار mock برای auth

- اکانت‌های نمایشی (student/admin) با خروجی هم‌شکل API واقعی.
- ذخیره token نمایشی برای سازگاری با guard/interceptor.
- ثبت‌نام در mock، کاربر را pending کند.

### 6.3 داده‌های mock

- چند دوره active + تکالیف با تاریخ‌های گذشته/امروز/آینده.
- ضمیمه‌های متنوع.
- ارسال‌های نمونه برای دانش‌آموز.
- کاربران pending برای تست فرآیند تایید/رد.

### 6.4 آپلود در mock

- پذیرش `FormData` برای `audioFile` یا `file`.
- بازگشت URL قابل پخش/نمایش (fake URL).

### 6.5 چک‌لیست هم‌ریختی

- همه متدهای مورد استفاده UI باید در mock هم وجود داشته باشند.
- شکل پاسخ‌ها با API واقعی سازگار باشد.

### 6.6 پشتیبانی mock برای قانون 3 بار گوش‌دادن

- داده assignment باید شامل موارد زیر باشد:
  - `requiredListenCount` (پیش‌فرض 3)
  - `currentListenCount`
  - `isRecordingUnlocked`
  - اختیاری: `instructionAudioVersion`
- رویداد «تکمیل گوش‌دادن» باید:
  - شمارنده را افزایش دهد،
  - در رسیدن به حد آستانه، `isRecordingUnlocked` را true کند.
- وضعیت per-user/per-assignment در mock پایدار بماند.
- در صورت قفل بودن ضبط، submit باید خطای معتبر برگرداند (مگر حالت bypass بدون فایل آموزشی).

---

## 7) نیازمندی‌های غیرعملکردی

- **CORS:** برای API واقعی فعال باشد.
- **RTL/فارسی:** سازگاری کامل متون و چیدمان.
- **مدیریت خطا:** نمایش پیام مناسب از `error.error.message`.
- **امنیت:** تا قبل از JWT واقعی، توکن فرانت امنیت واقعی ایجاد نمی‌کند.

---

## 8) فازبندی تحویل

| فاز | خروجی |
|-----|-------|
| **P0** | environment + mock provider + مسیرهای اصلی auth/student/admin users |
| **P1** | تکمیل مدیریت دوره (CRUD + search/filter) |
| **P2** | تکمیل مدیریت تکلیف (CRUD + daily series + attachment) |
| **P3** | نمودار پیشرفت + بهبود فعالیت‌های اخیر + آماده‌سازی JWT |

---

## 9) معیارهای پذیرش

- در حالت `useMockApi: true`، مسیرهای اصلی دانش‌آموز و مدیر بدون اجرای Nest قابل تست باشند.
- در حالت `useMockApi: false`، همان UI به API واقعی متصل شود بدون تغییر کامپوننت‌ها.
- URLهای نسبی فایل‌ها به‌درستی resolve شوند.
- مدل‌های فرانت با قرارداد API هم‌راستا باشند (یا mapping روشن داشته باشند).
- اگر تعداد گوش‌دادن کمتر از 3 باشد، دکمه ضبط غیرفعال باشد.
- با رسیدن به گوش‌دادن سوم، دکمه ضبط بلافاصله فعال شود.
- وضعیت شمارنده و unlock در mock بعد از refresh همچنان درست باشد.
- شمارنده هر تکلیف مستقل از تکلیف‌های دیگر باشد.

---

## پیوست: فایل‌های مرجع

- بک‌اند: `backend/src/controllers/*.ts` و `backend/src/main.ts`
- فرانت‌اند: `frontend-angular/src/app/app.routes.ts`، `core/services/api.service.ts`، `core/services/auth.service.ts` و کامپوننت‌های features
# Product Requirements Document — Lesson Planner (Angular frontend)

## 1. Purpose and scope

Build and complete the **Angular** client for a **lesson / daily-assignment planner**: students see courses and a **timeline of assignments**, record or upload work, and view submissions; admins **approve registrations**, manage **courses**, **assignments**, **attachments**, and view **statistics**.

**Out of scope for this PRD:** production auth (JWT), payment, email. The backend today is a **development NestJS app** on **port 3000** with **CORS enabled**, **SQLite**, and an `AuthGuard` that **allows all requests** (no real token validation).

---

## 2. Personas and roles

| Role | Backend `userType` | Primary journeys |
|------|-------------------|------------------|
| **Student** | `student` | Login → dashboard → pick course → timeline → assignment detail → record/upload submission → list submissions |
| **Admin** | `admin` | Login → admin dashboard → pending users (approve/reject) → course CRUD → assignment CRUD, daily series, attachments → statistics |

**Registration:** students self-register; account is **`pending`** until admin approves (backend messages in Persian for pending/rejected sign-in).

---

## 3. Current Angular UI (baseline from `frontend-angular/`)

This is what already exists; the PRD treats it as **MVP shell + partial features**.

### 3.1 Routing (`app.routes.ts`)

- `/` → `/auth/login`
- `/auth/*` — lazy auth routes
- `/dashboard` — **AuthGuard** (student dashboard)
- `/admin/*` — **AuthGuard + AdminGuard**
- wildcard → login

### 3.2 Auth feature (`features/auth/`)

- **Login:** reactive form (username, password); POST `auth/signin`; redirect **admin → `/admin`**, **student → `/dashboard`**; Persian validation/errors.
- **Register:** name, username, email, Iranian mobile pattern `09xxxxxxxxx`, password + confirm; POST `auth/signup`; success message + redirect to login after delay.

### 3.3 Student dashboard (`features/dashboard/`)

- **Header:** logo, user dropdown (profile modal, logout).
- **Sidebar:** active courses as buttons.
- **Main:** course title/description/instructor; **horizontal assignment timeline** (past/today/future styling); click opens **Bootstrap modal** with assignment details, attachments, progress, feedback, “start recording”.
- **Audio:** `MediaRecorder`, preview, **submit via `FormData`** (`audioFile` + extra fields).
- **Submissions:** grid of cards (date, daily score, status, notes, play audio — URL prefixed with `http://localhost:3000` when relative).
- **Chart area:** placeholder text (“در حال توسعه”).

### 3.4 Admin feature (`features/admin/`)

- **Shared chrome:** header + sidebar (dashboard, users, courses, assignments).
- **Admin dashboard:** stat cards (**expects** `totalUsers`, `approvedUsers`, `pendingUsers`, `totalCourses` — **does not match** current `GET /admin/statistics` response; see §6), quick actions, **recent activity** currently **hardcoded** after timeout.
- **User management:** list **pending users** from API; approve (with form: student fields + course enrollment) / reject; **note:** list items use `user.firstName` / `email` on **User** — backend `User` entity may not expose those until modeled; align with real API or map in frontend.
- **Course management / Assignment management:** **placeholders only** (“در حال توسعه”).

### 3.5 Core services

- `AuthService`: `API_BASE = http://localhost:3000`, stores **`dummy-token`** + mapped `User` in `localStorage` (no JWT from server today).
- `ApiService`: same base URL; student + admin methods as implemented.
- `authInterceptor`: sends `Authorization: Bearer <token>` if present (backend ignores for now).

---

## 4. Target backend API contract (Nest — `backend/src/`)

Base URL: **`http://localhost:3000`** (configurable per environment).

### 4.1 Auth (no guard)

| Method | Path | Body / notes | Success response (shape) |
|--------|------|----------------|---------------------------|
| POST | `/auth/signin` | JSON: `username`, `password` | `{ message, username, imageUrl?, userType, studentId?, studentInfo? }` or errors for pending/rejected |
| POST | `/auth/signup` | Multipart: fields + optional file `userImage` | `{ message, status: 'pending' }` |

### 4.2 Seeder (no guard)

| POST | `/seeder/seed` | — | `{ message }` or `{ error, details }` |

### 4.3 Courses (`@UseGuards(AuthGuard)` — currently permissive)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/courses` | Create course |
| GET | `/courses` | List all |
| GET | `/courses/active` | Active courses |
| GET | `/courses/:id` | Course by id |
| GET | `/courses/:id/assignments` | Assignments for course |
| POST | `/courses/:id/assignments` | Create assignment |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |

### 4.4 Students

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/students` | Create student |
| GET | `/students` | List |
| POST | `/students/findByEmail_Phone` | Lookup by email + phone |
| GET | `/students/:id` | Student detail |
| GET | `/students/me/profile` | **Placeholder:** expects `username` in body (should become JWT-derived) |
| GET | `/students/:id/progress` | Returns `{ student, courses: studentCourses[], submissions[] }` |
| GET | `/students/:id/assignments/:assignmentId/progress` | Per-assignment progress |
| GET | `/students/:id/submissions` | Optional `?assignmentId=` |
| POST | `/students/:id/assignments/:assignmentId/submit` | Multipart: `audioFile` + body fields |
| POST | `/students/:id/submissions/:submissionId/upload` | Upload file for existing submission |
| PUT/DELETE | `/students/:id` | Update / delete |

### 4.5 Admin (same guard)

**Courses:** `GET|POST /admin/courses`, `GET|PUT|DELETE /admin/courses/:id`, search `GET /admin/courses/search?q=`, filter `GET /admin/courses/filter?status=`.

**Assignments:**  
`GET /admin/courses/:courseId/assignments`,  
`GET /admin/assignments/:id`,  
`POST /admin/courses/:courseId/assignments`,  
`PUT|DELETE /admin/assignments/:id`,  
`POST /admin/courses/:courseId/assignments/daily-series` (body: `startDate`, `days`, optional prefixes, `type`, `maxScore`, `instructions`).

**Attachments:**  
`GET /admin/assignments/:assignmentId/attachments`,  
`POST` (multipart `file`),  
`POST /admin/attachments/:id/upload`,  
`PUT|DELETE /admin/attachments/:id`.

**Statistics:**  
`GET /admin/statistics` → `{ totalCourses, totalAssignments, totalAttachments, activeCourses }`  
`GET /admin/courses/:courseId/statistics` → course + assignment/attachment counts.

**Users:**  
`GET /admin/users/pending`,  
`POST /admin/users/:userId/approve` (body: `firstName`, `lastName`, `email`, `phoneNumber`, `studentId`, `courseIds[]`),  
`POST /admin/users/:userId/reject`.

### 4.6 Domain model highlights (for TypeScript types)

- **Course:** `title`, `description`, `courseCode`, `credits`, `instructor`, `status`, `startDate`, `endDate`, `maxStudents`, timestamps.
- **Assignment:** `title`, `description`, `type`, `maxScore`, `assignmentDate`, `status`, `instructions`, `courseId`, `attachments[]`, …
- **AssignmentSubmission:** `submissionDate`, `dailyScore`, `cumulativeScore`, `status` (`pending` | `submitted` | `graded` | `late` per entity), `feedback`, `audioFileUrl`, `documentUrl`, `notes`, `isCompleted`, `timeSpent`, …
- **AssignmentAttachment:** `title`, `description`, `kind` (`audio` | `image` | `document` | `text` | `other` from upload helper), `url`, `displayOrder`, …

Static files: server serves `/public`; upload paths like `/uploads/...` → full URL **`{API_ORIGIN}{path}`**.

---

## 5. Functional requirements (what “done” means for the Angular app)

1. **Environment-based API URL** — no hardcoded `localhost` in services; use `environment.apiUrl` (and optional `environment.apiPublicUrl` for media if ever different).
2. **Auth UX** — show backend error messages (including Persian pending/rejected). After login, **role-based redirect** as today.
3. **Student dashboard** — load active courses and assignments; timeline + modal; submissions list; multipart submit consistent with backend field name **`audioFile`**.
4. **Admin** — pending users + approve/reject wired to API; **implement** course and assignment management UIs (currently stubs) per §4.5.
5. **Admin statistics** — either **extend backend** to return `totalUsers`, `approvedUsers`, `pendingUsers` or **adapt the dashboard** to the existing `getSystemStatistics()` shape (and optionally derive pending count from `GET /admin/users/pending`).
6. **Models** — align `Course.code` vs backend `courseCode`; align submission `status` union with backend; align `StudentProgress` with actual `/students/:id/progress` payload or add a mapper.
7. **Optional profile image on register** — if product needs parity with Nest `userImage`, add file input and `FormData` signup.

---

## 5.1 Student assignment user-action workflow (required)

This section defines required UX behavior for completing an assignment with audio, including the listening gate before recording.

### A) Assignment open and media readiness

- Student opens assignment details from timeline.
- UI shows assignment metadata, attachments, and progress state.
- If an assignment has at least one audio attachment, the first playable audio is treated as the **primary instruction audio** for gating.

### B) Listening gate (3 complete listens)

- Recording is locked until the student completes **3 full listens** of the primary instruction audio.
- A “listen” is counted only when playback reaches completion (or >= 95% progress to avoid browser edge cases).
- Seek/skip to end must not increment listen count unless actual elapsed playback satisfies completion threshold.
- UI displays counter: `Listened X / 3 times`.
- Record button remains disabled while `X < 3`.
- When `X = 3`, recording controls become enabled immediately for that assignment.

### C) Recording and submission

- After unlock, student can start/stop recording, preview audio, and submit.
- Submit request must include assignment context and recorded file (`audioFile`) as multipart.
- Prevent duplicate submit while request is in flight.
- On submit success:
  - show success feedback,
  - refresh assignment progress and submissions list,
  - keep listen count and unlock status for the assignment.

### D) Persistence and reset rules

- Listen count and unlock state are tracked per `studentId + assignmentId`.
- State persists across page reloads in mock mode (local persistence acceptable).
- Switching to another assignment uses that assignment’s own counter.
- Admin/content update to instruction audio should invalidate prior listens for that assignment version (future-ready requirement; can be implemented via content hash/version field).

### E) Edge/error behavior

- If no playable instruction audio exists, recording gate is bypassed and record is enabled by default (configurable policy).
- If audio playback fails, user gets actionable message and retry option.
- Offline/mock errors should not crash the page; keep current counter state.

---

## 6. Dummy / mock API strategy (required until backend is ready)

**Goal:** Same components and guards work; swap implementation by configuration.

### 6.1 Recommended architecture

- Define a **`LessonPlannerApi`** interface (or abstract class) mirroring `ApiService` methods + auth endpoints.
- Provide:
  - **`HttpLessonPlannerApi`** — current `HttpClient` implementation.
  - **`MockLessonPlannerApi`** — in-memory store + `Observable` delays (`delay(300)`), `of()` / `throwError()` for errors.
- Register with Angular **`InjectionToken`** + `useFactory` reading `environment.useMockApi`.

### 6.2 Mock auth behavior

- **`signin`:** accept fixed demo accounts, e.g. `admin` / `student` passwords, return objects **identical in shape** to real `auth/signin` (including `userType`, `studentId`, `studentInfo` for student).
- Store the same **`dummy-token`** (or a fake JWT string) so `authInterceptor` and guards behave like production.
- **`signup`:** append to in-memory pending list; return `{ message, status: 'pending' }`.

### 6.3 Mock data

- Seed 2–3 **courses** (some `active`), each with **assignments** spanning past/today/future dates (for timeline colors).
- Seed **attachments** on some assignments (mixed `kind`).
- Seed **submissions** for the demo student; support **POST submit** by appending to store and returning a saved entity.
- For admin: seed **pending users**; **approve** creates student + enrollments in mock store; **reject** updates status.

### 6.4 File uploads in mock mode

- Accept `FormData` in mock: read `audioFile` / `file` as `Blob`, respond with a **fake URL** (e.g. `blob:` or `https://via.placeholder.com/audio` or store as data URL in memory for playback in dev only).
- Student “play audio” should use the same URL resolution rule as real API (`absolute` vs `apiOrigin + path`).

### 6.5 Parity checklist

Every method called from `ApiService` / `AuthService` must exist on the mock with **compatible JSON shapes** so components do not branch on `useMockApi`.

### 6.6 Mock support for listen-gate workflow

- Mock assignment detail should expose fields needed by UI:
  - `requiredListenCount` (default `3`)
  - `currentListenCount`
  - `isRecordingUnlocked`
  - optional `instructionAudioVersion`
- Add mock action to register completed listen event per assignment:
  - increments `currentListenCount` when playback completion criteria are met,
  - sets `isRecordingUnlocked = true` when count reaches required threshold.
- Persist listen state per `studentId + assignmentId` (in-memory + localStorage sync for reload resilience in development).
- Submission mock must reject recording submit if `isRecordingUnlocked` is `false` (unless no-audio policy bypass applies).

---

## 7. Non-functional requirements

- **CORS:** real API already enables CORS; mock can run in-process (no CORS issue).
- **RTL / Persian UI:** keep existing copy and layout patterns (Bootstrap, Vazirmatn where used).
- **Errors:** centralized handling (optional): toast or banner for HTTP errors; surface `error.error.message` from Nest `BadRequestException`.
- **Security note:** document that **AuthGuard** on the server is a stub; frontend must not rely on Bearer token for real protection until backend implements JWT.

---

## 8. Delivery phases (suggested)

| Phase | Outcome |
|-------|---------|
| **P0** | Environments + mock provider; login/register/student dashboard + admin users fully usable offline |
| **P1** | Admin course CRUD + list/search/filter UI; wire `ApiService` methods already present |
| **P2** | Admin assignments: CRUD, daily series, attachments upload/list |
| **P3** | Progress chart; real activity feed or remove placeholder; optional JWT when backend ready |

---

## 9. Acceptance criteria (sample)

- With **`useMockApi: true`**, a developer can complete **full student and admin happy paths** without Nest running.
- With **`useMockApi: false`**, the same flows hit `environment.apiUrl` with no code changes in components (only DI).
- All relative media URLs from the API resolve consistently for playback/download.
- TypeScript models reflect backend fields or explicit mappers are documented and used in one place.
- Given a student opens an assignment with instruction audio and has listened fewer than 3 completed times, the record button is disabled.
- Given the same student completes the 3rd listen, record button becomes enabled without refresh.
- Given refresh/re-login in mock mode, listen count and unlock state remain correct per assignment.
- Given another assignment is opened, listen count is independent and does not leak from previous assignment.

---

## Appendix: files to treat as source of truth

- Backend routes: `backend/src/controllers/*.ts`, `main.ts` (port 3000, validation pipe, static `/public`).
- Frontend entry points: `frontend-angular/src/app/app.routes.ts`, `core/services/api.service.ts`, `core/services/auth.service.ts`, feature components under `features/`.
