// daily-focus.js — Greeting, priorities, builder quotes
import * as store from './store.js';
import { openModal, closeModal } from './modal.js';

const QUOTES = [
    { text: "Ship it before it's perfect. Perfection is the enemy of progress.", author: "Reid Hoffman" },
    { text: "The best way to predict the future is to build it.", author: "Alan Kay" },
    { text: "Move fast and break things. Unless you're breaking things, you're not moving fast enough.", author: "Mark Zuckerberg" },
    { text: "The only way to do great work is to love what you work on.", author: "Steve Jobs" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { text: "AI is the new electricity. Build the grid.", author: "Andrew Ng" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "The amateur waits for inspiration. The builder ships daily.", author: "Unknown" },
    { text: "Your vibe attracts your tribe. Ship and they will come.", author: "Builder's Creed" },
    { text: "Every great product started as a terrible prototype.", author: "Builder's Creed" },
    { text: "Don't ask for permission to build. Ask for forgiveness after you ship.", author: "Builder's Creed" },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning, builder ☀️';
    if (h < 17) return 'Good afternoon, builder 🔨';
    if (h < 21) return 'Good evening, builder 🌙';
    return 'Late night shipping? 🚀';
}

function formatDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
}

function getDailyQuote() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
}

function renderPriorities() {
    const list = document.getElementById('priorityList');
    const priorities = store.get('priorities') || [];
    list.innerHTML = '';
    priorities.forEach((p, i) => {
        const li = document.createElement('li');
        li.className = 'priority-item';
        li.innerHTML = `
            <div class="priority-check ${p.done ? 'done' : ''}" data-index="${i}"></div>
            <span class="priority-text ${p.done ? 'done' : ''}">${escapeHtml(p.text)}</span>
            <button class="priority-delete" data-index="${i}">×</button>
        `;
        list.appendChild(li);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function init() {
    document.getElementById('greeting').textContent = getGreeting();
    document.getElementById('focusDate').textContent = formatDate();
    document.getElementById('headerDate').textContent = formatDate();

    const quote = getDailyQuote();
    document.getElementById('quoteText').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;

    renderPriorities();

    // Add priority via modal
    document.getElementById('addPriorityBtn').addEventListener('click', () => {
        openModal('Add Build Priority', `
            <input type="text" class="modal-input" id="priorityInput" placeholder="What's your build priority?" autofocus maxlength="100">
            <button class="modal-btn" id="prioritySubmitBtn">Add Priority</button>
        `, () => {
            const submit = () => {
                const text = document.getElementById('priorityInput').value.trim();
                if (!text) return;
                store.update('priorities', (p) => [...(p || []), { text, done: false }]);
                renderPriorities();
                closeModal();
            };
            document.getElementById('prioritySubmitBtn').addEventListener('click', submit);
            document.getElementById('priorityInput').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') submit();
            });
        });
    });

    // Toggle done / delete
    document.getElementById('priorityList').addEventListener('click', (e) => {
        const check = e.target.closest('.priority-check');
        const del = e.target.closest('.priority-delete');
        if (check) {
            const idx = parseInt(check.dataset.index);
            store.update('priorities', (p) => {
                p[idx].done = !p[idx].done;
                return p;
            });
            renderPriorities();
        }
        if (del) {
            const idx = parseInt(del.dataset.index);
            store.update('priorities', (p) => { p.splice(idx, 1); return p; });
            renderPriorities();
        }
    });
}
