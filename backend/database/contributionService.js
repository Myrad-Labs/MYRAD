// Database service for contributions analytics
// Handles saving and querying contribution data from PostgreSQL
// Uses separate tables for Zomato and GitHub

import { query } from './db.js';
import config from '../config.js';

/**
 * Extract key fields from sellableData for indexing (Zomato)
 */
function extractZomatoFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  // Extract top cuisines (from category_insights or audience_segment)
  const topCuisines = sellableData?.audience_segment?.dmp_attributes?.interest_cuisine_types ||
    (sellableData?.category_insights?.top_categories?.slice(0, 5).map(c => c.category_name) || null);

  // Extract top brands (array of brand names)
  const topBrands = sellableData?.brand_intelligence?.top_brands?.map(b => b.brand_name) || null;

  // Extract favorite restaurants (from repeat_patterns, not brand_intelligence)
  const favoriteRestaurants = sellableData?.repeat_patterns?.favorite_restaurants || null;

  // Extract frequent dishes
  const frequentDishes = sellableData?.repeat_patterns?.frequent_dishes || null;

  // Extract competitor mapping (direct property)
  const competitorMapping = sellableData?.competitor_mapping || null;

  // Extract repeat baskets (from basket_intelligence)
  const repeatBaskets = sellableData?.basket_intelligence?.repeat_baskets || null;

  return {
    // Existing fields
    total_orders: toInt(sellableData?.transaction_data?.summary?.total_orders),
    total_gmv: toDecimal(sellableData?.transaction_data?.summary?.total_gmv),
    avg_order_value: toDecimal(sellableData?.transaction_data?.summary?.avg_order_value),
    frequency_tier: sellableData?.transaction_data?.frequency_metrics?.frequency_tier || null,
    lifestyle_segment: sellableData?.audience_segment?.dmp_attributes?.lifestyle_segment || null,
    city_cluster: sellableData?.geo_data?.city_cluster || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score),
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,

    // New extended fields
    top_cuisines: topCuisines,
    top_brands: topBrands,
    segment_id: sellableData?.audience_segment?.segment_id || null,
    chain_vs_local_preference: sellableData?.brand_intelligence?.chain_vs_local_preference || null,
    day_of_week_distribution: sellableData?.temporal_behavior?.day_of_week_distribution || null,
    time_of_day_curve: sellableData?.temporal_behavior?.time_of_day_curve || null,
    peak_ordering_day: sellableData?.temporal_behavior?.peak_ordering_day || null,
    peak_ordering_time: sellableData?.temporal_behavior?.peak_ordering_time || null,
    late_night_eater: sellableData?.temporal_behavior?.late_night_eater ?? sellableData?.behavioral_traits?.late_night_eater ?? false,
    price_bucket_distribution: sellableData?.price_sensitivity?.price_bucket_distribution || null,
    dominant_price_segment: sellableData?.price_sensitivity?.dominant_price_segment || null,
    discount_usage_rate: toDecimal(sellableData?.price_sensitivity?.discount_usage_rate),
    offer_dependent: sellableData?.price_sensitivity?.offer_dependent || false,
    premium_vs_budget_ratio: sellableData?.price_sensitivity?.premium_vs_budget_ratio?.toString() || null,
    frequent_dishes: frequentDishes,
    favorite_restaurants: favoriteRestaurants,
    competitor_mapping: competitorMapping,
    repeat_baskets: repeatBaskets,
    geo_data: sellableData?.geo_data || null,
  };
}

/**
 * Extract key fields from sellableData for indexing (GitHub)
 */
function extractGithubFields(sellableData, contributionData = null) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  // Extract follower_count - it may be in data object (from JSON) or in sellableData
  let followerCount = null;
  if (contributionData?.data?.followers !== undefined) {
    followerCount = toInt(contributionData.data.followers);
  } else if (sellableData?.social_metrics?.follower_count !== undefined) {
    followerCount = toInt(sellableData.social_metrics.follower_count);
  } else if (sellableData?.developer_profile?.follower_count !== undefined) {
    followerCount = toInt(sellableData.developer_profile.follower_count);
  } else if (sellableData?.data?.followers !== undefined) {
    followerCount = toInt(sellableData.data.followers);
  }

  return {
    follower_count: followerCount,
    contribution_count: toInt(sellableData?.activity_metrics?.yearly_contributions),
    developer_tier: sellableData?.developer_profile?.tier || null,
    follower_tier: sellableData?.social_metrics?.follower_tier || null,
    activity_level: sellableData?.activity_metrics?.activity_level || null,
    is_influencer: sellableData?.social_metrics?.is_influencer || false,
    is_active_contributor: sellableData?.activity_metrics?.is_active_contributor || false,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score),
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,
  };
}

/**
 * Extract key fields from sellableData for indexing (Netflix)
 */
function extractNetflixFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    total_titles_watched: toInt(sellableData?.viewing_summary?.total_titles_watched),
    total_watch_hours: toDecimal(sellableData?.viewing_summary?.total_watch_hours),
    binge_score: toInt(sellableData?.viewing_behavior?.binge_score),
    engagement_tier: sellableData?.viewing_summary?.engagement_tier || null,
    top_genres: sellableData?.content_preferences?.top_genres || null,
    genre_diversity_score: toInt(sellableData?.content_preferences?.genre_diversity_score),
    dominant_content_type: sellableData?.content_preferences?.content_type_preference?.dominant_type || null,
    primary_language: sellableData?.content_preferences?.language_preferences?.[0]?.language || null,
    peak_viewing_day: sellableData?.viewing_behavior?.peak_viewing_day || null,
    peak_viewing_time: sellableData?.viewing_behavior?.peak_viewing_time || null,
    late_night_viewer: sellableData?.viewing_behavior?.late_night_viewer || false,
    is_binge_watcher: sellableData?.viewing_behavior?.is_binge_watcher || false,
    day_of_week_distribution: sellableData?.viewing_behavior?.day_of_week_distribution || null,
    time_of_day_curve: sellableData?.viewing_behavior?.time_of_day_curve || null,
    subscription_tier: sellableData?.subscription_data?.tier || null,
    account_age_years: toDecimal(sellableData?.subscription_data?.account_age_years),
    member_since_year: toInt(sellableData?.subscription_data?.member_since_year),
    loyalty_tier: sellableData?.subscription_data?.loyalty_tier || null,
    churn_risk: sellableData?.subscription_data?.churn_risk || null,
    kids_content_pct: toInt(sellableData?.content_preferences?.maturity_profile?.kids_content_pct),
    mature_content_pct: toInt(sellableData?.content_preferences?.maturity_profile?.mature_content_pct),
    primary_audience: sellableData?.content_preferences?.maturity_profile?.primary_audience || null,
    segment_id: sellableData?.audience_segment?.segment_id || null,
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score * 100),
    // Content catalog fields
    movies_watched: sellableData?.content_catalog?.movies_watched || null,
    top_series: sellableData?.content_catalog?.top_series || null,
  };
}

/**
 * Extract key fields from sellableData for indexing (Blinkit)
 */
function extractBlinkitFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    total_orders: toInt(sellableData?.transaction_data?.summary?.total_orders),
    total_spend: toDecimal(sellableData?.transaction_data?.summary?.total_spend),
    avg_order_value: toDecimal(sellableData?.transaction_data?.summary?.avg_order_value),
    total_items: toInt(sellableData?.transaction_data?.summary?.total_items),
    avg_items_per_order: toDecimal(sellableData?.transaction_data?.summary?.avg_items_per_order),
    data_window_days: toInt(sellableData?.transaction_data?.summary?.data_window_days),
    top_categories: sellableData?.category_preferences?.top_categories || null,
    category_diversity_score: toInt(sellableData?.category_preferences?.category_diversity_score),
    essentials_buyer: sellableData?.category_preferences?.essentials_buyer || false,
    snacks_buyer: sellableData?.category_preferences?.snacks_buyer || false,
    personal_care_buyer: sellableData?.category_preferences?.personal_care_buyer || false,
    top_brands: sellableData?.brand_affinity?.top_brands || null,
    brand_loyalty_score: sellableData?.brand_affinity?.brand_loyalty_score || null,
    spend_bracket: sellableData?.behavioral_insights?.spend_bracket || null,
    order_frequency: sellableData?.behavioral_insights?.order_frequency || null,
    segment_id: sellableData?.audience_segment?.segment_id || null,
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score),
  };
}

/**
 * Extract key fields from sellableData for indexing (Uber Eats)
 */
function extractUberEatsFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    total_orders: toInt(sellableData?.transaction_data?.summary?.total_orders),
    total_spend: toDecimal(sellableData?.transaction_data?.summary?.total_spend),
    avg_order_value: toDecimal(sellableData?.transaction_data?.summary?.avg_order_value),
    data_window_days: toInt(sellableData?.transaction_data?.summary?.data_window_days),
    top_cuisines: sellableData?.cuisine_preferences?.top_cuisines || null,
    cuisine_diversity_score: toInt(sellableData?.cuisine_preferences?.cuisine_diversity_score),
    top_brands: sellableData?.brand_affinity?.top_brands || null,
    brand_loyalty_score: sellableData?.brand_affinity?.brand_loyalty_score || null,
    spend_bracket: sellableData?.behavioral_insights?.spend_bracket || null,
    price_sensitivity_index: toInt(sellableData?.behavioral_insights?.price_sensitivity?.index),
    price_sensitivity_category: sellableData?.behavioral_insights?.price_sensitivity?.category || null,
    peak_ordering_day: sellableData?.behavioral_insights?.temporal_behavior?.peak_ordering_day || null,
    peak_ordering_time: sellableData?.behavioral_insights?.temporal_behavior?.peak_ordering_time || null,
    late_night_eater: sellableData?.behavioral_insights?.temporal_behavior?.late_night_eater || false,
    avg_items_per_order: toDecimal(sellableData?.behavioral_insights?.avg_items_per_order),
    day_of_week_distribution: sellableData?.behavioral_insights?.temporal_behavior?.day_of_week_distribution || null,
    time_of_day_curve: sellableData?.behavioral_insights?.temporal_behavior?.time_of_day_curve || null,
    segment_id: sellableData?.audience_segment?.segment_id || null,
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score),
  };
}

