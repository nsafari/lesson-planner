# Lesson Planner API Documentation

## Base URL
`http://localhost:3000`

## Authentication
All endpoints (except auth) require authentication. Include the auth token in the request headers:
```
Authorization: Bearer <token>
```

## Endpoints

### Admin Management - جدید
**پیشوند: `/admin`** (نیاز به احراز هویت)

#### مدیریت دوره‌ها
- `GET /admin/courses` - دریافت همه دوره‌ها با جزئیات کامل
- `GET /admin/courses/:id` - دریافت دوره با شناسه و تمام جزئیات
- `POST /admin/courses` - ایجاد دوره جدید
- `PUT /admin/courses/:id` - به‌روزرسانی دوره
- `DELETE /admin/courses/:id` - حذف دوره

#### مدیریت تکالیف
- `GET /admin/courses/:courseId/assignments` - دریافت همه تکالیف یک دوره
- `GET /admin/assignments/:id` - دریافت تکلیف خاص با ضمیمه‌ها
- `POST /admin/courses/:courseId/assignments` - ایجاد تکلیف جدید برای دوره
- `PUT /admin/assignments/:id` - به‌روزرسانی تکلیف
- `DELETE /admin/assignments/:id` - حذف تکلیف
- `POST /admin/courses/:courseId/assignments/daily-series` - ایجاد سری تکالیف روزانه

#### مدیریت ضمیمه‌ها
- `GET /admin/assignments/:assignmentId/attachments` - دریافت همه ضمیمه‌های یک تکلیف
- `POST /admin/assignments/:assignmentId/attachments` - ایجاد ضمیمه جدید برای تکلیف (با فایل)
- `POST /admin/attachments/:id/upload` - آپلود فایل برای ضمیمه موجود
- `PUT /admin/attachments/:id` - به‌روزرسانی ضمیمه
- `DELETE /admin/attachments/:id` - حذف ضمیمه

#### مدیریت کاربران
- `GET /admin/users/pending` - دریافت کاربران در انتظار تایید
- `POST /admin/users/:userId/approve` - تایید کاربر و ایجاد دانش‌آموز
  - Body:
    ```json
    {
      "firstName": "نام",
      "lastName": "نام خانوادگی",
      "email": "user@example.com",
      "phoneNumber": "09123456789",
      "studentId": "ST004",
      "courseIds": [1, 2]
    }
    ```
- `POST /admin/users/:userId/reject` - رد کردن کاربر

#### گزارش‌گیری
- `GET /admin/statistics` - دریافت آمار کلی سیستم
- `GET /admin/courses/:courseId/statistics` - دریافت گزارش دوره خاص
- `GET /admin/courses/search?q=query` - جستجوی دوره‌ها
- `GET /admin/courses/filter?status=active` - فیلتر دوره‌ها بر اساس وضعیت

### Authentication
- `POST /auth/login` - Login with username and password
  - Returns user type ('student' or 'admin') and student info if applicable
  - Checks approval status (pending/rejected users cannot login)
  - Example response for student:
    ```json
    {
      "message": "Sign-in successful",
      "username": "ali.ahmadi",
      "imageUrl": null,
      "userType": "student",
      "studentId": 1,
      "studentInfo": {
        "firstName": "علی",
        "lastName": "احمدی",
        "email": "ali.ahmadi@example.com",
        "studentId": "ST001"
      }
    }
    ```
- `POST /auth/register` - Register new user (requires approval)
  - Body:
    ```json
    {
      "username": "newuser",
      "password": "password123",
      "retryPassword": "password123",
      "firstName": "نام",
      "lastName": "نام خانوادگی",
      "email": "user@example.com",
      "phoneNumber": "09123456789"
    }
    ```
  - Response:
    ```json
    {
      "message": "ثبت نام با موفقیت انجام شد. در انتظار تایید مدیر سیستم هستید.",
      "status": "pending"
    }
    ```

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `GET /students/me/profile` - Get current student profile (based on auth token)
- `GET /students/:id/progress` - Get student progress (courses + submissions)
- `GET /students/:id/assignments/:assignmentId/progress` - Get progress for a specific (daily) assignment
- `GET /students/:id/submissions?assignmentId=1` - List submissions (optional filter by assignment)
- `POST /students/:id/assignments/:assignmentId/submit` - Submit daily work (with file upload)
- `POST /students/:id/submissions/:submissionId/upload` - Upload file for existing submission

### Courses
- `GET /courses` - Get all courses
- `GET /courses/active` - Get active courses
- `GET /courses/:id` - Get course by ID
- `GET /courses/:id/assignments` - Get course assignments (daily), ordered by assignmentDate, includes attachments
- `POST /courses/:id/assignments` - Create a daily assignment
- `POST /courses/:id/assignments/daily-series` - Create a daily assignment series (e.g., 12 days)
  - Body:
  ```json
  {
    "startDate": "2024-09-01",
    "days": 12,
    "titlePrefix": "تکلیف روز",
    "descriptionPrefix": "شرح تکلیف روز",
    "type": "homework",
    "maxScore": 100,
    "instructions": "طبق دستورالعمل انجام دهید"
  }
  ```

### Assignments (Daily)
- Each assignment is for exactly one day: uses `assignmentDate`
- Assignments can have multiple attachments (audio/doc/link)
- Scores are typically evaluated in cycles (e.g., every 12 days collection)

#### Attachments
- Attachments are included when fetching assignments and submissions via relations
- Attachment fields:
  - `title`, `description`, `kind` (audio|document|link|other), `url`, `displayOrder`

## Database Schema (Updated)

### Assignments Table (Daily)
- `id` (PK)
- `title`, `description`, `type`, `maxScore`
- `assignmentDate` (Date for that day)
- `status`, `instructions`
- `courseId` (FK)
- `createdAt`, `updatedAt`

### Assignment Attachments Table
- `id` (PK)
- `title` (nullable), `description` (nullable)
- `kind` (audio|document|link|other)
- `url`
- `displayOrder`
- `assignmentId` (FK)
- `createdAt`, `updatedAt`

### Assignment Submissions Table (Daily)
- Same as before; submissions happen for a single day

## Notes on Scoring Cycles
- Although each assignment is daily, courses can define series (e.g., 12 consecutive days).
- You can compute aggregated scores per 12-day window by summing `cumulativeScore` of submissions across that window. 