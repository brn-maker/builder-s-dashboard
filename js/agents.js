// agents.js — Polls local API for agent activity
import * as store from './store.js';

let lastLogCount = 0;

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function fetchAgentLogs() {
    try {
        const response = await fetch('/api/agent');
        if (!response.ok) throw new Error('API down');
        
        const logs = await response.json();
        
        if (logs.length > lastLogCount || logs.length === 0) {
            renderLogs(logs);
            lastLogCount = logs.length;
        }
        
        // Ensure status indicator is green
        const indicator = document.getElementById('agentStatusPulse');
        if (indicator) indicator.style.background = 'var(--accent-green)';
        
    } catch (e) {
        // API down / not available (probably running the static server instead of server.py)
        const indicator = document.getElementById('agentStatusPulse');
        if (indicator) indicator.style.background = 'var(--text-muted)';
    }
}

function renderLogs(logs) {
    const terminal = document.getElementById('agentTerminal');
    if (!terminal) return;

    if (logs.length === 0) {
        terminal.innerHTML = '<div class="terminal-entry"><span class="term-time">[System]</span> <span class="term-agent">Dashboard</span> <span class="term-msg">Awaiting agent connections on /api/agent...</span></div>';
        return;
    }

    terminal.innerHTML = '';
    
    // Reverse to show newest at bottom (or top depending on preference)
    // We'll show oldest at top, newest at bottom, and auto-scroll
    logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'terminal-entry';
        
        let statusClass = '';
        if (log.status === 'success') statusClass = 'term-status-success';
        else if (log.status === 'error') statusClass = 'term-status-error';
        else if (log.status === 'working') statusClass = 'term-status-working';

        const statusHtml = log.status !== 'info' ? `<span class="${statusClass}">[${escapeHtml(log.status)}]</span> ` : '';

        div.innerHTML = `
            <span class="term-time">[${formatTime(log.timestamp)}]</span>
            <span class="term-agent">${escapeHtml(log.agent)}:</span>
            <span class="term-msg">${statusHtml}${escapeHtml(log.message)}</span>
        `;
        terminal.appendChild(div);
    });

    // Auto scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

export function init() {
    // Initial fetch
    fetchAgentLogs();
    
    // Poll every 3 seconds
    setInterval(fetchAgentLogs, 3000);
}
