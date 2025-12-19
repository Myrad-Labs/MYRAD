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
  };
}

/**
 * Save a contribution to the appropriate table based on dataType
 */
export async function saveContribution(contribution) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    console.log('ℹ️  Database disabled, skipping DB save');
    return null;
  }

  try {
    const {
      id,
      userId,
      dataType,
      reclaimProofId,
      sellableData,
      behavioralInsights,
      status = 'verified',
      processingMethod,
      createdAt
    } = contribution;

    if (!sellableData) {
      console.warn('⚠️  No sellableData to save, skipping');
      return null;
    }

    // Start transaction
    await query('BEGIN');

    try {
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
            frequent_dishes, favorite_restaurants, competitor_mapping, repeat_baskets, geo_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35
          )
          ON CONFLICT (id) DO UPDATE SET
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
            updated_at = NOW()`,
          [
            id, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
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
            data_quality_score, cohort_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO UPDATE SET
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
            updated_at = NOW()`,
          [
            id, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
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
            indexedFields.cohort_id
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
            segment_id, cohort_id, data_quality_score
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
          )
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            sellable_data = EXCLUDED.sellable_data,
            metadata = EXCLUDED.metadata,
            total_titles_watched = EXCLUDED.total_titles_watched,
            total_watch_hours = EXCLUDED.total_watch_hours,
            binge_score = EXCLUDED.binge_score,
            engagement_tier = EXCLUDED.engagement_tier,
            top_genres = EXCLUDED.top_genres,
            updated_at = NOW()`,
          [
            id, String(userId), reclaimProofId, status, processingMethod, createdAt || new Date(),
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
            indexedFields.data_quality_score
          ]
        );

      } else {
        console.warn(`⚠️  Unknown dataType: ${dataType}, skipping database save`);
        await query('ROLLBACK');
        return null;
      }

      await query('COMMIT');
      console.log(`✅ Contribution ${id} saved to ${dataType} table`);
      return { success: true, id };

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error saving contribution to database:', error.message);
    // Don't throw - allow JSON fallback to work
    return { success: false, error: error.message };
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
  } else {
    // If no dataType specified, return all
    const zomato = await queryZomatoContributions({ ...filters, dataType: 'zomato_order_history' });
    const github = await queryGithubContributions({ ...filters, dataType: 'github_profile' });
    const netflix = await queryNetflixContributions({ ...filters, dataType: 'netflix_watch_history' });
    return [...zomato, ...github, ...netflix];
  }
}

/**
 * Get all contributions for a specific user (from both tables)
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

    // Transform database format to match expected format
    return [...zomato, ...github, ...netflix].map(contrib => {
      // Determine dataType based on which table it came from or sellable_data structure
      let dataType = 'general';
      if (contrib.sellable_data?.dataset_id) {
        if (contrib.sellable_data.dataset_id.includes('zomato')) {
          dataType = 'zomato_order_history';
        } else if (contrib.sellable_data.dataset_id.includes('github')) {
          dataType = 'github_profile';
        } else if (contrib.sellable_data.dataset_id.includes('netflix')) {
          dataType = 'netflix_watch_history';
        }
      } else {
        // Fallback: check if it has provider-specific fields
        if (contrib.total_orders !== undefined) {
          dataType = 'zomato_order_history';
        } else if (contrib.follower_count !== undefined) {
          dataType = 'github_profile';
        } else if (contrib.total_titles_watched !== undefined) {
          dataType = 'netflix_watch_history';
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
    // Check zomato table
    const zomatoResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM zomato_contributions WHERE reclaim_proof_id = $1',
      [reclaimProofId]
    );

    if (zomatoResult.rows.length > 0) {
      return zomatoResult.rows[0];
    }

    // Check github table
    const githubResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM github_contributions WHERE reclaim_proof_id = $1',
      [reclaimProofId]
    );

    if (githubResult.rows.length > 0) {
      return githubResult.rows[0];
    }

    // Check netflix table
    const netflixResult = await query(
      'SELECT id, user_id, reclaim_proof_id FROM netflix_contributions WHERE reclaim_proof_id = $1',
      [reclaimProofId]
    );

    if (netflixResult.rows.length > 0) {
      return netflixResult.rows[0];
    }

    return null;
  } catch (error) {
    console.error('Error finding contribution by proof ID:', error);
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
    // Count from zomato table
    const zomatoResult = await query(
      'SELECT COUNT(*) as count FROM zomato_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    // Count from github table
    const githubResult = await query(
      'SELECT COUNT(*) as count FROM github_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    // Count from netflix table
    const netflixResult = await query(
      'SELECT COUNT(*) as count FROM netflix_contributions WHERE cohort_id = $1',
      [cohortId]
    );

    const zomatoCount = parseInt(zomatoResult.rows[0]?.count || '0', 10);
    const githubCount = parseInt(githubResult.rows[0]?.count || '0', 10);
    const netflixCount = parseInt(netflixResult.rows[0]?.count || '0', 10);

    return zomatoCount + githubCount + netflixCount;
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
