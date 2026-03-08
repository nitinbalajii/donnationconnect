const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide shelter name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    type: {
        type: String,
        enum: ['family', 'women-children', 'youth', 'veterans', 'general', 'other'],
        required: true
    },
    address: {
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
    contactInfo: {
        phone: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        email: {
            type: String,
            required: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        website: String
    },
    capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be at least 1']
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    images: [{
        url: String,
        publicId: String
    }],
    currentNeeds: [{
        category: {
            type: String,
            enum: [
                'clothing', 'furniture', 'electronics', 'books', 'toys',
                'household', 'food', 'hygiene', 'medical', 'other'
            ]
        },
        description: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        quantity: String
    }],
    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    services: [{
        type: String,
        enum: [
            'emergency-shelter', 'transitional-housing', 'meals',
            'counseling', 'job-training', 'healthcare', 'childcare',
            'education', 'legal-aid', 'other'
        ]
    }],
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date
    }],
    statistics: {
        totalPeopleHelped: {
            type: Number,
            default: 0
        },
        donationsReceived: {
            type: Number,
            default: 0
        },
        establishedYear: Number
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
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
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
shelterSchema.index({ 'address.city': 1, isActive: 1 });
shelterSchema.index({ isVerified: 1, isActive: 1 });
shelterSchema.index({ 'rating.average': -1 });

// Virtual for accepted donations
shelterSchema.virtual('acceptedDonations', {
    ref: 'Donation',
    localField: '_id',
    foreignField: 'acceptedBy',
    justOne: false
});

module.exports = mongoose.model('Shelter', shelterSchema);
