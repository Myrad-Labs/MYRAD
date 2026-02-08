// Uber Rides History Pipeline for MYRAD
// Transforms Uber ride history data into sellable, anonymized mobility datasets
// Valuable for transportation and urban planning insights

import 'dotenv/config';
import dayjs from 'dayjs';

// ================================
// CONFIGURATION
// ================================

const DATASET_CONFIG = {
    uber_rides: {
        dataset_id: 'myrad_uber_rides_v1',
        platform: 'uber_rides',
        version: '1.0.0'
    }
};

// Ride type categories
const RIDE_TYPES = {
    'uberx': { category: 'Economy', tier: 'standard' },
    'uber_x': { category: 'Economy', tier: 'standard' },
    'pool': { category: 'Economy', tier: 'shared' },
    'ubergo': { category: 'Economy', tier: 'budget' },
    'uber_go': { category: 'Economy', tier: 'budget' },
    'comfort': { category: 'Premium', tier: 'comfort' },
    'uber_comfort': { category: 'Premium', tier: 'comfort' },
    'premier': { category: 'Premium', tier: 'premium' },
    'uber_premier': { category: 'Premium', tier: 'premium' },
    'black': { category: 'Luxury', tier: 'luxury' },
    'uber_black': { category: 'Luxury', tier: 'luxury' },
    'suv': { category: 'Premium', tier: 'suv' },
    'uber_xl': { category: 'Economy', tier: 'xl' },
    'auto': { category: 'Economy', tier: 'auto' },
    'moto': { category: 'Economy', tier: 'bike' },
    'default': { category: 'Rideshare', tier: 'standard' }
};

// Time of day patterns
const TIME_PERIODS = {
    early_morning: { start: 5, end: 8, label: 'Early Morning' },
    morning_commute: { start: 8, end: 10, label: 'Morning Commute' },
    daytime: { start: 10, end: 17, label: 'Daytime' },
    evening_commute: { start: 17, end: 20, label: 'Evening Commute' },
    evening: { start: 20, end: 23, label: 'Evening' },
    late_night: { start: 23, end: 5, label: 'Late Night' }
};

// ================================
// HELPER FUNCTIONS
// ================================

// Parse fare from various formats
function parseFare(fare) {
    if (!fare) return 0;
    if (typeof fare === 'number') return fare;
    const cleaned = ('' + fare).replace(/[^\d.\-]/g, '');
    return parseFloat(cleaned) || 0;
}

// Parse distance
function parseDistance(distance) {
    if (!distance) return 0;
    if (typeof distance === 'number') return distance;
    const str = String(distance).toLowerCase();
    const numMatch = str.match(/[\d.]+/);
    if (!numMatch) return 0;
    const value = parseFloat(numMatch[0]);
    if (str.includes('mi')) return value * 1.60934; // miles to km
    return value; // assume km
}

// Parse duration in minutes
function parseDuration(duration) {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    const str = String(duration);
    const minMatch = str.match(/(\d+)\s*min/i);
    const hrMatch = str.match(/(\d+)\s*h/i);
    let total = 0;
    if (hrMatch) total += parseInt(hrMatch[1]) * 60;
    if (minMatch) total += parseInt(minMatch[1]);
    if (total === 0) {
        const numMatch = str.match(/[\d.]+/);
        total = numMatch ? parseFloat(numMatch[0]) : 0;
    }
    return total;
}

// Parse timestamp
function parseRideTimestamp(timestampStr) {
    if (!timestampStr) return null;
    try {
        const dt = dayjs(timestampStr);
        return dt.isValid() ? dt.toDate() : null;
    } catch (e) {
        return null;
    }
}

// Get ride type category
function getRideCategory(rideType) {
    const type = (rideType || '').toLowerCase().replace(/\s+/g, '_');
    return RIDE_TYPES[type] || RIDE_TYPES['default'];
}

// Get time period from hour
function getTimePeriod(hour) {
    if (hour >= 5 && hour < 8) return 'early_morning';
    if (hour >= 8 && hour < 10) return 'morning_commute';
    if (hour >= 10 && hour < 17) return 'daytime';
    if (hour >= 17 && hour < 20) return 'evening_commute';
    if (hour >= 20 && hour < 23) return 'evening';
    return 'late_night';
}

