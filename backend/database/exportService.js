// Export service for generating CSV and JSON exports from database

import { queryContributions, queryZomatoContributions, queryGithubContributions, getAggregateStats } from './contributionService.js';
import config from '../config.js';

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV
  const rows = [csvHeaders.map(escapeCSV).join(',')];
  
  for (const row of data) {
    const values = csvHeaders.map(header => {
      const value = row[header];
      // Handle nested objects/arrays
      if (typeof value === 'object' && value !== null) {
        return escapeCSV(JSON.stringify(value));
      }
      return escapeCSV(value);
    });
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Flatten Zomato contribution data for CSV export
 */
function flattenZomatoForCSV(contribution) {
  const { id, user_id, created_at, total_orders, total_gmv, avg_order_value,
          frequency_tier, lifestyle_segment, city_cluster, data_quality_score,
          cohort_id, sellable_data } = contribution;

  return {
    id,
    user_id,
    created_at,
    total_orders: total_orders || '',
    total_gmv: total_gmv || '',
    avg_order_value: avg_order_value || '',
    frequency_tier: frequency_tier || '',
    lifestyle_segment: lifestyle_segment || '',
    city_cluster: city_cluster || '',
    data_quality_score: data_quality_score || '',
    cohort_id: cohort_id || '',
    // Full sellable data as JSON string
    sellable_data_json: sellable_data ? JSON.stringify(sellable_data) : ''
  };
}

/**
 * Flatten GitHub contribution data for CSV export
 */
function flattenGithubForCSV(contribution) {
  const { id, user_id, created_at, follower_count, contribution_count,
          developer_tier, follower_tier, activity_level, is_influencer,
          is_active_contributor, data_quality_score, cohort_id, sellable_data } = contribution;

  return {
    id,
    user_id,
    created_at,
    follower_count: follower_count || '',
    contribution_count: contribution_count || '',
    developer_tier: developer_tier || '',
    follower_tier: follower_tier || '',
    activity_level: activity_level || '',
    is_influencer: is_influencer || false,
    is_active_contributor: is_active_contributor || false,
    data_quality_score: data_quality_score || '',
    cohort_id: cohort_id || '',
    // Full sellable data as JSON string
    sellable_data_json: sellable_data ? JSON.stringify(sellable_data) : ''
  };
}

/**
 * Export contributions as CSV
 */
export async function exportContributionsCSV(filters = {}) {
  try {
    if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
      throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
    }

    let contributions = [];
    let flattened = [];
    
    if (filters.dataType === 'zomato_order_history') {
      contributions = await queryZomatoContributions(filters);
      flattened = contributions.map(flattenZomatoForCSV);
    } else if (filters.dataType === 'github_profile') {
      contributions = await queryGithubContributions(filters);
      flattened = contributions.map(flattenGithubForCSV);
    } else {
      // Export all if no dataType specified
      const zomato = await queryZomatoContributions(filters);
      const github = await queryGithubContributions(filters);
      flattened = [
        ...zomato.map(flattenZomatoForCSV),
        ...github.map(flattenGithubForCSV)
      ];
    }
    
    return arrayToCSV(flattened);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

/**
 * Export contributions as JSON
 */
export async function exportContributionsJSON(filters = {}) {
  try {
    if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
      throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
    }
    return await queryContributions(filters);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw error;
  }
}

/**
 * Get export metadata (stats, available filters, etc.)
 */
export async function getExportMetadata(filters = {}) {
  try {
    const stats = config.DB_USE_DATABASE && config.DATABASE_URL
      ? await getAggregateStats(filters)
      : null;

    // Get available filter values
    let availableFilters = {};
    
    if (config.DB_USE_DATABASE && config.DATABASE_URL) {
      try {
        const { query } = await import('./db.js');
        const dataTypes = await query('SELECT DISTINCT data_type FROM contributions');
        const segments = await query('SELECT DISTINCT lifestyle_segment FROM contribution_analytics WHERE lifestyle_segment IS NOT NULL');
        const cities = await query('SELECT DISTINCT city_cluster FROM contribution_analytics WHERE city_cluster IS NOT NULL');
        
        availableFilters = {
          dataTypes: dataTypes.rows.map(r => r.data_type),
          lifestyleSegments: segments.rows.map(r => r.lifestyle_segment),
          cityClusters: cities.rows.map(r => r.city_cluster)
        };
      } catch (error) {
        console.error('Error getting filter options:', error);
      }
    }

    return {
      stats,
      availableFilters,
      exportFormats: ['csv', 'json', 'jsonl'],
      supportedFilters: [
        'dataType', 'userId', 'minOrders', 'minGMV',
        'lifestyleSegment', 'cityCluster', 'startDate', 'endDate',
        'limit', 'offset'
      ]
    };
  } catch (error) {
    console.error('Error getting export metadata:', error);
    return { error: error.message };
  }
}

