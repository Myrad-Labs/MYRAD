// Netflix Streaming Intelligence Pipeline for MYRAD
// Transforms Netflix Watch History, Membership, and Ratings data into sellable, anonymized datasets
// Follows k-anonymity principles and generates enriched streaming behavior insights

import 'dotenv/config';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

// Import production services
import { generateDeterministicCohortId } from './cohortService.js';

// Data quality constants
const DATA_WINDOW_DAYS = 90;
const MIN_K_ANONYMITY = 10;

// ================================
// CONFIGURATION
// ================================

const DATASET_CONFIG = {
    netflix: {
        dataset_id: 'myrad_netflix_v1',
        platform: 'netflix',
        version: '1.0.0'
    }
};

// ================================
// GENRE & CATEGORY MAPPINGS
// ================================

// Netflix genre categories mapped to IAB taxonomy
const GENRE_CATEGORIES = {
    'action': { l1: 'Entertainment', l2: 'Action & Adventure', iab: 'IAB1-1' },
    'adventure': { l1: 'Entertainment', l2: 'Action & Adventure', iab: 'IAB1-1' },
    'animation': { l1: 'Entertainment', l2: 'Animation', iab: 'IAB1-2' },
    'anime': { l1: 'Entertainment', l2: 'Anime', iab: 'IAB1-2' },
    'comedy': { l1: 'Entertainment', l2: 'Comedy', iab: 'IAB1-3' },
    'crime': { l1: 'Entertainment', l2: 'Crime & Mystery', iab: 'IAB1-4' },
    'documentary': { l1: 'Entertainment', l2: 'Documentary', iab: 'IAB1-5' },
    'drama': { l1: 'Entertainment', l2: 'Drama', iab: 'IAB1-6' },
    'family': { l1: 'Entertainment', l2: 'Family', iab: 'IAB1-7' },
    'fantasy': { l1: 'Entertainment', l2: 'Sci-Fi & Fantasy', iab: 'IAB1-8' },
    'horror': { l1: 'Entertainment', l2: 'Horror', iab: 'IAB1-9' },
    'mystery': { l1: 'Entertainment', l2: 'Crime & Mystery', iab: 'IAB1-4' },
    'romance': { l1: 'Entertainment', l2: 'Romance', iab: 'IAB1-10' },
    'sci-fi': { l1: 'Entertainment', l2: 'Sci-Fi & Fantasy', iab: 'IAB1-8' },
    'thriller': { l1: 'Entertainment', l2: 'Thriller', iab: 'IAB1-11' },
    'reality': { l1: 'Entertainment', l2: 'Reality TV', iab: 'IAB1-12' },
    'talk show': { l1: 'Entertainment', l2: 'Talk Shows', iab: 'IAB1-13' },
    'kids': { l1: 'Entertainment', l2: 'Kids & Family', iab: 'IAB1-7' },
    'sports': { l1: 'Sports', l2: 'Sports Entertainment', iab: 'IAB17-1' },
    'music': { l1: 'Entertainment', l2: 'Music & Concerts', iab: 'IAB1-14' },
    'stand-up': { l1: 'Entertainment', l2: 'Stand-up Comedy', iab: 'IAB1-3' },
    'true crime': { l1: 'Entertainment', l2: 'True Crime', iab: 'IAB1-4' },
    'k-drama': { l1: 'Entertainment', l2: 'Korean Drama', iab: 'IAB1-6' },
    'bollywood': { l1: 'Entertainment', l2: 'Indian Cinema', iab: 'IAB1-6' },
    'default': { l1: 'Entertainment', l2: 'General', iab: 'IAB1' }
};

// Content type patterns for inference
const CONTENT_TYPE_PATTERNS = [
    { pattern: /series|season|episode|ep\./i, type: 'series' },
    { pattern: /movie|film/i, type: 'movie' },
    { pattern: /documentary|docu-series/i, type: 'documentary' },
    { pattern: /stand-up|comedy special/i, type: 'standup' },
    { pattern: /limited series|miniseries/i, type: 'limited_series' }
];

