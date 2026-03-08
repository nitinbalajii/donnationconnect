const express = require('express');
const {
    getVolunteers,
    getVolunteer,
    createVolunteer,
    updateVolunteer,
    assignTask,
    completeTask,
    getVolunteerStats,
    verifyVolunteer,
    getMyProfile
} = require('../controllers/volunteer.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', authorize('admin', 'shelter'), getVolunteers);
router.get('/my/profile', authorize('volunteer', 'admin'), getMyProfile);
router.post('/', authorize('volunteer', 'admin'), createVolunteer);
router.get('/:id', getVolunteer);
router.put('/:id', authorize('volunteer', 'admin'), updateVolunteer);
router.put('/:id/assign', authorize('admin', 'shelter'), assignTask);
router.put('/:id/complete', authorize('volunteer', 'admin'), completeTask);
router.get('/:id/stats', authorize('volunteer', 'admin'), getVolunteerStats);
router.put('/:id/verify', authorize('admin'), verifyVolunteer);

module.exports = router;
