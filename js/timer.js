// timer.js — Pomodoro focus timer with circular progress ring
import * as store from './store.js';

const FOCUS_DURATION = 25 * 60;  // 25 min
const BREAK_DURATION = 5 * 60;   // 5 min
const CIRCUMFERENCE = 2 * Math.PI * 52; // ~326.73

let timeLeft = FOCUS_DURATION;
let isRunning = false;
let isBreak = false;
let interval = null;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateDisplay() {
    document.getElementById('timerDisplay').textContent = formatTime(timeLeft);

    const totalTime = isBreak ? BREAK_DURATION : FOCUS_DURATION;
    const progress = (totalTime - timeLeft) / totalTime;
    const offset = CIRCUMFERENCE * (1 - progress);
    document.getElementById('timerProgress').style.strokeDashoffset = offset;

    document.getElementById('timerMode').textContent = isBreak ? 'Break Time' : 'Focus Mode';
    document.getElementById('timerStartBtn').textContent = isRunning ? 'Pause' : 'Start';

    // Color
    const ring = document.getElementById('timerProgress');
    ring.style.stroke = isBreak ? 'var(--accent-green)' : 'var(--accent-purple)';
}

function tick() {
    if (timeLeft <= 0) {
        clearInterval(interval);
        isRunning = false;

        if (!isBreak) {
            // Completed a focus session
            const today = new Date().toISOString().slice(0, 10);
            store.update('timer', (t) => {
                if (!t || t.lastDate !== today) {
                    return { sessions: 1, lastDate: today };
                }
                t.sessions++;
                return t;
            });
            updateSessionCount();
        }

        // Switch mode
        isBreak = !isBreak;
        timeLeft = isBreak ? BREAK_DURATION : FOCUS_DURATION;
        updateDisplay();
        return;
    }
    timeLeft--;
    updateDisplay();
}

function updateSessionCount() {
    const today = new Date().toISOString().slice(0, 10);
    const timer = store.get('timer') || { sessions: 0, lastDate: null };
    const sessions = timer.lastDate === today ? timer.sessions : 0;
    document.getElementById('timerSessions').textContent = `${sessions} session${sessions !== 1 ? 's' : ''}`;
    const el = document.getElementById('statSessions');
    if (el) el.textContent = sessions;
}

export function init() {
    document.getElementById('timerProgress').style.strokeDasharray = CIRCUMFERENCE;
    updateDisplay();
    updateSessionCount();

    document.getElementById('timerStartBtn').addEventListener('click', () => {
        if (isRunning) {
            clearInterval(interval);
            isRunning = false;
        } else {
            interval = setInterval(tick, 1000);
            isRunning = true;
        }
        updateDisplay();
    });

    document.getElementById('timerResetBtn').addEventListener('click', () => {
        clearInterval(interval);
        isRunning = false;
        isBreak = false;
        timeLeft = FOCUS_DURATION;
        updateDisplay();
    });
}

export { updateSessionCount };
