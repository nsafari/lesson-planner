import { ApiService } from "./api/api.service.js";
import { objectToBase64 } from "./utilites/byte64.js";

const form = document.getElementById('loginForm');
const gifContainer = document.getElementById('quranGifContainer');
const gif = document.getElementById('quranGif');

async function handleSubmit(form1) {
    const formData = new FormData(form1);
    const data = Object.fromEntries(formData.entries());
    
    const result = await ApiService.signInStudent(data);

    if (!result.email) {
        Swal.fire({
            title: "خطا!",
            text: result,
            icon: "error"
        });
    }
    else {
        localStorage.setItem("user", objectToBase64(result))
        Swal.fire({
            title: "ورود موفق",
            icon: "success"
        });

        setTimeout(
            () => window.location.href = "/frontend/users/login.html", 1000
        )
    }
    return true
}

$("#loginForm").validate({
    rules: {
        email: {
            required: true,
            email: true
        },
        phoneNumber: {
            required: true,
            minlength: 6,
            digits: true
        },

        code: {
            required: true,
            digits: true,
            minlength: 4,
            maxlength: 6
        }
    },
    messages: {
        email: {
            required: "لطفاً ایمیل را وارد کنید",
            email: "لطفاً یک ایمیل معتبر وارد کنید"
        },
        phoneNumber: {
            required: "لطفاً شماره تلفن را وارد کنید",
            minlength: "شماره تلفن باید حداقل ۶ کاراکتر باشد"
        },
        code: {
            required: "لطفاً کد ورود را وارد کنید",
            digits: "کد باید فقط عدد باشد",
            minlength: "کد حداقل باید ۴ رقم باشد",
            maxlength: "کد حداکثر باید ۶ رقم باشد"
        }
    },
    errorClass: "is-invalid",
    validClass: "is-valid",
    errorElement: "div",
    highlight: function (element) {
        $(element).addClass("is-invalid").removeClass("is-valid");
    },
    unhighlight: function (element) {
        $(element).removeClass("is-invalid").addClass("is-valid");
    },
    errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        error.insertAfter(element);
    },
    submitHandler: function (form1) {
        form.style.transition = 'opacity 1s';
        form.style.opacity = 0;

        handleSubmit(form1)
        let interVal = setTimeout(() => {
            form.style.display = 'none';
            gifContainer.style.display = 'flex';
            setTimeout(() => {
                gifContainer.style.opacity = 1;
                // ریست گیف برای شروع مجدد
                gif.src = gif.src;
            }, 50);
        }, 1000);

        setTimeout(() => {
            window.location.reload()
        }, 5000);


        return false;
    }
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
});