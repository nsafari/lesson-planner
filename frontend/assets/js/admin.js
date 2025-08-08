import { api_services } from './admin/api-servies-admin.js';
import { addUser_form_validation } from './admin/form-validation-admin.js';
import { table_users } from './admin/table-users-admin.js';

$(document).ready(function () {
    // ==================== CONFIGURATION ====================
    const { SweetAlert, students } = api_services

    const { initializeDatePickers, initializeFormValidation } = addUser_form_validation
    const { showAlert, refreshTable, updateStatistics, initializeDataTable, updateBulkStudentsList, setupAdvancedSearch, currentEditId } = table_users



    // Form submission
    $('#addStudentForm').on('submit', async function (e) {
        e.preventDefault();

        if ($(this).valid()) {
            try {
                const formData = {
                    id: students.length + 1,
                    fullName: $('#fullName').val(),
                    phone: $('#phone').val(),
                    landline: $('#landline').val(),
                    fatherName: $('#fatherName').val(),
                    motherName: $('#motherName').val(),
                    birthDate: $('#birthDate').val(),
                    age: parseInt($('#age').val()),
                    nationalCode: $('#nationalCode').val(),
                    aboutMe: $('#aboutMe').val(),
                    circle: $('#circle').val(),
                    status: 'approved',
                    isBest: false
                };

                // اگر API آماده باشد، از آن استفاده کنید
                // const result = await API.addStudent(formData);

                // فعلاً از داده‌های محلی استفاده می‌کنیم
                students.push(formData);
                refreshTable();
                updateStatistics();
                $(this)[0].reset();
                $('#age').val('');

                showAlert('دانش آموز با موفقیت اضافه شد', 'success');
            } catch (error) {
                showAlert('خطا در ثبت دانش آموز', 'error');
            }
        }
    });

    // Save edit
    $('#saveEditBtn').on('click', async function () {
        if (currentEditId) {
            try {
                const studentIndex = students.findIndex(s => s.id === currentEditId);
                if (studentIndex !== -1) {
                    const updatedData = {
                        id: currentEditId,
                        fullName: $('#editFullName').val(),
                        phone: $('#editPhone').val(),
                        landline: $('#editLandline').val(),
                        fatherName: $('#editFatherName').val(),
                        motherName: $('#editMotherName').val(),
                        birthDate: $('#editBirthDate').val(),
                        age: parseInt($('#editAge').val()),
                        nationalCode: $('#editNationalCode').val(),
                        aboutMe: $('#editAboutMe').val(),
                        circle: $('#editCircle').val(),
                        status: $('#editStatus').val(),
                        isBest: students[studentIndex].isBest
                    };

                    // اگر API آماده باشد، از آن استفاده کنید
                    // const result = await API.updateStudent(currentEditId, updatedData);

                    // فعلاً از داده‌های محلی استفاده می‌کنیم
                    students[studentIndex] = updatedData;
                    refreshTable();
                    updateStatistics();
                    $('#editStudentModal').modal('hide');

                    showAlert('اطلاعات دانش آموز با موفقیت بروزرسانی شد', 'success');
                }
            } catch (error) {
                showAlert('خطا در بروزرسانی اطلاعات', 'error');
            }
        }
    });


    // Initialize everything
    initializeDatePickers();
    initializeFormValidation();

    // اضافه کردن حلقه به دانش‌آموزانی که حلقه ندارند
    students.forEach(student => {
        if (!student.circle) {
            const circles = ['حلقه اول', 'حلقه دوم', 'حلقه سوم', 'حلقه چهارم', 'حلقه پنجم'];
            student.circle = circles[Math.floor(Math.random() * circles.length)];
        }
    });

    initializeDataTable();
    updateStatistics();

    // اضافه کردن قابلیت جستجوی پیشرفته
    setupAdvancedSearch();

    // اضافه کردن عملکرد برای پذیرش قوانین
    $('#termsModal .btn-primary').on('click', function () {
        $('#acceptTerms').prop('checked', true);
        $('#acceptTerms').trigger('change');
    });

    // اضافه کردن عملکرد برای ویرایش گروهی حلقه‌ها
    $('#bulkSelectCircle').on('change', function () {
        updateBulkStudentsList();
    });

    $('#bulkNewCircle').on('change', function () {
        updateBulkStudentsList();
    });

    // عملکرد دکمه اعمال تغییرات گروهی
    $('#applyBulkEditBtn').on('click', async function () {
        const selectedCircle = $('#bulkSelectCircle').val();
        const newCircle = $('#bulkNewCircle').val();

        if (!newCircle) {
            showAlert('لطفاً حلقه جدید را انتخاب کنید', 'warning');
            return;
        }

        const result = await SweetAlert.confirm(
            'تایید تغییر حلقه',
            `آیا از تغییر حلقه ${selectedCircle || 'همه'} به ${newCircle} اطمینان دارید؟`
        );

        if (result.isConfirmed) {
            try {
                let updatedCount = 0;

                students.forEach(student => {
                    if (!selectedCircle || student.circle === selectedCircle) {
                        student.circle = newCircle;
                        updatedCount++;
                    }
                });

                refreshTable();
                updateStatistics();
                $('#bulkEditModal').modal('hide');

                showAlert(`${updatedCount} دانش‌آموز با موفقیت به حلقه ${newCircle} منتقل شدند`, 'success');
            } catch (error) {
                showAlert('خطا در بروزرسانی حلقه‌ها', 'error');
            }
        }
    });

    // Initialize Typed.js for header animation
    function initializeTypedAnimation() {
        const typed = new Typed('#typed-text', {
            strings: [
                'پنل مدیریت دانش آموزان',
                'مدیریت دانش آموزان نهضت',
                'سیستم مدیریت آموزشی',
                'پنل مدیریت دانش آموزان'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: false,
            cursorChar: '|',
            autoInsertCss: false
        });
    }
    // Initialize typing animation
    initializeTypedAnimation();
}); 