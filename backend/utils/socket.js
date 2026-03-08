const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Initialize Socket.io
const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);

        // Join role-based rooms
        socket.join(`role:${socket.userRole}`);

        // Emit online status
        io.emit('user:online', {
            userId: socket.userId,
            timestamp: new Date()
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            io.emit('user:offline', {
                userId: socket.userId,
                timestamp: new Date()
            });
        });

        // Handle typing indicators (for future chat feature)
        socket.on('typing:start', (data) => {
            socket.broadcast.to(data.room).emit('typing:user', {
                userId: socket.userId,
                typing: true
            });
        });

        socket.on('typing:stop', (data) => {
            socket.broadcast.to(data.room).emit('typing:user', {
                userId: socket.userId,
                typing: false
            });
        });
    });

    return io;
};

// Emit notification to specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Emit notification to all users with specific role
const emitToRole = (role, event, data) => {
    if (io) {
        io.to(`role:${role}`).emit(event, data);
    }
};

// Emit notification to all connected users
const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

// Notification helpers
const notifyDonationCreated = (donation) => {
    // Notify all shelters about new donation
    emitToRole('shelter', 'donation:new', {
        id: donation._id,
        title: donation.title,
        type: donation.type,
        category: donation.category,
        location: donation.pickupAddress,
        timestamp: new Date()
    });
};

const notifyDonationAccepted = (donation, shelter) => {
    // Notify donor that their donation was accepted
    emitToUser(donation.donor, 'donation:accepted', {
        id: donation._id,
        title: donation.title,
        shelter: shelter.name,
        timestamp: new Date()
    });
};

const notifyDonationStatusUpdate = (donation, newStatus) => {
    // Notify donor about status change
    emitToUser(donation.donor, 'donation:status', {
        id: donation._id,
        title: donation.title,
        status: newStatus,
        timestamp: new Date()
    });
};

const notifyVolunteerTaskAssigned = (volunteer, task) => {
    // Notify volunteer about new task
    emitToUser(volunteer.user, 'task:assigned', {
        id: task._id,
        title: task.title,
        description: task.description,
        points: task.points,
        timestamp: new Date()
    });
};

const notifyVolunteerTaskCompleted = (volunteer, task) => {
    // Notify volunteer about task completion and points earned
    emitToUser(volunteer.user, 'task:completed', {
        id: task._id,
        title: task.title,
        pointsEarned: task.points,
        newTotal: volunteer.points,
        timestamp: new Date()
    });
};

const notifyBadgeEarned = (userId, badge) => {
    // Notify user about new badge
    emitToUser(userId, 'badge:earned', {
        badge: badge.name,
        description: badge.description,
        timestamp: new Date()
    });
};

module.exports = {
    initializeSocket,
    emitToUser,
    emitToRole,
    emitToAll,
    notifyDonationCreated,
    notifyDonationAccepted,
    notifyDonationStatusUpdate,
    notifyVolunteerTaskAssigned,
    notifyVolunteerTaskCompleted,
    notifyBadgeEarned
};
