// streak.js — Build streak tracker with heatmap
import * as store from './store.js';

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function calcStreak(history) {
    if (!history || history.length === 0) return 0;
    const sorted = [...history].sort().reverse();
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Must have shipped today or yesterday to have an active streak
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (prev - curr) / 86400000;
        if (diff === 1) streak++;
        else break;
    }
    return streak;
}

function renderHeatmap() {
    const container = document.getElementById('streakHeatmap');
    const streak = store.get('streak') || { history: [] };
    const today = getToday();
    container.innerHTML = '';

    // Show last 21 days
    for (let i = 20; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const dot = document.createElement('div');
        dot.className = 'heatmap-dot';
        if (streak.history && streak.history.includes(d)) dot.classList.add('active');
        if (d === today) dot.classList.add('today');
        dot.title = d;
        container.appendChild(dot);
    }
}

function renderStreak() {
    const streak = store.get('streak') || { count: 0, history: [] };
    const count = calcStreak(streak.history);
    document.getElementById('streakCount').textContent = count;

    const btn = document.getElementById('markShippedBtn');
    const today = getToday();
    if (streak.history && streak.history.includes(today)) {
        btn.textContent = 'Shipped today ✅';
        btn.classList.add('shipped');
    } else {
        btn.textContent = 'I shipped today 🚢';
        btn.classList.remove('shipped');
    }

    // Update stat
    const el = document.getElementById('statStreak');
    if (el) el.textContent = count;

    renderHeatmap();
}

export function init() {
    renderStreak();

    document.getElementById('markShippedBtn').addEventListener('click', () => {
        const today = getToday();
        store.update('streak', (s) => {
            if (!s) s = { count: 0, lastShipped: null, history: [] };
            if (!s.history) s.history = [];
            if (!s.history.includes(today)) {
                s.history.push(today);
                s.lastShipped = today;
                s.count = calcStreak(s.history);
            }
            return s;
        });
        renderStreak();
    });
}

export { renderStreak };
