// Strava Fitness Activity Pipeline for MYRAD
// Transforms Strava user data and activity habits into sellable, anonymized fitness intelligence
// High value target audience for fitness brands

import 'dotenv/config';
import dayjs from 'dayjs';

// ================================
// CONFIGURATION
// ================================

const DATASET_CONFIG = {
    strava: {
        dataset_id: 'myrad_strava_v1',
        platform: 'strava',
        version: '1.0.0'
    }
};

// Activity type mappings
const ACTIVITY_TYPES = {
    'run': { category: 'Cardio', subcategory: 'Running' },
    'running': { category: 'Cardio', subcategory: 'Running' },
    'walk': { category: 'Cardio', subcategory: 'Walking' },
    'walking': { category: 'Cardio', subcategory: 'Walking' },
    'hike': { category: 'Outdoor', subcategory: 'Hiking' },
    'hiking': { category: 'Outdoor', subcategory: 'Hiking' },
    'ride': { category: 'Cardio', subcategory: 'Cycling' },
    'cycling': { category: 'Cardio', subcategory: 'Cycling' },
    'bike': { category: 'Cardio', subcategory: 'Cycling' },
    'swim': { category: 'Cardio', subcategory: 'Swimming' },
    'swimming': { category: 'Cardio', subcategory: 'Swimming' },
    'yoga': { category: 'Wellness', subcategory: 'Yoga' },
    'workout': { category: 'Strength', subcategory: 'Gym Workout' },
    'weight_training': { category: 'Strength', subcategory: 'Weight Training' },
    'crossfit': { category: 'Strength', subcategory: 'CrossFit' },
    'elliptical': { category: 'Cardio', subcategory: 'Elliptical' },
    'rowing': { category: 'Cardio', subcategory: 'Rowing' },
    'skiing': { category: 'Winter Sports', subcategory: 'Skiing' },
    'snowboard': { category: 'Winter Sports', subcategory: 'Snowboarding' },
    'default': { category: 'Fitness', subcategory: 'General' }
};

// Fitness level tiers based on activity frequency
const FITNESS_TIERS = {
    elite: { minActivitiesPerWeek: 7, label: 'Elite Athlete' },
    enthusiast: { minActivitiesPerWeek: 4, label: 'Fitness Enthusiast' },
    regular: { minActivitiesPerWeek: 2, label: 'Regular Active' },
    casual: { minActivitiesPerWeek: 1, label: 'Casual Fitness' },
    beginner: { minActivitiesPerWeek: 0, label: 'Getting Started' }
};

// ================================
// HELPER FUNCTIONS
// ================================

// Anonymize location to region level (strip specific address/coordinates)
function anonymizeLocation(location) {
    if (!location || typeof location !== 'string') return { region: 'unknown', country: 'unknown' };

    // Extract country and city/region only, remove specific addresses
    const parts = location.split(',').map(p => p.trim());

    if (parts.length >= 2) {
        return {
            region: parts[parts.length - 2] || 'unknown',
            country: parts[parts.length - 1] || 'unknown'
        };
    }

    return { region: parts[0] || 'unknown', country: 'unknown' };
}

// Get activity category
function getActivityCategory(activityType) {
    const type = (activityType || '').toLowerCase();
    return ACTIVITY_TYPES[type] || ACTIVITY_TYPES['default'];
}

// Calculate fitness tier based on weekly activity frequency
function getFitnessTier(activitiesPerWeek) {
    if (activitiesPerWeek >= 7) return 'elite';
    if (activitiesPerWeek >= 4) return 'enthusiast';
    if (activitiesPerWeek >= 2) return 'regular';
    if (activitiesPerWeek >= 1) return 'casual';
    return 'beginner';
}

// Parse distance (handles various formats: km, mi, meters)
function parseDistance(distanceStr) {
    if (!distanceStr) return 0;
    if (typeof distanceStr === 'number') return distanceStr;

    const str = String(distanceStr).toLowerCase();
    const numMatch = str.match(/[\d.]+/);
    if (!numMatch) return 0;

    const value = parseFloat(numMatch[0]);

    if (str.includes('mi')) return value * 1.60934; // Convert miles to km
    if (str.includes('m') && !str.includes('mi')) return value / 1000; // meters to km
    return value; // Assume km
}