// Genre inference patterns from title
const GENRE_PATTERNS = [
    { pattern: /horror|haunted|scary|terror|nightmare/i, genre: 'horror' },
    { pattern: /comedy|funny|laugh|hilarious/i, genre: 'comedy' },
    { pattern: /action|fight|battle|war|explosion/i, genre: 'action' },
    { pattern: /romance|love|heart|wedding/i, genre: 'romance' },
    { pattern: /thriller|suspense|mystery|detective/i, genre: 'thriller' },
    { pattern: /documentary|true story|real life/i, genre: 'documentary' },
    { pattern: /anime|manga/i, genre: 'anime' },
    { pattern: /kids|children|family|animated/i, genre: 'kids' },
    { pattern: /crime|murder|heist|gangster/i, genre: 'crime' },
    { pattern: /sci-fi|science fiction|space|alien|future/i, genre: 'sci-fi' },
    { pattern: /fantasy|magic|dragon|wizard/i, genre: 'fantasy' },
    { pattern: /drama/i, genre: 'drama' }
];

// ================================
// HELPER FUNCTIONS
// ================================

const inferGenre = (title, genres = []) => {
    // First check explicit genres
    if (genres && genres.length > 0) {
        const genre = genres[0].toLowerCase();
        if (GENRE_CATEGORIES[genre]) {
            return genre;
        }
    }

    // Infer from title
    if (title) {
        for (const { pattern, genre } of GENRE_PATTERNS) {
            if (pattern.test(title)) {
                return genre;
            }
        }
    }

    return 'drama'; // Default
};

const inferContentType = (title, metadata = {}) => {
    if (metadata.type) return metadata.type;

    if (title) {
        for (const { pattern, type } of CONTENT_TYPE_PATTERNS) {
            if (pattern.test(title)) {
                return type;
            }
        }
    }

    return 'movie'; // Default
};

const parseWatchTimestamp = (timestampStr) => {
    if (!timestampStr) return null;
    try {
        const cleaned = timestampStr.replace(' at ', ' ').trim();
        const formats = [
            'MMMM DD, YYYY hh:mm A',
            'MMMM D, YYYY hh:mm A',
            'YYYY-MM-DDTHH:mm:ssZ',
            'YYYY-MM-DD HH:mm:ss',
            'DD-MM-YYYY HH:mm',
            'MM-DD-YYYY HH:mm',
            'DD/MM/YYYY HH:mm',
            'YYYY-MM-DD',
            'MM/DD/YYYY'
        ];
        const dt = dayjs(cleaned, formats, true);
        return dt.isValid() ? dt.toDate() : null;
    } catch (e) {
        return null;
    }
};

const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    if (typeof durationStr === 'number') return durationStr;

    // Parse formats like "1h 30m", "45m", "2:30:00"
    const hourMatch = durationStr.match(/(\d+)\s*h/i);
    const minMatch = durationStr.match(/(\d+)\s*m/i);
    const colonMatch = durationStr.match(/(\d+):(\d+)(?::(\d+))?/);

    if (colonMatch) {
        const hours = parseInt(colonMatch[1]) || 0;
        const mins = parseInt(colonMatch[2]) || 0;
        return hours * 60 + mins;
    }

    let totalMins = 0;
    if (hourMatch) totalMins += parseInt(hourMatch[1]) * 60;
    if (minMatch) totalMins += parseInt(minMatch[1]);

    return totalMins;
};

// ================================
// VIEWING BEHAVIOR ANALYTICS
// ================================

