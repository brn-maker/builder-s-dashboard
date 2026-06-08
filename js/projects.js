// projects.js — Track active AI-built projects
import * as store from './store.js';
import { openModal } from './modal.js';

const STATUSES = ['ideating', 'building', 'shipped'];
const STATUS_LABELS = { ideating: 'Ideating', building: 'Building', shipped: 'Shipped' };

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    const projects = store.get('projects') || [];
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.82rem; text-align: center; padding: 1rem;">No projects yet. Start building! 🚀</p>';
        return;
    }

    projects.forEach((proj, i) => {
        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <button class="project-status status-${proj.status}" data-index="${i}" title="Click to advance status">
                ${STATUS_LABELS[proj.status]}
            </button>
            <span class="project-name">${escapeHtml(proj.name)}</span>
            <span class="project-tech">${escapeHtml(proj.tech || '')}</span>
            <button class="project-delete" data-index="${i}">×</button>
        `;
        container.appendChild(div);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function init() {
    renderProjects();

    document.getElementById('addProjectBtn').addEventListener('click', () => {
        openModal('New Project', `
            <input type="text" class="modal-input" id="projNameInput" placeholder="Project name" autofocus>
            <input type="text" class="modal-input" id="projTechInput" placeholder="Tech stack (e.g. Next.js + AI)">
            <select class="modal-select" id="projStatusInput">
                <option value="ideating">💡 Ideating</option>
                <option value="building" selected>🔨 Building</option>
                <option value="shipped">🚀 Shipped</option>
            </select>
            <button class="modal-btn" id="projSubmitBtn">Add Project</button>
        `, () => {
            document.getElementById('projSubmitBtn').addEventListener('click', () => {
                const name = document.getElementById('projNameInput').value.trim();
                if (!name) return;
                const tech = document.getElementById('projTechInput').value.trim();
                const status = document.getElementById('projStatusInput').value;
                store.update('projects', (p) => [...(p || []), { name, tech, status }]);
                renderProjects();
                document.getElementById('modalOverlay').classList.remove('active');
                updateStats();
            });
        });
    });

    // Advance status / delete
    document.getElementById('projectsContainer').addEventListener('click', (e) => {
        const statusBtn = e.target.closest('.project-status');
        const delBtn = e.target.closest('.project-delete');

        if (statusBtn) {
            const idx = parseInt(statusBtn.dataset.index);
            store.update('projects', (p) => {
                const current = STATUSES.indexOf(p[idx].status);
                p[idx].status = STATUSES[(current + 1) % STATUSES.length];
                return p;
            });
            renderProjects();
            updateStats();
        }

        if (delBtn) {
            const idx = parseInt(delBtn.dataset.index);
            store.update('projects', (p) => { p.splice(idx, 1); return p; });
            renderProjects();
            updateStats();
        }
    });
}

function updateStats() {
    const projects = store.get('projects') || [];
    const el = document.getElementById('statProjects');
    if (el) el.textContent = projects.filter(p => p.status !== 'shipped').length;
}

export { renderProjects, updateStats };
