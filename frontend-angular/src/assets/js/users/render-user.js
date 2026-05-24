import { utilities_user } from "./utilities-user.js";
import { ApiService } from "../api/api.service.js";
import { base64ToObject } from "../utilites/byte64.js";

const { getQualitativeStatus, getScoreStatus } = utilities_user;

// منوی دروس
async function renderLessonMenu(selectedId) {
    const menu = document.getElementById('lessonMenu');
    menu.innerHTML = '';

    try {
        // دریافت دوره‌های فعال از API
        const courses = await ApiService.getActiveCourses();

        courses.forEach(course => {
            const btn = document.createElement('button');
            btn.className = 'lesson-btn' + (course.id === selectedId ? ' active' : '');
            btn.innerHTML = `<i class="fa fa-book"></i> ${course.title}`;
            btn.onclick = async () => {
                renderLessonMenu(course.id);
                renderLessonInfo(course);
                await renderTimeline(course);
                await renderChart(course);
            };
            menu.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        menu.innerHTML = '<div class="alert alert-danger">خطا در بارگذاری دوره‌ها</div>';
    }
}

// اطلاعات کلی درس
function renderLessonInfo(course) {
    const info = document.getElementById('lessonInfo');
    if (!course) {
        info.innerHTML = `<div class="mb-3 text-center"><strong>لطفاً یک دوره را انتخاب کنید.</strong></div>`;
        return;
    }
    info.innerHTML = `
        <div class="mb-3 text-center">
            <h3>${course.title}</h3>
        </div>
        <div class="mb-3">
            <strong>استاد:</strong> ${course.instructor}<br>
            <strong>درباره درس:</strong> ${course.description}
        </div>
    `;
}

// تایم‌لاین تکالیف روزانه
async function renderTimeline(course) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';
    if (!course) return;

    try {
        // دریافت تکالیف دوره از API
        const assignments = await ApiService.getCourseAssignments(course.id);
        if (!assignments.length) {
            container.innerHTML = '<div class="alert alert-info">هنوز تکلیفی برای این دوره تعریف نشده است.</div>';
            return;
        }

        // افقی
        const horiz = document.createElement('div');
        horiz.className = 'timeline-horizontal';

        assignments.forEach((assignment, idx) => {
            if (idx > 0) {
                const bar = document.createElement('div');
                bar.className = 'timeline-bar';
                horiz.appendChild(bar);
            }

            // نقطه و لیبل زیر آن
            const dotLabelWrap = document.createElement('div');
            dotLabelWrap.style.display = 'flex';
            dotLabelWrap.style.flexDirection = 'column';
            dotLabelWrap.style.alignItems = 'center';
            dotLabelWrap.style.minWidth = '60px';

            const dot = document.createElement('div');
            const status = getSubmissionStatus(assignment);
            dot.className = `timeline-dot ${status.color}`;
            dot.setAttribute('data-tippy-content', `${assignment.title}<br>تاریخ: ${new Date(assignment.assignmentDate).toLocaleDateString('fa-IR')}`);
            dot.innerHTML = assignment.attachments?.length ? '<i class="fa fa-file-audio"></i>' : '<i class="fa fa-book"></i>';
            dot.onclick = () => showDetailModal(course, assignment);

            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.innerText = `روز ${idx + 1}`;

            dotLabelWrap.appendChild(dot);
            dotLabelWrap.appendChild(label);
            horiz.appendChild(dotLabelWrap);
        });

        container.appendChild(horiz);

        // فعال‌سازی tooltip
        setTimeout(() => {
            tippy('.timeline-dot', { allowHTML: true, placement: 'top', theme: 'light-border' });
        }, 100);

    } catch (error) {
        console.error('Error loading assignments:', error);
        container.innerHTML = '<div class="alert alert-danger">خطا در بارگذاری تکالیف</div>';
    }
}

// مدال جزئیات تکلیف روزانه
async function showDetailModal(course, assignment) {
    try {
        // دریافت پیشرفت دانش‌آموز در این تکلیف
        const progress = await ApiService.getAssignmentProgress(1, assignment.id); // TODO: studentId dynamic

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h5>${assignment.title}</h5>
            <p><strong>تاریخ:</strong> ${new Date(assignment.assignmentDate).toLocaleDateString('fa-IR')}</p>
            <p><strong>توضیحات:</strong> ${assignment.description}</p>
            <p><strong>دستورالعمل:</strong> ${assignment.instructions}</p>

            ${assignment.attachments?.length ? `
                <h6 class="mt-4">فایل‌های ضمیمه:</h6>
                <div class="list-group mb-4">
                    ${assignment.attachments.map(att => `
                        <a href="${att.url}" class="list-group-item list-group-item-action">
                            <i class="fa ${att.kind === 'audio' ? 'fa-file-audio' : 'fa-file'} me-2"></i>
                            ${att.title}
                            ${att.description ? `<small class="d-block text-muted">${att.description}</small>` : ''}
                        </a>
                    `).join('')}
                </div>
            ` : ''}

            ${progress ? `
                <div class="alert ${progress.isCompleted ? 'alert-success' : 'alert-warning'}">
                    <strong>وضعیت:</strong> ${progress.isCompleted ? 'تکمیل شده' : 'در انتظار تکمیل'}<br>
                    <strong>نمره روزانه:</strong> ${progress.dailyScore || '-'}<br>
                    <strong>نمره تجمعی:</strong> ${progress.cumulativeScore || '-'}
                </div>
                ${progress.feedback ? `
                    <div class="alert alert-info">
                        <strong>بازخورد استاد:</strong><br>${progress.feedback}
                    </div>
                ` : ''}
            ` : `
                <div class="alert alert-warning">هنوز ارسالی برای این تکلیف ثبت نشده است.</div>
            `}

            ${!progress?.isCompleted ? `
                <button class="btn btn-primary mt-3" onclick="submitDailyWork(${assignment.id})">
                    ثبت کار روزانه
                </button>
            ` : ''}
        `;

        const modal = new bootstrap.Modal(document.getElementById('detailModal'));
        modal.show();

    } catch (error) {
        console.error('Error loading assignment details:', error);
        alert('خطا در بارگذاری جزئیات تکلیف');
    }
}

// نمودار پیشرفت
async function renderChart(course) {
    if (!course) {
        document.querySelector("#progressChart").innerHTML = "";
        return;
    }

    try {
        // دریافت تکالیف و ارسال‌های دوره
        const assignments = await ApiService.getCourseAssignments(course.id);
        const submissions = await ApiService.getStudentSubmissions(1); // TODO: studentId dynamic

        // اطمینان از مرتب‌سازی بر اساس تاریخ تکلیف
        assignments.sort((a, b) => new Date(a.assignmentDate).getTime() - new Date(b.assignmentDate).getTime());

        // استخراج نمره روزانه متناظر با هر تکلیف
        const dailyScores = assignments.map(a => {
            const submission = submissions.find(s => s.assignmentId === a.id);
            return typeof submission?.dailyScore === 'number' ? submission.dailyScore : null;
        });

        // تجمیع به بازه‌های ۱۲ روزه و محاسبه میانگین هر بازه
        const chunkSize = 12;
        const categories = [];
        const averagedScores = [];
        for (let i = 0; i < assignments.length; i += chunkSize) {
            const chunkAssignments = assignments.slice(i, i + chunkSize);
            const chunkScores = dailyScores.slice(i, i + chunkSize).filter(v => typeof v === 'number');
            const avg = chunkScores.length > 0
                ? Math.round((chunkScores.reduce((sum, v) => sum + v, 0) / chunkScores.length) * 10) / 10
                : 0;
            averagedScores.push(avg);

            const start = new Date(chunkAssignments[0].assignmentDate).toLocaleDateString('fa-IR');
            const end = new Date(chunkAssignments[chunkAssignments.length - 1].assignmentDate).toLocaleDateString('fa-IR');
            categories.push(`${start} تا ${end}`);
        }

        Highcharts.chart('progressChart', {
            chart: {
                type: 'line',
                style: {
                    fontFamily: 'Vazirmatn, sans-serif',
                    fontSize: '14px'
                }
            },
            title: { text: 'میانگین نمرات هر دو هفته' },
            xAxis: {
                categories,
                title: { text: 'بازه‌های دو هفته‌ای' }
            },
            yAxis: {
                title: { text: 'میانگین نمره' },
                min: 0,
                max: 100
            },
            tooltip: {
                formatter: function () {
                    return `<b>${this.series.name}</b><br/>بازه: ${this.x}<br/>میانگین: <b>${this.y}</b>`;
                },
                useHTML: true
            },
            series: [{
                name: `${course.title} (میانگین هر دو هفته)`,
                data: averagedScores,
                color: '#7cb5ec'
            }],
            credits: { enabled: false }
        });

    } catch (error) {
        console.error('Error rendering chart:', error);
        document.querySelector("#progressChart").innerHTML = '<div class="alert alert-danger">خطا در بارگذاری نمودار</div>';
    }
}

// کمک‌کننده: وضعیت ظاهری تکلیف در تایم‌لاین
function getSubmissionStatus(assignment) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignmentDate = new Date(assignment.assignmentDate);
    assignmentDate.setHours(0, 0, 0, 0);

    if (assignmentDate > today) {
        return { color: 'gray', text: 'آینده' };
    } else if (assignmentDate.getTime() === today.getTime()) {
        return { color: 'blue', text: 'امروز' };
    } else {
        return { color: 'green', text: 'گذشته' };
    }
}

// ثبت کار روزانه
window.submitDailyWork = async function (assignmentId) {
    try {
        const submissionData = {
            dailyScore: 85, // TODO: از فرم دریافت شود
            isCompleted: true,
            audioFileUrl: 'uploads/temp.mp3', // TODO: از ضبط صدا دریافت شود
            notes: 'تکلیف امروز انجام شد'
        };

        await ApiService.submitDailyWork(1, assignmentId, submissionData); // TODO: studentId dynamic
        alert('کار روزانه با موفقیت ثبت شد');
        location.reload(); // بارگذاری مجدد برای نمایش تغییرات

    } catch (error) {
        console.error('Error submitting daily work:', error);
        alert('خطا در ثبت کار روزانه');
    }
};

// نمایش ارسال‌های دانش‌آموز
window.loadStudentSubmissions = async function (studentId) {
    try {
        const submissions = await ApiService.getStudentSubmissionsWithDetails(studentId);
        displaySubmissions(submissions);
    } catch (error) {
        console.error('Error loading submissions:', error);
        // نمایش پیام خطا به کاربر
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'خطا',
                text: 'خطا در بارگذاری ارسال‌ها',
                icon: 'error',
                confirmButtonText: 'باشه'
            });
        } else {
            alert('خطا در بارگذاری ارسال‌ها');
        }
    }
};

// نمایش ارسال‌ها در UI
function displaySubmissions(submissions) {
    const submissionsContainer = document.getElementById('submissionsContainer');
    if (!submissionsContainer) return;

    if (submissions.length === 0) {
        submissionsContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                هنوز هیچ ارسالی ثبت نشده است.
            </div>
        `;
        return;
    }

    let html = '<div class="row">';
    
    submissions.forEach((submission, index) => {
        const submissionDate = new Date(submission.submissionDate).toLocaleDateString('fa-IR');
        const assignmentTitle = submission.assignment?.title || `تکلیف ${submission.assignmentId}`;
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0">
                            <i class="fas fa-file-audio me-2"></i>
                            ${assignmentTitle}
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <small class="text-muted">تاریخ ارسال:</small>
                            <div>${submissionDate}</div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">نمره روزانه:</small>
                            <div class="badge bg-success">${submission.dailyScore || 0}</div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">وضعیت:</small>
                            <div class="badge bg-${submission.status === 'submitted' ? 'primary' : 'secondary'}">
                                ${submission.status === 'submitted' ? 'ارسال شده' : submission.status}
                            </div>
                        </div>
                        ${submission.notes ? `
                            <div class="mb-2">
                                <small class="text-muted">یادداشت:</small>
                                <div class="small">${submission.notes}</div>
                            </div>
                        ` : ''}
                        ${submission.audioFileUrl ? `
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-primary" onclick="playSubmissionAudio('${submission.audioFileUrl}', ${index})">
                                    <i class="fas fa-play me-1"></i>
                                    پخش صوت
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    submissionsContainer.innerHTML = html;
}

// پخش صوت ارسال
window.playSubmissionAudio = function (audioUrl, submissionIndex) {
    try {
        const fullUrl = audioUrl.startsWith('http') ? audioUrl : `http://localhost:5253${audioUrl}`;
        const audio = new Audio(fullUrl);
        
        audio.play().then(() => {
            console.log('Audio started playing');
        }).catch(error => {
            console.error('Error playing audio:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'خطا',
                    text: 'خطا در پخش فایل صوتی',
                    icon: 'error',
                    confirmButtonText: 'باشه'
                });
            } else {
                alert('خطا در پخش فایل صوتی');
            }
        });
    } catch (error) {
        console.error('Error creating audio element:', error);
    }
};

ApiService.getUserData()

// تابع برای نمایش مدال با اطلاعات
export function showStudentModal(data) {
    document.getElementById('firstName').textContent = data.firstName || '';
    document.getElementById('lastName').textContent = data.lastName || '';
    document.getElementById('email').textContent = data.email || '';
    document.getElementById('phoneNumber').textContent = data.phoneNumber || '';
    document.getElementById('studentId').textContent = data.studentId || '';
    document.getElementById('status').textContent = data.status || '';
    document.getElementById('dateOfBirth').textContent = data.dateOfBirth || '';
    document.getElementById('address').textContent = data.address || '';
    document.getElementById('createdAt').textContent = data.createdAt?.split('T')[0] || '';
    document.getElementById('updatedAt').textContent = data.updatedAt?.split('T')[0] || '';

    // نمایش مدال
    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
}

export const render_user = { renderLessonMenu, renderLessonInfo, renderTimeline, showDetailModal, renderChart };
