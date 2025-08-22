# رابطه کاربر و دانش‌آموز

این فایل توضیح می‌دهد که چگونه سیستم احراز هویت با دانش‌آموزان کار می‌کند.

## ساختار رابطه

### مدل‌های پایگاه‌داده

#### User Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  studentId: number; // رابطه با دانش‌آموز

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
```

#### Student Entity
```typescript
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  studentId: string; // کد دانش‌آموزی
}
```

## فرآیند احراز هویت

### 1. ورود کاربر (Login)
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "ali.ahmadi",
  "password": "password123"
}
```

### 2. پاسخ سیستم
اگر کاربر دانش‌آموز باشد:
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

اگر کاربر مدیر باشد:
```json
{
  "message": "Sign-in successful",
  "username": "admin",
  "imageUrl": null,
  "userType": "admin"
}
```

## کاربران نمونه

### دانش‌آموزان
سیستم به‌صورت خودکار کاربران زیر را ایجاد می‌کند:

| Username | Password | Student ID | نام |
|----------|----------|------------|-----|
| `ali.ahmadi` | `password123` | 1 | علی احمدی |
| `fateme.mohammadi` | `password123` | 2 | فاطمه محمدی |
| `mohammad.rezaei` | `password123` | 3 | محمد رضایی |

### مدیر
| Username | Password | نوع |
|----------|----------|------|
| `test` | `password` | مدیر |

## نحوه استفاده در Frontend

### 1. ورود و ذخیره اطلاعات
```javascript
async function login(username, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.userType === 'student') {
    // ذخیره اطلاعات دانش‌آموز
    localStorage.setItem('studentId', data.studentId);
    localStorage.setItem('studentInfo', JSON.stringify(data.studentInfo));
    localStorage.setItem('userType', 'student');
  } else {
    localStorage.setItem('userType', 'admin');
  }
  
  return data;
}
```

### 2. استفاده از شناسه دانش‌آموز
```javascript
// دریافت شناسه دانش‌آموز جاری
const studentId = localStorage.getItem('studentId');

// استفاده در API calls
const progress = await fetch(`/students/${studentId}/progress`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. دریافت پروفایل دانش‌آموز جاری
```javascript
async function getCurrentStudentProfile() {
  const response = await fetch('/students/me/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: localStorage.getItem('username')
    })
  });
  
  return await response.json();
}
```

## API Endpoints مرتبط

### احراز هویت
- `POST /auth/login` - ورود کاربر
- `POST /auth/register` - ثبت‌نام کاربر جدید

### دانش‌آموز
- `GET /students/me/profile` - دریافت پروفایل دانش‌آموز جاری
- `GET /students/:id/progress` - دریافت پیشرفت دانش‌آموز
- `POST /students/:id/assignments/:assignmentId/submit` - ارسال تکلیف

## نکات مهم

1. **یک کاربر = یک دانش‌آموز**: هر کاربر می‌تواند حداکثر یک دانش‌آموز باشد
2. **احراز هویت اجباری**: تمام APIها نیاز به توکن معتبر دارند
3. **شناسه دانش‌آموز**: پس از ورود، `studentId` در پاسخ برگردانده می‌شود
4. **نوع کاربر**: سیستم بین `student` و `admin` تمایز قائل می‌شود
5. **دسترسی**: دانش‌آموزان فقط به داده‌های خود دسترسی دارند

## مثال کامل Frontend

```javascript
class AuthService {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.token = localStorage.getItem('token');
  }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.userType === 'student') {
      // ذخیره اطلاعات دانش‌آموز
      localStorage.setItem('token', 'your-jwt-token'); // در آینده JWT
      localStorage.setItem('studentId', data.studentId);
      localStorage.setItem('studentInfo', JSON.stringify(data.studentInfo));
      localStorage.setItem('userType', 'student');
    }
    
    return data;
  }

  async getStudentProgress() {
    const studentId = localStorage.getItem('studentId');
    const response = await fetch(`${this.baseUrl}/students/${studentId}/progress`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    return await response.json();
  }

  async submitAssignment(assignmentId, submissionData) {
    const studentId = localStorage.getItem('studentId');
    const formData = new FormData();
    
    // اضافه کردن فیلدهای ارسال
    Object.keys(submissionData).forEach(key => {
      formData.append(key, submissionData[key]);
    });
    
    const response = await fetch(`${this.baseUrl}/students/${studentId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` },
      body: formData
    });
    
    return await response.json();
  }
}
```

## آینده‌نگری

در نسخه‌های آینده:
1. **JWT Tokens**: استفاده از JWT برای احراز هویت
2. **Role-based Access**: کنترل دسترسی بر اساس نقش
3. **Multiple User Types**: پشتیبانی از انواع مختلف کاربر (معلم، والدین، مدیر)
4. **Session Management**: مدیریت نشست‌های کاربر 