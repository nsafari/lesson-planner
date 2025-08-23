// Import API service
import { ApiService } from './api/api.service.js';

// Initialize variables
let recorder;
let audioContext;
let analyser;
let microphone;
let dataArray;
let animationFrame;
let isRecording = false;
let isPlaying = false;
let isSamplePlaying = false;
let startTime;
let timerInterval;
let audioBlob;
let audioUrl;
let sampleAudio;
let sampleSource;
let sampleAnalyser;
let samplePlayCount = 0;
let requiredSamplePlays = 3;

// Configuration for API
let STUDENT_ID = 1; // Will be set dynamically
let ASSIGNMENT_ID = 1; // Will be set dynamically

// Function to get configuration from URL parameters or localStorage
function getConfiguration() {
    // Try to get from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlStudentId = urlParams.get('studentId');
    const urlAssignmentId = urlParams.get('assignmentId');

    if (urlStudentId) STUDENT_ID = parseInt(urlStudentId);
    if (urlAssignmentId) ASSIGNMENT_ID = parseInt(urlAssignmentId);

    // If not in URL, try to get from localStorage
    if (!urlStudentId) {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.id) STUDENT_ID = user.id;
            } catch (e) {
                console.warn('Could not parse user data from localStorage');
            }
        }
    }

    console.log(`Configuration: Student ID: ${STUDENT_ID}, Assignment ID: ${ASSIGNMENT_ID}`);
}

// Function to set assignment ID dynamically
function setAssignmentId(assignmentId) {
    ASSIGNMENT_ID = parseInt(assignmentId);
    console.log(`Assignment ID updated to: ${ASSIGNMENT_ID}`);
}

// Function to set student ID dynamically
function setStudentId(studentId) {
    STUDENT_ID = parseInt(studentId);
    console.log(`Student ID updated to: ${STUDENT_ID}`);
}

// Make functions available globally for external use
window.setAssignmentId = setAssignmentId;
window.setStudentId = setStudentId;

// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const playbackBtn = document.getElementById('playbackBtn');
const sendBtn = document.getElementById('sendBtn');
const sampleBtn = document.getElementById('sampleBtn');
const statusText = document.getElementById('statusText');
const recordingTimer = document.getElementById('recordingTimer');
const audioPlayer = document.getElementById('audioPlayer');
const audioPlayerContainer = document.getElementById('audioPlayerContainer');
const permissionMessage = document.getElementById('permissionMessage');
const visualizer = document.getElementById('visualizer');
const sampleCounter = document.getElementById('sampleCounter');
const readyMessage = document.getElementById('readyMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadingText = document.getElementById('loadingText');
const loadingDetails = document.getElementById('loadingDetails');

// Create visualizer bars
function createVisualizer() {
    visualizer.innerHTML = '';
    for (let i = 0; i < 24; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.height = '5px';
        visualizer.appendChild(bar);
    }
}

createVisualizer();

// Initialize tooltips
tippy('#recordBtn', {
    content: 'شروع / توقف ضبط صوت',
    placement: 'top'
});

tippy('#playbackBtn', {
    content: 'پخش/توقف صوت ضبط شده',
    placement: 'top'
});

tippy('#sendBtn', {
    content: 'ارسال صوت',
    placement: 'top'
});

tippy('#sampleBtn', {
    content: 'پخش نمونه صوت',
    placement: 'top'
});

// Function to show loading indicator
function showLoading(message = 'در حال ارسال صوت...', details = '') {
    loadingText.textContent = message;
    loadingDetails.textContent = details;
    loadingIndicator.style.display = 'block';
}

// Function to hide loading indicator
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Function to update loading details
function updateLoadingDetails(details) {
    loadingDetails.textContent = details;
}

// Function to simulate upload progress
function simulateUploadProgress() {
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
            progress = 90; // Stop at 90% until server responds
            clearInterval(progressInterval);
        }
        updateLoadingDetails(`پیشرفت آپلود: ${Math.round(progress)}%`);
    }, 200);

    return progressInterval;
}

