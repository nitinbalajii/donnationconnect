const Donation = require('../models/Donation.model');

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public
exports.getDonations = async (req, res, next) => {
    try {
        // Build query
        let query = { isActive: true };

        // Filter by type
        if (req.query.type) {
            query.type = req.query.type;
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        } else {
            // Default: only show pending donations to public
            query.status = 'pending';
        }

        // Filter by city
        if (req.query.city) {
            query['pickupAddress.city'] = new RegExp(req.query.city, 'i');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Donation.countDocuments(query);

        const donations = await Donation.find(query)
            .populate('donor', 'name email profileImage')
            .populate('acceptedBy', 'name address')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: donations.length,
            total,
            pagination,
            data: donations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Public
exports.getDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donor', 'name email phone profileImage')
            .populate('acceptedBy', 'name address contactInfo')
            .populate('assignedVolunteer', 'name phone email');

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Increment views
        donation.views += 1;
        await donation.save();

        res.status(200).json({
            success: true,
            data: donation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donor)
exports.createDonation = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.donor = req.user.id;

        const donation = await Donation.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Donation created successfully',
            data: donation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private (Owner or Admin)
exports.updateDonation = async (req, res, next) => {
    try {
        let donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Make sure user is donation owner or admin
        if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this donation'
            });
        }

        donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Donation updated successfully',
            data: donation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (Owner or Admin)
exports.deleteDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Make sure user is donation owner or admin
        if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this donation'
            });
        }

        // Soft delete - just mark as inactive
        donation.isActive = false;
        await donation.save();

        res.status(200).json({
            success: true,
            message: 'Donation deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept donation (for shelters)
// @route   PUT /api/donations/:id/accept
// @access  Private (Shelter)
exports.acceptDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        if (donation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This donation has already been accepted or is no longer available'
            });
        }

        donation.status = 'accepted';
        donation.acceptedBy = req.body.shelterId; // Shelter ID from request
        await donation.save();

        res.status(200).json({
            success: true,
            message: 'Donation accepted successfully',
            data: donation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
// @access  Private (Volunteer, Shelter, Admin)
exports.updateStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        donation.status = status;

        if (note) {
            donation.statusHistory[donation.statusHistory.length - 1].note = note;
        }

        await donation.save();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: donation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my donations
// @route   GET /api/donations/my/donations
// @access  Private
exports.getMyDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ donor: req.user.id })
            .populate('acceptedBy', 'name')
            .populate('assignedVolunteer', 'name phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        next(error);
    }
};
