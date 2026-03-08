const Volunteer = require('../models/Volunteer.model');
const Donation = require('../models/Donation.model');

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Private (Admin, Shelter)
exports.getVolunteers = async (req, res, next) => {
    try {
        let query = { isActive: true };

        // Filter by verified status
        if (req.query.verified === 'true') {
            query.isVerified = true;
        }

        // Filter by availability
        if (req.query.availability) {
            query[`availability.${req.query.availability}`] = true;
        }

        // Filter by transportation
        if (req.query.hasTransportation === 'true') {
            query.hasTransportation = true;
        }

        const volunteers = await Volunteer.find(query)
            .populate('user', 'name email phone address profileImage')
            .sort({ 'rating.average': -1, completedTasks: -1 });

        res.status(200).json({
            success: true,
            count: volunteers.length,
            data: volunteers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Private
exports.getVolunteer = async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id)
            .populate('user', 'name email phone address profileImage')
            .populate({
                path: 'assignedTasks',
                select: 'title type status pickupAddress createdAt'
            });

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create volunteer profile
// @route   POST /api/volunteers
// @access  Private (Volunteer role)
exports.createVolunteer = async (req, res, next) => {
    try {
        // Check if user already has a volunteer profile
        const existingVolunteer = await Volunteer.findOne({ user: req.user.id });
        if (existingVolunteer) {
            return res.status(400).json({
                success: false,
                message: 'You already have a volunteer profile'
            });
        }

        req.body.user = req.user.id;
        const volunteer = await Volunteer.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Volunteer profile created successfully',
            data: volunteer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update volunteer profile
// @route   PUT /api/volunteers/:id
// @access  Private (Owner or Admin)
exports.updateVolunteer = async (req, res, next) => {
    try {
        let volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // Make sure user is volunteer owner or admin
        if (volunteer.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: volunteer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign task to volunteer
// @route   PUT /api/volunteers/:id/assign
// @access  Private (Admin, Shelter)
exports.assignTask = async (req, res, next) => {
    try {
        const { donationId } = req.body;

        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Update donation
        donation.assignedVolunteer = volunteer.user;
        donation.status = 'assigned';
        await donation.save();

        // Update volunteer
        if (!volunteer.assignedTasks.includes(donationId)) {
            volunteer.assignedTasks.push(donationId);
            await volunteer.save();
        }

        res.status(200).json({
            success: true,
            message: 'Task assigned successfully',
            data: { volunteer, donation }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Complete task
// @route   PUT /api/volunteers/:id/complete
// @access  Private (Volunteer owner)
exports.completeTask = async (req, res, next) => {
    try {
        const { donationId, hours } = req.body;

        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        if (volunteer.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Update volunteer stats
        volunteer.completedTasks += 1;
        volunteer.totalHours += hours || 1;
        volunteer.points += 10; // Award points
        volunteer.lastActiveDate = Date.now();

        // Remove from assigned tasks
        volunteer.assignedTasks = volunteer.assignedTasks.filter(
            task => task.toString() !== donationId
        );

        // Check for badges
        if (volunteer.completedTasks === 1) {
            volunteer.badges.push({
                name: 'First Delivery',
                description: 'Completed your first delivery',
                icon: '🎉'
            });
        }
        if (volunteer.completedTasks === 10) {
            volunteer.badges.push({
                name: 'Dedicated Helper',
                description: 'Completed 10 deliveries',
                icon: '⭐'
            });
        }
        if (volunteer.completedTasks === 50) {
            volunteer.badges.push({
                name: 'Super Volunteer',
                description: 'Completed 50 deliveries',
                icon: '🏆'
            });
        }

        await volunteer.save();

        res.status(200).json({
            success: true,
            message: 'Task completed successfully',
            data: volunteer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get volunteer statistics
// @route   GET /api/volunteers/:id/stats
// @access  Private (Owner or Admin)
exports.getVolunteerStats = async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        if (volunteer.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const stats = {
            completedTasks: volunteer.completedTasks,
            totalHours: volunteer.totalHours,
            points: volunteer.points,
            level: volunteer.level,
            badges: volunteer.badges,
            rating: volunteer.rating,
            currentAssignments: volunteer.assignedTasks.length
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify volunteer (Admin only)
// @route   PUT /api/volunteers/:id/verify
// @access  Private (Admin)
exports.verifyVolunteer = async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        volunteer.isVerified = true;
        volunteer.backgroundCheckStatus = 'approved';
        volunteer.backgroundCheckDate = Date.now();
        await volunteer.save();

        res.status(200).json({
            success: true,
            message: 'Volunteer verified successfully',
            data: volunteer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my volunteer profile
// @route   GET /api/volunteers/my/profile
// @access  Private (Volunteer)
exports.getMyProfile = async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ user: req.user.id })
            .populate({
                path: 'assignedTasks',
                populate: { path: 'donor acceptedBy', select: 'name address' }
            });

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'No volunteer profile found. Please create one.'
            });
        }

        res.status(200).json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        next(error);
    }
};