// Create sample audio data (synthetic audio)
function createSampleAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 3; // 3 seconds
    const sampleRate = audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate synthetic audio data
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Create a combination of sine waves for interesting sound
        data[i] = Math.sin(2 * Math.PI * 440 * t) * 0.5 +
            Math.sin(2 * Math.PI * 880 * t) * 0.3 +
            Math.sin(2 * Math.PI * 220 * t) * 0.2;
    }

    return buffer;
}

// Update sample counter display
function updateSampleCounter() {
    if (samplePlayCount >= requiredSamplePlays) {
        sampleCounter.style.display = 'none';
        readyMessage.style.display = 'inline-block';
        recordBtn.disabled = false;
        statusText.textContent = 'آماده برای ضبط صوت';
    } else {
        sampleCounter.textContent = `صوت نمونه را 3 بار گوش دهید: ${samplePlayCount}/${requiredSamplePlays}`;
        readyMessage.style.display = 'none';
    }
}

// Get microphone access
async function getMicrophoneAccess() {
    try {
        permissionMessage.style.display = 'block';
        statusText.textContent = 'در حال درخواست دسترسی به میکروفون...';

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        permissionMessage.style.display = 'none';
        statusText.textContent = 'دسترسی به میکروفون تأیید شد';

        // Setup audio context and recorder
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(stream);

        // Setup analyzer for visualization
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Setup recorder.js
        recorder = new Recorder(microphone);

        return true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        permissionMessage.style.display = 'block';
        permissionMessage.textContent = 'خطا در دسترسی به میکروفون: ' + error.message;
        statusText.textContent = 'خطا در دسترسی به میکروفون';
        return false;
    }
}

// Start recording
async function startRecording() {
    if (!recorder) {
        const success = await getMicrophoneAccess();
        if (!success) return;
    }

    try {
        recorder.clear();
        recorder.record();
        isRecording = true;
        recordBtn.classList.add('recording');
        recordBtn.innerHTML = '⏹';
        statusText.textContent = 'در حال ضبط...';
        recordingTimer.style.display = 'block';

        // Start timer
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);

        // Start visualization
        visualize();

    } catch (error) {
        console.error('Error starting recording:', error);
        statusText.textContent = 'خطا در شروع ضبط';
    }
}

// Stop recording
function stopRecording() {
    if (recorder && isRecording) {
        recorder.stop();
        isRecording = false;
        recordBtn.classList.remove('recording');
        recordBtn.innerHTML = '⚫';
        statusText.textContent = 'ضبط متوقف شد';
        recordingTimer.style.display = 'none';

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Stop visualization
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        // Get recorded audio
        recorder.exportWAV(function (blob) {
            audioBlob = blob;
            audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            audioPlayerContainer.style.display = 'block';
            playbackBtn.style.display = 'flex';
            sendBtn.style.display = 'flex';
        });
    }
}

// Update recording timer
function updateTimer() {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000);
    recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Visualize audio
function visualize() {
    if (!analyser && !sampleAnalyser) return;

    let currentAnalyser = analyser;
    if (isSamplePlaying && sampleAnalyser) {
        currentAnalyser = sampleAnalyser;
    }

    if (currentAnalyser) {
        currentAnalyser.getByteFrequencyData(dataArray);

        const bars = visualizer.querySelectorAll('.visualizer-bar');
        for (let i = 0; i < bars.length; i++) {
            const value = dataArray[i] || 0;
            const height = Math.max(5, value / 255 * 70);
            bars[i].style.height = height + 'px';
        }
    }

    if (isRecording || isPlaying || isSamplePlaying) {
        animationFrame = requestAnimationFrame(visualize);
    }
}

// Toggle playback
function togglePlayback() {
    if (isPlaying) {
        audioPlayer.pause();
        playbackBtn.innerHTML = '▶';
        statusText.textContent = 'پخش متوقف شد';
        isPlaying = false;
        samplePlayCount -= 2
        console.log(1);


        // Stop visualization
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    } else {
        audioPlayer.play();
        playbackBtn.innerHTML = '⏹';
        statusText.textContent = 'در حال پخش صوت ضبط شده...';
        isPlaying = true;

        // Start visualization
        visualize();
    }
}