/**
 * Extract key fields from sellableData for indexing (Uber Rides)
 */
function extractUberRidesFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    total_rides: toInt(sellableData?.ride_summary?.total_rides),
    total_spend: toDecimal(sellableData?.ride_summary?.total_spend),
    total_distance_km: toDecimal(sellableData?.ride_summary?.total_distance_km),
    total_duration_min: toInt(sellableData?.ride_summary?.total_duration_min),
    avg_fare: toDecimal(sellableData?.ride_summary?.avg_fare),
    avg_distance_km: toDecimal(sellableData?.ride_summary?.avg_distance_km),
    avg_duration_min: toInt(sellableData?.ride_summary?.avg_duration_min),
    preferred_ride_type: sellableData?.ride_preferences?.preferred_type || null,
    ride_type_distribution: sellableData?.ride_preferences?.ride_type_distribution || null,
    uses_premium: sellableData?.ride_preferences?.uses_premium || false,
    uses_shared: sellableData?.ride_preferences?.uses_shared || false,
    peak_time_period: sellableData?.temporal_behavior?.peak_time_period || null,
    peak_day: sellableData?.temporal_behavior?.peak_day || null,
    is_commuter: sellableData?.temporal_behavior?.is_commuter || false,
    weekend_preference: sellableData?.temporal_behavior?.weekend_preference || false,
    late_night_rider: sellableData?.temporal_behavior?.late_night_rider || false,
    spend_bracket: sellableData?.behavioral_insights?.spend_bracket || null,
    frequency: sellableData?.behavioral_insights?.frequency || null,
    urban_mobility_score: toInt(sellableData?.behavioral_insights?.urban_mobility_score),
    segment_id: sellableData?.audience_segment?.segment_id || null,
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score),
  };
}

/**
 * Extract key fields from sellableData for indexing (Strava)
 */
function extractStravaFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    fitness_tier: sellableData?.fitness_profile?.tier || null,
    tier_label: sellableData?.fitness_profile?.tier_label || null,
    activities_per_week: toDecimal(sellableData?.fitness_profile?.activities_per_week),
    primary_activity: sellableData?.fitness_profile?.primary_activity || null,
    engagement_score: toInt(sellableData?.fitness_profile?.engagement_score),
    total_distance_km: toDecimal(sellableData?.activity_totals?.total_distance_km),
    total_activities: toInt(sellableData?.activity_totals?.total_activities),
    total_time_hours: toDecimal(sellableData?.activity_totals?.total_time_hours),
    running_distance_km: toDecimal(sellableData?.activity_totals?.running?.distance_km),
    running_count: toInt(sellableData?.activity_totals?.running?.count),
    running_time_hours: toDecimal(sellableData?.activity_totals?.running?.time_hours),
    cycling_distance_km: toDecimal(sellableData?.activity_totals?.cycling?.distance_km),
    cycling_count: toInt(sellableData?.activity_totals?.cycling?.count),
    cycling_time_hours: toDecimal(sellableData?.activity_totals?.cycling?.time_hours),
    walking_distance_km: toDecimal(sellableData?.activity_totals?.walking?.distance_km),
    walking_count: toInt(sellableData?.activity_totals?.walking?.count),
    swimming_distance_km: toDecimal(sellableData?.activity_totals?.swimming?.distance_km),
    swimming_count: toInt(sellableData?.activity_totals?.swimming?.count),
    consistency_score: toInt(sellableData?.behavioral_insights?.consistency_score),
    multi_sport_athlete: sellableData?.behavioral_insights?.multi_sport_athlete || false,
    endurance_focused: sellableData?.behavioral_insights?.endurance_focused || false,
    outdoor_enthusiast: sellableData?.behavioral_insights?.outdoor_enthusiast || false,
    region: sellableData?.geo_data?.region || null,
    country: sellableData?.geo_data?.country || null,
    segment_id: sellableData?.audience_segment?.segment_id || null,
    cohort_id: sellableData?.metadata?.privacy_compliance?.cohort_id || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score),
  };
}

/**
 * Extract key fields from sellableData for indexing (Zepto)
 */
function extractZeptoFields(sellableData) {
  if (!sellableData) return {};

  const toInt = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const toDecimal = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    total_orders: toInt(sellableData?.transaction_data?.summary?.total_orders),
    total_spend: toDecimal(sellableData?.transaction_data?.summary?.total_spend),
    avg_order_value: toDecimal(sellableData?.transaction_data?.summary?.avg_order_value),
    total_items: toInt(sellableData?.transaction_data?.summary?.total_items),
    avg_items_per_order: toDecimal(sellableData?.transaction_data?.summary?.avg_items_per_order),
    data_window_days: toInt(sellableData?.transaction_data?.summary?.data_window_days),
    top_categories: sellableData?.category_preferences?.top_categories || null,
    category_diversity_score: toInt(sellableData?.category_preferences?.category_diversity_score),
    essentials_buyer: sellableData?.category_preferences?.essentials_buyer || false,
    snacks_buyer: sellableData?.category_preferences?.snacks_buyer || false,
    personal_care_buyer: sellableData?.category_preferences?.personal_care_buyer || false,
    top_brands: sellableData?.brand_affinity?.top_brands || null,
    brand_loyalty_score: sellableData?.brand_affinity?.brand_loyalty_score || null,
    spend_bracket: sellableData?.behavioral_insights?.spend_bracket || null,
    order_frequency: sellableData?.behavioral_insights?.order_frequency || null,
    segment_id: sellableData?.audience_segment?.segment_id || null,
    cohort_id: sellableData?.audience_segment?.cohort_id || null,
    data_quality_score: toInt(sellableData?.metadata?.data_quality?.score)
  };
}

/**
 * Generate unique contribution ID with timestamp + random component
 */
function generateContributionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}`;
}

/**
 * Save a contribution to the appropriate table based on dataType
 * Uses transactions with row locking to prevent race conditions
 */
export async function saveContribution(contribution) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    console.log('ℹ️  Database disabled, skipping DB save');
    return null;
  }

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await saveContributionInternal(contribution);
    } catch (error) {
      lastError = error;
      
      // Check if it's a retryable error (serialization failure, deadlock)
      if (error.code === '40001' || error.code === '40P01' || 
          error.message.includes('deadlock') || error.message.includes('could not serialize')) {
        console.log(`⚠️ Transaction conflict in saveContribution (attempt ${attempt}/${maxRetries}), retrying...`);
        // Small random delay before retry
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        continue;
      }
      
      // Non-retryable error, throw immediately
      throw error;
    }
  }

  console.error('❌ Error saving contribution after retries:', lastError?.message);
  throw lastError;
}

/**
 * Internal implementation of saveContribution with transaction handling
 */
async function saveContributionInternal(contribution) {
  const {
    id,
    userId,
    dataType,
    reclaimProofId,
    sellableData,
    behavioralInsights,
    status = 'verified',
    processingMethod,
    createdAt,
    walletAddress
  } = contribution;

  if (!sellableData) {
    console.warn('⚠️  No sellableData to save, skipping');
    return null;
  }

  // Use provided ID or generate unique one
  let contributionId = id || generateContributionId();

  // Start transaction FIRST - all duplicate checks happen inside transaction
  await query('BEGIN');

  try {
    // ========================================
    // DUPLICATE CHECKS INSIDE TRANSACTION
    // Using SELECT FOR UPDATE to lock rows and prevent race conditions
    // ========================================
    
    if (dataType === 'zomato_order_history') {
      const indexedFields = extractZomatoFields(sellableData);
      if (indexedFields.total_orders !== null && indexedFields.total_gmv !== null) {
        // Lock and check for existing contribution
        const existingResult = await query(
          `SELECT id, total_orders FROM zomato_contributions 
           WHERE total_orders = $1 AND total_gmv = $2 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [indexedFields.total_orders, indexedFields.total_gmv]
        );
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (indexedFields.total_orders > (existing.total_orders || 0)) {
            contributionId = existing.id;
            console.log(`🔄 Updating Zomato contribution with MORE data`);
          } else {
            await query('ROLLBACK');
            console.log(`⚠️ DUPLICATE Zomato data detected, rejecting`);
            return { success: false, isDuplicate: true, existingId: existing.id, message: 'This Zomato data has already been submitted.' };
          }
        }
      }
    }
    
    if (dataType === 'github_profile') {
      const username = sellableData?.data?.username || contribution.data?.username;
      if (username) {
        const existingResult = await query(
          `SELECT id FROM github_contributions 
           WHERE username = $1 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [username]
        );
        
        if (existingResult.rows.length > 0) {
          await query('ROLLBACK');
          console.log(`⚠️ DUPLICATE GitHub data detected (username: ${username}), rejecting`);
          return { success: false, isDuplicate: true, existingId: existingResult.rows[0].id, message: 'This GitHub profile has already been submitted.' };
        }
      }
    }
    
    if (dataType === 'netflix_watch_history') {
      const titleCount = sellableData?.viewing_summary?.total_titles_watched;
      if (titleCount && titleCount > 0) {
        const existingResult = await query(
          `SELECT id FROM netflix_contributions 
           WHERE total_titles_watched = $1 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [titleCount]
        );
        
        if (existingResult.rows.length > 0) {
          await query('ROLLBACK');
          console.log(`⚠️ DUPLICATE Netflix data detected (titles: ${titleCount}), rejecting`);
          return { success: false, isDuplicate: true, existingId: existingResult.rows[0].id, message: 'This Netflix watch history has already been submitted.' };
        }
      }
    }

    if (dataType === 'blinkit_order_history') {
      const indexedFields = extractBlinkitFields(sellableData);
      if (indexedFields.total_orders !== null && indexedFields.total_spend !== null) {
        const existingResult = await query(
          `SELECT id, total_orders FROM blinkit_contributions 
           WHERE total_orders = $1 AND total_spend = $2 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [indexedFields.total_orders, indexedFields.total_spend]
        );
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (indexedFields.total_orders > (existing.total_orders || 0)) {
            contributionId = existing.id;
            console.log(`🔄 Updating Blinkit contribution with MORE data`);
          } else {
            await query('ROLLBACK');
            console.log(`⚠️ DUPLICATE Blinkit data detected, rejecting`);
            return { success: false, isDuplicate: true, existingId: existing.id, message: 'This Blinkit data has already been submitted.' };
          }
        }
      }
    }

    if (dataType === 'ubereats_order_history') {
      const indexedFields = extractUberEatsFields(sellableData);
      if (indexedFields.total_orders !== null && indexedFields.total_spend !== null) {
        const existingResult = await query(
          `SELECT id, total_orders FROM ubereats_contributions 
           WHERE total_orders = $1 AND total_spend = $2 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [indexedFields.total_orders, indexedFields.total_spend]
        );
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (indexedFields.total_orders > (existing.total_orders || 0)) {
            contributionId = existing.id;
            console.log(`🔄 Updating Uber Eats contribution with MORE data`);
          } else {
            await query('ROLLBACK');
            console.log(`⚠️ DUPLICATE Uber Eats data detected, rejecting`);
            return { success: false, isDuplicate: true, existingId: existing.id, message: 'This Uber Eats data has already been submitted.' };
          }
        }
      }
    }

    if (dataType === 'uber_ride_history') {
      const indexedFields = extractUberRidesFields(sellableData);
      if (indexedFields.total_rides !== null && indexedFields.total_spend !== null) {
        const existingResult = await query(
          `SELECT id, total_rides FROM uber_rides_contributions 
           WHERE total_rides = $1 AND total_spend = $2 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [indexedFields.total_rides, indexedFields.total_spend]
        );
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (indexedFields.total_rides > (existing.total_rides || 0)) {
            contributionId = existing.id;
            console.log(`🔄 Updating Uber Rides contribution with MORE data`);
          } else {
            await query('ROLLBACK');
            console.log(`⚠️ DUPLICATE Uber Rides data detected, rejecting`);
            return { success: false, isDuplicate: true, existingId: existing.id, message: 'This Uber Rides data has already been submitted.' };
          }
        }
      }
    }

    if (dataType === 'strava_fitness') {
      const indexedFields = extractStravaFields(sellableData);
      if (indexedFields.total_activities !== null && indexedFields.total_distance_km !== null) {
        const existingResult = await query(
          `SELECT id, total_activities FROM strava_contributions 
           WHERE total_activities = $1 AND total_distance_km = $2 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [indexedFields.total_activities, indexedFields.total_distance_km]
        );
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (indexedFields.total_activities > (existing.total_activities || 0)) {
            contributionId = existing.id;
            console.log(`🔄 Updating Strava contribution with MORE data`);
          } else {
            await query('ROLLBACK');
            console.log(`⚠️ DUPLICATE Strava data detected, rejecting`);
            return { success: false, isDuplicate: true, existingId: existing.id, message: 'This Strava data has already been submitted.' };
          }
        }
      }
    }

    if (dataType === 'zepto_order_history') {
      const indexedFields = extractZeptoFields(sellableData);
      if (indexedFields.total_orders !== null && indexedFields.total_spend !== null) {
        // Check for non-opted-out contributions
        const existingResult = await query(
          `SELECT id, total_orders FROM zepto_contributions 
           WHERE total_orders = $1 AND total_spend = $2 
           AND (opt_out = FALSE OR opt_out IS NULL)
           FOR UPDATE`,
          [indexedFields.total_orders, indexedFields.total_spend]
        );
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (indexedFields.total_orders > (existing.total_orders || 0)) {
            contributionId = existing.id;
            console.log(`🔄 Updating Zepto contribution with MORE data`);
          } else {
            await query('ROLLBACK');
            console.log(`⚠️ DUPLICATE Zepto data detected, rejecting`);
            return { success: false, isDuplicate: true, existingId: existing.id, message: 'This Zepto data has already been submitted.' };
          }
        } else {
          // Check for opted-out contributions from the same user to update instead of creating new row
          const optedOutResult = await query(
            `SELECT id FROM zepto_contributions 
             WHERE user_id = $1 AND total_orders = $2 AND total_spend = $3 AND opt_out = TRUE
             FOR UPDATE`,
            [String(userId), indexedFields.total_orders, indexedFields.total_spend]
          );
          
          if (optedOutResult.rows.length > 0) {
            contributionId = optedOutResult.rows[0].id;
            console.log(`🔄 Found opted-out Zepto contribution, will update instead of creating new row`);
          }
        }
      }
    }

    // ========================================
    // INSERT/UPDATE CONTRIBUTION DATA
    // ========================================

    // Determine which table to use based on dataType
    if (dataType === 'zomato_order_history') {
        const indexedFields = extractZomatoFields(sellableData);

        await query(
          `INSERT INTO zomato_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            total_orders, total_gmv, avg_order_value, frequency_tier,
            lifestyle_segment, city_cluster, data_quality_score, cohort_id,
            top_cuisines, top_brands, segment_id, chain_vs_local_preference,
            day_of_week_distribution, time_of_day_curve, peak_ordering_day, peak_ordering_time,
            late_night_eater, price_bucket_distribution, dominant_price_segment,
            discount_usage_rate, offer_dependent, premium_vs_budget_ratio,
            frequent_dishes, favorite_restaurants, competitor_mapping, repeat_baskets, geo_data,
            wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            top_cuisines = EXCLUDED.top_cuisines,
            top_brands = EXCLUDED.top_brands,
            segment_id = EXCLUDED.segment_id,
            chain_vs_local_preference = EXCLUDED.chain_vs_local_preference,
            day_of_week_distribution = EXCLUDED.day_of_week_distribution,
            time_of_day_curve = EXCLUDED.time_of_day_curve,
            peak_ordering_day = EXCLUDED.peak_ordering_day,
            peak_ordering_time = EXCLUDED.peak_ordering_time,
            late_night_eater = EXCLUDED.late_night_eater,
            price_bucket_distribution = EXCLUDED.price_bucket_distribution,
            dominant_price_segment = EXCLUDED.dominant_price_segment,
            discount_usage_rate = EXCLUDED.discount_usage_rate,
            offer_dependent = EXCLUDED.offer_dependent,
            premium_vs_budget_ratio = EXCLUDED.premium_vs_budget_ratio,
            frequent_dishes = EXCLUDED.frequent_dishes,
            favorite_restaurants = EXCLUDED.favorite_restaurants,
            competitor_mapping = EXCLUDED.competitor_mapping,
            repeat_baskets = EXCLUDED.repeat_baskets,
            geo_data = EXCLUDED.geo_data,
            wallet_address = EXCLUDED.wallet_address,
            total_orders = EXCLUDED.total_orders,
            total_gmv = EXCLUDED.total_gmv,
            avg_order_value = EXCLUDED.avg_order_value,
            frequency_tier = EXCLUDED.frequency_tier,
            lifestyle_segment = EXCLUDED.lifestyle_segment,
            city_cluster = EXCLUDED.city_cluster,
            data_quality_score = EXCLUDED.data_quality_score,
            cohort_id = EXCLUDED.cohort_id,
            opt_out = FALSE,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.total_orders,
            indexedFields.total_gmv,
            indexedFields.avg_order_value,
            indexedFields.frequency_tier,
            indexedFields.lifestyle_segment,
            indexedFields.city_cluster,
            indexedFields.data_quality_score,
            indexedFields.cohort_id,
            // Extended fields
            indexedFields.top_cuisines ? JSON.stringify(indexedFields.top_cuisines) : null,
            indexedFields.top_brands ? JSON.stringify(indexedFields.top_brands) : null,
            indexedFields.segment_id,
            indexedFields.chain_vs_local_preference,
            indexedFields.day_of_week_distribution ? JSON.stringify(indexedFields.day_of_week_distribution) : null,
            indexedFields.time_of_day_curve ? JSON.stringify(indexedFields.time_of_day_curve) : null,
            indexedFields.peak_ordering_day,
            indexedFields.peak_ordering_time,
            indexedFields.late_night_eater,
            indexedFields.price_bucket_distribution ? JSON.stringify(indexedFields.price_bucket_distribution) : null,
            indexedFields.dominant_price_segment,
            indexedFields.discount_usage_rate,
            indexedFields.offer_dependent,
            indexedFields.premium_vs_budget_ratio,
            indexedFields.frequent_dishes ? JSON.stringify(indexedFields.frequent_dishes) : null,
            indexedFields.favorite_restaurants ? JSON.stringify(indexedFields.favorite_restaurants) : null,
            indexedFields.competitor_mapping ? JSON.stringify(indexedFields.competitor_mapping) : null,
            indexedFields.repeat_baskets ? JSON.stringify(indexedFields.repeat_baskets) : null,
            indexedFields.geo_data ? JSON.stringify(indexedFields.geo_data) : null,
            walletAddress || null,
          ]
        );

      } else if (dataType === 'github_profile') {
        const indexedFields = extractGithubFields(sellableData, contribution);

        await query(
          `INSERT INTO github_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            follower_count, contribution_count, developer_tier, follower_tier,
            activity_level, is_influencer, is_active_contributor,
            data_quality_score, cohort_id, wallet_address, opt_out
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, FALSE)
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            follower_count = EXCLUDED.follower_count,
            contribution_count = EXCLUDED.contribution_count,
            developer_tier = EXCLUDED.developer_tier,
            follower_tier = EXCLUDED.follower_tier,
            activity_level = EXCLUDED.activity_level,
            is_influencer = EXCLUDED.is_influencer,
            is_active_contributor = EXCLUDED.is_active_contributor,
            data_quality_score = EXCLUDED.data_quality_score,
            cohort_id = EXCLUDED.cohort_id,
            wallet_address = EXCLUDED.wallet_address,
            opt_out = FALSE,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.follower_count,
            indexedFields.contribution_count,
            indexedFields.developer_tier,
            indexedFields.follower_tier,
            indexedFields.activity_level,
            indexedFields.is_influencer,
            indexedFields.is_active_contributor,
            indexedFields.data_quality_score,
            indexedFields.cohort_id,
            walletAddress || null
          ]
        );

      } else if (dataType === 'netflix_watch_history') {
        const indexedFields = extractNetflixFields(sellableData);

        await query(
          `INSERT INTO netflix_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            total_titles_watched, total_watch_hours, binge_score, engagement_tier,
            top_genres, genre_diversity_score, dominant_content_type, primary_language,
            peak_viewing_day, peak_viewing_time, late_night_viewer, is_binge_watcher,
            day_of_week_distribution, time_of_day_curve,
            subscription_tier, account_age_years, member_since_year, loyalty_tier, churn_risk,
            kids_content_pct, mature_content_pct, primary_audience,
            segment_id, cohort_id, data_quality_score,
            movies_watched, top_series, wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33,
            $34, $35, $36, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            total_titles_watched = EXCLUDED.total_titles_watched,
            total_watch_hours = EXCLUDED.total_watch_hours,
            binge_score = EXCLUDED.binge_score,
            engagement_tier = EXCLUDED.engagement_tier,
            top_genres = EXCLUDED.top_genres,
            movies_watched = EXCLUDED.movies_watched,
            top_series = EXCLUDED.top_series,
            wallet_address = EXCLUDED.wallet_address,
            opt_out = FALSE,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.total_titles_watched,
            indexedFields.total_watch_hours,
            indexedFields.binge_score,
            indexedFields.engagement_tier,
            indexedFields.top_genres ? JSON.stringify(indexedFields.top_genres) : null,
            indexedFields.genre_diversity_score,
            indexedFields.dominant_content_type,
            indexedFields.primary_language,
            indexedFields.peak_viewing_day,
            indexedFields.peak_viewing_time,
            indexedFields.late_night_viewer,
            indexedFields.is_binge_watcher,
            indexedFields.day_of_week_distribution ? JSON.stringify(indexedFields.day_of_week_distribution) : null,
            indexedFields.time_of_day_curve ? JSON.stringify(indexedFields.time_of_day_curve) : null,
            indexedFields.subscription_tier,
            indexedFields.account_age_years,
            indexedFields.member_since_year,
            indexedFields.loyalty_tier,
            indexedFields.churn_risk,
            indexedFields.kids_content_pct,
            indexedFields.mature_content_pct,
            indexedFields.primary_audience,
            indexedFields.segment_id,
            indexedFields.cohort_id,
            indexedFields.data_quality_score,
            indexedFields.movies_watched ? JSON.stringify(indexedFields.movies_watched) : null,
            indexedFields.top_series ? JSON.stringify(indexedFields.top_series) : null,
            walletAddress || null
          ]
        );

      } else if (dataType === 'blinkit_order_history') {
        const indexedFields = extractBlinkitFields(sellableData);

        await query(
          `INSERT INTO blinkit_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            total_orders, total_spend, avg_order_value, total_items, avg_items_per_order,
            data_window_days, top_categories, category_diversity_score,
            essentials_buyer, snacks_buyer, personal_care_buyer,
            top_brands, brand_loyalty_score, spend_bracket, order_frequency,
            segment_id, cohort_id, data_quality_score, wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            total_orders = EXCLUDED.total_orders,
            total_spend = EXCLUDED.total_spend,
            avg_order_value = EXCLUDED.avg_order_value,
            top_categories = EXCLUDED.top_categories,
            top_brands = EXCLUDED.top_brands,
            spend_bracket = EXCLUDED.spend_bracket,
            wallet_address = EXCLUDED.wallet_address,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.total_orders,
            indexedFields.total_spend,
            indexedFields.avg_order_value,
            indexedFields.total_items,
            indexedFields.avg_items_per_order,
            indexedFields.data_window_days,
            indexedFields.top_categories ? JSON.stringify(indexedFields.top_categories) : null,
            indexedFields.category_diversity_score,
            indexedFields.essentials_buyer,
            indexedFields.snacks_buyer,
            indexedFields.personal_care_buyer,
            indexedFields.top_brands ? JSON.stringify(indexedFields.top_brands) : null,
            indexedFields.brand_loyalty_score,
            indexedFields.spend_bracket,
            indexedFields.order_frequency,
            indexedFields.segment_id,
            indexedFields.cohort_id,
            indexedFields.data_quality_score,
            walletAddress || null,
          ]
        );

      } else if (dataType === 'ubereats_order_history') {
        const indexedFields = extractUberEatsFields(sellableData);

        await query(
          `INSERT INTO ubereats_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            total_orders, total_spend, avg_order_value, data_window_days,
            top_cuisines, cuisine_diversity_score, top_brands, brand_loyalty_score,
            spend_bracket, price_sensitivity_index, price_sensitivity_category,
            peak_ordering_day, peak_ordering_time, late_night_eater, avg_items_per_order,
            day_of_week_distribution, time_of_day_curve,
            segment_id, cohort_id, data_quality_score, wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            total_orders = EXCLUDED.total_orders,
            total_spend = EXCLUDED.total_spend,
            top_cuisines = EXCLUDED.top_cuisines,
            top_brands = EXCLUDED.top_brands,
            spend_bracket = EXCLUDED.spend_bracket,
            wallet_address = EXCLUDED.wallet_address,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.total_orders,
            indexedFields.total_spend,
            indexedFields.avg_order_value,
            indexedFields.data_window_days,
            indexedFields.top_cuisines ? JSON.stringify(indexedFields.top_cuisines) : null,
            indexedFields.cuisine_diversity_score,
            indexedFields.top_brands ? JSON.stringify(indexedFields.top_brands) : null,
            indexedFields.brand_loyalty_score,
            indexedFields.spend_bracket,
            indexedFields.price_sensitivity_index,
            indexedFields.price_sensitivity_category,
            indexedFields.peak_ordering_day,
            indexedFields.peak_ordering_time,
            indexedFields.late_night_eater,
            indexedFields.avg_items_per_order,
            indexedFields.day_of_week_distribution ? JSON.stringify(indexedFields.day_of_week_distribution) : null,
            indexedFields.time_of_day_curve ? JSON.stringify(indexedFields.time_of_day_curve) : null,
            indexedFields.segment_id,
            indexedFields.cohort_id,
            indexedFields.data_quality_score,
            walletAddress || null,
          ]
        );

      } else if (dataType === 'uber_ride_history') {
        const indexedFields = extractUberRidesFields(sellableData);

        await query(
          `INSERT INTO uber_rides_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            total_rides, total_spend, total_distance_km, total_duration_min,
            avg_fare, avg_distance_km, avg_duration_min,
            preferred_ride_type, ride_type_distribution, uses_premium, uses_shared,
            peak_time_period, peak_day, is_commuter, weekend_preference, late_night_rider,
            spend_bracket, frequency, urban_mobility_score,
            segment_id, cohort_id, data_quality_score, wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            total_rides = EXCLUDED.total_rides,
            total_spend = EXCLUDED.total_spend,
            preferred_ride_type = EXCLUDED.preferred_ride_type,
            is_commuter = EXCLUDED.is_commuter,
            wallet_address = EXCLUDED.wallet_address,
            opt_out = FALSE,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.total_rides,
            indexedFields.total_spend,
            indexedFields.total_distance_km,
            indexedFields.total_duration_min,
            indexedFields.avg_fare,
            indexedFields.avg_distance_km,
            indexedFields.avg_duration_min,
            indexedFields.preferred_ride_type,
            indexedFields.ride_type_distribution ? JSON.stringify(indexedFields.ride_type_distribution) : null,
            indexedFields.uses_premium,
            indexedFields.uses_shared,
            indexedFields.peak_time_period,
            indexedFields.peak_day,
            indexedFields.is_commuter,
            indexedFields.weekend_preference,
            indexedFields.late_night_rider,
            indexedFields.spend_bracket,
            indexedFields.frequency,
            indexedFields.urban_mobility_score,
            indexedFields.segment_id,
            indexedFields.cohort_id,
            indexedFields.data_quality_score,
            walletAddress || null,
          ]
        );

      } else if (dataType === 'strava_fitness') {
        const indexedFields = extractStravaFields(sellableData);

        await query(
          `INSERT INTO strava_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            fitness_tier, tier_label, activities_per_week, primary_activity, engagement_score,
            total_distance_km, total_activities, total_time_hours,
            running_distance_km, running_count, running_time_hours,
            cycling_distance_km, cycling_count, cycling_time_hours,
            walking_distance_km, walking_count,
            swimming_distance_km, swimming_count,
            consistency_score, multi_sport_athlete, endurance_focused, outdoor_enthusiast,
            region, country,
            segment_id, cohort_id, data_quality_score, wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            fitness_tier = EXCLUDED.fitness_tier,
            tier_label = EXCLUDED.tier_label,
            activities_per_week = EXCLUDED.activities_per_week,
            primary_activity = EXCLUDED.primary_activity,
            engagement_score = EXCLUDED.engagement_score,
            total_activities = EXCLUDED.total_activities,
            total_distance_km = EXCLUDED.total_distance_km,
            total_time_hours = EXCLUDED.total_time_hours,
            running_distance_km = EXCLUDED.running_distance_km,
            running_count = EXCLUDED.running_count,
            running_time_hours = EXCLUDED.running_time_hours,
            cycling_distance_km = EXCLUDED.cycling_distance_km,
            cycling_count = EXCLUDED.cycling_count,
            cycling_time_hours = EXCLUDED.cycling_time_hours,
            walking_distance_km = EXCLUDED.walking_distance_km,
            walking_count = EXCLUDED.walking_count,
            swimming_distance_km = EXCLUDED.swimming_distance_km,
            swimming_count = EXCLUDED.swimming_count,
            consistency_score = EXCLUDED.consistency_score,
            multi_sport_athlete = EXCLUDED.multi_sport_athlete,
            endurance_focused = EXCLUDED.endurance_focused,
            outdoor_enthusiast = EXCLUDED.outdoor_enthusiast,
            region = EXCLUDED.region,
            country = EXCLUDED.country,
            segment_id = EXCLUDED.segment_id,
            cohort_id = EXCLUDED.cohort_id,
            data_quality_score = EXCLUDED.data_quality_score,
            wallet_address = EXCLUDED.wallet_address,
            opt_out = FALSE,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.fitness_tier,
            indexedFields.tier_label,
            indexedFields.activities_per_week,
            indexedFields.primary_activity,
            indexedFields.engagement_score,
            indexedFields.total_distance_km,
            indexedFields.total_activities,
            indexedFields.total_time_hours,
            indexedFields.running_distance_km,
            indexedFields.running_count,
            indexedFields.running_time_hours,
            indexedFields.cycling_distance_km,
            indexedFields.cycling_count,
            indexedFields.cycling_time_hours,
            indexedFields.walking_distance_km,
            indexedFields.walking_count,
            indexedFields.swimming_distance_km,
            indexedFields.swimming_count,
            indexedFields.consistency_score,
            indexedFields.multi_sport_athlete,
            indexedFields.endurance_focused,
            indexedFields.outdoor_enthusiast,
            indexedFields.region,
            indexedFields.country,
            indexedFields.segment_id,
            indexedFields.cohort_id,
            indexedFields.data_quality_score,
            walletAddress || null,
          ]
        );

      } else if (dataType === 'zepto_order_history') {
        const indexedFields = extractZeptoFields(sellableData);

        await query(
          `INSERT INTO zepto_contributions (
            id, user_id, reclaim_proof_id, status, processing_method, created_at,
            sellable_data, metadata,
            total_orders, total_spend, avg_order_value, total_items, avg_items_per_order,
            data_window_days, top_categories, category_diversity_score,
            essentials_buyer, snacks_buyer, personal_care_buyer,
            top_brands, brand_loyalty_score, spend_bracket, order_frequency,
            segment_id, cohort_id, data_quality_score, wallet_address, opt_out
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, FALSE
          )
          ON CONFLICT (reclaim_proof_id) DO UPDATE SET
            id = EXCLUDED.id,
            user_id = EXCLUDED.user_id,
            reclaim_proof_id = EXCLUDED.reclaim_proof_id,
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            total_orders = EXCLUDED.total_orders,
            total_spend = EXCLUDED.total_spend,
            avg_order_value = EXCLUDED.avg_order_value,
            top_categories = EXCLUDED.top_categories,
            top_brands = EXCLUDED.top_brands,
            spend_bracket = EXCLUDED.spend_bracket,
            wallet_address = EXCLUDED.wallet_address,
            opt_out = FALSE,
            updated_at = NOW()`,
          [
            contributionId, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
            JSON.stringify(sellableData),
            behavioralInsights ? JSON.stringify(behavioralInsights) : null,
            indexedFields.total_orders,
            indexedFields.total_spend,
            indexedFields.avg_order_value,
            indexedFields.total_items,
            indexedFields.avg_items_per_order,
            indexedFields.data_window_days,
            indexedFields.top_categories ? JSON.stringify(indexedFields.top_categories) : null,
            indexedFields.category_diversity_score,
            indexedFields.essentials_buyer,
            indexedFields.snacks_buyer,
            indexedFields.personal_care_buyer,
            indexedFields.top_brands ? JSON.stringify(indexedFields.top_brands) : null,
            indexedFields.brand_loyalty_score,
            indexedFields.spend_bracket,
            indexedFields.order_frequency,
            indexedFields.segment_id,
            indexedFields.cohort_id,
            indexedFields.data_quality_score,
            walletAddress || null,
          ]
        );

    } else {
      console.warn(`⚠️  Unknown dataType: ${dataType}, skipping database save`);
      await query('ROLLBACK');
      return null;
    }

    await query('COMMIT');
    console.log(`✅ Contribution ${contributionId} saved to ${dataType} table`);
    return { success: true, id: contributionId };

  } catch (error) {
    // Ensure rollback on any error
    try {
      await query('ROLLBACK');
    } catch (rollbackError) {
      // Ignore rollback errors
    }
    
    // Re-throw for retry logic in saveContribution wrapper
    throw error;
  }
}

/**
 * Query Zomato contributions with filters
 */
export async function queryZomatoContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             total_orders, total_gmv, avg_order_value, frequency_tier,
             lifestyle_segment, city_cluster, data_quality_score, cohort_id,
             top_cuisines, top_brands, segment_id, chain_vs_local_preference,
             day_of_week_distribution, time_of_day_curve, peak_ordering_day, peak_ordering_time,
             late_night_eater, price_bucket_distribution, dominant_price_segment,
             discount_usage_rate, offer_dependent, premium_vs_budget_ratio,
             frequent_dishes, favorite_restaurants, competitor_mapping, repeat_baskets, geo_data
      FROM zomato_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId)); // Ensure userId is a string to match database
    }

    if (filters.minOrders) {
      sql += ` AND total_orders >= $${paramIndex++}`;
      params.push(filters.minOrders);
    }

    if (filters.minGMV) {
      sql += ` AND total_gmv >= $${paramIndex++}`;
      params.push(filters.minGMV);
    }

    if (filters.lifestyleSegment) {
      sql += ` AND lifestyle_segment = $${paramIndex++}`;
      params.push(filters.lifestyleSegment);
    }

    if (filters.cityCluster) {
      sql += ` AND city_cluster = $${paramIndex++}`;
      params.push(filters.cityCluster);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    // Helper to parse JSONB fields
    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    };

    return result.rows.map(row => ({
      ...row,
      sellable_data: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
      top_cuisines: parseJsonb(row.top_cuisines),
      top_brands: parseJsonb(row.top_brands),
      day_of_week_distribution: parseJsonb(row.day_of_week_distribution),
      time_of_day_curve: parseJsonb(row.time_of_day_curve),
      price_bucket_distribution: parseJsonb(row.price_bucket_distribution),
      frequent_dishes: parseJsonb(row.frequent_dishes),
      favorite_restaurants: parseJsonb(row.favorite_restaurants),
      competitor_mapping: parseJsonb(row.competitor_mapping),
      repeat_baskets: parseJsonb(row.repeat_baskets),
      geo_data: parseJsonb(row.geo_data),
    }));

  } catch (error) {
    console.error('Error querying Zomato contributions:', error);
    return [];
  }
}

/**
 * Query GitHub contributions with filters
 */
export async function queryGithubContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             follower_count, contribution_count, developer_tier, follower_tier,
             activity_level, is_influencer, is_active_contributor,
             data_quality_score, cohort_id
      FROM github_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId)); // Ensure userId is a string to match database
    }

    if (filters.minFollowers) {
      sql += ` AND follower_count >= $${paramIndex++}`;
      params.push(filters.minFollowers);
    }

    if (filters.minContributions) {
      sql += ` AND contribution_count >= $${paramIndex++}`;
      params.push(filters.minContributions);
    }

    if (filters.developerTier) {
      sql += ` AND developer_tier = $${paramIndex++}`;
      params.push(filters.developerTier);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows.map(row => ({
      ...row,
      sellable_data: typeof row.sellable_data === 'string' ? JSON.parse(row.sellable_data) : row.sellable_data,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));

  } catch (error) {
    console.error('Error querying GitHub contributions:', error);
    return [];
  }
}

/**
 * Query Netflix contributions with filters
 */
export async function queryNetflixContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             total_titles_watched, total_watch_hours, binge_score, engagement_tier,
             top_genres, genre_diversity_score, dominant_content_type, primary_language,
             peak_viewing_day, peak_viewing_time, late_night_viewer, is_binge_watcher,
             subscription_tier, account_age_years, loyalty_tier, churn_risk,
             segment_id, cohort_id, data_quality_score
      FROM netflix_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId));
    }

    if (filters.minTitles) {
      sql += ` AND total_titles_watched >= $${paramIndex++}`;
      params.push(filters.minTitles);
    }

    if (filters.minWatchHours) {
      sql += ` AND total_watch_hours >= $${paramIndex++}`;
      params.push(filters.minWatchHours);
    }

    if (filters.engagementTier) {
      sql += ` AND engagement_tier = $${paramIndex++}`;
      params.push(filters.engagementTier);
    }

    if (filters.subscriptionTier) {
      sql += ` AND subscription_tier = $${paramIndex++}`;
      params.push(filters.subscriptionTier);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val;
    };

    return result.rows.map(row => ({
      ...row,
      sellable_data: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
      top_genres: parseJsonb(row.top_genres),
    }));

  } catch (error) {
    console.error('Error querying Netflix contributions:', error);
    return [];
  }
}

/**
 * Query Blinkit contributions with filters
 */
export async function queryBlinkitContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             total_orders, total_spend, avg_order_value, spend_bracket,
             order_frequency, segment_id, cohort_id, data_quality_score
      FROM blinkit_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId));
    }

    if (filters.minOrders) {
      sql += ` AND total_orders >= $${paramIndex++}`;
      params.push(filters.minOrders);
    }

    if (filters.minSpend) {
      sql += ` AND total_spend >= $${paramIndex++}`;
      params.push(filters.minSpend);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val;
    };

    return result.rows.map(row => ({
      ...row,
      sellable_data: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
    }));

  } catch (error) {
    console.error('Error querying Blinkit contributions:', error);
    return [];
  }
}

/**
 * Query Uber Eats contributions with filters
 */
export async function queryUberEatsContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             total_orders, total_spend, avg_order_value, spend_bracket,
             segment_id, cohort_id, data_quality_score
      FROM ubereats_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId));
    }

    if (filters.minOrders) {
      sql += ` AND total_orders >= $${paramIndex++}`;
      params.push(filters.minOrders);
    }

    if (filters.minSpend) {
      sql += ` AND total_spend >= $${paramIndex++}`;
      params.push(filters.minSpend);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val;
    };

    return result.rows.map(row => ({
      ...row,
      sellable_data: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
    }));

  } catch (error) {
    console.error('Error querying Uber Eats contributions:', error);
    return [];
  }
}

/**
 * Query Uber Rides contributions with filters
 */
export async function queryUberRidesContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             total_rides, total_spend, avg_fare, spend_bracket,
             is_commuter, preferred_ride_type, segment_id, cohort_id, data_quality_score
      FROM uber_rides_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId));
    }

    if (filters.minRides) {
      sql += ` AND total_rides >= $${paramIndex++}`;
      params.push(filters.minRides);
    }

    if (filters.minSpend) {
      sql += ` AND total_spend >= $${paramIndex++}`;
      params.push(filters.minSpend);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val;
    };

    return result.rows.map(row => ({
      ...row,
      sellable_data: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
    }));

  } catch (error) {
    console.error('Error querying Uber Rides contributions:', error);
    return [];
  }
}

/**
 * Query Strava contributions with filters
 */
export async function queryStravaContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             fitness_tier, total_activities, total_distance_km,
             primary_activity, engagement_score, segment_id, cohort_id, data_quality_score
      FROM strava_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId));
    }

    if (filters.minActivities) {
      sql += ` AND total_activities >= $${paramIndex++}`;
      params.push(filters.minActivities);
    }

    if (filters.fitnessTier) {
      sql += ` AND fitness_tier = $${paramIndex++}`;
      params.push(filters.fitnessTier);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val;
    };

    return result.rows.map(row => ({
      ...row,
      sellable_data: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
    }));

  } catch (error) {
    console.error('Error querying Strava contributions:', error);
    return [];
  }
}

/**
 * Query Zepto contributions with filters
 */
export async function queryZeptoContributions(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let sql = `
      SELECT id, user_id, reclaim_proof_id, status, created_at,
             sellable_data, metadata,
             total_orders, total_spend, avg_order_value, spend_bracket,
             order_frequency, segment_id, cohort_id, data_quality_score
      FROM zepto_contributions
      WHERE 1=1
      AND (opt_out = FALSE OR opt_out IS NULL)
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(String(filters.userId));
    }

    if (filters.minOrders) {
      sql += ` AND total_orders >= $${paramIndex++}`;
      params.push(filters.minOrders);
    }

    if (filters.minSpend) {
      sql += ` AND total_spend >= $${paramIndex++}`;
      params.push(filters.minSpend);
    }

    if (filters.spendBracket) {
      sql += ` AND spend_bracket = $${paramIndex++}`;
      params.push(filters.spendBracket);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);

    // Helper to parse JSONB fields
    const parseJsonb = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    };

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      reclaimProofId: row.reclaim_proof_id,
      status: row.status,
      createdAt: row.created_at,
      sellableData: parseJsonb(row.sellable_data),
      metadata: parseJsonb(row.metadata),
      dataType: 'zepto_order_history',
      totalOrders: row.total_orders,
      totalSpend: row.total_spend ? parseFloat(row.total_spend) : null,
      avgOrderValue: row.avg_order_value ? parseFloat(row.avg_order_value) : null,
      spendBracket: row.spend_bracket,
      orderFrequency: row.order_frequency,
      segmentId: row.segment_id,
      cohortId: row.cohort_id,
      dataQualityScore: row.data_quality_score
    }));
  } catch (error) {
    console.error('Error querying Zepto contributions:', error);
    return [];
  }
}

