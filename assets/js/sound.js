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
async function sendAudio() {
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
        statusText.textContent = 'در حال ارسال صوت...';

        // Simulate sending to server
        setTimeout(() => {
            Swal.fire({
                title: 'موفق!',
                text: 'پیام صوتی با موفقیت ارسال شد.',
                icon: 'success',
                confirmButtonText: 'باشه'
            });
            statusText.textContent = 'صوت با موفقیت ارسال شد';

            // Reset UI
            sendBtn.style.display = 'none';
            playbackBtn.style.display = 'none';
            audioPlayerContainer.style.display = 'none';
            audioPlayer.pause();
            playbackBtn.innerHTML = '▶';
            isPlaying = false;
        }, 2000);
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
sendBtn.addEventListener('click', sendAudio);
sampleBtn.addEventListener('click', playSample);

// Initialize
window.addEventListener('load', () => {
    updateSampleCounter();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
});