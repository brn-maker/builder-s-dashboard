// ideas.js — Ideas backlog for future projects
import * as store from './store.js';

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderIdeas() {
    const container = document.getElementById('ideasList');
    const ideas = store.get('ideas') || [];
    container.innerHTML = '';

    if (ideas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 0.8rem;">No ideas yet. Inspiration incoming! 💡</p>';
        return;
    }

    ideas.forEach((idea, i) => {
        const div = document.createElement('div');
        div.className = 'idea-item';
        div.innerHTML = `
            <span class="idea-icon">💡</span>
            <span class="idea-text">${escapeHtml(idea.text)}</span>
            <button class="idea-promote" data-index="${i}" title="Promote to project">→ Project</button>
            <button class="idea-delete" data-index="${i}">×</button>
        `;
        container.appendChild(div);
    });
}

export function init() {
    renderIdeas();

    const input = document.getElementById('ideaInput');
    const addBtn = document.getElementById('addIdeaBtn');

    function addIdea() {
        const text = input.value.trim();
        if (!text) return;
        store.update('ideas', (ideas) => [...(ideas || []), { text }]);
        input.value = '';
        renderIdeas();
    }

    addBtn.addEventListener('click', addIdea);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addIdea();
    });

    document.getElementById('ideasList').addEventListener('click', (e) => {
        const promote = e.target.closest('.idea-promote');
        const del = e.target.closest('.idea-delete');

        if (promote) {
            const idx = parseInt(promote.dataset.index);
            const ideas = store.get('ideas') || [];
            const idea = ideas[idx];

            // Add as project
            store.update('projects', (p) => [...(p || []), { name: idea.text, tech: '', status: 'ideating' }]);

            // Remove from ideas
            store.update('ideas', (ideas) => { ideas.splice(idx, 1); return ideas; });
            renderIdeas();

            // Re-render projects if available
            window.dispatchEvent(new CustomEvent('projectsUpdated'));
        }

        if (del) {
            const idx = parseInt(del.dataset.index);
            store.update('ideas', (ideas) => { ideas.splice(idx, 1); return ideas; });
            renderIdeas();
        }
    });
}

export { renderIdeas };