/**
 * Query contributions with filters (routes to appropriate table)
 */
export async function queryContributions(filters = {}) {
  // Route to appropriate table based on dataType
  if (filters.dataType === 'zomato_order_history') {
    return await queryZomatoContributions(filters);
  } else if (filters.dataType === 'github_profile') {
    return await queryGithubContributions(filters);
  } else if (filters.dataType === 'netflix_watch_history') {
    return await queryNetflixContributions(filters);
  } else if (filters.dataType === 'blinkit_order_history') {
    return await queryBlinkitContributions(filters);
  } else if (filters.dataType === 'ubereats_order_history') {
    return await queryUberEatsContributions(filters);
  } else if (filters.dataType === 'uber_ride_history') {
    return await queryUberRidesContributions(filters);
  } else if (filters.dataType === 'strava_fitness') {
    return await queryStravaContributions(filters);
  } else if (filters.dataType === 'zepto_order_history') {
    return await queryZeptoContributions(filters);
  } else {
    // If no dataType specified, return all
    const zomato = await queryZomatoContributions({ ...filters, dataType: 'zomato_order_history' });
    const github = await queryGithubContributions({ ...filters, dataType: 'github_profile' });
    const netflix = await queryNetflixContributions({ ...filters, dataType: 'netflix_watch_history' });
    const blinkit = await queryBlinkitContributions({ ...filters, dataType: 'blinkit_order_history' });
    const ubereats = await queryUberEatsContributions({ ...filters, dataType: 'ubereats_order_history' });
    const uberRides = await queryUberRidesContributions({ ...filters, dataType: 'uber_ride_history' });
    const strava = await queryStravaContributions({ ...filters, dataType: 'strava_fitness' });
    const zepto = await queryZeptoContributions({ ...filters, dataType: 'zepto_order_history' });
    return [...zomato, ...github, ...netflix, ...blinkit, ...ubereats, ...uberRides, ...strava, ...zepto];
  }
}

