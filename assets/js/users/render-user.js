import {utilities_user} from "./utilities-user.js"

const {getQualitativeStatus,getScoreStatus,lessons} = utilities_user

// منوی دروس
function renderLessonMenu(selectedId) {
    const menu = document.getElementById('lessonMenu');
    menu.innerHTML = '';
    // دکمه همه دروس
    const allBtn = document.createElement('button');
    allBtn.className = 'lesson-btn' + (!selectedId ? ' active' : '');
    allBtn.innerHTML = `<i class="fa fa-layer-group"></i> همه دروس`;
    allBtn.disabled = "true"
    allBtn.style.display = "none"
    allBtn.onclick = () => {
        renderLessonMenu(null);
        renderLessonInfo(null);
        renderTimeline(null);
        renderChart(null);
    };
    menu.appendChild(allBtn);
    lessons.forEach(lesson => {
        const btn = document.createElement('button');
        btn.className = 'lesson-btn' + (lesson.id === selectedId ? ' active' : '');
        btn.style.display = lesson.name !== 'قرآن' ? " none" : "block"
        btn.innerHTML = `<i class="fa ${lesson.icon}"></i> ${lesson.name}`;
        if (lesson.name == 'قرآن') btn.id = "quran"
        btn.onclick = () => {
            renderLessonMenu(lesson.id);
            renderLessonInfo(lesson);
            renderTimeline(lesson);
            renderChart(lesson);
        };
        menu.appendChild(btn);
    });
}

