import { table_users } from './table-users-admin.js';


const { showAlert, refreshTable, updateStatistics, currentEditId } = table_users


const API_CONFIG = {
    BASE_URL: 'http://localhost:5253', // هم‌راستا با بک‌اند جدید ASP.NET Core
    ENDPOINTS: {
        STUDENTS: '/students',
        STUDENT: '/students/:id',
        DELETE: '/students/:id',
        COURSES: '/courses',
        COURSE: '/courses/:id',
        ASSIGNMENTS: '/courses/:courseId/assignments',
        ASSIGNMENT: '/admin/assignments/:id',
        ATTACHMENTS: '/admin/assignments/:assignmentId/attachments',
        ATTACHMENT: '/admin/attachments/:id'
    },
    getHeaders() {
        const token = localStorage.getItem('token') || localStorage.getItem('user');
        return {
        'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }
};

// ==================== API FUNCTIONS ====================
const API = {
    // دریافت لیست دانش آموزان
    async getStudents() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STUDENTS, {
                method: 'GET',
                headers: API_CONFIG.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    // افزودن دانش آموز جدید
    async addStudent(studentData) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STUDENTS, {
                method: 'POST',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify(studentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding student:', error);
            throw error;
        }
    },

    // ویرایش دانش آموز
    async updateStudent(id, studentData) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STUDENT.replace(':id', id), {
                method: 'PUT',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify(studentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    },

    // حذف دانش آموز
    async deleteStudent(id) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DELETE.replace(':id', id), {
                method: 'DELETE',
                headers: API_CONFIG.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },

    // به‌روزرسانی وضعیت دانش‌آموز (به‌جای approve مجزا)
    async updateStudentStatus(id, status) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STUDENT.replace(':id', id), {
                method: 'PUT',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify({ status })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating student status:', error);
            throw error;
        }
    },

    // ==================== COURSES & ASSIGNMENTS API ====================
    
    // دریافت لیست دوره‌ها
    async getCourses() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COURSES, {
                method: 'GET',
                headers: API_CONFIG.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    // افزودن دوره جدید
    async addCourse(courseData) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COURSES, {
                method: 'POST',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify(courseData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding course:', error);
            throw error;
        }
    },

    // ویرایش دوره
    async updateCourse(id, courseData) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COURSE.replace(':id', id), {
                method: 'PUT',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify(courseData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    },

    // حذف دوره
    async deleteCourse(id) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COURSE.replace(':id', id), {
                method: 'DELETE',
                headers: API_CONFIG.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    },

    // دریافت تکالیف یک دوره
    async getCourseAssignments(courseId) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ASSIGNMENTS.replace(':courseId', courseId), {
                method: 'GET',
                headers: API_CONFIG.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching assignments:', error);
            throw error;
        }
    },

    // افزودن تکلیف جدید
    async addAssignment(courseId, assignmentData) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ASSIGNMENTS.replace(':courseId', courseId), {
                method: 'POST',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify(assignmentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding assignment:', error);
            throw error;
        }
    },

    // آپلود ضمیمه برای تکلیف
    async uploadAttachment(assignmentId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ATTACHMENTS.replace(':assignmentId', assignmentId), {
                method: 'POST',
                headers: {
                    ...API_CONFIG.getHeaders(),
                    // حذف Content-Type برای FormData
                    'Content-Type': undefined
                },
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error uploading attachment:', error);
            throw error;
        }
    }
};

// ==================== SWEET ALERT FUNCTIONS ====================
const SweetAlert = {
    // نمایش پیام موفقیت
    success(title, message) {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'success',
            confirmButtonText: 'باشه',
            confirmButtonColor: '#28a745',
            background: '#f8f9fa',
            backdrop: 'rgba(0,0,0,0.4)'
        });
    },

    // نمایش پیام خطا
    error(title, message) {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'error',
            confirmButtonText: 'باشه',
            confirmButtonColor: '#dc3545',
            background: '#f8f9fa',
            backdrop: 'rgba(0,0,0,0.4)'
        });
    },

    // نمایش پیام هشدار
    warning(title, message) {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'warning',
            confirmButtonText: 'باشه',
            confirmButtonColor: '#ffc107',
            background: '#f8f9fa',
            backdrop: 'rgba(0,0,0,0.4)'
        });
    },

    // نمایش پیام اطلاعات
    info(title, message) {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'info',
            confirmButtonText: 'باشه',
            confirmButtonColor: '#17a2b8',
            background: '#f8f9fa',
            backdrop: 'rgba(0,0,0,0.4)'
        });
    },

    // نمایش پیام تایید
    confirm(title, message) {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'بله',
            cancelButtonText: 'خیر',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            background: '#f8f9fa',
            backdrop: 'rgba(0,0,0,0.4)'
        });
    },

    // نمایش loading
    loading(title = 'لطفاً صبر کنید...') {
        return Swal.fire({
            title: title,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
};

export const api_services = { API, API_CONFIG, SweetAlert }