const calculateViewingBehavior = (watchHistory) => {
    const dayOfWeekCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const hourBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0, late_night: 0 };
    const weekdayVsWeekend = { weekday: 0, weekend: 0 };
    const monthDistribution = {};

    let totalWatchMins = 0;
    let bingeSessionCount = 0;
    let currentBingeCount = 0;
    let lastWatchDate = null;

    watchHistory.forEach(item => {
        const date = parseWatchTimestamp(item.watchedAt || item.date || item.timestamp);
        if (!date) return;

        const dayOfWeek = date.getDay();
        const hour = date.getHours();

        dayOfWeekCount[dayOfWeek]++;

        // Weekend vs weekday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekdayVsWeekend.weekend++;
        } else {
            weekdayVsWeekend.weekday++;
        }

        // Time of day buckets
        if (hour >= 5 && hour < 12) hourBuckets.morning++;
        else if (hour >= 12 && hour < 17) hourBuckets.afternoon++;
        else if (hour >= 17 && hour < 21) hourBuckets.evening++;
        else if (hour >= 21 && hour < 24) hourBuckets.night++;
        else hourBuckets.late_night++;

        // Month distribution
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthDistribution[monthKey] = (monthDistribution[monthKey] || 0) + 1;

        // Track watch duration
        const duration = parseDuration(item.duration);
        totalWatchMins += duration;

        // Binge detection (3+ titles in same day)
        const dateKey = dayjs(date).format('YYYY-MM-DD');
        if (lastWatchDate === dateKey) {
            currentBingeCount++;
            if (currentBingeCount === 3) bingeSessionCount++;
        } else {
            currentBingeCount = 1;
            lastWatchDate = dateKey;
        }
    });

    const totalItems = watchHistory.length;
    const peakDay = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1])[0];
    const peakTime = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Calculate binge score (0-100)
    const bingeScore = Math.min(100, Math.round((bingeSessionCount / Math.max(1, totalItems / 10)) * 100));

    return {
        day_of_week_distribution: {
            monday: dayOfWeekCount[1],
            tuesday: dayOfWeekCount[2],
            wednesday: dayOfWeekCount[3],
            thursday: dayOfWeekCount[4],
            friday: dayOfWeekCount[5],
            saturday: dayOfWeekCount[6],
            sunday: dayOfWeekCount[0]
        },
        time_of_day_curve: hourBuckets,
        peak_viewing_day: dayNames[parseInt(peakDay[0])],
        peak_viewing_time: peakTime[0],
        weekday_vs_weekend_ratio: weekdayVsWeekend.weekday > 0
            ? (weekdayVsWeekend.weekend / weekdayVsWeekend.weekday).toFixed(2)
            : 0,
        total_watch_hours: Math.round(totalWatchMins / 60 * 10) / 10,
        binge_session_count: bingeSessionCount,
        binge_score: bingeScore,
        is_binge_watcher: bingeScore > 50,
        late_night_viewer: hourBuckets.late_night > totalItems * 0.1,
        monthly_viewing_pattern: monthDistribution
    };
};

// ================================
// CONTENT PREFERENCE ANALYTICS
// ================================

const calculateContentPreferences = (watchHistory, ratings = []) => {
    const genreCount = {};
    const contentTypeCount = {};
    const languageCount = {};
    const maturityCount = { kids: 0, teen: 0, adult: 0, mature: 0 };

    watchHistory.forEach(item => {
        const genre = inferGenre(item.title, item.genres);
        genreCount[genre] = (genreCount[genre] || 0) + 1;

        const contentType = inferContentType(item.title, item);
        contentTypeCount[contentType] = (contentTypeCount[contentType] || 0) + 1;

        if (item.language) {
            languageCount[item.language] = (languageCount[item.language] || 0) + 1;
        }

        // Maturity rating inference
        if (item.maturityRating) {
            const rating = item.maturityRating.toLowerCase();
            if (rating.includes('kids') || rating.includes('g') || rating.includes('all')) {
                maturityCount.kids++;
            } else if (rating.includes('teen') || rating.includes('pg-13') || rating.includes('13+')) {
                maturityCount.teen++;
            } else if (rating.includes('adult') || rating.includes('16+') || rating.includes('r')) {
                maturityCount.adult++;
            } else if (rating.includes('mature') || rating.includes('18+') || rating.includes('nc-17')) {
                maturityCount.mature++;
            }
        }
    });

    // Calculate average rating if available
    let avgRating = null;
    if (ratings.length > 0) {
        const validRatings = ratings.filter(r => r.rating && !isNaN(r.rating));
        if (validRatings.length > 0) {
            avgRating = validRatings.reduce((sum, r) => sum + parseFloat(r.rating), 0) / validRatings.length;
            avgRating = Math.round(avgRating * 10) / 10;
        }
    }

    // Sort genres by count
    const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre, count], idx) => ({
            genre,
            watch_count: count,
            share_pct: Math.round((count / watchHistory.length) * 100),
            rank: idx + 1,
            category: GENRE_CATEGORIES[genre] || GENRE_CATEGORIES.default
        }));

    // Dominant content type
    const dominantType = Object.entries(contentTypeCount)
        .sort((a, b) => b[1] - a[1])[0];

    return {
        top_genres: topGenres,
        genre_diversity_score: Object.keys(genreCount).length * 10,
        content_type_preference: {
            series_pct: Math.round((contentTypeCount.series || 0) / watchHistory.length * 100),
            movie_pct: Math.round((contentTypeCount.movie || 0) / watchHistory.length * 100),
            documentary_pct: Math.round((contentTypeCount.documentary || 0) / watchHistory.length * 100),
            dominant_type: dominantType ? dominantType[0] : 'mixed'
        },
        language_preferences: Object.entries(languageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([lang, count]) => ({ language: lang, count })),
        maturity_profile: {
            kids_content_pct: Math.round(maturityCount.kids / watchHistory.length * 100),
            mature_content_pct: Math.round((maturityCount.adult + maturityCount.mature) / watchHistory.length * 100),
            primary_audience: Object.entries(maturityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed'
        },
        ratings_behavior: {
            average_rating: avgRating,
            ratings_count: ratings.length,
            is_active_rater: ratings.length > 10
        }
    };
};

