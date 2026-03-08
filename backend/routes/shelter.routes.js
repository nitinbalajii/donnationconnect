const express = require('express');
const {
    getShelters,
    getShelter,
    createShelter,
    updateShelter,
    deleteShelter,
    updateNeeds,
    getShelterStats,
    verifyShelter,
    getMyShelter
} = require('../controllers/shelter.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getShelters);
router.get('/:id', getShelter);

// Protected routes
router.use(protect);

router.post('/', authorize('shelter', 'admin'), createShelter);
router.get('/my/shelter', authorize('shelter', 'admin'), getMyShelter);
router.put('/:id', authorize('shelter', 'admin'), updateShelter);
router.delete('/:id', authorize('shelter', 'admin'), deleteShelter);
router.put('/:id/needs', authorize('shelter', 'admin'), updateNeeds);
router.get('/:id/stats', authorize('shelter', 'admin'), getShelterStats);
router.put('/:id/verify', authorize('admin'), verifyShelter);

module.exports = router;
