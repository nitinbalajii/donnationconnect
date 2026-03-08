// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.location.pathname.includes('admin-dashboard')) return;

    // Require admin authentication
    if (!UserState.requireAuth()) return;

    const user = UserState.getUser();
    if (user.role !== 'admin') {
        showMessage('Access denied. Admin only.', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }

    // Load overview stats
    loadOverviewStats();
    loadRecentActivity();
});

async function loadOverviewStats() {
    try {
        // Fetch all data
        const [usersRes, donationsRes, sheltersRes, volunteersRes] = await Promise.all([
            API.auth.getMe(), // For now, we'll use placeholder
            API.donations.getAll(),
            API.shelters.getAll(),
            API.volunteers.getAll()
        ]);

        // Update stats (using available data)
        if (donationsRes.success) {
            document.getElementById('totalDonations').textContent = donationsRes.data.length;
        }
        if (sheltersRes.success) {
            document.getElementById('totalShelters').textContent = sheltersRes.data.length;
        }
        if (volunteersRes.success) {
            document.getElementById('totalVolunteers').textContent = volunteersRes.data.length;
        }

        // Placeholder for total users
        document.getElementById('totalUsers').textContent = '50+';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentActivity() {
    try {
        const response = await API.donations.getAll({ limit: 10 });
        if (response.success) {
            const tbody = document.getElementById('recentActivity');
            const donations = response.data.slice(0, 10);

            if (donations.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No recent activity</td></tr>';
                return;
            }

            tbody.innerHTML = donations.map(d => `
        <tr>
          <td>${new Date(d.createdAt).toLocaleDateString()}</td>
          <td>New ${d.type} donation: ${d.title}</td>
          <td>${d.donor?.name || 'Anonymous'}</td>
          <td><span class="badge badge-${d.status}">${d.status}</span></td>
        </tr>
      `).join('');
        }
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all links
    document.querySelectorAll('.admin-sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).style.display = 'block';

    // Add active class to clicked link
    event.target.closest('a').classList.add('active');

    // Load section data
    switch (sectionId) {
        case 'users':
            loadUsers();
            break;
        case 'donations':
            loadDonations();
            break;
        case 'shelters':
            loadShelters();
            break;
        case 'volunteers':
            loadVolunteers();
            break;
    }
}

async function loadUsers() {
    // Placeholder - would need admin endpoint
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">User management coming soon</td></tr>';
}

async function loadDonations() {
    try {
        const response = await API.donations.getAll();
        if (response.success) {
            const tbody = document.getElementById('donationsTable');
            const donations = response.data;

            if (donations.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No donations found</td></tr>';
                return;
            }

            tbody.innerHTML = donations.map(d => `
        <tr>
          <td>${d.title}</td>
          <td>${d.type}</td>
          <td>${d.donor?.name || 'Anonymous'}</td>
          <td><span class="badge badge-${d.status}">${d.status}</span></td>
          <td>${new Date(d.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="action-btn btn-view" onclick="viewDonation('${d._id}')">
              <i class="fas fa-eye"></i> View
            </button>
          </td>
        </tr>
      `).join('');
        }
    } catch (error) {
        console.error('Error loading donations:', error);
    }
}

async function loadShelters() {
    try {
        const response = await API.shelters.getAll();
        if (response.success) {
            const tbody = document.getElementById('sheltersTable');
            const shelters = response.data;

            if (shelters.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No shelters found</td></tr>';
                return;
            }

            tbody.innerHTML = shelters.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.address.city}, ${s.address.state}</td>
          <td>${s.currentOccupancy}/${s.capacity}</td>
          <td>${s.isVerified ? '<span class="badge badge-donor">✓ Verified</span>' : '<span class="badge badge-pending">Pending</span>'}</td>
          <td>
            ${!s.isVerified ? `
              <button class="action-btn btn-verify" onclick="verifyShelter('${s._id}')">
                <i class="fas fa-check"></i> Verify
              </button>
            ` : ''}
            <button class="action-btn btn-view" onclick="viewShelter('${s._id}')">
              <i class="fas fa-eye"></i> View
            </button>
          </td>
        </tr>
      `).join('');
        }
    } catch (error) {
        console.error('Error loading shelters:', error);
    }
}

async function loadVolunteers() {
    try {
        const response = await API.volunteers.getAll();
        if (response.success) {
            const tbody = document.getElementById('volunteersTable');
            const volunteers = response.data;

            if (volunteers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No volunteers found</td></tr>';
                return;
            }

            tbody.innerHTML = volunteers.map(v => `
        <tr>
          <td>${v.user?.name || 'Unknown'}</td>
          <td>${v.skills.slice(0, 3).join(', ')}</td>
          <td>${v.points || 0}</td>
          <td>${v.level || 1}</td>
          <td>${v.isVerified ? '<span class="badge badge-donor">✓ Verified</span>' : '<span class="badge badge-pending">Pending</span>'}</td>
          <td>
            ${!v.isVerified ? `
              <button class="action-btn btn-verify" onclick="verifyVolunteer('${v._id}')">
                <i class="fas fa-check"></i> Verify
              </button>
            ` : ''}
            <button class="action-btn btn-view" onclick="assignTask('${v._id}')">
              <i class="fas fa-tasks"></i> Assign Task
            </button>
          </td>
        </tr>
      `).join('');
        }
    } catch (error) {
        console.error('Error loading volunteers:', error);
    }
}

async function verifyShelter(shelterId) {
    if (!confirm('Verify this shelter?')) return;

    try {
        const response = await API.shelters.verify(shelterId);
        if (response.success) {
            showMessage('Shelter verified successfully!', 'success');
            loadShelters();
        }
    } catch (error) {
        showMessage(error.message || 'Failed to verify shelter', 'error');
    }
}

async function verifyVolunteer(volunteerId) {
    if (!confirm('Verify this volunteer?')) return;

    try {
        const response = await API.volunteers.verify(volunteerId);
        if (response.success) {
            showMessage('Volunteer verified successfully!', 'success');
            loadVolunteers();
        }
    } catch (error) {
        showMessage(error.message || 'Failed to verify volunteer', 'error');
    }
}

function viewDonation(donationId) {
    showMessage('Donation details coming soon!', 'success');
}

function viewShelter(shelterId) {
    showMessage('Shelter details coming soon!', 'success');
}

function assignTask(volunteerId) {
    showMessage('Task assignment coming soon!', 'success');
}