/**
 * Get all contributions for a specific user (from all tables)
 */
export async function getUserContributions(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  if (!userId) {
    return [];
  }

  try {
    const zomato = await queryZomatoContributions({ userId });
    const github = await queryGithubContributions({ userId });
    const netflix = await queryNetflixContributions({ userId });
    const blinkit = await queryBlinkitContributions({ userId });
    const ubereats = await queryUberEatsContributions({ userId });
    const uberRides = await queryUberRidesContributions({ userId });
    const strava = await queryStravaContributions({ userId });
    const zepto = await queryZeptoContributions({ userId });

    // Transform database format to match expected format
    return [...zomato, ...github, ...netflix, ...blinkit, ...ubereats, ...uberRides, ...strava, ...zepto].map(contrib => {
      // Determine dataType based on which table it came from or sellable_data structure
      let dataType = 'general';
      if (contrib.sellable_data?.dataset_id) {
        if (contrib.sellable_data.dataset_id.includes('zomato')) {
          dataType = 'zomato_order_history';
        } else if (contrib.sellable_data.dataset_id.includes('github')) {
          dataType = 'github_profile';
        } else if (contrib.sellable_data.dataset_id.includes('netflix')) {
          dataType = 'netflix_watch_history';
        } else if (contrib.sellable_data.dataset_id.includes('blinkit')) {
          dataType = 'blinkit_order_history';
        } else if (contrib.sellable_data.dataset_id.includes('ubereats')) {
          dataType = 'ubereats_order_history';
        } else if (contrib.sellable_data.dataset_id.includes('uber_rides')) {
          dataType = 'uber_ride_history';
        } else if (contrib.sellable_data.dataset_id.includes('strava')) {
          dataType = 'strava_fitness';
        } else if (contrib.sellable_data.dataset_id.includes('zepto')) {
          dataType = 'zepto_order_history';
        }
      } else {
        // Fallback: check if it has provider-specific fields
        if (contrib.total_orders !== undefined && contrib.total_gmv !== undefined) {
          dataType = 'zomato_order_history';
        } else if (contrib.follower_count !== undefined) {
          dataType = 'github_profile';
        } else if (contrib.total_titles_watched !== undefined) {
          dataType = 'netflix_watch_history';
        } else if (contrib.total_orders !== undefined && contrib.total_spend !== undefined && contrib.top_categories !== undefined) {
          dataType = 'blinkit_order_history';
        } else if (contrib.total_orders !== undefined && contrib.total_spend !== undefined && contrib.top_cuisines !== undefined) {
          dataType = 'ubereats_order_history';
        } else if (contrib.total_rides !== undefined) {
          dataType = 'uber_ride_history';
        } else if (contrib.total_activities !== undefined && contrib.fitness_tier !== undefined) {
          dataType = 'strava_fitness';
        }
      }

      return {
        id: contrib.id,
        userId: contrib.user_id,
        dataType,
        data: {}, // Can be extracted from sellable_data if needed
        sellableData: contrib.sellable_data,
        behavioralInsights: contrib.metadata,
        reclaimProofId: contrib.reclaim_proof_id,
        processingMethod: 'enterprise_pipeline',
        status: contrib.status,
        createdAt: contrib.created_at || contrib.createdAt,
      };
    });
  } catch (error) {
    console.error('Error getting user contributions from database:', error);
    return [];
  }
}

