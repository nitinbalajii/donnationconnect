// Enhanced dashboard functionality for role-specific views
document.addEventListener('DOMContentLoaded', async () => {
    const dashboardContainer = document.getElementById('donationsContainer');

    if (dashboardContainer && window.location.pathname.includes('dashboard')) {
        const user = UserState.getUser();

        // Add filter and search UI
        const filterHTML = `
      <div style="margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <input type="text" id="searchDonations" placeholder="Search donations..." 
          style="flex: 1; min-width: 200px; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius);">
        <select id="filterStatus" style="padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius);">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="picked-up">Picked Up</option>
          <option value="delivered">Delivered</option>
        </select>
        <select id="filterType" style="padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius);">
          <option value="">All Types</option>
          <option value="item">Items</option>
          <option value="food">Food</option>
        </select>
      </div>
    `;

        dashboardContainer.insertAdjacentHTML('beforebegin', filterHTML);

        let allDonations = [];

        // Fetch donations
        async function loadDonations() {
            try {
                const response = await API.donations.getMyDonations();
                if (response.success) {
                    allDonations = response.data;
                    displayDonations(allDonations);
                }
            } catch (error) {
                console.error('Error loading donations:', error);
            }
        }

        function displayDonations(donations) {
            if (donations.length === 0) {
                dashboardContainer.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h3>No donations found</h3>
            <p>Try adjusting your filters or create a new donation!</p>
          </div>
        `;
                return;
            }

            dashboardContainer.innerHTML = donations.map(donation => `
        <div class="donation-item">
          <div class="donation-header">
            <div class="donation-title">${donation.title}</div>
            <span class="donation-status status-${donation.status}">${donation.status}</span>
          </div>
          <p>${donation.description}</p>
          <div class="donation-meta">
            <i class="fas fa-tag"></i> ${donation.category}
            <span style="margin-left: 1rem;"><i class="fas fa-map-marker-alt"></i> ${donation.pickupAddress.city}, ${donation.pickupAddress.state}</span>
            <span style="margin-left: 1rem;"><i class="fas fa-calendar"></i> ${new Date(donation.createdAt).toLocaleDateString()}</span>
          </div>
          ${donation.images && donation.images.length > 0 ? `
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              ${donation.images.slice(0, 3).map(img => `
                <img src="${img}" alt="Donation" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
        }

        // Filter and search functionality
        function filterDonations() {
            const searchTerm = document.getElementById('searchDonations').value.toLowerCase();
            const statusFilter = document.getElementById('filterStatus').value;
            const typeFilter = document.getElementById('filterType').value;

            let filtered = allDonations;

            if (searchTerm) {
                filtered = filtered.filter(d =>
                    d.title.toLowerCase().includes(searchTerm) ||
                    d.description.toLowerCase().includes(searchTerm)
                );
            }

            if (statusFilter) {
                filtered = filtered.filter(d => d.status === statusFilter);
            }

            if (typeFilter) {
                filtered = filtered.filter(d => d.type === typeFilter);
            }

            displayDonations(filtered);
        }

        document.getElementById('searchDonations').addEventListener('input', filterDonations);
        document.getElementById('filterStatus').addEventListener('change', filterDonations);
        document.getElementById('filterType').addEventListener('change', filterDonations);

        loadDonations();
    }
});

// Shelter Dashboard - Accept/Reject Donations
if (window.location.pathname.includes('shelter-dashboard')) {
    document.addEventListener('DOMContentLoaded', async () => {
        if (!UserState.requireAuth()) return;

        const user = UserState.getUser();
        if (user.role !== 'shelter') {
            window.location.href = 'dashboard.html';
            return;
        }

        // Load available donations for shelter
        try {
            const response = await API.donations.getAll({ status: 'pending' });
            if (response.success) {
                const container = document.getElementById('availableDonations');
                const donations = response.data;

                if (donations.length === 0) {
                    container.innerHTML = '<p>No pending donations available</p>';
                    return;
                }

                container.innerHTML = donations.map(donation => `
          <div class="donation-card" style="background: var(--background); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 1rem;">
            <h3>${donation.title}</h3>
            <p>${donation.description}</p>
            <div style="margin: 1rem 0;">
              <strong>Category:</strong> ${donation.category}<br>
              <strong>Location:</strong> ${donation.pickupAddress.city}, ${donation.pickupAddress.state}<br>
              <strong>Posted:</strong> ${new Date(donation.createdAt).toLocaleDateString()}
            </div>
            <div style="display: flex; gap: 1rem;">
              <button class="btn btn-primary" onclick="acceptDonation('${donation._id}')">
                <i class="fas fa-check"></i> Accept
              </button>
              <button class="btn btn-outline" onclick="viewDonationDetails('${donation._id}')">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
          </div>
        `).join('');
            }
        } catch (error) {
            console.error('Error loading donations:', error);
        }
    });
}

async function acceptDonation(donationId) {
    if (!confirm('Are you sure you want to accept this donation?')) return;

    try {
        const response = await API.donations.accept(donationId);
        if (response.success) {
            showMessage('Donation accepted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to accept donation', 'error');
    }
}

function viewDonationDetails(donationId) {
    // For now, just show alert. Can be enhanced later
    showMessage('Donation details coming soon!', 'success');
}

// Volunteer Dashboard - View Tasks and Points
if (window.location.pathname.includes('volunteer-dashboard')) {
    document.addEventListener('DOMContentLoaded', async () => {
        if (!UserState.requireAuth()) return;

        const user = UserState.getUser();
        if (user.role !== 'volunteer') {
            window.location.href = 'dashboard.html';
            return;
        }

        try {
            const response = await API.volunteers.getMyProfile();
            if (response.success) {
                const volunteer = response.data;

                // Display points and level
                document.getElementById('volunteerPoints').textContent = volunteer.points || 0;
                document.getElementById('volunteerLevel').textContent = volunteer.level || 1;

                // Display badges
                const badgesContainer = document.getElementById('volunteerBadges');
                if (volunteer.badges && volunteer.badges.length > 0) {
                    badgesContainer.innerHTML = volunteer.badges.map(badge => `
            <div class="badge-item" style="display: inline-block; margin: 0.5rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border-radius: 20px;">
              <i class="fas fa-award"></i> ${badge}
            </div>
          `).join('');
                } else {
                    badgesContainer.innerHTML = '<p>No badges earned yet. Complete tasks to earn badges!</p>';
                }

                // Display assigned tasks
                const tasksContainer = document.getElementById('assignedTasks');
                if (volunteer.assignedTasks && volunteer.assignedTasks.length > 0) {
                    tasksContainer.innerHTML = volunteer.assignedTasks.map(task => `
            <div class="task-item" style="background: var(--background); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 1rem;">
              <h4>${task.title}</h4>
              <p>${task.description}</p>
              <div style="margin-top: 1rem;">
                <strong>Status:</strong> <span class="badge badge-${task.status}">${task.status}</span><br>
                <strong>Points:</strong> ${task.points || 10}
              </div>
              ${task.status === 'assigned' ? `
                <button class="btn btn-primary" onclick="completeTask('${task._id}')" style="margin-top: 1rem;">
                  <i class="fas fa-check"></i> Mark as Complete
                </button>
              ` : ''}
            </div>
          `).join('');
                } else {
                    tasksContainer.innerHTML = '<p>No tasks assigned yet.</p>';
                }
            }
        } catch (error) {
            console.error('Error loading volunteer profile:', error);
        }
    });
}

async function completeTask(taskId) {
    if (!confirm('Mark this task as complete?')) return;

    try {
        const response = await API.volunteers.completeTask(taskId);
        if (response.success) {
            showMessage('Task completed! Points awarded.', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to complete task', 'error');
    }
}
