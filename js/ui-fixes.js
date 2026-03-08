// ui-fixes.js — Shared UI helpers for DonationConnect

// ─── Auth-aware navbar ───────────────────────────────────────────────────────
function updateNavbarAuthState() {
    const user = UserState.getUser();
    const navbarActions = document.querySelector('.navbar-actions');
    if (!navbarActions) return;

    if (UserState.isLoggedIn() && user) {
        // Determine dashboard link based on role
        const dashboardLinks = {
            donor: 'dashboard.html',
            volunteer: 'volunteer-dashboard.html',
            shelter: 'shelter-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        const dashLink = dashboardLinks[user.role] || 'dashboard.html';

        navbarActions.innerHTML = `
            <button id="themeToggle" class="theme-toggle" aria-label="Toggle dark mode">
                <i class="fas fa-moon"></i>
            </button>
            <a href="${dashLink}" class="btn btn-outline">
                <i class="fas fa-user"></i> ${user.name.split(' ')[0]}
            </a>
            <button id="logoutBtn" class="btn btn-primary">Logout</button>
        `;

        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await API.auth.logout();
                } catch (e) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'index.html';
                }
            }
        });

        initThemeToggle();
    }
}

// ─── Dark mode (re-exported here so pages only need one script) ────────────
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const isDarkMode = localStorage.getItem('darkMode') === 'true' ||
        document.documentElement.classList.contains('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (icon) icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    if (isDarkMode) document.documentElement.classList.add('dark-mode');

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// ─── Mobile menu ─────────────────────────────────────────────────────────────
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
        menu.classList.toggle('active');
        const icon = btn.querySelector('i');
        if (icon) icon.className = menu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
}

// ─── Toast notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const existing = document.querySelectorAll('.dc-toast');
    existing.forEach(t => t.remove());

    const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#F59E0B' };
    const toast = document.createElement('div');
    toast.className = 'dc-toast';
    toast.style.cssText = `
        position: fixed; top: 80px; right: 20px; z-index: 99999;
        padding: 0.85rem 1.5rem; border-radius: 10px; color: #fff; font-weight: 500;
        background: ${colors[type] || colors.success};
        box-shadow: 0 4px 20px rgba(0,0,0,0.18);
        animation: dcSlideIn 0.3s ease;
        max-width: 360px; word-break: break-word;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    const style = document.getElementById('dc-toast-style') || (() => {
        const s = document.createElement('style');
        s.id = 'dc-toast-style';
        s.textContent = `
            @keyframes dcSlideIn { from { transform: translateX(420px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes dcSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(420px); opacity: 0; } }
        `;
        document.head.appendChild(s);
        return s;
    })();

    setTimeout(() => {
        toast.style.animation = 'dcSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

// ─── Form validation helpers ──────────────────────────────────────────────────
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = '#EF4444';
    let errEl = field.parentElement.querySelector('.field-error');
    if (!errEl) {
        errEl = document.createElement('small');
        errEl.className = 'field-error';
        errEl.style.color = '#EF4444';
        field.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = '';
    const errEl = field.parentElement.querySelector('.field-error');
    if (errEl) errEl.remove();
}

// ─── Set current year in footer ───────────────────────────────────────────────
function setFooterYear() {
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

// ─── Loading spinner helper ────────────────────────────────────────────────────
function showSpinner(containerId, message = 'Loading...') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--text-light)"><i class="fas fa-spinner fa-spin"></i> ${message}</p>`;
}

function showEmptyState(containerId, message = 'No data found.', icon = 'inbox') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--text-light)"><i class="fas fa-${icon}"></i> ${message}</p>`;
}

// ─── Bootstrap on DOM ready ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuthState();
    initMobileMenu();
    setFooterYear();
    initThemeToggle();
});
