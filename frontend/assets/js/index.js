import {render_user} from "../js/users/render-user.js"

const {renderChart,renderLessonInfo,renderLessonMenu,renderTimeline} = render_user
// مقداردهی اولیه
renderLessonMenu(null);
renderLessonInfo(null);
renderTimeline(null);
renderChart(null);
document.getElementById("quran").click()

// Audio recordings data
const recordingsData = [
    {
        id: 1,
        recordTime: '۱۴۰۲/۰۵/۱۵ - ۱۴:۳۰',
        grade: 'excellent',
        feedback: 'تلفظ بسیار خوب بود، فقط روی مکث‌ها بیشتر کار کنید.',
        status: 'reviewed'
    },
    {
        id: 2,
        recordTime: '۱۴۰۲/۰۵/۱۰ - ۱۰:۱۵',
        grade: 'good',
        feedback: 'کلمات را واضح‌تر بیان کنید.',
        status: 'reviewed'
    },
    {
        id: 3,
        recordTime: '۱۴۰۲/۰۵/۰۵ - ۰۸:۴۵',
        grade: 'average',
        feedback: 'در حال بررسی',
        status: 'pending'
    },
    {
        id: 4,
        recordTime: '۱۴۰۲/۰۴/۲۸ - ۱۶:۲۰',
        status: 'not-sent'
    },
    {
        id: 5,
        recordTime: '۱۴۰۲/۰۴/۲۰ - ۱۱:۰۰',
        status: 'not-sent'
    }
];

// Grade mapping
const gradeMap = {
    excellent: 'عالی',
    good: 'خوب',
    average: 'متوسط',
    poor: 'ضعیف',
    fail: 'نیاز به تلاش بیشتر'
};

// Status mapping
const statusMap = {
    reviewed: 'بررسی شده',
    pending: 'در حال بررسی',
    'not-sent': 'ارسال نشده'
};

// Function to render recordings table
function renderRecordingsTable() {
    const tableBody = document.getElementById('recordingsTableBody');
    tableBody.innerHTML = '';

    const columnLabels = [
        "ردیف",
        "زمان ضبط",
        "نمره کیفی",
        "پخش",
        "بازخورد دبیر",
        "وضعیت ارسال"
    ];

    recordingsData.forEach((recording, index) => {
        const row = document.createElement('tr');

        if (recording.status === 'not-sent') {
            row.classList.add('text-muted');
        }

        let gradeDisplay = '-';
        let gradeClass = '';
        if (recording.grade) {
            gradeDisplay = gradeMap[recording.grade];
            gradeClass = `grade-${recording.grade}`;
        }

        const playButton = recording.status === 'not-sent'
            ? '<button class="play-btn disabled" disabled><i class="fas fa-play"></i></button>'
            : `<button class="play-btn"><i class="fas fa-play"></i></button>`;

        let statusClass = '';
        if (recording.status) {
            statusClass = `status-${recording.status.replace(' ', '-')}`;
        }

        // Create cells with data-label attributes
        const cells = [
            { value: index + 1, class: '' },
            { value: recording.recordTime, class: '' },
            { value: gradeDisplay, class: gradeClass },
            { value: playButton, class: '' },
            { value: recording.feedback || '-', class: '' },
            { value: statusMap[recording.status] || 'ارسال نشده', class: statusClass }
        ];

        cells.forEach((cell, i) => {
            const td = document.createElement('td');
            td.innerHTML = cell.value;
            if (cell.class) td.className = cell.class;
            td.setAttribute('data-label', columnLabels[i]);
            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });

    document.querySelectorAll('.play-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Playing audio...');
        });
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', renderRecordingsTable);