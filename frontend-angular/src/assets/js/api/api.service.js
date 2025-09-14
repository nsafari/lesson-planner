import { base64ToObject } from "../utilites/byte64.js";

const API_BASE = 'http://localhost:3000';

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('user');
}

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
    const token = this.token || getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
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
   * ارسال کار روزانه با فایل صوتی برای یک تکلیف
   */
  static async submitDailyWorkWithAudio(studentId, assignmentId, audioBlob, submissionData = {}) {
    try {
      console.log(audioBlob);
      
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'recording.wav');
      
      // اضافه کردن داده‌های تکلیف به فرم
      Object.keys(submissionData).forEach(key => {
        formData.append(key, submissionData[key]);
      });

      const token = this.token || getAuthToken();
      const response = await fetch(`${API_BASE}/students/${studentId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
          // حذف Content-Type برای FormData
        },
        body: formData
      });
      // محتوای پاسخ را فقط یک بار بخوان
      const responseText = await response.text();

      // بررسی وضعیت HTTP
      if (!response.ok) {
        let errorMessage = `خطای HTTP: ${response.status}`;
        try {
          const errorJson = responseText ? JSON.parse(responseText) : null;
          if (errorJson) {
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } else if (responseText) {
            errorMessage = responseText;
          }
        } catch (_) {
          if (responseText) errorMessage = responseText;
        }
        throw new Error(errorMessage);
      }

      // اگر پاسخ خالی است
      if (!responseText) {
        return { success: true, message: 'فایل صوتی با موفقیت ارسال شد' };
      }

      // تلاش برای پارس JSON
      try {
        return JSON.parse(responseText);
      } catch (_) {
        return { success: true, message: responseText || 'فایل صوتی با موفقیت ارسال شد' };
      }

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
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
  },

  /**
   * دریافت ارسال‌های دانش‌آموز با جزئیات کامل
   */
  static async getStudentSubmissionsWithDetails(studentId) {
    try {
      const response = await fetch(`${API_BASE}/students/${studentId}/submissions`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const submissions = await response.json();
      
      // برای هر ارسال، اطلاعات تکلیف را هم دریافت کن
      const submissionsWithDetails = await Promise.all(
        submissions.map(async (submission) => {
          try {
            const assignmentResponse = await fetch(`${API_BASE}/courses/${submission.assignmentId}/assignments`, {
              headers: this.getHeaders()
            });
            
            if (assignmentResponse.ok) {
              const assignments = await assignmentResponse.json();
              const assignment = assignments.find(a => a.id === submission.assignmentId);
              return {
                ...submission,
                assignment: assignment || null
              };
            }
            return submission;
          } catch (error) {
            console.warn('Error fetching assignment details:', error);
            return submission;
          }
        })
      );
      
      return submissionsWithDetails;
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      throw error;
    }
  }
}
