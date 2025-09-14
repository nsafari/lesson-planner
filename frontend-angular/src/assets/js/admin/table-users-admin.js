import { api_services } from './api-servies-admin.js';

var students = [];
var SweetAlert;

// Load students from server
async function loadStudentsFromServer() {
    try {
        const serverStudents = await api_services.API.getStudents();
        // نگاشت فیلدهای بک‌اند به ساختار مورد انتظار جدول فعلی
        students = (serverStudents || []).map((s) => ({
            id: s.id,
            fullName: [s.firstName, s.lastName].filter(Boolean).join(' ') || '',
            phone: s.phoneNumber || '',
            landline: '',
            fatherName: '',
            motherName: '',
            birthDate: s.dateOfBirth ? String(s.dateOfBirth).split('T')[0] : '',
            age: '',
            nationalCode: '',
            aboutMe: s.address || '',
            status: s.status === 'active' ? 'approved' : 'pending',
            isBest: false,
            circle: ''
        }));
        refreshTable();
        updateStatistics();
    } catch (error) {
        console.error(error);
        showAlert('خطا در بارگذاری داده‌ها', 'error');
    }
}

// Initialize DataTable
function initializeDataTable() {
    const { SweetAlert: SweetAlert1 } = api_services
    SweetAlert = SweetAlert1

    $('#studentsTable').DataTable({
        data: students,
        columns: [
            {
                data: null,
                title: 'ردیف',
                orderable: true,
                searchable: false,
                width: '60px',
                render: function (data, type, row, meta) {
                    // شماره ردیف بر اساس صفحه فعلی و موقعیت در جدول
                    const pageInfo = $('#studentsTable').DataTable().page.info();
                    const rowNumber = pageInfo.start + meta.row + 1;
                    return `<div class="row-number">${rowNumber}</div>`;
                }
            },
            {
                data: 'fullName',
                orderable: true
            },
            {
                data: 'phone',
                orderable: true
            },
            {
                data: 'fatherName',
                orderable: true
            },
            {
                data: 'age',
                orderable: true
            },
            {
                data: 'nationalCode',
                orderable: true
            },
            {
                data: 'status',
                orderable: true,
                render: function (data) {
                    if (data === 'approved') {
                        return 'تایید شده';
                    } else {
                        return 'در انتظار تایید';
                    }
                }
            },
            {
                data: 'circle',
                orderable: true,
                title: 'حلقه'
            },
            {
                data: null,
                orderable: false, // غیرفعال کردن سورت برای ستون عملیات
                render: function (data, type, row) {
                    return `
                        <div class="action-buttons">
                            <button class="action-btn btn-about" title="درباره کاربر" onclick="showAboutStudent(${row.id})">
                                <i class="fas fa-user"></i>
                            </button>
                            <button class="action-btn btn-edit" title="ویرایش" onclick="editStudent(${row.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn btn-delete" title="حذف" onclick="deleteStudent(${row.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="action-btn btn-best" title="${row.isBest ? 'حذف از برترین ها' : 'انتخاب به عنوان برترین'}" onclick="toggleBestStudent(${row.id})">
                                <i class="fas fa-${row.isBest ? 'star' : 'star-o'}"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/fa.json'
        },
        pageLength: 5, // نمایش 5 ردیف در هر صفحه
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "همه"]],
        responsive: true,
        order: [[1, 'asc']], // مرتب‌سازی پیش‌فرض بر اساس نام
        // بهبود جستجو برای تطابق جزئی
        search: {
            smart: false,
            regex: false,
            caseInsensitive: true
        },
        // بروزرسانی خلاصه جدول بعد از هر تغییر
        drawCallback: function () {
            updateTableSummary();
        }
    });
}

// Update statistics
function updateStatistics() {
    const total = students.length;
    const active = students.filter(s => s.status === 'approved').length;
    const pending = students.filter(s => s.status === 'pending').length;
    const best = students.filter(s => s.isBest).length;

    $('#totalStudents').text(total);
    $('#activeStudents').text(active);
    $('#pendingStudents').text(pending);

    // Update table summary
    updateTableSummary();
}

// Update table summary
function updateTableSummary() {
    const table = $('#studentsTable').DataTable();
    const data = table.data().toArray();

    // Update summary counts
    $('#totalRows').text(data.length);
    $('#approvedCount').text(data.filter(row => row.status === 'approved').length);
    $('#pendingCount').text(data.filter(row => row.status === 'pending').length);
    $('#bestCount').text(data.filter(row => row.isBest).length);

    // Update circle summary table
    updateCircleSummary(data);
}

// Update circle summary table
function updateCircleSummary(data) {
    const circles = ['حلقه اول', 'حلقه دوم', 'حلقه سوم', 'حلقه چهارم', 'حلقه پنجم'];
    let html = '';

    circles.forEach(circle => {
        const circleData = data.filter(row => row.circle === circle);
        const total = circleData.length;
        const approved = circleData.filter(row => row.status === 'approved').length;
        const pending = circleData.filter(row => row.status === 'pending').length;
        const best = circleData.filter(row => row.isBest).length;

        html += `
            <tr>
                <td><strong>${circle}</strong></td>
                <td><span class="badge bg-primary">${total}</span></td>
                <td><span class="badge bg-success">${approved}</span></td>
                <td><span class="badge bg-warning">${pending}</span></td>
                <td><span class="badge bg-info">${best}</span></td>
            </tr>
        `;
    });

    $('#circleSummaryTable').html(html);
}

// Show about student modal
window.showAboutStudent = function (id) {
    const student = students.find(s => s.id === id);
    if (student) {
        const content = `
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>نام و نام خانوادگی:</strong></h6>
                    <p>${student.fullName}</p>
                    
                    <h6><strong>شماره تماس:</strong></h6>
                    <p>${student.phone}</p>
                    
                    <h6><strong>تلفن ثابت:</strong></h6>
                    <p>${student.landline || 'ثبت نشده'}</p>
                    
                    <h6><strong>نام پدر:</strong></h6>
                    <p>${student.fatherName}</p>
                    
                    <h6><strong>نام مادر:</strong></h6>
                    <p>${student.motherName}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>تاریخ تولد:</strong></h6>
                    <p>${student.birthDate}</p>
                    
                    <h6><strong>سن:</strong></h6>
                    <p>${student.age} سال</p>
                    
                    <h6><strong>کد ملی:</strong></h6>
                    <p>${student.nationalCode}</p>
                    
                    <h6><strong>وضعیت:</strong></h6>
                    <p>${student.status === 'approved' ? 'تایید شده' : 'در انتظار تایید'}</p>
                    
                    <h6><strong>برترین:</strong></h6>
                    <p>${student.isBest ? 'بله' : 'خیر'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6><strong>درباره من:</strong></h6>
                    <p class="text-justify">${student.aboutMe}</p>
                </div>
            </div>
        `;
        $('#aboutStudentContent').html(content);
        $('#aboutStudentModal').modal('show');
    }
};

// Edit student
window.editStudent = function (id) {
    const student = students.find(s => s.id === id);
    if (student) {
        currentEditId = id;
        $('#editStudentId').val(student.id);
        $('#editFullName').val(student.fullName);
        $('#editPhone').val(student.phone);
        $('#editLandline').val(student.landline);
        $('#editFatherName').val(student.fatherName);
        $('#editMotherName').val(student.motherName);
        $('#editBirthDate').val(student.birthDate);
        $('#editAge').val(student.age);
        $('#editNationalCode').val(student.nationalCode);
        $('#editAboutMe').val(student.aboutMe);
        $('#editCircle').val(student.circle || '');
        $('#editStatus').val(student.status);
        $('#editStudentModal').modal('show');
    }
};

// Delete student
window.deleteStudent = async function (id) {
    const result = await SweetAlert.confirm(
        'تایید حذف',
        'آیا از حذف این دانش آموز اطمینان دارید؟'
    );

    if (result.isConfirmed) {
        try {
            // حذف از سرور
            const { API } = (await import('./api-servies-admin.js')).api_services;
            await API.deleteStudent(id);

            // Reload data from server after deletion
            await loadStudentsFromServer();

            showAlert('دانش آموز با موفقیت حذف شد', 'success');
        } catch (error) {
            showAlert('خطا در حذف دانش آموز', 'error');
        }
    }
};

// Toggle best student
window.toggleBestStudent = async function (id) {
    const student = students.find(s => s.id === id);
    if (student) {
        try {
            // اگر API آماده باشد، از آن استفاده کنید
            // await API.toggleBestStudent(id);

            // فعلاً از داده‌های محلی استفاده می‌کنیم
            student.isBest = !student.isBest;
            refreshTable();

            showAlert(
                student.isBest ? 'دانش آموز به عنوان برترین انتخاب شد' : 'دانش آموز از لیست برترین ها حذف شد',
                'success'
            );
        } catch (error) {
            showAlert('خطا در بروزرسانی وضعیت', 'error');
        }
    }
};

// Refresh table
function refreshTable() {
    const table = $('#studentsTable').DataTable();
    table.clear();
    table.rows.add(students);
    table.draw();
    updateTableSummary();
}

// Show alert (using SweetAlert)
function showAlert(message, type = 'success') {
    switch (type) {
        case 'success':
            SweetAlert.success('موفقیت', message);
            break;
        case 'error':
            SweetAlert.error('خطا', message);
            break;
        case 'warning':
            SweetAlert.warning('هشدار', message);
            break;
        case 'info':
            SweetAlert.info('اطلاعات', message);
            break;
        default:
            SweetAlert.success('موفقیت', message);
    }
}
console.log(true);

// تابع بروزرسانی لیست دانش‌آموزان در مودال گروهی
function updateBulkStudentsList() {
    const selectedCircle = $('#bulkSelectCircle').val();
    const newCircle = $('#bulkNewCircle').val();

    let filteredStudents = students;
    if (selectedCircle) {
        filteredStudents = students.filter(s => s.circle === selectedCircle);
    }

    let html = '';
    if (filteredStudents.length > 0) {
        html = '<h6 class="mb-3">دانش‌آموزان انتخاب شده:</h6>';
        filteredStudents.forEach(student => {
            html += `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                    <div>
                        <strong>${student.fullName}</strong>
                        <br>
                        <small class="text-muted">حلقه فعلی: ${student.circle || 'تعیین نشده'}</small>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">${student.phone}</small>
                    </div>
                </div>
            `;
        });
        html += `<div class="mt-3 alert alert-info">
            <strong>تعداد کل:</strong> ${filteredStudents.length} دانش‌آموز
            ${newCircle ? `<br><strong>حلقه جدید:</strong> ${newCircle}` : ''}
        </div>`;
    } else {
        html = '<div class="alert alert-warning">هیچ دانش‌آموزی یافت نشد.</div>';
    }

    $('#bulkStudentsList').html(html);
}

// بارگذاری داده‌ها از سرور (وقتی API آماده باشد)
// loadStudentsFromServer();

// Setup advanced search functionality
function setupAdvancedSearch() {
    const table = $('#studentsTable').DataTable();

    // بهبود جستجوی DataTable برای تطابق جزئی بهتر
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const searchTerm = table.search().toLowerCase();

        if (searchTerm === '') return true;

        // جستجو در تمام ستون‌های قابل جستجو
        const rowNumber = data[0].toLowerCase();
        const fullName = data[1].toLowerCase();
        const phone = data[2].toLowerCase();
        const fatherName = data[3].toLowerCase();
        const age = data[4].toLowerCase();
        const nationalCode = data[5].toLowerCase();
        const status = data[6].toLowerCase();
        const circle = data[7].toLowerCase();

        // بررسی تطابق جزئی در هر فیلد
        return rowNumber.includes(searchTerm) ||
            fullName.includes(searchTerm) ||
            phone.includes(searchTerm) ||
            fatherName.includes(searchTerm) ||
            age.includes(searchTerm) ||
            nationalCode.includes(searchTerm) ||
            status.includes(searchTerm) ||
            circle.includes(searchTerm);
    });

    // اضافه کردن placeholder بهتر برای جستجو
    $('.dataTables_filter input').attr('placeholder', 'جستجو در نام، شماره تماس، نام پدر، سن، کد ملی، وضعیت، حلقه...');

    // بهبود ظاهر جعبه جستجو
    $('.dataTables_filter').addClass('mb-3');
    $('.dataTables_filter input').addClass('form-control');

    // اضافه کردن دکمه پاک کردن جستجو
    $('.dataTables_filter').append(`
        <button type="button" class="btn btn-outline-secondary btn-sm ms-2" id="clearSearchBtn" style="display: none;">
            <i class="fas fa-times"></i>
            پاک کردن
        </button>
    `);

    // نمایش/مخفی کردن دکمه پاک کردن بر اساس وجود متن در جستجو
    $('.dataTables_filter input').on('input', function () {
        if ($(this).val().length > 0) {
            $('#clearSearchBtn').show();
        } else {
            $('#clearSearchBtn').hide();
        }
    });

    // عملکرد دکمه پاک کردن
    $('#clearSearchBtn').on('click', function () {
        table.search('').draw();
        $('.dataTables_filter input').val('');
        $(this).hide();
    });

    // پاک کردن جستجو با کلید Escape
    $('.dataTables_filter input').on('keydown', function (e) {
        if (e.key === 'Escape') {
            table.search('').draw();
            $(this).val('');
            $('#clearSearchBtn').hide();
        }
    });
}

let currentEditId = null;

export const table_users = { showAlert, refreshTable, updateCircleSummary, updateTableSummary, updateStatistics, initializeDataTable, updateBulkStudentsList, setupAdvancedSearch, currentEditId, loadStudentsFromServer }