// اطلاعات کلی درس یا همه دروس
function renderLessonInfo(lesson) {
    const info = document.getElementById('lessonInfo');
    if (!lesson) {
        info.innerHTML = `<div class="mb-3 text-center"><strong>عملکرد کلی همه دروس در نمودار زیر قابل مشاهده است.</strong></div>`;
        return;
    }
    info.innerHTML = `
  <div class="mb-3 text-center">
    <img src="../assets/medai/${lesson.image}" alt="${lesson.name}" style="max-width:160px;max-height:110px;border-radius:1rem;box-shadow:0 2px 8px #0002;margin-bottom:1rem;">
        </div>
  <div class="mb-3"><strong>درباره درس:</strong> ${lesson.description}</div>
`;
}
// تایم‌لاین فقط برای درس انتخابی
function renderTimeline(lesson) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';
    if (!lesson) return;
    // افقی
    const horiz = document.createElement('div');
    horiz.className = 'timeline-horizontal';
    lesson.timeline.forEach((item, idx) => {
        if (idx > 0) {
            const bar = document.createElement('div');
            bar.className = 'timeline-bar';
            horiz.appendChild(bar);
        }
        const qual = getQualitativeStatus(item.score_qualitative);
        // نقطه و لیبل زیر آن
        const dotLabelWrap = document.createElement('div');
        dotLabelWrap.style.display = 'flex';
        dotLabelWrap.style.flexDirection = 'column';
        dotLabelWrap.style.alignItems = 'center';
        dotLabelWrap.style.minWidth = '60px';
        const dot = document.createElement('div');
        dot.className = `timeline-dot ${qual.color}`;
        dot.setAttribute('data-tippy-content', `بازخورد: <b class='score-${qual.color}'>${item.score_qualitative}</b>`);
        dot.innerHTML = `<i class=\"fa ${lesson.icon}\"></i>`;
        dot.onclick = () => showDetailModal(lesson, item);
        const label = document.createElement('div');
        label.className = 'timeline-label';
        label.innerText = item.surah;
        dotLabelWrap.appendChild(dot);
        dotLabelWrap.appendChild(label);
        horiz.appendChild(dotLabelWrap);
    });
    container.appendChild(horiz);
    // عمودی (موبایل) - ساختار مستقل و وسط‌چین
    const vert = document.createElement('div');
    vert.className = 'timeline-vertical-custom';
    //vert.style.display = 'flex';
    vert.style.flexDirection = 'column';
    vert.style.alignItems = 'center';
    vert.style.width = '100%';
    lesson.timeline.forEach((item, idx) => {
        // نقطه و لیبل زیر آن
        const dotLabelWrap = document.createElement('div');
        dotLabelWrap.style.display = 'flex';
        dotLabelWrap.style.flexDirection = 'column';
        dotLabelWrap.style.alignItems = 'center';
        dotLabelWrap.style.justifyContent = 'center';
        dotLabelWrap.style.width = '70px';
        dotLabelWrap.style.margin = '0 auto';
        const qual = getQualitativeStatus(item.score_qualitative);
        const dot = document.createElement('div');
        dot.className = `timeline-dot ${qual.color}`;
        dot.setAttribute('data-tippy-content', `بازخورد: <b class='score-${qual.color}'>${item.score_qualitative}</b>`);
        dot.innerHTML = `<i class=\"fa ${lesson.icon}\"></i>`;
        dot.onclick = () => showDetailModal(lesson, item);
        const label = document.createElement('div');
        label.className = 'timeline-label';
        label.innerText = item.surah;
        dotLabelWrap.appendChild(dot);
        dotLabelWrap.appendChild(label);
        vert.appendChild(dotLabelWrap);
        if (idx < lesson.timeline.length - 1) {
            const bar = document.createElement('div');
            bar.className = 'timeline-bar-vertical-custom';
            bar.style.width = '6px';
            bar.style.height = '40px';
            bar.style.background = 'linear-gradient(180deg, #e0e0e0 60%, #ed12a3 100%)';
            bar.style.margin = '0.2rem auto';
            bar.style.borderRadius = '3px';
            vert.appendChild(bar);
        }
    });
    container.appendChild(vert);
    // فعال‌سازی tooltip
    setTimeout(() => {
        tippy('.timeline-dot', { allowHTML: true, placement: 'top', theme: 'light-border' });
    }, 100);
}
// مدال جزئیات
function showDetailModal(lesson, item) {
    // معدل کمی و کیفی درس
    console.log(lesson.timeline);

    // بیشترین تکرار کیفی
    const status = getScoreStatus(item.score);
    const qual = getQualitativeStatus(item.score_qualitative);
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
  <h5><i class="fa ${lesson.icon}"></i> ${item.surah}</h5>
  <p>آیات: ${item.ayat}</p>
  <p>نام دبیر: <b>${item.teacher}</b></p>
  <p>نمره این بخش: <span class="score-${status.color}">${item.score}</span> <span class="status-emoji">${status.emoji}</span></p>
  <p>بازخورد کیفی این بخش: <span class="score-${qual.color}">${item.score_qualitative}</span> <span class="status-emoji">${qual.emoji}</span></p>
  <div class="progress mb-3">
    ${item.details.map(d => `
    <span class="progress-bar" role="progressbar" style="background-color:${getScoreStatus(d.score).color};width: calc(100%/${item.details.length}*(${d.score}/20))" aria-valuenow="${item.progress}" aria-valuemin="0" aria-valuemax="100"></span>`)
        }
    </div>
    <div class="progress mb-3">
      ${`<div class="progress-bar" role="progressbar" style="height: 5px,background-color:blue;width: calc(100%*${item.details.length}/3)" aria-valuenow="${item.progress}" aria-valuemin="0" aria-valuemax="100"></div>`}
    </div>
  <div class="alert alert-info"><b>بازخورد معلم:</b> ${item.feedback}</div>
  <h6 class="mt-3">مراحل حفظ/مطالعه:</h6>
  <ul>
    ${item.details.map(d => `
      <li>
        <br />
        <ul>
          <li>نوع: ${d.type}</li>
          <li>سوره: ${d.surah}</li>
          <li>${d.date} — از آیه ${d.from} تا ${d.to}</li>  
          <li>نمره: <span style="color:${getScoreStatus(d.score).color}">${d.score}</span></li>
        </ul>
      </li>
    `).join('')}
  </ul>
`;
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

// نمودار خطی پیشرفت
function renderChart(lesson) {
    document.querySelector("#progressChart").innerHTML = ""
    // نمودار کلی همه دروس (کیفی)
    const categories = lessons[0].timeline.map(item => item.surah);

    const series = ([lesson?.timeline][0] ? [lesson.timeline] : lessons).map(lesson1 => {
        return {
            name: lesson?.name || lesson1.name,
            data: lesson1.timeline ? lesson1.timeline.map(x => getQualitativeStatus(x.
                score_qualitative).score) : lesson1.map(x => getQualitativeStatus(x.score_qualitative).score),
            zones: [{
                value: 3,
                color: '#f15c80' // زیر آستانه = رنگ مردودی
            }, {
                color: '#7cb5ec' // بالای آستانه = رنگ اوکی
            }]
        };
    });

    Highcharts.chart('progressChart', {
        chart: {
            type: 'line',
            style: {
                fontFamily: 'Vazirmatn, sans-serif',
                fontSize: '14px' // فونت ثابت
            },
            scrollablePlotArea: {
                minWidth: 700,  // حداقل عرض نمودار برای فعال شدن اسکرول
                scrollPositionX: 0
            },
            events: {
                load: function () {
                    const chart = this;
                    const container = chart.container.parentNode; // div پدر که اسکرول داره

                    function toggleYAxis() {
                        // مقدار اسکرول افقی
                        const scrollLeft = container.scrollLeft;
                        // وقتی فاصله اسکرول کمتر از 10 پیکسل بود محور Y نمایش داده شود
                        if (scrollLeft < 10) {
                            chart.yAxis[0].update({ visible: true }, false);
                        } else {
                            chart.yAxis[0].update({ visible: false }, false);
                        }
                        chart.redraw();
                    }

                    container.addEventListener('scroll', toggleYAxis);
                    toggleYAxis(); // بار اول اجرا شود
                }
            }
        },
        title: { text: 'مقایسه عملکرد کیفی همه دروس' },
        xAxis: {
            categories,
            title: { text: 'مراحل' },
            labels: {
                formatter: function () { return this.value; }
            }
        },
        yAxis: {
            min: 1,
            max: 5,
            tickInterval: 1,
            title: { text: 'بازخورد کیفی' },
            labels: {
                formatter: function () {
                    return ['', 'سعی بیشتر', 'متوسط', 'خوب', 'عالی', 'ممتاز'][this.value];
                }
            },
            plotLines: [{
                value: 3,
                color: 'red',
                dashStyle: 'Dash',
                width: 2,
                label: {
                    text: 'حد مردودی',
                    align: 'right',
                    style: {
                        color: 'red',
                        fontWeight: 'bold'
                    }
                }
            }],
            visible: true // شروع با visible=true
        },
        tooltip: {
            formatter: function () {
                return `<b>${this.series.name}</b><br>مرحله: ${this.x}<br>بازخورد: <b>${['', 'سعی بیشتر', 'متوسط', 'خوب', 'عالی', 'ممتاز'][this.y]}</b>`;
            },
            useHTML: true
        },
        series,
        credits: { enabled: false }
    });
}

export const render_user = {renderLessonMenu,renderLessonInfo,renderTimeline,showDetailModal,renderChart}