// Get spend bracket
function getSpendBracket(totalSpend, rideCount) {
    const avgFare = rideCount > 0 ? totalSpend / rideCount : 0;
    if (avgFare >= 500) return 'premium_rider';
    if (avgFare >= 200) return 'regular_rider';
    if (avgFare >= 100) return 'budget_rider';
    return 'value_seeker';
}

// Anonymize location to area level
function anonymizeLocation(location) {
    if (!location || typeof location !== 'string') return null;
    // Remove specific addresses, keep only area/neighborhood
    const parts = location.split(',').map(p => p.trim());
    // Return last 2 parts (usually area/city)
    return parts.slice(-2).join(', ') || null;
}

// ================================
// MAIN PROCESSING FUNCTION
// ================================

/**
 * Process Uber Rides data from Reclaim proof
 * @param {Object} extractedData - Data from Reclaim proof
 * @param {Object} options - Processing options
 * @returns {Object} Processed sellable mobility data
 */
export function processUberRidesData(extractedData, options = {}) {
    console.log('🚗 Processing Uber Rides data...');
    console.log('🔍 Input data:', JSON.stringify(extractedData, null, 2).substring(0, 500));

    // Extract rides array
    let rides = extractedData.rides || extractedData.ride_history || extractedData.trips || [];

    if (typeof rides === 'string') {
        try {
            rides = JSON.parse(rides);
        } catch (e) {
            rides = [];
        }
    }

    if (!Array.isArray(rides)) {
        rides = [];
    }

    console.log(`🚕 Found ${rides.length} rides`);

    // Process rides
    const processedRides = [];
    const rideTypeCount = {};
    const timePeriodCount = {};
    let totalSpend = 0;
    let totalDistance = 0;
    let totalDuration = 0;
    const validDates = [];
    const dayOfWeekCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    rides.forEach(ride => {
        const fare = parseFare(ride.fare || ride.total || ride.price || ride.amount);
        const distance = parseDistance(ride.distance || ride.trip_distance);
        const duration = parseDuration(ride.duration || ride.trip_duration);
        const rideType = ride.ride_type || ride.product_type || ride.vehicle_type || 'uberx';
        const timestamp = ride.timestamp || ride.date || ride.pickup_time || ride.request_time;

        totalSpend += fare;
        totalDistance += distance;
        totalDuration += duration;

        // Categorize ride type
        const category = getRideCategory(rideType);
        const categoryKey = category.tier;
        rideTypeCount[categoryKey] = (rideTypeCount[categoryKey] || 0) + 1;

        // Parse date for time analysis
        const parsedDate = parseRideTimestamp(timestamp);
        if (parsedDate) {
            validDates.push(parsedDate);
            const hour = parsedDate.getHours();
            const timePeriod = getTimePeriod(hour);
            timePeriodCount[timePeriod] = (timePeriodCount[timePeriod] || 0) + 1;
            dayOfWeekCount[parsedDate.getDay()]++;
        }

        processedRides.push({
            fare,
            distance,
            duration,
            rideType: categoryKey,
            timestamp
        });
    });

    // Calculate analytics
    const rideCount = processedRides.length;
    const avgFare = rideCount > 0 ? Math.round(totalSpend / rideCount * 100) / 100 : 0;
    const avgDistance = rideCount > 0 ? Math.round(totalDistance / rideCount * 10) / 10 : 0;
    const avgDuration = rideCount > 0 ? Math.round(totalDuration / rideCount) : 0;
    const spendBracket = getSpendBracket(totalSpend, rideCount);

    // Preferred ride type
    const preferredRideType = Object.entries(rideTypeCount)
        .sort((a, b) => b[1] - a[1])[0];

    // Peak time period
    const peakTimePeriod = Object.entries(timePeriodCount)
        .sort((a, b) => b[1] - a[1])[0];

    // Peak day
    const peakDay = Object.entries(dayOfWeekCount)
        .sort((a, b) => b[1] - a[1])[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Commuter detection
    const isCommuter = (timePeriodCount['morning_commute'] || 0) + (timePeriodCount['evening_commute'] || 0) > rideCount * 0.4;

    // Weekend vs weekday
    const weekendRides = dayOfWeekCount[0] + dayOfWeekCount[6];
    const weekdayRides = rideCount - weekendRides;
    const weekendPreference = weekendRides > weekdayRides;

    // Generate sellable data
    const sellableData = {
        schema_version: '1.0',
        dataset_id: DATASET_CONFIG.uber_rides.dataset_id,
        record_type: 'ride_history',
        generated_at: new Date().toISOString(),

        // Ride summary
        ride_summary: {
            total_rides: rideCount,
            total_spend: Math.round(totalSpend * 100) / 100,
            total_distance_km: Math.round(totalDistance * 10) / 10,
            total_duration_min: Math.round(totalDuration),
            avg_fare: avgFare,
            avg_distance_km: avgDistance,
            avg_duration_min: avgDuration
        },

        // Ride preferences
        ride_preferences: {
            preferred_type: preferredRideType?.[0] || 'standard',
            ride_type_distribution: rideTypeCount,
            uses_premium: (rideTypeCount['comfort'] || 0) + (rideTypeCount['premium'] || 0) + (rideTypeCount['luxury'] || 0) > 0,
            uses_shared: (rideTypeCount['shared'] || 0) > 0
        },

        // Temporal behavior
        temporal_behavior: {
            peak_time_period: peakTimePeriod?.[0] || 'daytime',
            peak_day: dayNames[parseInt(peakDay?.[0] || '0')],
            is_commuter: isCommuter,
            weekend_preference: weekendPreference,
            late_night_rider: (timePeriodCount['late_night'] || 0) > rideCount * 0.1
        },

        // Behavioral insights
        behavioral_insights: {
            spend_bracket: spendBracket,
            frequency: rideCount >= 20 ? 'heavy_user' : rideCount >= 10 ? 'regular' : rideCount >= 5 ? 'occasional' : 'light',
            urban_mobility_score: Math.min(100, rideCount * 5 + (isCommuter ? 20 : 0))
        },

        // Audience segment
        audience_segment: {
            segment_id: `uber_${spendBracket}_${isCommuter ? 'commuter' : 'casual'}`,
            dmp_attributes: {
                interest_transportation: true,
                interest_rideshare: true,
                interest_urban_mobility: true,
                platform_uber: true,
                is_commuter: isCommuter,
                uses_premium_rides: (rideTypeCount['comfort'] || 0) + (rideTypeCount['premium'] || 0) > 0,
                engagement_level: rideCount >= 15 ? 'high' : rideCount >= 5 ? 'medium' : 'low'
            }
        },

        // Metadata
        metadata: {
            source: 'reclaim_protocol',
            platform: DATASET_CONFIG.uber_rides.platform,
            schema_standard: 'myrad_mobility_v1',
            verification: {
                status: 'zk_verified',
                proof_type: 'zero_knowledge',
                attestor: 'reclaim_network'
            },
            privacy_compliance: {
                pii_stripped: true,
                locations_anonymized: true,
                gdpr_compatible: true,
                ccpa_compatible: true
            },
            data_quality: {
                score: Math.min(100, rideCount * 10 + (validDates.length > 0 ? 20 : 0)),
                completeness: rideCount > 0 ? 'good' : 'empty',
                rides_with_valid_dates: validDates.length,
                rides_with_fares: processedRides.filter(r => r.fare > 0).length
            }
        }
    };

    console.log('✅ Uber Rides data processed successfully');
    console.log(`📊 Ride count: ${rideCount}, Total spend: $${totalSpend}`);

    return {
        success: true,
        sellableRecord: sellableData,
        rawProcessed: {
            rideCount,
            totalSpend,
            avgFare,
            preferredRideType: preferredRideType?.[0],
            isCommuter
        }
    };
}

// ================================
// EXPORT
// ================================

export default {
    processUberRidesData,
    getRideCategory,
    getTimePeriod,
    parseFare,
    parseDistance,
    getSpendBracket
};