/**
 * Check if a contribution with given reclaimProofId exists
 */
export async function findContributionByProofId(reclaimProofId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  try {
    // Check zomato table - only check contributions that haven't opted out
    const zomatoResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM zomato_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (zomatoResult.rows.length > 0) {
      return zomatoResult.rows[0];
    }

    // Check github table - only check contributions that haven't opted out
    const githubResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM github_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (githubResult.rows.length > 0) {
      return githubResult.rows[0];
    }

    // Check netflix table - only check contributions that haven't opted out
    const netflixResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM netflix_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (netflixResult.rows.length > 0) {
      return netflixResult.rows[0];
    }

    // Check blinkit table - only check contributions that haven't opted out
    const blinkitResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM blinkit_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (blinkitResult.rows.length > 0) {
      return blinkitResult.rows[0];
    }

    // Check ubereats table - only check contributions that haven't opted out
    const ubereatsResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM ubereats_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (ubereatsResult.rows.length > 0) {
      return ubereatsResult.rows[0];
    }

    // Check uber_rides table - only check contributions that haven't opted out
    const uberRidesResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM uber_rides_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (uberRidesResult.rows.length > 0) {
      return uberRidesResult.rows[0];
    }

    // Check strava table - only check contributions that haven't opted out
    const stravaResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM strava_contributions WHERE reclaim_proof_id = $1 AND (opt_out = FALSE OR opt_out IS NULL)',
      [reclaimProofId]
    );

    if (stravaResult.rows.length > 0) {
      return stravaResult.rows[0];
    }

    return null;
  } catch (error) {
    console.error('Error finding contribution by proof ID:', error);
    return null;
  }
}

