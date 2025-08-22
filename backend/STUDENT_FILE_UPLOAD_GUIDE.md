# راهنمای آپلود فایل برای دانش‌آموزان

این فایل شامل مثال‌های عملی برای آپلود فایل توسط دانش‌آموزان هنگام تکمیل تکالیف روزانه است.

## پیش‌نیازها
- احراز هویت با توکن دانش‌آموز
- آدرس پایه: `http://localhost:3000/students`

## مثال‌های عملی

### 1. ارسال کار روزانه با فایل صوتی

```bash
curl -X POST http://localhost:3000/students/1/assignments/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "dailyScore=85" \
  -F "notes=تلاوت سوره حمد انجام شد" \
  -F "isCompleted=true" \
  -F "timeSpent=30" \
  -F "audioFile=@/path/to/student-recording.mp3"
```

### 2. ارسال کار روزانه بدون فایل

```bash
curl -X POST http://localhost:3000/students/1/assignments/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dailyScore": 90,
    "notes": "تکلیف روزانه تکمیل شد",
    "isCompleted": true,
    "timeSpent": 25
  }'
```

### 3. آپلود فایل برای ارسال موجود

```bash
curl -X POST http://localhost:3000/students/1/submissions/5/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audioFile=@/path/to/new-recording.mp3"
```

### 4. ارسال با فایل مستندات

```bash
curl -X POST http://localhost:3000/students/1/assignments/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "dailyScore=95" \
  -F "notes=تکلیف با مستندات تکمیل شد" \
  -F "isCompleted=true" \
  -F "timeSpent=45" \
  -F "audioFile=@/path/to/written-assignment.pdf"
```

## فیلدهای ارسال

### فیلدهای اجباری:
- `dailyScore`: نمره روزانه (عدد)
- `isCompleted`: وضعیت تکمیل (boolean)

### فیلدهای اختیاری:
- `notes`: یادداشت‌های دانش‌آموز (string)
- `timeSpent`: زمان صرف شده (دقیقه) (number)
- `audioFile`: فایل آپلود شده (file)

## محدودیت‌های آپلود فایل

### فایل‌های مجاز:
- **صوتی**: MP3, WAV, OGG (audio/mpeg, audio/wav, audio/mp3, audio/ogg)
- **مستندات**: PDF, DOC, DOCX (application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- **تصاویر**: JPEG, PNG, GIF (image/jpeg, image/png, image/gif)
- **متنی**: TXT (text/plain)

### محدودیت‌ها:
- **حجم فایل**: حداکثر 10 مگابایت
- **مسیر ذخیره**: `public/uploads/submissions/`
- **نام فایل**: به‌صورت خودکار تولید می‌شود (hash + extension)

## پاسخ‌های API

### ارسال موفق:
```json
{
  "id": 15,
  "studentId": 1,
  "assignmentId": 1,
  "submissionDate": "2024-09-01T00:00:00.000Z",
  "dailyScore": 85,
  "cumulativeScore": 85,
  "status": "submitted",
  "notes": "تلاوت سوره حمد انجام شد",
  "audioFileUrl": "/uploads/submissions/a1b2c3d4e5f6.mp3",
  "isCompleted": true,
  "timeSpent": 30,
  "createdAt": "2024-09-01T10:30:00.000Z",
  "updatedAt": "2024-09-01T10:30:00.000Z"
}
```

### خطاهای رایج:
- **400 Bad Request**: فایل نامعتبر یا داده‌های ناقص
- **401 Unauthorized**: توکن نامعتبر
- **404 Not Found**: دانش‌آموز یا تکلیف یافت نشد

## مثال‌های JavaScript (Frontend)

### آپلود فایل با FormData:
```javascript
async function submitAssignmentWithFile(studentId, assignmentId, formData) {
  const response = await fetch(`/students/${studentId}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
}

// استفاده:
const formData = new FormData();
formData.append('dailyScore', '85');
formData.append('notes', 'تکلیف تکمیل شد');
formData.append('isCompleted', 'true');
formData.append('timeSpent', '30');
formData.append('audioFile', fileInput.files[0]);

const result = await submitAssignmentWithFile(1, 1, formData);
```

### آپلود فایل برای ارسال موجود:
```javascript
async function uploadFileForSubmission(studentId, submissionId, file) {
  const formData = new FormData();
  formData.append('audioFile', file);
  
  const response = await fetch(`/students/${studentId}/submissions/${submissionId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
}
```

## نکات مهم

1. **احراز هویت**: تمام درخواست‌ها نیاز به توکن معتبر دارند
2. **نوع فایل**: فقط فایل‌های مجاز قابل آپلود هستند
3. **حجم فایل**: حداکثر 10 مگابایت
4. **نام فایل**: به‌صورت خودکار تولید می‌شود
5. **مسیر فایل**: فایل‌ها در `public/uploads/submissions/` ذخیره می‌شوند
6. **دسترسی**: فایل‌ها از طریق URL `/uploads/submissions/filename` قابل دسترسی هستند

## تست با Postman

1. یک Collection جدید ایجاد کنید
2. متغیر `baseUrl` را به `http://localhost:3000` تنظیم کنید
3. متغیر `token` را به توکن احراز هویت تنظیم کنید
4. در Headers: `Authorization: Bearer {{token}}` اضافه کنید
5. برای آپلود فایل، از `form-data` استفاده کنید و فیلد `audioFile` را از نوع `File` انتخاب کنید 