// ================================
// SUBSCRIPTION INTELLIGENCE
// ================================

const calculateSubscriptionInsights = (membership = {}) => {
    let accountAgeYears = null;
    let memberSince = null;

    if (membership.memberSince || membership.createdAt || membership.joinDate) {
        const joinDate = dayjs(membership.memberSince || membership.createdAt || membership.joinDate);
        if (joinDate.isValid()) {
            accountAgeYears = dayjs().diff(joinDate, 'year', true);
            accountAgeYears = Math.round(accountAgeYears * 10) / 10;
            memberSince = joinDate.year();
        }
    }

    // Tier inference
    const tier = (membership.plan || membership.tier || 'standard').toLowerCase();
    let tierLevel = 'standard';
    if (tier.includes('premium') || tier.includes('ultra')) tierLevel = 'premium';
    else if (tier.includes('basic')) tierLevel = 'basic';
    else if (tier.includes('standard')) tierLevel = 'standard';

    // Loyalty tier based on account age
    let loyaltyTier = 'new';
    if (accountAgeYears >= 5) loyaltyTier = 'veteran';
    else if (accountAgeYears >= 3) loyaltyTier = 'established';
    else if (accountAgeYears >= 1) loyaltyTier = 'regular';

    return {
        subscription_tier: tierLevel,
        account_age_years: accountAgeYears,
        member_since_year: memberSince,
        loyalty_tier: loyaltyTier,
        is_premium_subscriber: tierLevel === 'premium',
        churn_risk: accountAgeYears && accountAgeYears < 0.5 ? 'high' :
            accountAgeYears && accountAgeYears < 1 ? 'medium' : 'low'
    };
};

// ================================
// DATA QUALITY SCORING
// ================================

const calculateDataQuality = (watchHistory, ratings, membership, viewingBehavior) => {
    const totalItems = watchHistory.length;
    if (totalItems === 0) {
        return { score: 0, breakdown: {}, completeness: 'empty' };
    }

    // Calculate signals
    const hasTimestamps = watchHistory.filter(w => parseWatchTimestamp(w.watchedAt || w.date)).length / totalItems;
    const hasGenres = watchHistory.filter(w => w.genres && w.genres.length > 0).length / totalItems;
    const hasDuration = watchHistory.filter(w => w.duration).length / totalItems;
    const hasRatings = ratings.length > 0 ? Math.min(1, ratings.length / totalItems) : 0;
    const hasMembership = membership && Object.keys(membership).length > 0 ? 1 : 0;
    const dataWindowSpan = Math.min(1, (viewingBehavior.total_watch_hours / 100));

    const weights = {
        timestamp_coverage: 0.25,
        genre_coverage: 0.20,
        duration_coverage: 0.15,
        ratings_coverage: 0.15,
        membership_data: 0.10,
        data_volume: 0.15
    };

    const signals = {
        timestamp_coverage: Math.round(hasTimestamps * 100),
        genre_coverage: Math.round(hasGenres * 100),
        duration_coverage: Math.round(hasDuration * 100),
        ratings_coverage: Math.round(hasRatings * 100),
        membership_data: Math.round(hasMembership * 100),
        data_volume: Math.round(dataWindowSpan * 100)
    };

    const weightedScore =
        hasTimestamps * weights.timestamp_coverage +
        hasGenres * weights.genre_coverage +
        hasDuration * weights.duration_coverage +
        hasRatings * weights.ratings_coverage +
        hasMembership * weights.membership_data +
        dataWindowSpan * weights.data_volume;

    let completeness;
    if (weightedScore >= 0.8) completeness = 'excellent';
    else if (weightedScore >= 0.6) completeness = 'good';
    else if (weightedScore >= 0.4) completeness = 'partial';
    else completeness = 'limited';

    return {
        score: Math.round(weightedScore * 100) / 100,
        breakdown: signals,
        weights,
        completeness
    };
};

