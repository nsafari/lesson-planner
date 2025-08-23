import { render_user } from "./users/render-user.js";
import { ApiService } from "./api/api.service.js";

const { renderLessonMenu, renderLessonInfo, renderTimeline, renderChart } = render_user;

// مقداردهی اولیه
async function initializeApp() {
    try {
        // تنظیم توکن (موقتاً هاردکد)
        ApiService.setToken('test-token');

        // دریافت دوره‌های فعال
        const courses = await ApiService.getActiveCourses();
        if (courses.length > 0) {
            // نمایش اولین دوره
            const firstCourse = courses[0];
            renderLessonMenu(firstCourse.id);
            renderLessonInfo(firstCourse);
            await renderTimeline(firstCourse);
            await renderChart(firstCourse);
        } else {
            renderLessonInfo(null);
        }

        // دریافت و نمایش ارسال‌های اخیر
        await renderRecentSubmissions();

    } catch (error) {
        console.error('Error initializing app:', error);
        alert('خطا در بارگذاری اطلاعات');
    }
}

// نمایش ارسال‌های اخیر
async function renderRecentSubmissions() {
    try {
        // دریافت ارسال‌های دانش‌آموز
        const submissions = await ApiService.getStudentSubmissions(1); // TODO: studentId dynamic
        const tableBody = document.getElementById('recordingsTableBody');
        tableBody.innerHTML = '';

        if (!submissions.length) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">هنوز ارسالی ثبت نشده است.</td></tr>';
            return;
        }

        const columnLabels = [
            "ردیف",
            "تاریخ",
            "نمره",
            "پخش",
            "بازخورد",
            "وضعیت"
        ];

        submissions.forEach((submission, index) => {
            const row = document.createElement('tr');
            if (!submission.isCompleted) {
                row.classList.add('text-muted');
            }

            const cells = [
                { value: index + 1, class: '' },
                { value: new Date(submission.submissionDate).toLocaleDateString('fa-IR'), class: '' },
                { value: submission.dailyScore || '-', class: submission.dailyScore >= 90 ? 'text-success' : '' },
                {
                    value: submission.audioFileUrl
                        ? `<button class="play-btn" onclick="playAudio('${submission.audioFileUrl}')"><i class="fas fa-play"></i></button>`
                        : '<button class="play-btn disabled" disabled><i class="fas fa-play"></i></button>',
                    class: ''
                },
                { value: submission.feedback || '-', class: '' },
                {
                    value: submission.isCompleted ? 'تکمیل شده' : 'ناتمام',
                    class: `status-${submission.isCompleted ? 'completed' : 'pending'}`
                }
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

    } catch (error) {
        console.error('Error loading submissions:', error);
        document.getElementById('recordingsTableBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">خطا در بارگذاری ارسال‌ها</td></tr>';
    }
}

// پخش فایل صوتی
window.playAudio = function(url) {
    const audio = new Audio(url);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('خطا در پخش فایل صوتی');
    });
};

// شروع برنامه
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
    
    // Load student submissions on page load
    if (typeof loadStudentSubmissions === 'function') {
        loadStudentSubmissions(1);
    }
});