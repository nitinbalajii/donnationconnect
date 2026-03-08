const express = require('express');
const {
    getDonations,
    getDonation,
    createDonation,
    updateDonation,
    deleteDonation,
    acceptDonation,
    updateStatus,
    getMyDonations
} = require('../controllers/donation.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getDonations);
router.get('/:id', getDonation);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/', authorize('donor', 'admin'), createDonation);
router.get('/my/donations', getMyDonations);
router.put('/:id', authorize('donor', 'admin'), updateDonation);
router.delete('/:id', authorize('donor', 'admin'), deleteDonation);
router.put('/:id/accept', authorize('shelter', 'admin'), acceptDonation);
router.put('/:id/status', authorize('volunteer', 'shelter', 'admin'), updateStatus);

module.exports = router;
