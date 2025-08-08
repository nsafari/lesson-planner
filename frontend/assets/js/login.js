const form = document.getElementById('loginForm');
const gifContainer = document.getElementById('quranGifContainer');
const gif = document.getElementById('quranGif');

$("#loginForm").validate({
    rules: {
        username: {
            required: true,
            minlength: 3
        },
        password: {
            required: true,
            minlength: 6
        },
        code: {
            required: true,
            digits: true,
            minlength: 4,
            maxlength: 6
        }
    },
    messages: {
        username: {
            required: "لطفاً نام کاربری را وارد کنید",
            minlength: "نام کاربری باید حداقل ۳ کاراکتر باشد"
        },
        password: {
            required: "لطفاً رمز عبور را وارد کنید",
            minlength: "رمز عبور باید حداقل ۶ کاراکتر باشد"
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
        console.log(form1);
        
        form.style.transition = 'opacity 1s';
        form.style.opacity = 0;
        setTimeout(() => {
            form.style.display = 'none';
            gifContainer.style.display = 'flex';
            setTimeout(() => {
                gifContainer.style.opacity = 1;
                // ریست گیف برای شروع مجدد
                gif.src = gif.src;
            }, 50);
        }, 1000);

        return false;
    }
});

form.addEventListener('submit', function (e) {
    e.preventDefault();

});