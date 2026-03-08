// Socket.io Client for Real-time Features
let socket = null;

function initializeSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    socket = io('http://localhost:5000', {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('✅ Connected to real-time server');
    });

    socket.on('donation:new', (data) => {
        showToast(`New donation available: ${data.title}`, 'info');
    });

    socket.on('donation:accepted', (data) => {
        showToast(`Your donation "${data.title}" was accepted by ${data.shelter}!`, 'success');
    });

    socket.on('task:assigned', (data) => {
        showToast(`New task assigned: ${data.title}`, 'info');
    });

    socket.on('badge:earned', (data) => {
        showToast(`🏆 Badge earned: ${data.badge}!`, 'success', 5000);
    });
}

if (UserState.isLoggedIn()) {
    initializeSocket();
}
