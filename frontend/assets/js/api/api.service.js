import { base64ToObject } from "../utilites/byte64.js";

const API_BASE = 'http://localhost:3000';

/**
 * سرویس ارتباط با API برای دریافت و ارسال داده‌ها
 */

// تابع برای نمایش مدال با اطلاعات
function showStudentModal(data) {
  document.getElementById('firstName').textContent = data.firstName || '';
  document.getElementById('lastName').textContent = data.lastName || '';
  document.getElementById('email').textContent = data.email || '';
  document.getElementById('phoneNumber').textContent = data.phoneNumber || '';
  document.getElementById('studentId').textContent = data.studentId || '';
  document.getElementById('status').textContent = data.status || '';
  document.getElementById('dateOfBirth').textContent = data.dateOfBirth || '';
  document.getElementById('address').textContent = data.address || '';
  document.getElementById('createdAt').textContent = data.createdAt?.split('T')[0] || '';
  document.getElementById('updatedAt').textContent = data.updatedAt?.split('T')[0] || '';

  // نمایش مدال
  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
}

export class ApiService {
  static token = null;

  /**
   * تنظیم توکن برای درخواست‌های بعدی
   */
  static setToken(token) {
    this.token = token;
  }

  /**
   * ساخت هدرهای درخواست با توکن
   */
  static getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
    };
  }

  /**
   * دریافت اطلاعات دانش‌آموز و پیشرفت او
   */
  static async getStudentProgress(studentId) {
    const response = await fetch(`${API_BASE}/students/${studentId}/progress`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  /**
   * دریافت پیشرفت دانش‌آموز در یک تکلیف مشخص
   */
  static async getAssignmentProgress(studentId, assignmentId) {
    const response = await fetch(`${API_BASE}/students/${studentId}/assignments/${assignmentId}/progress`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  /**
   * دریافت ارسال‌های دانش‌آموز (اختیاری: فیلتر بر اساس تکلیف)
   */
  static async getStudentSubmissions(studentId, assignmentId = null) {
    const url = assignmentId
      ? `${API_BASE}/students/${studentId}/submissions?assignmentId=${assignmentId}`
      : `${API_BASE}/students/${studentId}/submissions`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  /**
   * ارسال کار روزانه برای یک تکلیف
   */
  static async submitDailyWork(studentId, assignmentId, submissionData) {
    const response = await fetch(`${API_BASE}/students/${studentId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submissionData)
    });
    return await response.json();
  }

  /**
   * دریافت تکالیف یک دوره
   */
  static async getCourseAssignments(courseId) {
    const response = await fetch(`${API_BASE}/courses/${courseId}/assignments`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  /**
   * دریافت دوره‌های فعال
   */
  static async getActiveCourses() {
    const response = await fetch(`${API_BASE}/courses/active`, {
      headers: this.getHeaders()
    });
    return await response.json();
  }

  /**
   * دریافت پیشرفت دانش‌آموز در یک تکلیف مشخص
   */
  static async submitSigninUser(data) {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (response.ok) {
      return await response.json();
    } else {
      return await "کاربر وجود ندارد"
    }
  }

  static async getUserData() {
    const id = base64ToObject(localStorage.getItem("user")).id
    let response = await fetch(`${API_BASE}/students/${id}`);
    response = await response.json()
    document.querySelector(".fa-cog").parentNode.addEventListener("click", () => showStudentModal(response))


    document.getElementById("user-name-dropDown").innerHTML = response.firstName + " " + response.lastName
    document.getElementById("user-email-dropDown").innerHTML = response.email
  }

  static async signInStudent(data) {
    const response = await fetch(`${API_BASE}/students/findByEmail_Phone`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    const dt = (await response.text());

    if (dt) {
      const js = JSON.parse(dt);
      console.log(js);
      return js;
    } else {
      return "کاربر وجود ندارد"
    }
  }
}
