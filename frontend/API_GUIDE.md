# راهنمای API پنل مدیریت دانش آموزان

## مقدمه
این راهنما شامل تمام endpoint های مورد نیاز برای ارتباط با سرور است.

## تنظیمات پایه
```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api', // تغییر به آدرس سرور واقعی
    HEADERS: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
};
```

## Endpoint ها

### 1. دریافت لیست دانش آموزان
```http
GET /api/students
```

**پاسخ موفق:**
```json
[
    {
        "id": 1,
        "fullName": "علی احمدی",
        "phone": "09123456789",
        "landline": "02112345678",
        "fatherName": "محمد احمدی",
        "motherName": "فاطمه محمدی",
        "birthDate": "1380/03/15",
        "age": 23,
        "nationalCode": "1234567890",
        "aboutMe": "توانمندی ها، ویژگی های اخلاقی، هدف از ورود به نهضت",
        "status": "approved",
        "isBest": false
    }
]
```

### 2. افزودن دانش آموز جدید
```http
POST /api/students
```

**بدنه درخواست:**
```json
{
    "fullName": "نام و نام خانوادگی",
    "phone": "شماره تماس",
    "landline": "شماره تلفن ثابت",
    "fatherName": "نام پدر",
    "motherName": "نام مادر",
    "birthDate": "تاریخ تولد",
    "age": 23,
    "nationalCode": "کد ملی",
    "aboutMe": "درباره من",
    "status": "pending",
    "isBest": false
}
```

### 3. ویرایش دانش آموز
```http
PUT /api/students/:id
```

**بدنه درخواست:** (همان فرمت افزودن)

### 4. حذف دانش آموز
```http
DELETE /api/students/:id
```

### 5. تایید دانش آموز
```http
PATCH /api/students/:id/approve
```

### 6. انتخاب به عنوان برترین
```http
PATCH /api/students/:id/best
```

## کدهای وضعیت HTTP

- `200` - موفقیت
- `201` - ایجاد موفق
- `400` - درخواست نامعتبر
- `401` - عدم احراز هویت
- `403` - عدم دسترسی
- `404` - یافت نشد
- `500` - خطای سرور

## نمونه پاسخ‌های خطا

### خطای اعتبارسنجی
```json
{
    "error": "VALIDATION_ERROR",
    "message": "خطا در اعتبارسنجی داده‌ها",
    "details": {
        "fullName": "نام و نام خانوادگی الزامی است",
        "phone": "شماره تماس باید 11 رقم باشد"
    }
}
```

### خطای عدم احراز هویت
```json
{
    "error": "UNAUTHORIZED",
    "message": "توکن احراز هویت نامعتبر است"
}
```

### خطای عدم دسترسی
```json
{
    "error": "FORBIDDEN",
    "message": "شما دسترسی به این عملیات را ندارید"
}
```

## نحوه فعال‌سازی API

### 1. تغییر آدرس سرور
در فایل `assets/js/admin.js`، خط زیر را تغییر دهید:
```javascript
BASE_URL: 'http://localhost:3000/api', // آدرس سرور واقعی
```

### 2. فعال‌سازی درخواست‌های API
برای هر عملیات، خط مربوط به API را از حالت کامنت خارج کنید:

```javascript
// افزودن دانش آموز
const result = await API.addStudent(formData);

// ویرایش دانش آموز
const result = await API.updateStudent(id, updatedData);

// حذف دانش آموز
await API.deleteStudent(id);

// بارگذاری داده‌ها
const serverStudents = await API.getStudents();
```

### 3. فعال‌سازی بارگذاری خودکار
در انتهای فایل، خط زیر را از حالت کامنت خارج کنید:
```javascript
loadStudentsFromServer();
```

## احراز هویت

اگر سرور نیاز به احراز هویت دارد:

### 1. ذخیره توکن
```javascript
localStorage.setItem('token', 'your-jwt-token');
```

### 2. بروزرسانی خودکار هدرها
```javascript
API_CONFIG.HEADERS.Authorization = 'Bearer ' + localStorage.getItem('token');
```

## مدیریت خطاها

تمام درخواست‌های API در try-catch قرار گرفته‌اند و خطاها با SweetAlert نمایش داده می‌شوند.

## تست API

برای تست API، می‌توانید از ابزارهایی مانند:
- Postman
- Insomnia
- curl

استفاده کنید.

## نکات مهم

1. **اعتبارسنجی**: تمام داده‌ها در سمت کلاینت و سرور اعتبارسنجی می‌شوند
2. **امنیت**: از HTTPS استفاده کنید
3. **Rate Limiting**: درخواست‌های مکرر را محدود کنید
4. **Logging**: تمام عملیات را ثبت کنید
5. **Backup**: از داده‌ها پشتیبان تهیه کنید

## پشتیبانی

برای سوالات و مشکلات API، با تیم توسعه تماس بگیرید. 