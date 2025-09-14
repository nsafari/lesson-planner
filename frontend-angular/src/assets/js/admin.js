import { api_services } from './admin/api-servies-admin.js';
import { addUser_form_validation } from './admin/form-validation-admin.js';
import { table_users } from './admin/table-users-admin.js';

$(document).ready(function () {
    // ==================== CONFIGURATION ====================
    const { SweetAlert, API } = api_services
    const { loadStudentsFromServer } = table_users

    const { initializeDatePickers, initializeFormValidation } = addUser_form_validation
    const { showAlert, refreshTable, updateStatistics, initializeDataTable, updateBulkStudentsList, setupAdvancedSearch, currentEditId } = table_users



    // Form submission
    $('#addStudentForm').on('submit', async function (e) {
        e.preventDefault();

        if ($(this).valid()) {
            try {
                const fullName = $('#fullName').val();
                const firstName = fullName.split(' ')[0] || '';
                const lastName = fullName.split(' ').slice(1).join(' ') || '';

                const payload = {
                    firstName,
                    lastName,
                    email: $('#email').val() || `${Date.now()}@example.com`,
                    studentId: $('#nationalCode').val() || String(Date.now()),
                    phoneNumber: $('#phone').val(),
                    address: $('#aboutMe').val(),
                    dateOfBirth: $('#birthDate').val() || null,
                    status: 'active'
                };

                const created = await API.addStudent(payload);

                // Reload data from server after adding new student
                await loadStudentsFromServer();
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
                const nameCombined = $('#editFullName').val();
                const payload = {
                    firstName: nameCombined.split(' ')[0] || '',
                    lastName: nameCombined.split(' ').slice(1).join(' ') || '',
                    phoneNumber: $('#editPhone').val(),
                    address: $('#editAboutMe').val(),
                    status: $('#editStatus').val() === 'approved' ? 'active' : 'inactive'
                };

                const updated = await API.updateStudent(currentEditId, payload);

                // Reload data from server after updating student
                await loadStudentsFromServer();
                $('#editStudentModal').modal('hide');

                showAlert('اطلاعات دانش آموز با موفقیت بروزرسانی شد', 'success');
            } catch (error) {
                showAlert('خطا در بروزرسانی اطلاعات', 'error');
            }
        }
    });


    // Initialize everything
    initializeDatePickers();
    initializeFormValidation();

    initializeDataTable();
    updateStatistics();
    // Load from server and refresh UI when ready
    loadStudentsFromServer();

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
                // Reload data from server after bulk update
                await loadStudentsFromServer();
                $('#bulkEditModal').modal('hide');
                showAlert(`حلقه‌ها با موفقیت بروزرسانی شدند`, 'success');
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