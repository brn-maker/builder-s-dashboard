// modal.js — Reusable modal helper
export function openModal(title, bodyHtml, onReady) {
    const overlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    overlay.classList.add('active');

    // Focus first input
    setTimeout(() => {
        const firstInput = modalBody.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
    }, 100);

    if (onReady) onReady();
}

export function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

export function initModal() {
    const overlay = document.getElementById('modalOverlay');
    document.getElementById('modalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}
