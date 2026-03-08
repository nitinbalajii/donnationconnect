// volunteer-shelters.js
// Handles data loading for:
//   - volunteer.html      (volunteer registration + shelter listing)
//   - shelters.html       (public shelter browser)

// ─── SHELTERS PAGE ─────────────────────────────────────────────────────────────
async function loadSheltersPage() {
    const grid = document.getElementById('sheltersGrid');
    const loadingEl = document.getElementById('sheltersLoading');
    const emptyEl = document.getElementById('sheltersEmpty');
    const searchInput = document.getElementById('shelterSearch');
    const cityFilter = document.getElementById('cityFilter');
    const typeFilter = document.getElementById('typeFilter');

    if (!grid) return; // not on the shelters page

    async function fetchAndRender(filters = {}) {
        if (loadingEl) loadingEl.style.display = 'block';
        if (grid) grid.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'none';

        try {
            const response = await API.shelters.getAll(filters);
            const shelters = response.data || [];

            if (loadingEl) loadingEl.style.display = 'none';

            if (!shelters.length) {
                if (emptyEl) emptyEl.style.display = 'block';
                return;
            }

            shelters.forEach(shelter => {
                const card = createShelterCard(shelter);
                grid.appendChild(card);
            });
        } catch (err) {
            console.error('Error loading shelters:', err);
            if (loadingEl) loadingEl.style.display = 'none';
            if (grid) grid.innerHTML = `<p style="text-align:center;padding:2rem;color:#EF4444"><i class="fas fa-exclamation-triangle"></i> Failed to load shelters. Please try again.</p>`;
        }
    }

    // Initial load
    fetchAndRender();

    // Search / filter events
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => applyFilters(), 400);
        });
    }
    if (cityFilter) cityFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);

    function applyFilters() {
        const filters = {};
        if (searchInput?.value.trim()) filters.search = searchInput.value.trim();
        if (cityFilter?.value) filters.city = cityFilter.value;
        if (typeFilter?.value) filters.type = typeFilter.value;
        fetchAndRender(filters);
    }
}

function createShelterCard(shelter) {
    const card = document.createElement('div');
    card.className = 'card shelter-card';
    card.style.cssText = 'display:flex;flex-direction:column;';

    const needs = shelter.currentNeeds?.slice(0, 3).map(n => {
        const text = typeof n === 'string' ? n : (n.description || n.category);
        return `<span class="badge" style="background:rgba(235,96,24,0.1);color:var(--primary);padding:0.2rem 0.6rem;border-radius:999px;font-size:0.75rem;margin:0.2rem">${text}</span>`;
    }).join('') || '<span style="color:var(--text-light);font-size:0.85rem">No current needs listed</span>';

    const typeColors = {
        orphanage: '#8B5CF6', elderly: '#F59E0B', women: '#EC4899',
        disabled: '#3B82F6', general: '#10B981', rehabilitation: '#F97316'
    };
    const typeColor = typeColors[shelter.type] || '#6B7280';

    card.innerHTML = `
        <div class="card-body" style="flex:1">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem">
                <div>
                    <span style="background:${typeColor};color:#fff;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.75rem;text-transform:capitalize">
                        ${shelter.type || 'General'}
                    </span>
                    ${shelter.isVerified ? '<span style="background:#D1FAE5;color:#059669;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.75rem;margin-left:0.5rem"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                </div>
                ${shelter.rating?.average ? `<span style="color:#F59E0B;font-weight:600"><i class="fas fa-star"></i> ${shelter.rating.average.toFixed(1)}</span>` : ''}
            </div>

            <h3 class="card-title" style="margin-bottom:0.5rem">${shelter.name}</h3>
            <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.75rem">
                <i class="fas fa-map-marker-alt"></i>
                ${shelter.address?.city || ''}, ${shelter.address?.state || ''}
            </p>
            <p class="card-text" style="margin-bottom:1rem">${shelter.description?.substring(0, 120) || 'Shelter home providing essential services.'}${shelter.description?.length > 120 ? '...' : ''}</p>

            <div style="margin-bottom:1rem">
                <p style="font-size:0.8rem;font-weight:600;color:var(--text-light);margin-bottom:0.4rem">CURRENT NEEDS</p>
                <div style="display:flex;flex-wrap:wrap;gap:0.25rem">${needs}</div>
            </div>

            <div style="display:flex;justify-content:space-between;color:var(--text-light);font-size:0.85rem;border-top:1px solid var(--border);padding-top:0.75rem">
                <span><i class="fas fa-users"></i> Capacity: ${shelter.capacity || 'N/A'}</span>
                <span><i class="fas fa-phone"></i> ${shelter.contactInfo?.phone || 'Contact Shelter'}</span>
            </div>
        </div>
        <div class="card-footer" style="padding:0 1.5rem 1.5rem">
            <a href="donate-items.html" class="btn btn-primary btn-block">Donate to This Shelter</a>
        </div>
    `;
    return card;
}

// ─── VOLUNTEER REGISTRATION PAGE ───────────────────────────────────────────────
async function initVolunteerPage() {
    const form = document.getElementById('volunteerForm') || document.getElementById('volunteer-registration-form');
    if (!form) return;

    // Pre-fill user info if logged in
    const user = typeof UserState !== 'undefined' ? UserState.getUser() : null;
    if (user) {
        const nameField = form.querySelector('[name="name"], #volunteerName');
        const emailField = form.querySelector('[name="email"], #volunteerEmail');
        const phoneField = form.querySelector('[name="phone"], #volunteerPhone');
        if (nameField) nameField.value = user.name || '';
        if (emailField) emailField.value = user.email || '';
        if (phoneField) phoneField.value = user.phone || '';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }

        try {
            // Check auth
            if (!UserState.isLoggedIn()) {
                if (typeof showToast === 'function') showToast('Please log in to register as a volunteer.', 'error');
                else alert('Please log in to register as a volunteer.');
                window.location.href = 'login.html';
                return;
            }

            const formData = new FormData(form);
            const volunteerData = {
                bio: formData.get('bio') || form.querySelector('[name="bio"], #bio')?.value || '',
                hasTransportation: form.querySelector('[name="hasTransportation"], #hasTransportation')?.checked || false,
                skills: [],
                availability: {}
            };

            // Collect skills
            form.querySelectorAll('[name="skills"]:checked, .skill-checkbox:checked').forEach(cb => {
                volunteerData.skills.push(cb.value);
            });

            // Collect availability
            form.querySelectorAll('[name="availability"]:checked, .availability-checkbox:checked').forEach(cb => {
                volunteerData.availability[cb.value] = true;
            });

            // Collect address
            const city = form.querySelector('[name="city"], #city')?.value;
            const state = form.querySelector('[name="state"], #state')?.value;
            if (city || state) {
                volunteerData.serviceArea = { city, state };
            }

            await API.volunteers.create(volunteerData);
            if (typeof showToast === 'function') showToast('Volunteer profile created! Welcome to the team 🎉', 'success');
            else alert('Volunteer profile created! Welcome to the team!');

            setTimeout(() => { window.location.href = 'volunteer-dashboard.html'; }, 1500);

        } catch (err) {
            console.error('Volunteer registration error:', err);
            const msg = err.message || 'Registration failed. Please try again.';
            if (typeof showToast === 'function') showToast(msg, 'error');
            else alert(msg);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Register as Volunteer';
            }
        }
    });
}

// ─── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadSheltersPage();
    initVolunteerPage();
});
