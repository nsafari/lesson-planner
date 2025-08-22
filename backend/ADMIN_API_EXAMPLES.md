# راهنمای استفاده از API مدیریت (Admin)

این فایل شامل مثال‌های عملی برای استفاده از نقاط انتهایی مدیریت سیستم است.

## پیش‌نیازها
- احراز هویت با توکن (همان توکن کاربری)
- آدرس پایه: `http://localhost:3000/admin`

## مثال‌های عملی

### 1. ایجاد دوره جدید

```bash
curl -X POST http://localhost:3000/admin/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "قرآن کریم - جلد اول",
    "description": "آموزش تلاوت و حفظ قرآن کریم",
    "courseCode": "QURAN-101",
    "credits": 3,
    "instructor": "استاد احمدی",
    "status": "active",
    "startDate": "2024-09-01",
    "endDate": "2024-12-31",
    "maxStudents": 20
  }'
```

### 2. ایجاد تکلیف روزانه برای دوره

```bash
curl -X POST http://localhost:3000/admin/courses/1/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "تکلیف روز اول قرآن",
    "description": "گوش دادن به سوره حمد و ضبط تلاوت",
    "type": "homework",
    "maxScore": 100,
    "assignmentDate": "2024-09-01",
    "status": "active",
    "instructions": "سوره حمد را 3 بار گوش دهید، سپس خودتان تلاوت کنید و ضبط ارسال کنید"
  }'
```

### 3. ایجاد سری تکالیف روزانه (12 روز)

```bash
curl -X POST http://localhost:3000/admin/courses/1/assignments/daily-series \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-09-01",
    "days": 12,
    "titlePrefix": "تکلیف روز",
    "descriptionPrefix": "تلاوت و حفظ",
    "type": "homework",
    "maxScore": 100,
    "instructions": "طبق دستورالعمل روزانه، تلاوت کنید و ضبط ارسال کنید"
  }'
```

### 4. اضافه کردن ضمیمه صوتی به تکلیف (با آپلود فایل)

```bash
curl -X POST http://localhost:3000/admin/assignments/1/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=فایل صوتی راهنما" \
  -F "description=تلاوت استاد برای روز اول" \
  -F "displayOrder=1" \
  -F "file=@/path/to/audio/surah-fatiha.mp3"
```

### 4.1. اضافه کردن ضمیمه با URL خارجی

```bash
curl -X POST http://localhost:3000/admin/assignments/1/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "فایل صوتی راهنما",
    "description": "تلاوت استاد برای روز اول",
    "kind": "audio",
    "url": "https://example.com/audio/surah-fatiha.mp3",
    "displayOrder": 1
  }'
```

### 5. اضافه کردن ضمیمه مستندات (با آپلود فایل)

```bash
curl -X POST http://localhost:3000/admin/assignments/1/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=راهنمای تلاوت" \
  -F "description=PDF راهنمای نحوه تلاوت صحیح" \
  -F "displayOrder=2" \
  -F "file=@/path/to/docs/tajweed-guide.pdf"
```

### 5.1. آپلود فایل برای ضمیمه موجود

```bash
curl -X POST http://localhost:3000/admin/attachments/1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/new-audio-file.mp3"
```

### 5.2. اضافه کردن ضمیمه با URL خارجی

```bash
curl -X POST http://localhost:3000/admin/assignments/1/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "راهنمای تلاوت",
    "description": "PDF راهنمای نحوه تلاوت صحیح",
    "kind": "document",
    "url": "https://example.com/docs/tajweed-guide.pdf",
    "displayOrder": 2
  }'
```

### 6. دریافت آمار کلی سیستم

```bash
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**پاسخ نمونه:**
```json
{
  "totalCourses": 2,
  "totalAssignments": 24,
  "totalAttachments": 8,
  "activeCourses": 2
}
```

### 7. دریافت گزارش دوره خاص

```bash
curl -X GET http://localhost:3000/admin/courses/1/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**پاسخ نمونه:**
```json
{
  "course": {
    "id": 1,
    "title": "قرآن کریم - جلد اول",
    "description": "آموزش تلاوت و حفظ قرآن کریم",
    "status": "active"
  },
  "totalAssignments": 12,
  "totalAttachments": 4,
  "assignmentsWithAttachments": 3
}
```

### 8. جستجوی دوره‌ها

```bash
curl -X GET "http://localhost:3000/admin/courses/search?q=قرآن" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9. فیلتر دوره‌های فعال

```bash
curl -X GET "http://localhost:3000/admin/courses/filter?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. به‌روزرسانی دوره

```bash
curl -X PUT http://localhost:3000/admin/courses/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "قرآن کریم - جلد اول (به‌روزرسانی شده)",
    "maxStudents": 25
  }'
```

### 11. به‌روزرسانی تکلیف

```bash
curl -X PUT http://localhost:3000/admin/assignments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "تکلیف روز اول قرآن (به‌روزرسانی شده)",
    "maxScore": 120,
    "instructions": "دستورالعمل جدید: سوره حمد را 5 بار گوش دهید"
  }'
```

### 12. حذف ضمیمه

```bash
curl -X DELETE http://localhost:3000/admin/attachments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## نکات مهم

1. **احراز هویت**: تمام درخواست‌ها نیاز به توکن معتبر دارند
2. **تاریخ‌ها**: از فرمت ISO 8601 استفاده کنید (مثل `2024-09-01`)
3. **وضعیت‌ها**: مقادیر مجاز: `active`, `inactive`, `completed`
4. **نوع ضمیمه‌ها**: `audio`, `document`, `image`, `text`, `other`
5. **ترتیب نمایش**: `displayOrder` برای مرتب‌سازی ضمیمه‌ها

## محدودیت‌های آپلود فایل

### فایل‌های مجاز:
- **صوتی**: MP3, WAV, OGG (audio/mpeg, audio/wav, audio/mp3, audio/ogg)
- **مستندات**: PDF, DOC, DOCX (application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- **تصاویر**: JPEG, PNG, GIF (image/jpeg, image/png, image/gif)
- **متنی**: TXT (text/plain)

### محدودیت‌ها:
- **حجم فایل**: حداکثر 10 مگابایت
- **مسیر ذخیره**: `public/uploads/attachments/`
- **نام فایل**: به‌صورت خودکار تولید می‌شود (hash + extension)

## خطاهای رایج

- **401 Unauthorized**: توکن نامعتبر یا منقضی شده
- **404 Not Found**: شناسه مورد نظر یافت نشد
- **400 Bad Request**: داده‌های ارسالی نامعتبر
- **500 Internal Server Error**: خطای سرور

## تست با Postman

برای تست راحت‌تر، می‌توانید از Postman استفاده کنید:
1. یک Collection جدید ایجاد کنید
2. متغیر `baseUrl` را به `http://localhost:3000` تنظیم کنید
3. متغیر `token` را به توکن احراز هویت تنظیم کنید
4. در Headers همه درخواست‌ها: `Authorization: Bearer {{token}}` اضافه کنید 