// Parse duration (handles various formats)
function parseDuration(durationStr) {
    if (!durationStr) return 0;
    if (typeof durationStr === 'number') return durationStr;

    const str = String(durationStr);

    // HH:MM:SS format
    const hmsMatch = str.match(/(\d+):(\d+):(\d+)/);
    if (hmsMatch) {
        return parseInt(hmsMatch[1]) * 60 + parseInt(hmsMatch[2]) + parseInt(hmsMatch[3]) / 60;
    }

    // MM:SS format
    const msMatch = str.match(/(\d+):(\d+)/);
    if (msMatch) {
        return parseInt(msMatch[1]) + parseInt(msMatch[2]) / 60;
    }

    // Just minutes
    const numMatch = str.match(/[\d.]+/);
    return numMatch ? parseFloat(numMatch[0]) : 0;
}

// Parse time string like "2h 15m" or "1h 30m" to minutes
function parseTimeString(timeStr) {
    if (!timeStr) return 0;
    if (typeof timeStr === 'number') return timeStr;

    const str = String(timeStr);
    let totalMinutes = 0;

    // Match hours (e.g., "2h")
    const hoursMatch = str.match(/(\d+)\s*h/i);
    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
    }

    // Match minutes (e.g., "15m")
    const minutesMatch = str.match(/(\d+)\s*m(?!i)/i); // (?!i) to avoid matching "mi" in miles
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
    }

    // If no h/m format, try parsing as plain number
    if (totalMinutes === 0) {
        const numMatch = str.match(/[\d.]+/);
        if (numMatch) {
            totalMinutes = parseFloat(numMatch[0]);
        }
    }

    return totalMinutes;
}

// Calculate activity intensity based on pace/speed
function getIntensityLevel(distance, duration, activityType) {
    if (duration === 0) return 'unknown';

    const pace = duration / distance; // min/km
    const type = (activityType || '').toLowerCase();

    if (type.includes('run')) {
        if (pace < 4.5) return 'elite';
        if (pace < 5.5) return 'high';
        if (pace < 6.5) return 'moderate';
        return 'easy';
    }

    if (type.includes('cycling') || type.includes('ride') || type.includes('bike')) {
        const speed = distance / (duration / 60); // km/h
        if (speed > 35) return 'elite';
        if (speed > 28) return 'high';
        if (speed > 20) return 'moderate';
        return 'easy';
    }

    return 'moderate';
}

// ================================
// MAIN PROCESSING FUNCTION
// ================================

/**
 * Process Strava fitness data from Reclaim proof
 * @param {Object} extractedData - Data from Reclaim proof
 * @param {Object} options - Processing options
 * @returns {Object} Processed sellable fitness data
 */
