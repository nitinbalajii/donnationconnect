const Donation = require('../models/Donation.model');
const Shelter = require('../models/Shelter.model');
const Volunteer = require('../models/Volunteer.model');

/**
 * Smart matching algorithm to match donations with shelters
 * Based on:
 * - Location proximity
 * - Shelter needs
 * - Donation category
 * - Shelter capacity
 * - Priority level
 */
const matchDonationWithShelters = async (donationId) => {
    try {
        const donation = await Donation.findById(donationId);
        if (!donation) {
            throw new Error('Donation not found');
        }

        // Find active, verified shelters
        const shelters = await Shelter.find({
            isActive: true,
            isVerified: true
        });

        const matches = [];

        for (const shelter of shelters) {
            let score = 0;

            // 1. Check if shelter needs this category (40 points)
            const needsCategory = shelter.currentNeeds.some(
                need => need.category === donation.category
            );
            if (needsCategory) {
                score += 40;

                // Bonus for high priority needs (20 points)
                const highPriorityNeed = shelter.currentNeeds.find(
                    need => need.category === donation.category &&
                        (need.priority === 'high' || need.priority === 'urgent')
                );
                if (highPriorityNeed) {
                    score += 20;
                }
            }

            // 2. Location proximity (30 points max)
            const distance = calculateDistance(
                donation.pickupAddress.coordinates,
                shelter.address.coordinates
            );

            if (distance < 5) score += 30;  // Within 5km
            else if (distance < 10) score += 20; // Within 10km
            else if (distance < 20) score += 10; // Within 20km

            // 3. Shelter capacity (10 points)
            const occupancyRate = (shelter.currentOccupancy / shelter.capacity) * 100;
            if (occupancyRate > 80) score += 10; // High occupancy = more need

            // 4. Shelter rating (10 points)
            score += (shelter.rating.average / 5) * 10;

            // 5. Recent activity bonus (10 points)
            const recentDonations = await Donation.countDocuments({
                acceptedBy: shelter._id,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            if (recentDonations < 5) score += 10; // Prioritize less active shelters

            if (score > 0) {
                matches.push({
                    shelter: shelter,
                    score: score,
                    distance: distance
                });
            }
        }

        // Sort by score (highest first)
        matches.sort((a, b) => b.score - a.score);

        return matches.slice(0, 5); // Return top 5 matches
    } catch (error) {
        console.error('Error in matching algorithm:', error);
        throw error;
    }
};

/**
 * Match volunteer with donation based on:
 * - Location proximity
 * - Availability
 * - Transportation
 * - Rating
 * - Current workload
 */
const matchVolunteerWithDonation = async (donationId) => {
    try {
        const donation = await Donation.findById(donationId).populate('acceptedBy');
        if (!donation) {
            throw new Error('Donation not found');
        }

        // Find active, verified volunteers
        const volunteers = await Volunteer.find({
            isActive: true,
            isVerified: true,
            hasTransportation: true // Only volunteers with transportation
        }).populate('user');

        const matches = [];

        for (const volunteer of volunteers) {
            let score = 0;

            // 1. Location proximity (40 points max)
            if (volunteer.user.address && volunteer.user.address.coordinates) {
                const distance = calculateDistance(
                    donation.pickupAddress.coordinates,
                    volunteer.user.address.coordinates
                );

                if (distance < 5) score += 40;
                else if (distance < 10) score += 30;
                else if (distance < 20) score += 20;
                else if (distance < 30) score += 10;
            }

            // 2. Current workload (30 points)
            const currentTasks = volunteer.assignedTasks.length;
            if (currentTasks === 0) score += 30;
            else if (currentTasks === 1) score += 20;
            else if (currentTasks === 2) score += 10;

            // 3. Volunteer rating (20 points)
            score += (volunteer.rating.average / 5) * 20;

            // 4. Experience level (10 points)
            if (volunteer.completedTasks > 50) score += 10;
            else if (volunteer.completedTasks > 20) score += 7;
            else if (volunteer.completedTasks > 5) score += 5;

            if (score > 0) {
                matches.push({
                    volunteer: volunteer,
                    score: score
                });
            }
        }

        // Sort by score
        matches.sort((a, b) => b.score - a.score);

        return matches.slice(0, 3); // Return top 3 matches
    } catch (error) {
        console.error('Error matching volunteer:', error);
        throw error;
    }
};

/**
 * Calculate distance between two coordinates (in km)
 * Using Haversine formula
 */
const calculateDistance = (coords1, coords2) => {
    if (!coords1 || !coords2 || !coords1.lat || !coords2.lat) {
        return 999; // Return large distance if coordinates missing
    }

    const R = 6371; // Earth's radius in km
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Auto-suggest shelters when donation is created
 */
const suggestSheltersForDonation = async (donationId) => {
    const matches = await matchDonationWithShelters(donationId);

    return matches.map(match => ({
        shelterId: match.shelter._id,
        shelterName: match.shelter.name,
        score: match.score,
        distance: match.distance,
        matchReasons: getMatchReasons(match)
    }));
};

const getMatchReasons = (match) => {
    const reasons = [];

    if (match.score >= 60) {
        reasons.push('High priority need');
    }
    if (match.distance < 5) {
        reasons.push('Very close location');
    } else if (match.distance < 10) {
        reasons.push('Nearby location');
    }
    if (match.shelter.rating.average >= 4.5) {
        reasons.push('Highly rated shelter');
    }

    return reasons;
};

module.exports = {
    matchDonationWithShelters,
    matchVolunteerWithDonation,
    suggestSheltersForDonation,
    calculateDistance
};
