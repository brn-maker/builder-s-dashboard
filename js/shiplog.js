// shiplog.js — Daily ship log (what did you build today?)
import * as store from './store.js';

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function renderLog() {
    const container = document.getElementById('shipLogEntries');
    const entries = store.getTodayLog();
    container.innerHTML = '';

    if (entries.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem;">Nothing shipped yet today. Time to build! ⚡</p>';
        return;
    }

    entries.forEach((entry, i) => {
        const div = document.createElement('div');
        div.className = 'shiplog-entry';
        div.innerHTML = `
            <span class="shiplog-time">${escapeHtml(entry.time)}</span>
            <span class="shiplog-text">${escapeHtml(entry.text)}</span>
            <button class="shiplog-delete" data-index="${i}">×</button>
        `;
        container.appendChild(div);
    });

    // Update shipped stat
    const el = document.getElementById('statShipped');
    if (el) el.textContent = entries.length;
}

export function init() {
    renderLog();

    const input = document.getElementById('shipLogInput');
    const addBtn = document.getElementById('addLogBtn');

    function addEntry() {
        const text = input.value.trim();
        if (!text) return;
        store.addTodayLog({ text, time: formatTime(new Date()) });
        input.value = '';
        renderLog();
    }

    addBtn.addEventListener('click', addEntry);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addEntry();
    });

    // Delete entries
    document.getElementById('shipLogEntries').addEventListener('click', (e) => {
        const del = e.target.closest('.shiplog-delete');
        if (del) {
            const idx = parseInt(del.dataset.index);
            store.removeTodayLog(idx);
            renderLog();
        }
    });
}

export { renderLog };
