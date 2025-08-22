# فرآیند ثبت‌نام و تایید کاربران

این فایل توضیح می‌دهد که چگونه سیستم ثبت‌نام و تایید کاربران کار می‌کند.

## مراحل فرآیند

### 1. ثبت‌نام کاربر جدید

کاربر جدید درخواست ثبت‌نام می‌دهد:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newstudent",
    "password": "password123",
    "retryPassword": "password123",
    "firstName": "علی",
    "lastName": "احمدی",
    "email": "ali.ahmadi@example.com",
    "phoneNumber": "09123456789"
  }'
```

**پاسخ:**
```json
{
  "message": "ثبت نام با موفقیت انجام شد. در انتظار تایید مدیر سیستم هستید.",
  "status": "pending"
}
```

### 2. مدیر بررسی درخواست‌های تایید

مدیر سیستم درخواست‌های تایید را مشاهده می‌کند:

```bash
curl -X GET http://localhost:3000/admin/users/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**پاسخ:**
```json
[
  {
    "id": 5,
    "username": "newstudent",
    "approvalStatus": "pending",
    "userType": "student",
    "createdAt": "2024-09-01T10:00:00.000Z"
  }
]
```

### 3. تایید کاربر و ایجاد دانش‌آموز

مدیر کاربر را تایید می‌کند و دانش‌آموز ایجاد می‌شود:

```bash
curl -X POST http://localhost:3000/admin/users/5/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "علی",
    "lastName": "احمدی",
    "email": "ali.ahmadi@example.com",
    "phoneNumber": "09123456789",
    "studentId": "ST004",
    "courseIds": [1, 2]
  }'
```

**پاسخ:**
```json
{
  "message": "کاربر با موفقیت تایید شد و دانش‌آموز ایجاد شد",
  "student": {
    "id": 4,
    "firstName": "علی",
    "lastName": "احمدی",
    "email": "ali.ahmadi@example.com",
    "studentId": "ST004",
    "status": "active"
  },
  "enrolledCourses": 2
}
```

### 4. ورود کاربر تایید شده

کاربر تایید شده می‌تواند وارد سیستم شود:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newstudent",
    "password": "password123"
  }'
```

**پاسخ:**
```json
{
  "message": "Sign-in successful",
  "username": "newstudent",
  "userType": "student",
  "studentId": 4,
  "studentInfo": {
    "firstName": "علی",
    "lastName": "احمدی",
    "email": "ali.ahmadi@example.com",
    "studentId": "ST004"
  }
}
```

### 5. دسترسی به تکالیف و ارسال

کاربر می‌تواند تکالیف خود را مشاهده و ارسال کند:

```bash
# دریافت پیشرفت دانش‌آموز
curl -X GET http://localhost:3000/students/4/progress \
  -H "Authorization: Bearer STUDENT_TOKEN"

# ارسال تکلیف
curl -X POST http://localhost:3000/students/4/assignments/1/submit \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -F "dailyScore=85" \
  -F "notes=تکلیف تکمیل شد" \
  -F "isCompleted=true" \
  -F "audioFile=@/path/to/recording.mp3"
```

## وضعیت‌های کاربر

### pending
- کاربر ثبت‌نام کرده اما تایید نشده
- نمی‌تواند وارد سیستم شود
- پیام: "حساب کاربری شما در انتظار تایید مدیر سیستم است"

### approved
- کاربر تایید شده و دانش‌آموز ایجاد شده
- می‌تواند وارد سیستم شود
- به دوره‌های تخصیص داده شده دسترسی دارد

### rejected
- کاربر رد شده
- نمی‌تواند وارد سیستم شود
- پیام: "حساب کاربری شما رد شده است. لطفاً با مدیر سیستم تماس بگیرید"

## مثال کامل Frontend

### 1. فرم ثبت‌نام
```html
<form id="signupForm">
  <input type="text" name="username" placeholder="نام کاربری" required>
  <input type="password" name="password" placeholder="رمز عبور" required>
  <input type="password" name="retryPassword" placeholder="تکرار رمز عبور" required>
  <input type="text" name="firstName" placeholder="نام" required>
  <input type="text" name="lastName" placeholder="نام خانوادگی" required>
  <input type="email" name="email" placeholder="ایمیل" required>
  <input type="tel" name="phoneNumber" placeholder="شماره تلفن" required>
  <button type="submit">ثبت‌نام</button>
</form>
```

```javascript
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.status === 'pending') {
      alert('ثبت‌نام موفق! در انتظار تایید مدیر سیستم هستید.');
    }
  } catch (error) {
    alert('خطا در ثبت‌نام: ' + error.message);
  }
});
```

### 2. صفحه مدیریت (برای مدیر)
```javascript
class AdminPanel {
  async getPendingUsers() {
    const response = await fetch('/admin/users/pending', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const users = await response.json();
    this.renderPendingUsers(users);
  }
  
  async approveUser(userId, studentData) {
    const response = await fetch(`/admin/users/${userId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    
    const result = await response.json();
    alert(result.message);
    this.getPendingUsers(); // بروزرسانی لیست
  }
  
  renderPendingUsers(users) {
    const container = document.getElementById('pendingUsers');
    container.innerHTML = users.map(user => `
      <div class="user-card">
        <h3>${user.username}</h3>
        <p>تاریخ ثبت‌نام: ${new Date(user.createdAt).toLocaleDateString('fa-IR')}</p>
        <button onclick="approveUser(${user.id})">تایید</button>
        <button onclick="rejectUser(${user.id})">رد</button>
      </div>
    `).join('');
  }
}
```

### 3. صفحه ورود
```javascript
async function login(username, password) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.userType === 'student') {
      // ذخیره اطلاعات دانش‌آموز
      localStorage.setItem('studentId', data.studentId);
      localStorage.setItem('studentInfo', JSON.stringify(data.studentInfo));
      localStorage.setItem('userType', 'student');
      
      // انتقال به داشبورد دانش‌آموز
      window.location.href = '/student-dashboard.html';
    } else if (data.userType === 'admin') {
      // انتقال به پنل مدیریت
      window.location.href = '/admin-panel.html';
    }
  } catch (error) {
    alert('خطا در ورود: ' + error.message);
  }
}
```

## نکات مهم

1. **امنیت**: تمام درخواست‌های مدیریت نیاز به توکن مدیر دارند
2. **تایید اجباری**: کاربران جدید نمی‌توانند بدون تایید وارد شوند
3. **ایجاد خودکار**: پس از تایید، دانش‌آموز و ثبت‌نام در دوره‌ها به‌صورت خودکار انجام می‌شود
4. **پیام‌های مناسب**: سیستم پیام‌های واضح برای هر وضعیت ارائه می‌دهد
5. **مدیریت دوره‌ها**: مدیر می‌تواند دوره‌های مختلف را به دانش‌آموز تخصیص دهد

## خطاهای رایج

- **400 Bad Request**: داده‌های ثبت‌نام نامعتبر
- **401 Unauthorized**: توکن نامعتبر
- **409 Conflict**: نام کاربری یا ایمیل تکراری
- **403 Forbidden**: دسترسی غیرمجاز به APIهای مدیریت 