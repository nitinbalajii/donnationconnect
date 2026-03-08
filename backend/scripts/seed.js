// backend/scripts/seed.js
// Populates the database with realistic demo data for DonationConnect
// Usage: node scripts/seed.js  (from inside the backend/ folder)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User.model');
const Donation = require('../models/Donation.model');
const Shelter = require('../models/Shelter.model');
const Volunteer = require('../models/Volunteer.model');

// ────────────────────────────────────────────────────────────
// SEED DATA
// ────────────────────────────────────────────────────────────

const USERS = [
    { name: 'Nitin Balajee', email: 'admin@donationconnect.in', password: 'Admin@123', role: 'admin', phone: '9876543210' },
    { name: 'Priya Sharma', email: 'donor1@example.com', password: 'Donor@123', role: 'donor', phone: '9876543201' },
    { name: 'Rahul Verma', email: 'donor2@example.com', password: 'Donor@123', role: 'donor', phone: '9876543202' },
    { name: 'Anita Singh', email: 'shelter1@example.com', password: 'Shelter@123', role: 'shelter', phone: '9876543203' },
    { name: 'Rupesh Kumar', email: 'shelter2@example.com', password: 'Shelter@123', role: 'shelter', phone: '9876543204' },
    { name: 'Kavya Reddy', email: 'volunteer1@example.com', password: 'Volunteer@123', role: 'volunteer', phone: '9876543205' },
    { name: 'Arjun Nair', email: 'volunteer2@example.com', password: 'Volunteer@123', role: 'volunteer', phone: '9876543206' },
];

