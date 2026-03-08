const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Placeholder routes - will be implemented next
router.get('/', (req, res) => {
    res.json({ success: true, message: 'User routes - Coming soon' });
});

module.exports = router;
