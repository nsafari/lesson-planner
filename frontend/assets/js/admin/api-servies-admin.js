import { table_users } from './table-users-admin.js';


const { showAlert, refreshTable, updateStatistics, currentEditId } = table_users


const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api', // تغییر به آدرس سرور واقعی
    ENDPOINTS: {
        STUDENTS: '/students',
        STUDENT: '/students/:id',
        APPROVE: '/students/:id/approve',
        DELETE: '/students/:id',
        BEST: '/students/:id/best'
    },
    HEADERS: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token') // اگر نیاز به احراز هویت باشد
    }
};

// ==================== API FUNCTIONS ====================
const API = {
    // دریافت لیست دانش آموزان
    async getStudents() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STUDENTS, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
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
                headers: API_CONFIG.HEADERS,
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
                headers: API_CONFIG.HEADERS,
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
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },

    // تایید دانش آموز
    async approveStudent(id) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.APPROVE.replace(':id', id), {
                method: 'PATCH',
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('Error approving student:', error);
            throw error;
        }
    },

    // انتخاب به عنوان برترین
    async toggleBestStudent(id) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEST.replace(':id', id), {
                method: 'PATCH',
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('Error toggling best student:', error);
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

// ==================== SAMPLE DATA (FOR TESTING) ====================
let students = [
    {
        id: 1,
        fullName: "علی احمدی",
        phone: "09123456789",
        landline: "02112345678",
        fatherName: "محمد احمدی",
        motherName: "فاطمه محمدی",
        birthDate: "1380/03/15",
        age: 23,
        nationalCode: "1234567890",
        aboutMe: "علاقه مند به برنامه نویسی و تکنولوژی. هدف من یادگیری مهارت های جدید و کمک به جامعه است.",
        status: "approved",
        isBest: false,
        circle: "حلقه اول"
    },
    {
        id: 2,
        fullName: "سارا محمدی",
        phone: "09187654321",
        landline: "02187654321",
        fatherName: "حسن محمدی",
        motherName: "زهرا احمدی",
        birthDate: "1382/07/22",
        age: 21,
        nationalCode: "0987654321",
        aboutMe: "دانشجوی مهندسی کامپیوتر. علاقه مند به هوش مصنوعی و یادگیری ماشین.",
        status: "pending",
        isBest: false,
        circle: "حلقه دوم"
    },
    {
        id: 3,
        fullName: "محمد رضایی",
        phone: "09351234567",
        landline: "02198765432",
        fatherName: "علی رضایی",
        motherName: "مریم کریمی",
        birthDate: "1379/11/08",
        age: 24,
        nationalCode: "1122334455",
        aboutMe: "فعال در زمینه ورزش و تدریس. هدف من تربیت نسل آینده است.",
        status: "approved",
        isBest: true,
        circle: "حلقه سوم"
    },
    {
        id: 4,
        fullName: "فاطمه کریمی",
        phone: "09387654321",
        landline: "02111223344",
        fatherName: "حسین کریمی",
        motherName: "زینب احمدی",
        birthDate: "1383/04/12",
        age: 20,
        nationalCode: "2233445566",
        aboutMe: "علاقه مند به هنر و موسیقی. می خواهم در زمینه آموزش هنر فعالیت کنم.",
        status: "approved",
        isBest: false,
        circle: "حلقه اول"
    },
    {
        id: 5,
        fullName: "حسین احمدی",
        phone: "09111223344",
        landline: "02122334455",
        fatherName: "محمد احمدی",
        motherName: "فاطمه محمدی",
        birthDate: "1381/09/30",
        age: 22,
        nationalCode: "3344556677",
        aboutMe: "دانشجوی پزشکی. هدف من خدمت به مردم و درمان بیماران است.",
        status: "pending",
        isBest: false
    },
    {
        id: 6,
        fullName: "زهرا محمدی",
        phone: "09331234567",
        landline: "02133445566",
        fatherName: "علی محمدی",
        motherName: "مریم کریمی",
        birthDate: "1384/01/18",
        age: 19,
        nationalCode: "4455667788",
        aboutMe: "علاقه مند به زبان انگلیسی و سفر. می خواهم مترجم شوم.",
        status: "approved",
        isBest: false
    },
    {
        id: 7,
        fullName: "امیر رضایی",
        phone: "09187654321",
        landline: "02144556677",
        fatherName: "حسن رضایی",
        motherName: "زینب احمدی",
        birthDate: "1378/06/25",
        age: 25,
        nationalCode: "5566778899",
        aboutMe: "مهندس برق. علاقه مند به انرژی های تجدیدپذیر و محیط زیست.",
        status: "approved",
        isBest: true
    },
    {
        id: 8,
        fullName: "مریم کریمی",
        phone: "09351234567",
        landline: "02155667788",
        fatherName: "علی کریمی",
        motherName: "فاطمه محمدی",
        birthDate: "1382/12/03",
        age: 21,
        nationalCode: "6677889900",
        aboutMe: "دانشجوی روانشناسی. هدف من کمک به سلامت روان جامعه است.",
        status: "pending",
        isBest: false
    },
    {
        id: 9,
        fullName: "علی احمدی",
        phone: "09123456789",
        landline: "02166778899",
        fatherName: "محمد احمدی",
        motherName: "زهرا کریمی",
        birthDate: "1380/08/14",
        age: 23,
        nationalCode: "7788990011",
        aboutMe: "فعال در زمینه تجارت و کارآفرینی. می خواهم کسب و کار خودم را راه اندازی کنم.",
        status: "approved",
        isBest: false
    },
    {
        id: 10,
        fullName: "سارا رضایی",
        phone: "09387654321",
        landline: "02177889900",
        fatherName: "حسین رضایی",
        motherName: "مریم احمدی",
        birthDate: "1383/02/28",
        age: 20,
        nationalCode: "8899001122",
        aboutMe: "علاقه مند به طراحی گرافیک و هنرهای دیجیتال. می خواهم طراح خلاق شوم.",
        status: "approved",
        isBest: false
    },
    {
        id: 11,
        fullName: "محمد کریمی",
        phone: "09111223344",
        landline: "02188990011",
        fatherName: "علی کریمی",
        motherName: "زینب محمدی",
        birthDate: "1379/05/17",
        age: 24,
        nationalCode: "9900112233",
        aboutMe: "دانشجوی حقوق. هدف من دفاع از حقوق مردم و عدالت اجتماعی است.",
        status: "pending",
        isBest: false
    },
    {
        id: 12,
        fullName: "فاطمه احمدی",
        phone: "09331234567",
        landline: "02199001122",
        fatherName: "حسن احمدی",
        motherName: "فاطمه کریمی",
        birthDate: "1381/10/09",
        age: 22,
        nationalCode: "0011223344",
        aboutMe: "علاقه مند به آشپزی و هنرهای خانگی. می خواهم رستوران خودم را راه اندازی کنم.",
        status: "approved",
        isBest: false
    },
    {
        id: 13,
        fullName: "حسین محمدی",
        phone: "09187654321",
        landline: "02100112233",
        fatherName: "محمد محمدی",
        motherName: "زهرا رضایی",
        birthDate: "1384/07/21",
        age: 19,
        nationalCode: "1122334455",
        aboutMe: "دانشجوی معماری. علاقه مند به طراحی ساختمان های سبز و پایدار.",
        status: "approved",
        isBest: false
    },
    {
        id: 14,
        fullName: "زهرا رضایی",
        phone: "09351234567",
        landline: "02111223344",
        fatherName: "علی رضایی",
        motherName: "مریم احمدی",
        birthDate: "1378/12/05",
        age: 25,
        nationalCode: "2233445566",
        aboutMe: "مهندس صنایع. علاقه مند به بهینه سازی فرآیندها و مدیریت کیفیت.",
        status: "approved",
        isBest: true
    },
    {
        id: 15,
        fullName: "امیر کریمی",
        phone: "09123456789",
        landline: "02122334455",
        fatherName: "حسین کریمی",
        motherName: "زینب محمدی",
        birthDate: "1382/04/16",
        age: 21,
        nationalCode: "3344556677",
        aboutMe: "فعال در زمینه موسیقی و آهنگسازی. می خواهم موسیقیدان حرفه ای شوم.",
        status: "pending",
        isBest: false
    },
    {
        id: 16,
        fullName: "مریم احمدی",
        phone: "09387654321",
        landline: "02133445566",
        fatherName: "محمد احمدی",
        motherName: "فاطمه رضایی",
        birthDate: "1380/01/11",
        age: 23,
        nationalCode: "4455667788",
        aboutMe: "دانشجوی پرستاری. هدف من خدمت به بیماران و کمک به سلامت جامعه است.",
        status: "approved",
        isBest: false
    },
    {
        id: 17,
        fullName: "علی رضایی",
        phone: "09111223344",
        landline: "02144556677",
        fatherName: "حسن رضایی",
        motherName: "زهرا کریمی",
        birthDate: "1383/09/27",
        age: 20,
        nationalCode: "5566778899",
        aboutMe: "علاقه مند به ورزش و تناسب اندام. می خواهم مربی ورزش شوم.",
        status: "approved",
        isBest: false
    },
    {
        id: 18,
        fullName: "سارا کریمی",
        phone: "09331234567",
        landline: "02155667788",
        fatherName: "علی کریمی",
        motherName: "مریم احمدی",
        birthDate: "1379/11/19",
        age: 24,
        nationalCode: "6677889900",
        aboutMe: "دانشجوی مدیریت. علاقه مند به کارآفرینی و مدیریت کسب و کار.",
        status: "pending",
        isBest: false
    },
    {
        id: 19,
        fullName: "محمد احمدی",
        phone: "09187654321",
        landline: "02166778899",
        fatherName: "حسین احمدی",
        motherName: "زینب رضایی",
        birthDate: "1381/06/08",
        age: 22,
        nationalCode: "7788990011",
        aboutMe: "فعال در زمینه تدریس و آموزش. هدف من تربیت نسل آینده است.",
        status: "approved",
        isBest: false
    },
    {
        id: 20,
        fullName: "فاطمه محمدی",
        phone: "09351234567",
        landline: "02177889900",
        fatherName: "محمد محمدی",
        motherName: "فاطمه کریمی",
        birthDate: "1384/03/02",
        age: 19,
        nationalCode: "8899001122",
        aboutMe: "علاقه مند به هنرهای تجسمی و نقاشی. می خواهم هنرمند شوم.",
        status: "approved",
        isBest: false
    }
];

// Load data from server (when API is ready)
async function loadStudentsFromServer() {
    try {
        // اگر API آماده باشد، از آن استفاده کنید
        // const serverStudents = await API.getStudents();
        // students = serverStudents;

        // فعلاً از داده‌های محلی استفاده می‌کنیم
        refreshTable();
        updateStatistics();
    } catch (error) {
        showAlert('خطا در بارگذاری داده‌ها', 'error');
    }
}


export const api_services = { API, API_CONFIG, SweetAlert, students, loadStudentsFromServer, currentEditId }