// Play sample audio
function playSample() {
    let isEndPlay = false
    if (isSamplePlaying) {
        // Stop sample playback
        if (sampleSource) {
            sampleSource.stop();
            if (!isEndPlay) samplePlayCount--
        }
        sampleBtn.innerHTML = '▶';
        statusText.textContent = samplePlayCount >= requiredSamplePlays ? 'آماده برای ضبط صوت' : `صوت نمونه را ${requiredSamplePlays - samplePlayCount} بار دیگر گوش دهید`;
        isSamplePlaying = false;
        // Stop visualization
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        return;
    }

    // Create and play sample audio
    const sampleBuffer = createSampleAudio();
    const context = new (window.AudioContext || window.webkitAudioContext)();

    // Setup analyzer for sample audio
    sampleAnalyser = context.createAnalyser();
    sampleAnalyser.fftSize = 64;
    const bufferLength = sampleAnalyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    sampleSource = context.createBufferSource();
    sampleSource.buffer = sampleBuffer;
    sampleSource.connect(sampleAnalyser);
    sampleAnalyser.connect(context.destination);

    sampleSource.onended = function () {
        sampleBtn.innerHTML = '▶';
        isSamplePlaying = false;
        isEndPlay = true;

        // Increment play count only when sample finishes playing completely
        if (samplePlayCount < requiredSamplePlays) {
            samplePlayCount++;
            updateSampleCounter();
        }

        statusText.textContent = samplePlayCount >= requiredSamplePlays ? 'آماده برای ضبط صوت' : `صوت نمونه را ${requiredSamplePlays - samplePlayCount} بار دیگر گوش دهید`;

        // Stop visualization
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    };


    sampleSource.start();
    sampleBtn.innerHTML = '⏹';
    statusText.textContent = 'در حال پخش نمونه صوت...';
    isSamplePlaying = true;

    // Start visualization
    visualize();
}

