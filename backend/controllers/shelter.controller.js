const Shelter = require('../models/Shelter.model');
const User = require('../models/User.model');

// @desc    Get all shelters
// @route   GET /api/shelters
// @access  Public
exports.getShelters = async (req, res, next) => {
    try {
        let query = { isActive: true };

        // Filter by city
        if (req.query.city) {
            query['address.city'] = new RegExp(req.query.city, 'i');
        }

        // Filter by type
        if (req.query.type) {
            query.type = req.query.type;
        }

        // Filter by verified status
        if (req.query.verified === 'true') {
            query.isVerified = true;
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const total = await Shelter.countDocuments(query);

        const shelters = await Shelter.find(query)
            .populate('user', 'name email')
            .sort({ 'rating.average': -1, createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Pagination result
        const pagination = {};
        if (startIndex + limit < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: shelters.length,
            total,
            pagination,
            data: shelters
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single shelter
// @route   GET /api/shelters/:id
// @access  Public
exports.getShelter = async (req, res, next) => {
    try {
        const shelter = await Shelter.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate({
                path: 'acceptedDonations',
                match: { status: { $in: ['accepted', 'picked-up', 'in-transit', 'delivered'] } },
                options: { limit: 10, sort: { createdAt: -1 } }
            });

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'Shelter not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shelter
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create shelter profile
// @route   POST /api/shelters
// @access  Private (Shelter role)
exports.createShelter = async (req, res, next) => {
    try {
        // Check if user already has a shelter
        const existingShelter = await Shelter.findOne({ user: req.user.id });
        if (existingShelter) {
            return res.status(400).json({
                success: false,
                message: 'You already have a shelter profile'
            });
        }

        // Add user to req.body
        req.body.user = req.user.id;

        const shelter = await Shelter.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Shelter profile created successfully. Pending verification.',
            data: shelter
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update shelter
// @route   PUT /api/shelters/:id
// @access  Private (Owner or Admin)
exports.updateShelter = async (req, res, next) => {
    try {
        let shelter = await Shelter.findById(req.params.id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'Shelter not found'
            });
        }

        // Make sure user is shelter owner or admin
        if (shelter.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this shelter'
            });
        }

        shelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Shelter updated successfully',
            data: shelter
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete shelter
// @route   DELETE /api/shelters/:id
// @access  Private (Owner or Admin)
exports.deleteShelter = async (req, res, next) => {
    try {
        const shelter = await Shelter.findById(req.params.id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'Shelter not found'
            });
        }

        // Make sure user is shelter owner or admin
        if (shelter.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this shelter'
            });
        }

        // Soft delete
        shelter.isActive = false;
        await shelter.save();

        res.status(200).json({
            success: true,
            message: 'Shelter deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update shelter needs
// @route   PUT /api/shelters/:id/needs
// @access  Private (Shelter owner)
exports.updateNeeds = async (req, res, next) => {
    try {
        const shelter = await Shelter.findById(req.params.id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'Shelter not found'
            });
        }

        if (shelter.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update shelter needs'
            });
        }

        shelter.currentNeeds = req.body.needs;
        await shelter.save();

        res.status(200).json({
            success: true,
            message: 'Needs updated successfully',
            data: shelter
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get shelter statistics
// @route   GET /api/shelters/:id/stats
// @access  Private (Shelter owner or Admin)
exports.getShelterStats = async (req, res, next) => {
    try {
        const shelter = await Shelter.findById(req.params.id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'Shelter not found'
            });
        }

        if (shelter.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view shelter statistics'
            });
        }

        // Get donation statistics
        const Donation = require('../models/Donation.model');

        const stats = {
            totalDonationsReceived: await Donation.countDocuments({
                acceptedBy: shelter._id,
                status: 'delivered'
            }),
            pendingDonations: await Donation.countDocuments({
                acceptedBy: shelter._id,
                status: { $in: ['accepted', 'assigned', 'picked-up', 'in-transit'] }
            }),
            currentOccupancy: shelter.currentOccupancy,
            capacity: shelter.capacity,
            occupancyRate: ((shelter.currentOccupancy / shelter.capacity) * 100).toFixed(1),
            rating: shelter.rating
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify shelter (Admin only)
// @route   PUT /api/shelters/:id/verify
// @access  Private (Admin)
exports.verifyShelter = async (req, res, next) => {
    try {
        const shelter = await Shelter.findById(req.params.id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'Shelter not found'
            });
        }

        shelter.isVerified = true;
        await shelter.save();

        res.status(200).json({
            success: true,
            message: 'Shelter verified successfully',
            data: shelter
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my shelter
// @route   GET /api/shelters/my/shelter
// @access  Private (Shelter)
exports.getMyShelter = async (req, res, next) => {
    try {
        const shelter = await Shelter.findOne({ user: req.user.id })
            .populate({
                path: 'acceptedDonations',
                options: { limit: 20, sort: { createdAt: -1 } }
            });

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: 'No shelter profile found. Please create one.'
            });
        }

        res.status(200).json({
            success: true,
            data: shelter
        });
    } catch (error) {
        next(error);
    }
};