const SHELTERS = [
    {
        name: 'Aashraya Children Home',
        description: 'A registered shelter home for orphaned and abandoned children in New Delhi.',
        type: 'other', // must be one of: 'family', 'women-children', 'youth', 'veterans', 'general', 'other'
        address: { street: 'Sector 14, Dwarka', city: 'New Delhi', state: 'Delhi', zipCode: '110075' },
        contactInfo: { phone: '0112689123', email: 'aashraya@example.com', website: 'aashrayahome.org' }, // phone must be exactly 10 digits
        capacity: 80,
        currentOccupancy: 62,
        currentNeeds: [
            { category: 'clothing', description: 'clothes (age 5-14)', priority: 'high' },
            { category: 'other', description: 'school supplies', priority: 'medium' },
            { category: 'medical', description: 'medicines', priority: 'urgent' },
            { category: 'food', description: 'nutritious food', priority: 'high' }
        ],
        services: ['meals', 'education', 'healthcare', 'counseling'], // must match enum
        isVerified: true,
    },
    {
        name: 'Vanita Mahila Ashram',
        description: 'Safe shelter for women in distress, survivors of domestic violence, and single mothers across Mumbai.',
        type: 'women-children',
        address: { street: 'Andheri East, Near Metro', city: 'Mumbai', state: 'Maharashtra', zipCode: '400069' },
        contactInfo: { phone: '0222654123', email: 'vma@example.com' },
        capacity: 50,
        currentOccupancy: 38,
        currentNeeds: [
            { category: 'clothing', description: 'sarees & salwar kameez', priority: 'high' },
            { category: 'household', description: 'household items', priority: 'medium' },
            { category: 'food', description: 'baby food', priority: 'urgent' },
            { category: 'hygiene', description: 'toiletries', priority: 'high' }
        ],
        services: ['meals', 'emergency-shelter', 'legal-aid', 'job-training'],
        isVerified: true,
    },
    {
        name: 'Suraksha Old Age Home',
        description: 'Providing dignified care for senior citizens who are homeless or have been abandoned by families.',
        type: 'general',
        address: { street: 'Jayanagar 4th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560011' },
        contactInfo: { phone: '0802654123', email: 'suraksha@example.com' },
        capacity: 60,
        currentOccupancy: 44,
        currentNeeds: [
            { category: 'household', description: 'warm blankets', priority: 'high' },
            { category: 'medical', description: 'walking aids', priority: 'medium' },
            { category: 'medical', description: 'blood pressure medicine', priority: 'urgent' },
            { category: 'food', description: 'soft food items', priority: 'high' }
        ],
        services: ['meals', 'healthcare', 'other'],
        isVerified: true,
    },
    {
        name: 'Yuva Shakti Youth Shelter',
        description: 'Safe house and skill development center for runaway, homeless, and at-risk youth working towards independence.',
        type: 'youth',
        address: { street: 'Sector 62, Industrial Area', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201309' },
        contactInfo: { phone: '0120254123', email: 'yuvashakti@example.com' },
        capacity: 100,
        currentOccupancy: 85,
        currentNeeds: [
            { category: 'clothing', description: 'professional clothing (interviews)', priority: 'medium' },
            { category: 'electronics', description: 'laptops & tablets', priority: 'high' },
            { category: 'food', description: 'granola bars & snacks', priority: 'low' }
        ],
        services: ['meals', 'job-training', 'counseling', 'education'],
        isVerified: true,
    },
    {
        name: 'Sahara Community Center',
        description: 'A general shelter providing emergency overnight beds and hot meals for the urban homeless population.',
        type: 'general',
        address: { street: 'Paharganj', city: 'New Delhi', state: 'Delhi', zipCode: '110055' },
        contactInfo: { phone: '0112345678', email: 'sahara@example.com' },
        capacity: 120,
        currentOccupancy: 115,
        currentNeeds: [
            { category: 'clothing', description: 'mens winter coats', priority: 'urgent' },
            { category: 'hygiene', description: 'soap & toothbrushes', priority: 'high' },
            { category: 'clothing', description: 'socks and underwear', priority: 'urgent' }
        ],
        services: ['emergency-shelter', 'meals', 'healthcare'],
        isVerified: true,
    },
    {
        name: 'Pragati Family Shelter',
        description: 'Temporary transitional housing designed to keep families together while they get back on their feet.',
        type: 'family',
        address: { street: 'Salt Lake City', city: 'Kolkata', state: 'West Bengal', zipCode: '700091' },
        contactInfo: { phone: '0332345678', email: 'pragati@example.com' },
        capacity: 40,
        currentOccupancy: 32,
        currentNeeds: [
            { category: 'toys', description: 'childrens toys & games', priority: 'medium' },
            { category: 'household', description: 'bed sheets & towels', priority: 'high' },
            { category: 'food', description: 'baby formula', priority: 'urgent' }
        ],
        services: ['transitional-housing', 'childcare', 'meals', 'counseling'],
        isVerified: true,
    }
];

const DONATIONS = [
    {
        type: 'item',
        title: 'Winter Clothing Bundle — Jackets & Sweaters',
        description: 'Collection of 15 winter jackets and 20 sweaters in good condition.',
        category: 'clothing',
        condition: 'good',
        quantity: 35,
        pickupAddress: { street: 'Lajpat Nagar', city: 'New Delhi', state: 'Delhi', zipCode: '110024' },
        pickupAvailability: 'weekends',
        status: 'pending',
    },
    {
        type: 'food',
        title: 'Non-Perishable Grocery Pack',
        description: 'Rice (10kg), Dal (5kg), Atta (10kg), Sugar (3kg), Tea (500g).',
        category: 'groceries',
        condition: 'n/a',
        quantity: 1,
        pickupAddress: { street: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', zipCode: '560034' },
        pickupAvailability: 'flexible',
        foodDetails: { foodType: 'groceries', dietaryInfo: { vegetarian: true, vegan: true }, servings: 50 },
        status: 'pending',
    },
    {
        type: 'item',
        title: "Children's Books & Educational Material",
        description: '45 story books and textbooks for ages 6–14.',
        category: 'books',
        condition: 'like-new',
        quantity: 45,
        pickupAddress: { street: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
        pickupAvailability: 'weekdays',
        status: 'pending',
    },
    {
        type: 'item',
        title: 'Household Furniture — Beds & Chairs',
        description: '3 single beds with mattresses and 8 plastic chairs.',
        category: 'furniture',
        condition: 'fair',
        quantity: 11,
        pickupAddress: { street: 'Sector 18, Noida', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201301' },
        pickupAvailability: 'weekends',
        status: 'pending',
    },
    {
        type: 'food',
        title: 'Home-cooked Meal — 50 Servings',
        description: 'Dal rice, sabzi, and roti packed in containers.',
        category: 'prepared',
        condition: 'n/a',
        quantity: 50,
        pickupAddress: { street: 'Punjabi Bagh', city: 'New Delhi', state: 'Delhi', zipCode: '110026' },
        pickupAvailability: 'specific',
        foodDetails: { foodType: 'prepared', dietaryInfo: { vegetarian: true }, expiryDate: new Date(Date.now() + 8 * 60 * 60 * 1000), servings: 50 },
        status: 'pending',
    },
];

// ────────────────────────────────────────────────────────────
// SEED FUNCTION
// ────────────────────────────────────────────────────────────

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Donation.deleteMany({}),
            Shelter.deleteMany({}),
            Volunteer.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // Create users
        const createdUsers = [];
        for (const userData of USERS) {
            const user = await User.create({ ...userData, isVerified: true });
            createdUsers.push(user);
            console.log(`  👤 User: ${user.name} (${user.role})`);
        }

        // Map users by role
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const donors = createdUsers.filter(u => u.role === 'donor');
        const shelterUsers = createdUsers.filter(u => u.role === 'shelter');
        const volunteerUsers = createdUsers.filter(u => u.role === 'volunteer');

        // Create shelters
        for (let i = 0; i < SHELTERS.length; i++) {
            const s = await Shelter.create({
                ...SHELTERS[i],
                user: shelterUsers[i % shelterUsers.length]._id,
                rating: { average: (4.0 + Math.random() * 0.9).toFixed(1), count: Math.floor(10 + Math.random() * 40) }
            });
            console.log(`  🏠 Shelter: ${s.name}`);
        }

        // Create donations
        for (let i = 0; i < DONATIONS.length; i++) {
            const d = await Donation.create({
                ...DONATIONS[i],
                donor: donors[i % donors.length]._id,
            });
            console.log(`  🎁 Donation: ${d.title.substring(0, 50)}`);
        }

        // Create volunteer profiles
        for (let i = 0; i < volunteerUsers.length; i++) {
            const v = await Volunteer.create({
                user: volunteerUsers[i]._id,
                bio: `Passionate volunteer helping connect donors with shelters across India.`,
                hasTransportation: i % 2 === 0,
                skills: ['delivery', 'communication'],
                availability: { weekdays: true, weekends: i % 2 === 0 },
                completedTasks: i * 3,
                totalHours: i * 5,
                points: i * 30,
                isVerified: true,
                badges: i > 0 ? [{ name: 'Starter', description: 'First delivery', icon: '🎉' }] : [],
            });
            console.log(`  🙋 Volunteer: ${volunteerUsers[i].name}`);
        }

        console.log('\n✅ Seed complete!');
        console.log('\n📋 Test Accounts:');
        USERS.forEach(u => console.log(`   ${u.role.padEnd(10)} ${u.email}  /  ${u.password}`));

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
}

seed();
