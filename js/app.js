// app.js — Main entry point, initializes all modules
import { initModal } from './modal.js';
import { init as initDailyFocus } from './daily-focus.js';
import { init as initProjects, renderProjects, updateStats as updateProjectStats } from './projects.js';
import { init as initStreak } from './streak.js';
import { init as initTimer } from './timer.js';
import { init as initShipLog } from './shiplog.js';
import { init as initIdeas } from './ideas.js';
import { init as initAgents } from './agents.js';

// Initialize modal system first
initModal();

// Initialize all modules
initDailyFocus();
initProjects();
initStreak();
initTimer();
initShipLog();
initIdeas();
initAgents();

// Cross-module event: when idea is promoted to project
window.addEventListener('projectsUpdated', () => {
    renderProjects();
    updateProjectStats();
});

// Update stats on load
function updateAllStats() {
    updateProjectStats();
}
updateAllStats();

console.log('⚡ Builder\'s Dashboard initialized');
