// API Configuration
// Auto-detects environment: uses localhost in development, Render URL in production
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = IS_LOCAL
    ? 'http://localhost:5000/api'
    : 'https://donnationconnect.onrender.com/api';

// API Service - Handles all backend communication
const API = {
    // Helper function to make requests
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Authentication
    auth: {
        async register(userData) {
            const data = await API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
            }

            return data;
        },

        async login(email, password) {
            const data = await API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
            }

            return data;
        },

        async logout() {
            await API.request('/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        },

        async getMe() {
            return await API.request('/auth/me');
        },

        async updateProfile(userData) {
            return await API.request('/auth/updatedetails', {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },

        async updatePassword(currentPassword, newPassword) {
            return await API.request('/auth/updatepassword', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });
        }
    },

    // Donations
    donations: {
        async getAll(filters = {}) {
            const queryString = new URLSearchParams(filters).toString();
            return await API.request(`/donations?${queryString}`);
        },

        async getById(id) {
            return await API.request(`/donations/${id}`);
        },

        async create(donationData) {
            return await API.request('/donations', {
                method: 'POST',
                body: JSON.stringify(donationData)
            });
        },

        async update(id, donationData) {
            return await API.request(`/donations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(donationData)
            });
        },

        async delete(id) {
            return await API.request(`/donations/${id}`, {
                method: 'DELETE'
            });
        },

        async getMyDonations() {
            return await API.request('/donations/my/donations');
        },

        async accept(id, shelterId) {
            return await API.request(`/donations/${id}/accept`, {
                method: 'PUT',
                body: JSON.stringify({ shelterId })
            });
        },

        async updateStatus(id, status, note = '') {
            return await API.request(`/donations/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status, note })
            });
        }
    },

    // Shelters
    shelters: {
        async getAll(filters = {}) {
            const queryString = new URLSearchParams(filters).toString();
            return await API.request(`/shelters?${queryString}`);
        },

        async getById(id) {
            return await API.request(`/shelters/${id}`);
        },

        async create(shelterData) {
            return await API.request('/shelters', {
                method: 'POST',
                body: JSON.stringify(shelterData)
            });
        },

        async update(id, shelterData) {
            return await API.request(`/shelters/${id}`, {
                method: 'PUT',
                body: JSON.stringify(shelterData)
            });
        },

        async getMyShelter() {
            return await API.request('/shelters/my/shelter');
        },

        async updateNeeds(id, needs) {
            return await API.request(`/shelters/${id}/needs`, {
                method: 'PUT',
                body: JSON.stringify({ needs })
            });
        },

        async getStats(id) {
            return await API.request(`/shelters/${id}/stats`);
        }
    },

    // Volunteers
    volunteers: {
        async getAll(filters = {}) {
            const queryString = new URLSearchParams(filters).toString();
            return await API.request(`/volunteers?${queryString}`);
        },

        async create(volunteerData) {
            return await API.request('/volunteers', {
                method: 'POST',
                body: JSON.stringify(volunteerData)
            });
        },

        async update(id, volunteerData) {
            return await API.request(`/volunteers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(volunteerData)
            });
        },

        async getMyProfile() {
            return await API.request('/volunteers/my/profile');
        },

        async completeTask(id, donationId, hours) {
            return await API.request(`/volunteers/${id}/complete`, {
                method: 'PUT',
                body: JSON.stringify({ donationId, hours })
            });
        },

        async getStats(id) {
            return await API.request(`/volunteers/${id}/stats`);
        }
    },

    // Upload
    upload: {
        async single(file) {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/upload/single`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            return await response.json();
        },

        async multiple(files) {
            const formData = new FormData();
            files.forEach(file => formData.append('images', file));

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            return await response.json();
        }
    }
};

// User State Management
const UserState = {
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    },

    updateNavbar() {
        const user = this.getUser();
        const navbarActions = document.querySelector('.navbar-actions');

        if (!navbarActions) return;

        if (this.isLoggedIn() && user) {
            navbarActions.innerHTML = `
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle dark mode">
          <i class="fas fa-moon"></i>
        </button>
        <span style="color: var(--text); margin-right: 1rem;">Hi, ${user.name}</span>
        <a href="dashboard.html" class="btn btn-outline">Dashboard</a>
        <button id="logoutBtn" class="btn btn-primary">Logout</button>
      `;

            // Add logout handler
            document.getElementById('logoutBtn')?.addEventListener('click', async () => {
                if (confirm('Are you sure you want to logout?')) {
                    await API.auth.logout();
                }
            });

            // Re-initialize theme toggle
            initThemeToggle();
        }
    },

    requireAuth(redirectUrl = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    requireRole(allowedRoles, redirectUrl = 'index.html') {
        if (!this.requireAuth()) return false;

        const role = this.getRole();
        if (!allowedRoles.includes(role)) {
            alert('You do not have permission to access this page');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
};

// Helper function to show messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10B981' : '#EF4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize theme toggle (needed after navbar update)
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UserState.updateNavbar();
});