/**
 * Find existing Zomato contribution by data characteristics (total_orders + total_gmv)
 * This detects duplicate submissions of the same Zomato account data, even from different user accounts
 * Returns the existing contribution if found, null otherwise
 */
export async function findZomatoContributionByData(totalOrders, totalGmv) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || totalOrders === null || totalOrders === undefined || totalGmv === null || totalGmv === undefined) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_orders, total_gmv FROM zomato_contributions WHERE total_orders = $1 AND total_gmv = $2 AND (opt_out = FALSE OR opt_out IS NULL) ORDER BY created_at DESC LIMIT 1',
      [totalOrders, totalGmv]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Zomato contribution by data characteristics:', error);
    return null;
  }
}

/**
 * Find existing GitHub contribution by username
 */
export async function findGithubContributionByUsername(username) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || !username) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      `SELECT id, user_id, follower_count, contribution_count 
       FROM github_contributions 
       WHERE sellable_data::text LIKE $1
       AND (opt_out = FALSE OR opt_out IS NULL)
       ORDER BY created_at DESC LIMIT 1`,
      [`%"username":"${username}"%`]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding GitHub contribution by username:', error);
    return null;
  }
}

/**
 * Find existing Netflix contribution by title count
 */
export async function findNetflixContributionByTitleCount(titleCount) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || !titleCount) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      `SELECT id, user_id, total_titles_watched 
       FROM netflix_contributions 
       WHERE total_titles_watched = $1
       AND (opt_out = FALSE OR opt_out IS NULL)
       ORDER BY created_at DESC LIMIT 1`,
      [titleCount]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Netflix contribution by title count:', error);
    return null;
  }
}

/**
 * Find existing Blinkit contribution by data characteristics
 */
export async function findBlinkitContributionByData(totalOrders, totalSpend) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || totalOrders === null || totalOrders === undefined || totalSpend === null || totalSpend === undefined) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_orders, total_spend FROM blinkit_contributions WHERE total_orders = $1 AND total_spend = $2 AND (opt_out = FALSE OR opt_out IS NULL) ORDER BY created_at DESC LIMIT 1',
      [totalOrders, totalSpend]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Blinkit contribution by data characteristics:', error);
    return null;
  }
}

/**
 * Find existing Uber Eats contribution by data characteristics
 */
export async function findUberEatsContributionByData(totalOrders, totalSpend) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || totalOrders === null || totalOrders === undefined || totalSpend === null || totalSpend === undefined) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_orders, total_spend FROM ubereats_contributions WHERE total_orders = $1 AND total_spend = $2 AND (opt_out = FALSE OR opt_out IS NULL) ORDER BY created_at DESC LIMIT 1',
      [totalOrders, totalSpend]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Uber Eats contribution by data characteristics:', error);
    return null;
  }
}

/**
 * Find existing Uber Rides contribution by data characteristics
 */
export async function findUberRidesContributionByData(totalRides, totalSpend) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || totalRides === null || totalRides === undefined || totalSpend === null || totalSpend === undefined) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_rides, total_spend FROM uber_rides_contributions WHERE total_rides = $1 AND total_spend = $2 AND (opt_out = FALSE OR opt_out IS NULL) ORDER BY created_at DESC LIMIT 1',
      [totalRides, totalSpend]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Uber Rides contribution by data characteristics:', error);
    return null;
  }
}

/**
 * Find existing Strava contribution by data characteristics
 */
export async function findStravaContributionByData(totalActivities, totalDistanceKm) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || totalActivities === null || totalActivities === undefined || totalDistanceKm === null || totalDistanceKm === undefined) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_activities, total_distance_km FROM strava_contributions WHERE total_activities = $1 AND total_distance_km = $2 AND (opt_out = FALSE OR opt_out IS NULL) ORDER BY created_at DESC LIMIT 1',
      [totalActivities, totalDistanceKm]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Strava contribution by data characteristics:', error);
    return null;
  }
}

/**
 * Find existing Zepto contribution by data characteristics
 */
export async function findZeptoContributionByData(totalOrders, totalSpend) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || totalOrders === null || totalOrders === undefined || totalSpend === null || totalSpend === undefined) {
    return null;
  }

  try {
    // Only check for duplicates among contributions that haven't opted out
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_orders, total_spend FROM zepto_contributions WHERE total_orders = $1 AND total_spend = $2 AND (opt_out = FALSE OR opt_out IS NULL) ORDER BY created_at DESC LIMIT 1',
      [totalOrders, totalSpend]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Zepto contribution by data characteristics:', error);
    return null;
  }
}

/**
 * Find existing Zepto contribution by user and data characteristics (including opted-out)
 * Used to update opted-out contributions when user resubmits
 */
export async function findZeptoContributionByUserAndData(userId, totalOrders, totalSpend) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || !userId || totalOrders === null || totalOrders === undefined || totalSpend === null || totalSpend === undefined) {
    return null;
  }

  try {
    // Check for contributions from the same user with same data (including opted-out ones)
    const result = await query(
      'SELECT id, user_id, reclaim_proof_id, total_orders, total_spend, opt_out FROM zepto_contributions WHERE user_id = $1 AND total_orders = $2 AND total_spend = $3 ORDER BY created_at DESC LIMIT 1',
      [String(userId), totalOrders, totalSpend]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding Zepto contribution by user and data characteristics:', error);
    return null;
  }
}

/**
 * Find duplicate contribution by content signature
 * This detects duplicate submissions based on the actual data content, regardless of user/wallet
 * @param {string} dataType - The type of contribution (zomato_order_history, github_profile, netflix_watch_history)
 * @param {string} contentSignature - A unique signature based on the data content
 * @returns {Object|null} - The existing contribution if found, null otherwise
 */
