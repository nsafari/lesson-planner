const API_BASE = 'http://localhost:3000';

/**
 * سرویس ارتباط با API برای دریافت و ارسال داده‌ها
 */
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
} 