export function processStravaData(extractedData, options = {}) {
    console.log('🏃 Processing Strava fitness data...');
    console.log('🔍 Input data:', JSON.stringify(extractedData, null, 2).substring(0, 500));

    // Extract user details (will be anonymized)
    const userName = extractedData.name || extractedData.username || extractedData.athlete_name || null;
    const userLocation = extractedData.location || extractedData.city || extractedData.country || extractedData.athlete_location || null;

    // Initialize activity stats
    let runningTotal = 0, walkingTotal = 0, cyclingTotal = 0, swimmingTotal = 0, hikingTotal = 0;
    let runCount = 0, rideCount = 0, swimCount = 0, walkCount = 0, hikeCount = 0;
    let runningTime = 0, cyclingTime = 0, walkingTime = 0, hikingTime = 0;

    // CRITICAL: Parse allTimeActivity array from Reclaim proof
    // Format: [{"title": "Run", "details": {"Activities": "4", "Distance": "13.1 km", "Time": "2h 15m"}}]
    const allTimeActivity = extractedData.allTimeActivity || extractedData.all_time_activity || [];
    
    if (Array.isArray(allTimeActivity) && allTimeActivity.length > 0) {
        console.log('📊 Parsing allTimeActivity array with', allTimeActivity.length, 'entries');
        
        for (const activity of allTimeActivity) {
            const title = (activity.title || activity.type || '').toLowerCase();
            const details = activity.details || activity.stats || {};
            
            // Parse activity count
            const activityCount = parseInt(details.Activities || details.activities || details.count || 0);
            // Parse distance
            const distance = parseDistance(details.Distance || details.distance || 0);
            // Parse time (format: "2h 15m" or "1h 30m")
            const timeStr = details.Time || details.time || details.moving_time || '0';
            const time = parseTimeString(timeStr);
            
            console.log(`  📍 ${title}: ${activityCount} activities, ${distance}km, ${time}min`);
            
            if (title.includes('run')) {
                runCount = activityCount;
                runningTotal = distance;
                runningTime = time;
            } else if (title.includes('ride') || title.includes('cycl') || title.includes('bike')) {
                rideCount = activityCount;
                cyclingTotal = distance;
                cyclingTime = time;
            } else if (title.includes('walk')) {
                walkCount = activityCount;
                walkingTotal = distance;
                walkingTime = time;
            } else if (title.includes('hike')) {
                hikeCount = activityCount;
                hikingTotal = distance;
                hikingTime = time;
            } else if (title.includes('swim')) {
                swimCount = activityCount;
                swimmingTotal = distance;
            }
        }
    } else {
        // Fallback to old field names for backward compatibility
        console.log('📊 No allTimeActivity array, using legacy field names');
        runningTotal = parseDistance(extractedData.running_total || extractedData.ytd_run_totals?.distance || 0);
        walkingTotal = parseDistance(extractedData.walking_total || extractedData.all_walk_totals?.distance || 0);
        cyclingTotal = parseDistance(extractedData.cycling_total || extractedData.ytd_ride_totals?.distance || extractedData.ride_total || 0);
        swimmingTotal = parseDistance(extractedData.swimming_total || extractedData.ytd_swim_totals?.distance || 0);

        runCount = parseInt(extractedData.run_count || extractedData.ytd_run_totals?.count || 0);
        rideCount = parseInt(extractedData.ride_count || extractedData.ytd_ride_totals?.count || 0);
        swimCount = parseInt(extractedData.swim_count || extractedData.ytd_swim_totals?.count || 0);
        walkCount = parseInt(extractedData.walk_count || extractedData.all_walk_totals?.count || 0);

        runningTime = parseDuration(extractedData.running_time || extractedData.ytd_run_totals?.moving_time || 0);
        cyclingTime = parseDuration(extractedData.cycling_time || extractedData.ytd_ride_totals?.moving_time || 0);
    }

    // Calculate totals
    const totalActivities = runCount + rideCount + swimCount + walkCount + hikeCount +
        parseInt(extractedData.total_activities || 0);
    const totalTime = runningTime + cyclingTime + walkingTime + hikingTime + parseDuration(extractedData.total_moving_time || 0);

    // Calculate weekly average (assume data covers last 52 weeks if not specified)
    const dataWeeks = parseInt(extractedData.data_weeks || 52);
    const activitiesPerWeek = dataWeeks > 0 ? totalActivities / dataWeeks : 0;
    const fitnessTier = getFitnessTier(activitiesPerWeek);

    // Determine primary activity
    const activityCounts = {
        running: runCount,
        cycling: rideCount,
        swimming: swimCount,
        walking: walkCount
    };
    const primaryActivity = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1])[0];

    // Total distance across all activities
    const totalDistance = runningTotal + walkingTotal + cyclingTotal + swimmingTotal;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100,
        (activitiesPerWeek * 15) +
        (totalDistance / 100) +
        (totalTime / 60)
    );

    // Anonymized location
    const anonLocation = anonymizeLocation(userLocation);

    console.log(`📊 Fitness stats - Total activities: ${totalActivities}, Distance: ${totalDistance.toFixed(1)}km`);

    // Generate sellable data record
    const sellableData = {
        schema_version: '1.0',
        dataset_id: DATASET_CONFIG.strava.dataset_id,
        record_type: 'fitness_profile',
        generated_at: new Date().toISOString(),

        // Fitness profile (anonymized)
        fitness_profile: {
            tier: fitnessTier,
            tier_label: FITNESS_TIERS[fitnessTier]?.label || 'Unknown',
            activities_per_week: Math.round(activitiesPerWeek * 10) / 10,
            primary_activity: primaryActivity[0],
            engagement_score: Math.round(engagementScore),
            has_profile: !!userName
        },

        // Activity totals (sellable aggregate data)
        activity_totals: {
            total_distance_km: Math.round(totalDistance * 10) / 10,
            total_activities: totalActivities,
            total_time_hours: Math.round(totalTime / 60 * 10) / 10,

            running: {
                distance_km: Math.round(runningTotal * 10) / 10,
                count: runCount,
                time_hours: Math.round(runningTime / 60 * 10) / 10
            },
            cycling: {
                distance_km: Math.round(cyclingTotal * 10) / 10,
                count: rideCount,
                time_hours: Math.round(cyclingTime / 60 * 10) / 10
            },
            walking: {
                distance_km: Math.round(walkingTotal * 10) / 10,
                count: walkCount
            },
            swimming: {
                distance_km: Math.round(swimmingTotal * 10) / 10,
                count: swimCount
            }
        },

        // Behavioral insights for targeting
        behavioral_insights: {
            consistency_score: Math.min(100, activitiesPerWeek * 20),
            multi_sport_athlete: Object.values(activityCounts).filter(c => c > 0).length >= 2,
            endurance_focused: (runningTotal + cyclingTotal) > 100,
            outdoor_enthusiast: (runningTotal + cyclingTotal + walkingTotal) > 50
        },

        // Geo data (anonymized to region level)
        geo_data: {
            region: anonLocation.region,
            country: anonLocation.country
        },

        // Audience segment for fitness brand targeting
        audience_segment: {
            segment_id: `strava_${fitnessTier}_${primaryActivity[0]}`,
            dmp_attributes: {
                interest_fitness: true,
                interest_health_wellness: true,
                interest_sports: true,
                interest_outdoor_activities: (runningTotal + cyclingTotal) > 20,
                fitness_level: fitnessTier,
                primary_sport: primaryActivity[0],
                premium_fitness_target: fitnessTier === 'elite' || fitnessTier === 'enthusiast'
            }
        },

        // Metadata
        metadata: {
            source: 'reclaim_protocol',
            platform: DATASET_CONFIG.strava.platform,
            schema_standard: 'myrad_fitness_intelligence_v1',
            verification: {
                status: 'zk_verified',
                proof_type: 'zero_knowledge',
                attestor: 'reclaim_network'
            },
            privacy_compliance: {
                pii_stripped: true,
                name_removed: true,
                location_anonymized: true,
                gdpr_compatible: true,
                ccpa_compatible: true
            },
            data_quality: {
                score: Math.min(100, (totalActivities > 0 ? 30 : 0) +
                    (totalDistance > 0 ? 30 : 0) +
                    (userLocation ? 20 : 0) +
                    (primaryActivity[1] > 0 ? 20 : 0)),
                completeness: totalActivities > 0 ? 'good' : 'limited',
                has_activity_data: totalActivities > 0,
                has_distance_data: totalDistance > 0
            },
            high_value_audience: {
                fitness_brands: fitnessTier === 'elite' || fitnessTier === 'enthusiast',
                sports_equipment: totalActivities > 20,
                nutrition_supplements: engagementScore > 50,
                wearables: true
            }
        }
    };

    console.log('✅ Strava fitness data processed successfully');
    console.log(`🏆 Fitness tier: ${fitnessTier}, Primary activity: ${primaryActivity[0]}`);

    return {
        success: true,
        sellableRecord: sellableData,
        rawProcessed: {
            fitnessTier,
            primaryActivity: primaryActivity[0],
            totalActivities,
            totalDistanceKm: Math.round(totalDistance * 10) / 10,
            activitiesPerWeek: Math.round(activitiesPerWeek * 10) / 10,
            engagementScore: Math.round(engagementScore)
        }
    };
}

// ================================
// EXPORT
// ================================

export default {
    processStravaData,
    getActivityCategory,
    getFitnessTier,
    anonymizeLocation,
    parseDistance,
    parseDuration
};
