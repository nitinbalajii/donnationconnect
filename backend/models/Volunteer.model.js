const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Personal preferences
    interests: [{
        type: String,
        enum: ['delivery', 'food-rescue', 'event-coordinator', 'shelter-assistant', 'other']
    }],
    availability: {
        weekdayMornings: Boolean,
        weekdayAfternoons: Boolean,
        weekdayEvenings: Boolean,
        weekendMornings: Boolean,
        weekendAfternoons: Boolean,
        weekendEvenings: Boolean
    },
    frequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'occasionally'],
        default: 'occasionally'
    },
    hasTransportation: {
        type: Boolean,
        default: false
    },
    vehicleType: {
        type: String,
        enum: ['car', 'bike', 'scooter', 'bicycle', 'none'],
        default: 'none'
    },
    // Skills and qualifications
    skills: [String],
    languages: [String],
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date
    }],
    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    backgroundCheckStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'approved', 'rejected', 'not-required'],
        default: 'not-required'
    },
    backgroundCheckDate: Date,
    // References
    references: [{
        name: String,
        relationship: String,
        phone: String,
        email: String
    }],
    // Activity tracking
    assignedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    }],
    completedTasks: {
        type: Number,
        default: 0
    },
    totalHours: {
        type: Number,
        default: 0
    },
    // Gamification
    points: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: [{
        name: String,
        description: String,
        earnedDate: {
            type: Date,
            default: Date.now
        },
        icon: String
    }],
    // Rating
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    lastActiveDate: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
volunteerSchema.index({ isVerified: 1, isActive: 1 });
volunteerSchema.index({ 'rating.average': -1 });

// Calculate level based on points
volunteerSchema.pre('save', function (next) {
    if (this.isModified('points')) {
        this.level = Math.floor(this.points / 100) + 1;
    }
    next();
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
