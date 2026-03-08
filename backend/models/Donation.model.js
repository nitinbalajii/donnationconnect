const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['item', 'food'],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    category: {
        type: String,
        required: true,
        enum: [
            'clothing', 'furniture', 'electronics', 'books', 'toys',
            'household', 'food', 'groceries', 'prepared', 'baked',
            'produce', 'other'
        ]
    },
    condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'poor', 'n/a'],
        default: 'good'
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Quantity must be at least 1']
    },
    images: [{
        url: String,
        publicId: String
    }],
    // Food-specific fields
    foodDetails: {
        foodType: {
            type: String,
            enum: ['groceries', 'prepared', 'baked', 'produce', 'other']
        },
        dietaryInfo: {
            vegetarian: Boolean,
            vegan: Boolean,
            glutenFree: Boolean,
            dairyFree: Boolean,
            nutFree: Boolean
        },
        expiryDate: Date,
        servings: Number
    },
    // Pickup details
    pickupAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    pickupAvailability: {
        type: String,
        enum: ['flexible', 'weekdays', 'weekends', 'specific'],
        default: 'flexible'
    },
    pickupDate: Date,
    pickupTimeSlot: String,
    notes: String,
    // Status tracking
    status: {
        type: String,
        enum: ['pending', 'accepted', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
        default: 'pending'
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter'
    },
    assignedVolunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ acceptedBy: 1, status: 1 });
donationSchema.index({ category: 1, status: 1 });
donationSchema.index({ 'pickupAddress.city': 1, status: 1 });
donationSchema.index({ createdAt: -1 });

// Add status to history before saving
donationSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
    }
    next();
});

module.exports = mongoose.model('Donation', donationSchema);
