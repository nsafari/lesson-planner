// داده‌های نمونه دروس و مراحل
const lessons = [
    {
        id: 'quran',
        name: 'قرآن',
        icon: 'fa-quran',
        image: 'quran_yung.png',
        description: 'حفظ و تلاوت سوره‌های مختلف قرآن کریم به همراه ارزیابی ماهانه و بازخورد معلم.',
        timeline: [
            {
                surah: 'دو هفته اول',
                ayat: '۱ تا ۷',
                score: 19.5,
                score_qualitative: 'ممتاز',
                teacher: 'آقای رضایی',
                feedback: 'شروع عالی! تسلط و تلفظ بسیار خوب.',
                progress: 100,
                details: [
                    { date: '۱۴۰۲/۷/۱', from: 1, to: 3, surah: "الفاتحه", score: "19", type: "حفظ" },
                    { date: '۱۴۰۲/۷/۲', from: 4, to: 7, surah: "الفاتحه", score: "15", type: "حفظ" }
                ]
            },
            {
                surah: 'دو هفته دوم',
                ayat: '۱ تا ۲۰',
                score: 17.8,
                score_qualitative: 'عالی',
                teacher: 'آقای رضایی',
                feedback: 'حفظ خوب اما نیاز به مرور بیشتر.',
                progress: 100,
                details: [
                    { date: '۱۴۰۲/۷/۵', from: 1, to: 10, surah: "بقره", score: "17", type: "حفظ" },
                    { date: '۱۴۰۲/۷/۷', from: 11, to: 20, surah: "بقره", score: "17", type: "حفظ" }
                ]
            },
            {
                surah: 'دو هفته سوم',
                ayat: '۱ تا ۳۰',
                score: 15.2,
                score_qualitative: 'خوب',
                teacher: 'آقای رضایی',
                feedback: 'برخی آیات نیاز به تکرار دارند.',
                progress: 90,
                details: [
                    { date: '۱۴۰۲/۸/۱', from: 1, to: 15, surah: "بقره", score: "17" },
                    { date: '۱۴۰۲/۸/۳', from: 16, to: 30, surah: "بقره", score: "17" }
                ]
            },
            {
                surah: 'دو هفته چهارم',
                ayat: '۱ تا ۲۰',
                score: 12.5,
                score_qualitative: 'متوسط',
                teacher: 'آقای رضایی',
                feedback: 'نیاز به تلاش بیشتر و تمرین.',
                progress: 60,
                details: [
                    { date: '۱۴۰۲/۹/۱', from: 1, to: 10, surah: "بقره", score: "17" },
                    { date: '۱۴۰۲/۹/۴', from: 11, to: 20, surah: "بقره", score: "17" }
                ]
            },
            {
                surah: 'دو هفته پنجم',
                ayat: '۱ تا ۲۰',
                score: null,
                teacher: 'آقای رضایی',
                feedback: 'نیاز به تلاش بیشتر و تمرین.',
                progress: 60,
                details: [
                    { date: '۱۴۰۲/۹/۱', from: 1, to: 10, surah: "بقره", score: "17" },
                    { date: '۱۴۰۲/۹/۴', from: 11, to: 20, surah: "بقره", score: "17" }
                ]
            },
        ]
    },
    {
        id: 'arabi',
        name: 'عربی',
        icon: 'fa-language',
        image: 'irabic.jpg',
        description: 'یادگیری قواعد و ترجمه متون عربی، تمرین ترجمه و درک مطلب.',
        timeline: [
            {
                surah: 'درس ۱',
                ayat: 'صفحه ۱ تا ۵',
                score: 18.2,
                score_qualitative: 'ممتاز',
                teacher: 'خانم موسوی',
                feedback: 'درک مطلب عالی و ترجمه روان.',
                progress: 100,
                details: [
                    { date: '۱۴۰۲/۷/۳', from: 1, to: 3 },
                    { date: '۱۴۰۲/۷/۵', from: 4, to: 5 }
                ]
            },
            {
                surah: 'درس ۲',
                ayat: 'صفحه ۶ تا ۱۰',
                score: 16.7,
                score_qualitative: 'عالی',
                teacher: 'خانم موسوی',
                feedback: 'نیاز به تمرین بیشتر در قواعد.',
                progress: 90,
                details: [
                    { date: '۱۴۰۲/۷/۱۰', from: 6, to: 8 },
                    { date: '۱۴۰۲/۷/۱۲', from: 9, to: 10 }
                ]
            },
            {
                surah: 'درس ۳',
                ayat: 'صفحه ۱۱ تا ۱۵',
                score: 14.1,
                score_qualitative: 'خوب',
                teacher: 'خانم موسوی',
                feedback: 'مرور قواعد فراموش نشود.',
                progress: 80,
                details: [
                    { date: '۱۴۰۲/۸/۱', from: 11, to: 13 },
                    { date: '۱۴۰۲/۸/۳', from: 14, to: 15 }
                ]
            }
        ]
    },
    {
        id: 'adabiat',
        name: 'ادبیات',
        icon: 'fa-book-open',
        image: 'ferdossi.jpg',
        description: 'مطالعه و تحلیل متون ادبی فارسی، شعر و نثر و یادگیری آرایه‌های ادبی.',
        timeline: [
            {
                surah: 'درس ۱',
                ayat: 'صفحه ۱ تا ۴',
                score: 17.5,
                score_qualitative: 'عالی',
                teacher: 'آقای احمدی',
                feedback: 'تحلیل شعر عالی انجام شده.',
                progress: 100,
                details: [
                    { date: '۱۴۰۲/۷/۲', from: 1, to: 2 },
                    { date: '۱۴۰۲/۷/۴', from: 3, to: 4 }
                ]
            },
            {
                surah: 'درس ۲',
                ayat: 'صفحه ۵ تا ۸',
                score: 15.9,
                score_qualitative: 'خوب',
                teacher: 'آقای احمدی',
                feedback: 'آرایه‌ها نیاز به تمرین بیشتر دارد.',
                progress: 85,
                details: [
                    { date: '۱۴۰۲/۷/۸', from: 5, to: 6 },
                    { date: '۱۴۰۲/۷/۱۰', from: 7, to: 8 }
                ]
            }
        ]
    },
    {
        id: 'teb',
        name: 'طب',
        icon: 'fa-heart-pulse',
        image: 'doctor.jpeg',
        description: 'آشنایی با مبانی طب سنتی و نوین، یادگیری مفاهیم سلامت و بهداشت.',
        timeline: [
            {
                surah: 'مبحث ۱',
                ayat: 'صفحه ۱ تا ۳',
                score: 18.8,
                score_qualitative: 'ممتاز',
                teacher: 'دکتر نادری',
                feedback: 'مفاهیم به خوبی درک شده.',
                progress: 100,
                details: [
                    { date: '۱۴۰۲/۷/۱', from: 1, to: 3 }
                ]
            },
            {
                surah: 'مبحث ۲',
                ayat: 'صفحه ۴ تا ۶',
                score: 13.2,
                score_qualitative: 'متوسط',
                teacher: 'دکتر نادری',
                feedback: 'نیاز به مرور بیشتر.',
                progress: 70,
                details: [
                    { date: '۱۴۰۲/۷/۵', from: 4, to: 6 }
                ]
            }
        ]
    }
];

// وضعیت و رنگ نمره کیفی
function getQualitativeStatus(qual) {
    switch (qual) {
        case 'ممتاز':
            return { color: 'green', emoji: '🟢', score: 5 }
            break;
        case 'عالی':
            return { color: 'blue', emoji: '🔵', score: 4 }
            break;
        case 'خوب':
            return { color: 'yellow', emoji: '🟡', score: 3 }
            break;
        case 'متوسط':
            return { color: 'orange', emoji: '🟠', score: 2 }
            break;
        case 'سعی بیشتر':
            return { color: 'red', emoji: '🔴', score: 1 }
            break;
        default:
            return { color: 'gray', emoji: '⚪', score: 0 }
            break;
    }
}
// وضعیت و رنگ نمره کمی (برای نمودار کمی)
function getScoreStatus(score) {
    if (score >= 18) return { color: 'green', emoji: '🟢', status: 'قبول شده است' };
    if (score >= 16) return { color: 'blue', emoji: '🔵', status: 'قبول شده است' };
    if (score >= 13) return { color: 'yellow', emoji: '🟡', status: 'قبول شده است' };
    return { color: 'red', emoji: '🔴', status: 'مردود' };
}

export const utilities_user = { lessons, getQualitativeStatus, getScoreStatus }