// ================================
// PII STRIPPING
// ================================

const PII_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+91[-.\\s]?)?[6-9]\d{9}/g,
    name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    profileId: /profile[_-]?id[:\s]*[\w-]+/gi,
    accountId: /account[_-]?id[:\s]*[\w-]+/gi
};

const SENSITIVE_FIELDS = [
    'name', 'fullname', 'full_name', 'profile_name', 'user_name', 'username',
    'email', 'emailAddress', 'email_address',
    'phone', 'phoneNumber', 'phone_number',
    'profileId', 'profile_id', 'accountId', 'account_id',
    'ip', 'ipAddress', 'ip_address', 'deviceId', 'device_id'
];

const stripPII = (text) => {
    if (!text || typeof text !== 'string') return text;
    let cleaned = text;
    Object.values(PII_PATTERNS).forEach(pattern => {
        cleaned = cleaned.replace(pattern, '[REDACTED]');
    });
    return cleaned;
};

const stripPIIFromObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return stripPII(obj);
    if (Array.isArray(obj)) return obj.map(item => stripPIIFromObject(item));

    if (typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (SENSITIVE_FIELDS.some(f => lowerKey.includes(f.toLowerCase()))) {
                cleaned[key] = '[REDACTED]';
                continue;
            }
            cleaned[key] = stripPIIFromObject(value);
        }
        return cleaned;
    }
    return obj;
};

// ================================
// MAIN PROCESSING FUNCTION
// ================================

/**
 * Process Netflix data from Reclaim proof
 * @param {Object} extractedData - Data from Reclaim proof (watch history, membership, ratings)
 * @param {Object} options - Processing options
 * @returns {Object} Processed sellable data
 */