export async function findDuplicateByContent(dataType, contentSignature) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL || !contentSignature) {
    return null;
  }

  try {
    // Parse the content signature to extract searchable fields
    const parts = contentSignature.split('_');
    
    if (dataType === 'zomato_order_history' && parts[0] === 'zomato') {
      // Format: zomato_userId_orderCount_restaurant_timestamp
      const zomatoUserId = parts[1] || '';
      const orderCount = parseInt(parts[2], 10) || 0;
      
      // Check if same Zomato userId with same order count exists
      if (zomatoUserId) {
        // Only check for duplicates among contributions that haven't opted out
        const result = await query(
          `SELECT id, user_id, total_orders, sellable_data 
           FROM zomato_contributions 
           WHERE total_orders = $1 
           AND sellable_data::text LIKE $2
           AND (opt_out = FALSE OR opt_out IS NULL)
           ORDER BY created_at DESC LIMIT 1`,
          [orderCount, `%"userId":"${zomatoUserId}"%`]
        );
        if (result.rows.length > 0) {
          console.log(`🔍 Found duplicate Zomato data: userId=${zomatoUserId}, orders=${orderCount}`);
          return result.rows[0];
        }
      }
    } else if (dataType === 'github_profile' && parts[0] === 'github') {
      // Format: github_username_followers_contributions
      const username = parts[1] || '';
      const followers = parseInt(parts[2], 10) || 0;
      const contributions = parseInt(parts[3], 10) || 0;
      
      if (username) {
        // Only check for duplicates among contributions that haven't opted out
        const result = await query(
          `SELECT id, user_id, follower_count, contribution_count, sellable_data 
           FROM github_contributions 
           WHERE follower_count = $1 
           AND contribution_count = $2
           AND sellable_data::text LIKE $3
           AND (opt_out = FALSE OR opt_out IS NULL)
           ORDER BY created_at DESC LIMIT 1`,
          [followers, contributions, `%"username":"${username}"%`]
        );
        if (result.rows.length > 0) {
          console.log(`🔍 Found duplicate GitHub data: username=${username}, followers=${followers}`);
          return result.rows[0];
        }
      }
    } else if (dataType === 'netflix_watch_history' && parts[0] === 'netflix') {
      // Format: netflix_titleCount_firstTitle
      const titleCount = parseInt(parts[1], 10) || 0;
      
      if (titleCount > 0) {
        // Only check for duplicates among contributions that haven't opted out
        const result = await query(
          `SELECT id, user_id, total_titles_watched 
           FROM netflix_contributions 
           WHERE total_titles_watched = $1
           AND (opt_out = FALSE OR opt_out IS NULL)
           ORDER BY created_at DESC LIMIT 1`,
          [titleCount]
        );
        if (result.rows.length > 0) {
          console.log(`🔍 Found duplicate Netflix data: titles=${titleCount}`);
          return result.rows[0];
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding duplicate by content:', error);
    return null;
  }
}

/**
 * Get cohort size for k-anonymity compliance
 */
export async function getCohortSize(cohortId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return 0;
  }

  try {
    // Count from all tables
    const zomatoResult = await query(
      'SELECT COUNT(*) as count FROM zomato_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const githubResult = await query(
      'SELECT COUNT(*) as count FROM github_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const netflixResult = await query(
      'SELECT COUNT(*) as count FROM netflix_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const blinkitResult = await query(
      'SELECT COUNT(*) as count FROM blinkit_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const ubereatsResult = await query(
      'SELECT COUNT(*) as count FROM ubereats_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const uberRidesResult = await query(
      'SELECT COUNT(*) as count FROM uber_rides_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const stravaResult = await query(
      'SELECT COUNT(*) as count FROM strava_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const zomatoCount = parseInt(zomatoResult.rows[0]?.count || '0', 10);
    const githubCount = parseInt(githubResult.rows[0]?.count || '0', 10);
    const netflixCount = parseInt(netflixResult.rows[0]?.count || '0', 10);
    const blinkitCount = parseInt(blinkitResult.rows[0]?.count || '0', 10);
    const ubereatsCount = parseInt(ubereatsResult.rows[0]?.count || '0', 10);
    const uberRidesCount = parseInt(uberRidesResult.rows[0]?.count || '0', 10);
    const stravaCount = parseInt(stravaResult.rows[0]?.count || '0', 10);

    return zomatoCount + githubCount + netflixCount + blinkitCount + ubereatsCount + uberRidesCount + stravaCount;
  } catch (error) {
    console.error('Error getting cohort size:', error);
    return 0;
  }
}

/**
 * Get aggregate statistics
 */
export async function getAggregateStats(filters = {}) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  try {
    if (filters.dataType === 'zomato_order_history') {
      const result = await query(`
        SELECT 
          COUNT(*) as total_contributions,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(total_orders) as total_orders_sum,
          AVG(total_orders) as avg_orders,
          SUM(total_gmv) as total_gmv_sum,
          AVG(total_gmv) as avg_gmv,
          AVG(avg_order_value) as avg_order_value_avg,
          AVG(data_quality_score) as avg_quality_score
        FROM zomato_contributions
      `);
      return result.rows[0] || {};
    } else if (filters.dataType === 'github_profile') {
      const result = await query(`
        SELECT 
          COUNT(*) as total_contributions,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(follower_count) as total_followers,
          AVG(follower_count) as avg_followers,
          SUM(contribution_count) as total_contributions_sum,
          AVG(contribution_count) as avg_contributions,
          AVG(data_quality_score) as avg_quality_score
        FROM github_contributions
      `);
      return result.rows[0] || {};
    } else if (filters.dataType === 'netflix_watch_history') {
      const result = await query(`
        SELECT 
          COUNT(*) as total_contributions,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(total_titles_watched) as total_titles,
          AVG(total_titles_watched) as avg_titles,
          SUM(total_watch_hours) as total_watch_hours,
          AVG(total_watch_hours) as avg_watch_hours,
          AVG(binge_score) as avg_binge_score,
          AVG(data_quality_score) as avg_quality_score
        FROM netflix_contributions
      `);
      return result.rows[0] || {};
    }

    return null;
  } catch (error) {
    console.error('Error getting aggregate stats:', error);
    return null;
  }
}

/**
 * Opt-out user from data marketplace
 * Sets opt_out = true for all contributions by this user across all provider tables
 * Resets user points to 10 (initial bonus)
 * Data is retained but excluded from marketplace queries
 */
export async function optOutUser(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    throw new Error('Database is required but not configured');
  }

  try {
    // Start transaction
    await query('BEGIN');

    try {
      console.log(`🚫 Processing opt-out for user ${userId}...`);

      // Update opt_out flag in all contribution tables
      const tables = [
        'contributions',
        'zomato_contributions',
        'github_contributions',
        'netflix_contributions',
        'blinkit_contributions',
        'ubereats_contributions',
        'uber_rides_contributions',
        'strava_contributions',
        'zepto_contributions'
      ];

      let totalUpdated = 0;

      for (const table of tables) {
        try {
          const result = await query(
            `UPDATE ${table} SET opt_out = TRUE, updated_at = NOW() WHERE user_id = $1 AND (opt_out IS NULL OR opt_out = FALSE)`,
            [userId]
          );
          const rowCount = result.rowCount || 0;
          if (rowCount > 0) {
            console.log(`  ✅ Updated ${rowCount} rows in ${table}`);
            totalUpdated += rowCount;
          }
        } catch (tableError) {
          // Table might not exist or have the column yet, continue
          console.log(`  ⚠️ Could not update ${table}: ${tableError.message}`);
        }
      }

      // Delete all old points history entries (they were earned from opted-out contributions)
      const deleteResult = await query(
        `DELETE FROM points_history WHERE user_id = $1`,
        [userId]
      );
      console.log(`  ✅ Deleted ${deleteResult.rowCount || 0} old points history entries`);

      // Insert fresh 10-point initial bonus
      const initialPointsId = Date.now().toString();
      await query(
        `INSERT INTO points_history (id, user_id, points, reason, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [initialPointsId, userId, 10, 'first_access_bonus']
      );
      console.log(`  ✅ Added fresh 10-point initial bonus`);

      // Reset user points to 10 (initial first_access_bonus)
      await query(
        `UPDATE users SET total_points = 10, league = 'Bronze', updated_at = NOW() WHERE id = $1`,
        [userId]
      );
      console.log(`  ✅ Reset user points to 10`);

      await query('COMMIT');

      console.log(`✅ Opt-out complete for user ${userId}. Updated ${totalUpdated} contributions.`);

      return {
        success: true,
        userId,
        contributionsUpdated: totalUpdated,
        pointsReset: true,
        newPoints: 10
      };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error opting out user:', error);
    throw error;
  }
}

/**
 * Check if user has opted out
 */
export async function isUserOptedOut(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return false;
  }

  try {
    // Check if any contribution has opt_out = true
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM zomato_contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM github_contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM netflix_contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM blinkit_contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM ubereats_contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM uber_rides_contributions WHERE user_id = $1 AND opt_out = TRUE
        UNION
        SELECT 1 FROM strava_contributions WHERE user_id = $1 AND opt_out = TRUE
      ) as opted_out`,
      [userId]
    );
    return result.rows[0]?.opted_out || false;
  } catch (error) {
    console.error('Error checking opt-out status:', error);
    return false;
  }
}

/**
 * Get user's opt-out status and contribution count
 */
export async function getUserOptOutStatus(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return { optedOut: false, contributionCount: 0 };
  }

  try {
    // Count total contributions
    const countResult = await query(
      `SELECT COUNT(*) as count FROM (
        SELECT id FROM contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM zomato_contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM github_contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM netflix_contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM blinkit_contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM ubereats_contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM uber_rides_contributions WHERE user_id = $1
        UNION ALL
        SELECT id FROM strava_contributions WHERE user_id = $1
      ) as all_contributions`,
      [userId]
    );

    const isOptedOut = await isUserOptedOut(userId);

    return {
      optedOut: isOptedOut,
      contributionCount: parseInt(countResult.rows[0]?.count || 0, 10)
    };
  } catch (error) {
    console.error('Error getting opt-out status:', error);
    return { optedOut: false, contributionCount: 0 };
  }
}
