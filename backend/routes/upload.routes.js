const express = require('express');
const { upload, uploadMultipleImages } = require('../utils/imageUpload');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const { uploadToCloudinary } = require('../utils/imageUpload');
        const result = await uploadToCloudinary(req.file.buffer, 'donationconnect/profiles');

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('images', 4), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            });
        }

        const results = await uploadMultipleImages(req.files, 'donationconnect/donations');

        res.status(200).json({
            success: true,
            message: `${results.length} images uploaded successfully`,
            data: results
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete image
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, async (req, res, next) => {
    try {
        const { deleteFromCloudinary } = require('../utils/imageUpload');

        // Replace URL-encoded slashes
        const publicId = req.params.publicId.replace(/%2F/g, '/');

        await deleteFromCloudinary(publicId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