export async function processNetflixData(extractedData, options = {}) {
    console.log('📺 Processing Netflix data through streaming intelligence pipeline...');
    console.log('🔍 Input data keys:', Object.keys(extractedData));

    // Extract watch history from various possible structures
    let watchHistory = [];
    if (extractedData.watchHistory) {
        watchHistory = Array.isArray(extractedData.watchHistory)
            ? extractedData.watchHistory
            : [extractedData.watchHistory];
    } else if (extractedData.history) {
        watchHistory = Array.isArray(extractedData.history)
            ? extractedData.history
            : [extractedData.history];
    } else if (extractedData.titles || extractedData.shows || extractedData.movies) {
        watchHistory = [
            ...(extractedData.titles || []),
            ...(extractedData.shows || []),
            ...(extractedData.movies || [])
        ];
    }

    // Parse if string
    if (typeof watchHistory === 'string') {
        try {
            watchHistory = JSON.parse(watchHistory);
        } catch (e) {
            watchHistory = [];
        }
    }

    // Extract ratings
    let ratings = extractedData.ratings || [];
    if (typeof ratings === 'string') {
        try { ratings = JSON.parse(ratings); } catch (e) { ratings = []; }
    }

    // Extract membership info
    const membership = extractedData.membership || extractedData.subscription || {};

    const totalTitles = watchHistory.length;
    console.log(`📊 Found ${totalTitles} titles in watch history`);

    // Calculate analytics
    const viewingBehavior = calculateViewingBehavior(watchHistory);
    const contentPreferences = calculateContentPreferences(watchHistory, ratings);
    const subscriptionInsights = calculateSubscriptionInsights(membership);
    const dataQuality = calculateDataQuality(watchHistory, ratings, membership, viewingBehavior);

    // Generate cohort ID
    const engagementTier = viewingBehavior.binge_score > 70 ? 'high_engagement' :
        viewingBehavior.binge_score > 40 ? 'moderate_engagement' : 'casual';
    const genreCluster = contentPreferences.top_genres[0]?.genre || 'mixed';
    // generateDeterministicCohortId expects (platform, cityCluster, spendTier, frequencyTier)
    // For Netflix: platform=netflix, cityCluster=engagement, spendTier=subscription_tier, frequencyTier=top_genre
    const cohortId = generateDeterministicCohortId(
        'netflix',
        engagementTier,
        subscriptionInsights.subscription_tier,
        genreCluster
    );


    // Build sellable record
    const sellableRecord = {
        schema_version: '1.0',
        dataset_id: DATASET_CONFIG.netflix.dataset_id,
        record_type: 'streaming_behavior',
        generated_at: new Date().toISOString(),

        // === VIEWING SUMMARY ===
        viewing_summary: {
            total_titles_watched: totalTitles,
            total_watch_hours: viewingBehavior.total_watch_hours,
            data_window_days: DATA_WINDOW_DAYS,
            engagement_tier: engagementTier
        },

        // === VIEWING BEHAVIOR ===
        viewing_behavior: {
            day_of_week_distribution: viewingBehavior.day_of_week_distribution,
            time_of_day_curve: viewingBehavior.time_of_day_curve,
            peak_viewing_day: viewingBehavior.peak_viewing_day,
            peak_viewing_time: viewingBehavior.peak_viewing_time,
            weekday_vs_weekend_ratio: viewingBehavior.weekday_vs_weekend_ratio,
            binge_score: viewingBehavior.binge_score,
            binge_session_count: viewingBehavior.binge_session_count,
            is_binge_watcher: viewingBehavior.is_binge_watcher,
            late_night_viewer: viewingBehavior.late_night_viewer
        },

        // === CONTENT PREFERENCES ===
        content_preferences: {
            top_genres: contentPreferences.top_genres,
            genre_diversity_score: contentPreferences.genre_diversity_score,
            content_type_preference: contentPreferences.content_type_preference,
            language_preferences: contentPreferences.language_preferences,
            maturity_profile: contentPreferences.maturity_profile,
            ratings_behavior: contentPreferences.ratings_behavior
        },

        // === SUBSCRIPTION INTELLIGENCE ===
        subscription_data: {
            tier: subscriptionInsights.subscription_tier,
            account_age_years: subscriptionInsights.account_age_years,
            member_since_year: subscriptionInsights.member_since_year,
            loyalty_tier: subscriptionInsights.loyalty_tier,
            is_premium: subscriptionInsights.is_premium_subscriber,
            churn_risk: subscriptionInsights.churn_risk
        },

        // === AUDIENCE SEGMENT ===
        audience_segment: {
            segment_id: cohortId,
            dmp_attributes: {
                interest_streaming: true,
                interest_entertainment: true,
                [`interest_${genreCluster}`]: true,
                engagement_level: engagementTier,
                subscription_tier: subscriptionInsights.subscription_tier,
                is_binge_watcher: viewingBehavior.is_binge_watcher,
                late_night_viewer: viewingBehavior.late_night_viewer,
                content_preference: contentPreferences.content_type_preference.dominant_type
            }
        },

        // === METADATA ===
        metadata: {
            source: 'reclaim_protocol',
            schema_standard: 'myrad_streaming_intelligence_v1',
            verification: {
                status: 'zk_verified',
                proof_type: 'zero_knowledge',
                attestor: 'reclaim_network'
            },
            privacy_compliance: {
                pii_stripped: true,
                k_anonymity_threshold: MIN_K_ANONYMITY,
                k_anonymity_compliant: null, // Updated post-save
                gdpr_compatible: true,
                ccpa_compatible: true,
                cohort_id: cohortId
            },
            data_quality: {
                score: dataQuality.score,
                score_breakdown: dataQuality.breakdown,
                completeness: dataQuality.completeness,
                enrichment_applied: [
                    'genre_inference',
                    'viewing_behavior_analytics',
                    'content_preference_scoring',
                    'subscription_intelligence',
                    'audience_segmentation'
                ]
            }
        }
    };

    // Strip PII from raw data
    const piiStrippedData = stripPIIFromObject(extractedData);

    console.log('✅ Netflix data processing complete');
    console.log(`📊 Generated cohort: ${cohortId}`);
    console.log(`📊 Binge score: ${viewingBehavior.binge_score}`);
    console.log(`📊 Top genre: ${genreCluster}`);

    return {
        success: true,
        sellableRecord,
        rawProcessed: {
            totalTitles,
            totalWatchHours: viewingBehavior.total_watch_hours,
            bingeScore: viewingBehavior.binge_score,
            topGenres: contentPreferences.top_genres.slice(0, 3).map(g => g.genre)
        },
        piiStrippedData
    };
}

// ================================
// EXPORT
// ================================

export default {
    processNetflixData,
    calculateViewingBehavior,
    calculateContentPreferences,
    stripPIIFromObject
};