// Send audio
async function sendAudio(event) {
    // Prevent any default form submission behavior
    if (event) {
        event.preventDefault();
    }

    console.log('sendAudio function called', { event, audioBlob: !!audioBlob });

    if (!audioBlob) {
        Swal.fire({
            title: 'خطا!',
            text: 'هیچ فایل صوتی برای ارسال وجود ندارد.',
            icon: 'error',
            confirmButtonText: 'باشه'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'تأیید ارسال',
        text: "آیا از ارسال این پیام صوتی اطمینان دارید؟",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'بله، ارسال کن',
        cancelButtonText: 'لغو',
        reverseButtons: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        showLoading('در حال ارسال صوت به سرور...', 'شروع آپلود فایل...');
        sendBtn.disabled = true;
        sendBtn.innerHTML = '⏳';

        // شروع شبیه‌سازی پیشرفت آپلود
        const progressInterval = simulateUploadProgress();

        try {
            // Prepare submission data with hardcoded test values
            const submissionData = {
                dailyScore: 85, // Hardcoded test value
                isCompleted: true,
                notes: 'تکلیف صوتی ارسال شد - تست',
                timeSpent: Math.floor((Date.now() - startTime) / 1000), // زمان ضبط به ثانیه
                status: 'submitted'
            };

            console.log('Sending audio to server...', {
                studentId: STUDENT_ID,
                assignmentId: ASSIGNMENT_ID,
                submissionData
            });

            updateLoadingDetails('ارسال فایل به سرور...');

            // Send audio to server using API service
            const response = await ApiService.submitDailyWorkWithAudio(
                STUDENT_ID,
                ASSIGNMENT_ID,
                audioBlob,
                submissionData
            );

            // توقف شبیه‌سازی پیشرفت
            clearInterval(progressInterval);
            updateLoadingDetails('پیشرفت آپلود: 100%');

            console.log('Server response:', response);

            // بررسی پاسخ سرور
            if (response && (response.success || response.id || response.message)) {
                // نمایش پیام موفقیت با جزئیات
                let successMessage = 'پیام صوتی با موفقیت به سرور ارسال شد.';
                if (response.message) {
                    successMessage = response.message;
                }
                if (response.id) {
                    successMessage += `\nشناسه ارسال: ${response.id}`;
                }

                await Swal.fire({
                    title: '✅ موفق!',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonText: 'باشه',
                    showCloseButton: true
                });

                statusText.textContent = 'صوت با موفقیت به سرور ارسال شد';

                // نمایش جزئیات پاسخ در کنسول
                console.log('Audio submission successful:', response);
                // Reset UI
                sendBtn.style.display = 'none';
                playbackBtn.style.display = 'none';
                audioPlayerContainer.style.display = 'none';
                audioPlayer.pause();
                playbackBtn.innerHTML = '▶';
                isPlaying = false;

                // Clean up audio blob
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    audioUrl = null;
                }
                audioBlob = null;

                // نمایش دکمه ضبط جدید
                recordBtn.disabled = false;
                recordBtn.innerHTML = '⚫';
                statusText.textContent = 'آماده برای ضبط صوت جدید';

            } else {
                throw new Error('پاسخ نامعتبر از سرور: ' + JSON.stringify(response));
            }

        } catch (error) {
            // توقف شبیه‌سازی پیشرفت
            clearInterval(progressInterval);

            console.error('Error sending audio:', error);

            // تشخیص نوع خطا
            let errorMessage = 'خطا در ارسال فایل صوتی به سرور';
            let errorTitle = '❌ خطا در ارسال!';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.';
                errorTitle = '🌐 خطا در اتصال!';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = 'خطا در احراز هویت. لطفاً دوباره وارد سیستم شوید.';
                errorTitle = '🔐 خطا در احراز هویت!';
            } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
                errorMessage = 'فایل صوتی بسیار بزرگ است. حداکثر حجم مجاز 10 مگابایت است.';
                errorTitle = '📁 فایل بسیار بزرگ!';
            } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                errorMessage = 'خطای داخلی سرور. لطفاً بعداً تلاش کنید.';
                errorTitle = '⚙️ خطای سرور!';
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }

            await Swal.fire({
                title: errorTitle,
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'باشه',
                showCloseButton: true
            });

            statusText.textContent = 'خطا در ارسال صوت به سرور';

            // بازگرداندن دکمه ارسال به حالت عادی
            sendBtn.disabled = false;
            sendBtn.innerHTML = '📤';
        } finally {
            hideLoading();
        }
    }
}

// Event listeners
recordBtn.addEventListener('click', () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

playbackBtn.addEventListener('click', togglePlayback);
// sendBtn event listener is now added in the initialization function
sampleBtn.addEventListener('click', playSample);

// Initialize
window.addEventListener('load', () => {
    console.log('Sound.js loaded, initializing...');
    getConfiguration(); // Call the new function here
    updateSampleCounter();

    // Additional debugging
    console.log('DOM elements found:', {
        recordBtn: !!recordBtn,
        sendBtn: !!sendBtn,
        loadingIndicator: !!loadingIndicator
    });

    // Check for any form elements that might cause issues
    const forms = document.querySelectorAll('form');
    console.log('Forms found on page:', forms.length);
    forms.forEach((form, index) => {
        console.log(`Form ${index}:`, form);
        // Prevent form submission
        form.addEventListener('submit', (e) => {
            console.log('Form submit prevented');
            e.preventDefault();
            return false;
        });
    });

    // Check if send button has proper event listener
    if (sendBtn) {
        console.log('Send button event listener attached');
        sendBtn.addEventListener('click', (event) => {
            console.log('Send button clicked, preventing default...');
            event.preventDefault();
            event.stopPropagation();
            sendAudio(event);
            return false;
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
});

// Global form submission prevention
document.addEventListener('submit', (event) => {
    console.log('Global form submit caught and prevented');
    event.preventDefault();
    event.stopPropagation();
    return false;
});

// Prevent any default button behavior that might cause form submission
document.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.type !== 'submit') {
        // This is a non-submit button, ensure it doesn't trigger form submission
        event.preventDefault();
    }
});