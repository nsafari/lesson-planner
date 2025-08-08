// Initialize Persian DatePicker
function initializeDatePickers() {
    $('#birthDate').persianDatepicker({
        format: 'YYYY/MM/DD',
        initialValue: false,
        autoClose: true,
        onSelect: function (unix) {
            calculateAge(unix);
        }
    });

    $('#editBirthDate').persianDatepicker({
        format: 'YYYY/MM/DD',
        initialValue: false,
        autoClose: true,
        onSelect: function (unix) {
            calculateEditAge(unix);
        }
    });

}

// Calculate age from Persian date
function calculateAge(unix) {
    if (unix) {
        try {
            // Try using persianDate library if available
            if (typeof persianDate !== 'undefined') {
                const persianDateObj = new persianDate(unix);
                const gregorianDate = persianDateObj.toCalendar('gregorian').toLocale('en').format('YYYY-MM-DD');
                const birthYear = new Date(gregorianDate).getFullYear();
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;
                $('#age').val(age);
            } else {
                // Fallback: simple calculation based on Persian year
                const persianYear = Math.floor(unix / 31536000) + 1348; // Approximate conversion
                const currentPersianYear = new Date().getFullYear() - 621; // Approximate Persian year
                const age = currentPersianYear - persianYear;
                $('#age').val(age);
            }
        } catch (error) {
            console.log('Error calculating age:', error);
            // Simple fallback calculation
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - 20; // Default age
            $('#age').val(20);
        }
    }
}

function calculateEditAge(unix) {
    if (unix) {
        try {
            // Try using persianDate library if available
            if (typeof persianDate !== 'undefined') {
                const persianDateObj = new persianDate(unix);
                const gregorianDate = persianDateObj.toCalendar('gregorian').toLocale('en').format('YYYY-MM-DD');
                const birthYear = new Date(gregorianDate).getFullYear();
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;
                $('#editAge').val(age);
            } else {
                // Fallback: simple calculation based on Persian year
                const persianYear = Math.floor(unix / 31536000) + 1348; // Approximate conversion
                const currentPersianYear = new Date().getFullYear() - 621; // Approximate Persian year
                const age = currentPersianYear - persianYear;
                $('#editAge').val(age);
            }
        } catch (error) {
            console.log('Error calculating edit age:', error);
            // Simple fallback calculation
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - 20; // Default age
            $('#editAge').val(20);
        }
    }
}

// National Code Validation
function validateNationalCode(code) {
    if (code.length !== 10) return false;

    const digits = code.split('').map(Number);
    const checkDigit = digits[9];

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }

    const remainder = sum % 11;
    const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder;

    return checkDigit === calculatedCheckDigit;
}

// Form Validation
function initializeFormValidation() {
    $('#addStudentForm').validate({
        rules: {
            fullName: {
                required: true,
                minlength: 3
            },
            phone: {
                required: true,
                minlength: 11,
                maxlength: 11,
                digits: true
            },
            fatherName: {
                required: true,
                minlength: 2
            },
            motherName: {
                required: true,
                minlength: 2
            },
            birthDate: {
                required: true
            },
            nationalCode: {
                required: true,
                minlength: 10,
                maxlength: 10,
                digits: true,
                nationalCodeValidation: true
            },
            aboutMe: {
                required: true,
                minlength: 20
            },
            circle: {
                required: true
            },
            acceptTerms: {
                required: true
            }
        },
        messages: {
            fullName: {
                required: "نام و نام خانوادگی الزامی است",
                minlength: "نام و نام خانوادگی باید حداقل 3 کاراکتر باشد"
            },
            phone: {
                required: "شماره تماس الزامی است",
                minlength: "شماره تماس باید 11 رقم باشد",
                maxlength: "شماره تماس باید 11 رقم باشد",
                digits: "شماره تماس باید فقط شامل اعداد باشد"
            },
            fatherName: {
                required: "نام پدر الزامی است",
                minlength: "نام پدر باید حداقل 2 کاراکتر باشد"
            },
            motherName: {
                required: "نام مادر الزامی است",
                minlength: "نام مادر باید حداقل 2 کاراکتر باشد"
            },
            birthDate: {
                required: "تاریخ تولد الزامی است"
            },
            nationalCode: {
                required: "کد ملی الزامی است",
                minlength: "کد ملی باید 10 رقم باشد",
                maxlength: "کد ملی باید 10 رقم باشد",
                digits: "کد ملی باید فقط شامل اعداد باشد",
                nationalCodeValidation: "کد ملی وارد شده صحیح نیست"
            },
            aboutMe: {
                required: "درباره من الزامی است",
                minlength: "درباره من باید حداقل 20 کاراکتر باشد"
            },
            circle: {
                required: "انتخاب حلقه الزامی است"
            },
            acceptTerms: {
                required: "پذیرش قوانین مدرسه الزامی است"
            }
        },
        errorClass: "text-danger",
        highlight: function (element) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element) {
            $(element).removeClass('is-invalid');
        }
    });

    // Custom validation for national code
    $.validator.addMethod("nationalCodeValidation", function (value, element) {
        return validateNationalCode(value);
    });
}

export const addUser_form_validation = { initializeDatePickers, calculateAge, calculateEditAge, validateNationalCode, initializeFormValidation }
