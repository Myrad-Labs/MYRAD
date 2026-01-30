// Uber Eats Order History Pipeline for MYRAD
// Transforms Uber Eats order data into sellable, anonymized datasets
// Modeled after Zomato pipeline structure

import 'dotenv/config';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

// ================================
// CONFIGURATION
// ================================

const DATASET_CONFIG = {
    ubereats: {
        dataset_id: 'myrad_ubereats_v1',
        platform: 'uber_eats',
        version: '1.0.0'
    }
};

// Category mappings for food items
const FOOD_CATEGORIES = {
    'burger': { l1: 'Fast Food', l2: 'Burgers' },
    'pizza': { l1: 'Fast Food', l2: 'Pizza' },
    'sushi': { l1: 'Asian Cuisine', l2: 'Japanese' },
    'chinese': { l1: 'Asian Cuisine', l2: 'Chinese' },
    'indian': { l1: 'Regional Cuisine', l2: 'Indian' },
    'mexican': { l1: 'Regional Cuisine', l2: 'Mexican' },
    'thai': { l1: 'Asian Cuisine', l2: 'Thai' },
    'italian': { l1: 'Western Cuisine', l2: 'Italian' },
    'american': { l1: 'Western Cuisine', l2: 'American' },
    'desserts': { l1: 'Desserts & Sweets', l2: 'Desserts' },
    'beverages': { l1: 'Beverages', l2: 'Drinks' },
    'breakfast': { l1: 'Breakfast', l2: 'Morning Meals' },
    'healthy': { l1: 'Health Food', l2: 'Salads & Bowls' },
    'default': { l1: 'Food & Dining', l2: 'General' }
};

// Cuisine inference patterns
const CUISINE_PATTERNS = [
    { pattern: /burger|fries|nuggets|wings/i, cuisine: 'Burgers & Fast Food' },
    { pattern: /pizza|pasta|lasagna|garlic bread/i, cuisine: 'Pizza & Italian' },
    { pattern: /sushi|ramen|teriyaki|tempura|udon/i, cuisine: 'Japanese' },
    { pattern: /noodle|chow mein|fried rice|kung pao|orange chicken/i, cuisine: 'Chinese' },
    { pattern: /taco|burrito|quesadilla|nachos|enchilada/i, cuisine: 'Mexican' },
    { pattern: /curry|tikka|naan|biryani|tandoori/i, cuisine: 'Indian' },
    { pattern: /pad thai|tom yum|green curry|satay/i, cuisine: 'Thai' },
    { pattern: /salad|bowl|acai|smoothie/i, cuisine: 'Healthy' },
    { pattern: /coffee|latte|tea|juice|shake|smoothie/i, cuisine: 'Beverages' },
    { pattern: /ice cream|cake|cookie|brownie|donut/i, cuisine: 'Desserts' },
    { pattern: /pancake|waffle|eggs|bacon|omelette/i, cuisine: 'Breakfast' }
];

// Brand inference patterns
const BRAND_PATTERNS = [
    // International QSR
    { pattern: /mcdonald|mcD/i, brand: 'McDonalds' },
    { pattern: /burger\s*king/i, brand: 'Burger King' },
    { pattern: /wendy/i, brand: 'Wendys' },
    { pattern: /kfc/i, brand: 'KFC' },
    { pattern: /taco\s*bell/i, brand: 'Taco Bell' },
    { pattern: /chipotle/i, brand: 'Chipotle' },
    { pattern: /subway/i, brand: 'Subway' },
    { pattern: /domino/i, brand: 'Dominos' },
    { pattern: /pizza\s*hut/i, brand: 'Pizza Hut' },
    { pattern: /papa\s*john/i, brand: 'Papa Johns' },
    { pattern: /starbucks/i, brand: 'Starbucks' },
    { pattern: /dunkin/i, brand: 'Dunkin' },
    { pattern: /chick-fil-a|chickfila/i, brand: 'Chick-fil-A' },
    { pattern: /popeyes/i, brand: 'Popeyes' },
    { pattern: /five\s*guys/i, brand: 'Five Guys' },
    { pattern: /shake\s*shack/i, brand: 'Shake Shack' },
    { pattern: /panera/i, brand: 'Panera Bread' },
    { pattern: /panda\s*express/i, brand: 'Panda Express' },
    { pattern: /cheesecake\s*factory/i, brand: 'Cheesecake Factory' },
    { pattern: /olive\s*garden/i, brand: 'Olive Garden' },
    { pattern: /applebee/i, brand: 'Applebees' },
    { pattern: /ihop/i, brand: 'IHOP' },
    { pattern: /dennys|denny's/i, brand: 'Dennys' },
    { pattern: /baskin/i, brand: 'Baskin Robbins' },
    { pattern: /cold\s*stone/i, brand: 'Cold Stone' }
];

// ================================
// HELPER FUNCTIONS
// ================================

// Infer cuisine from item name
function inferCuisineFromItems(itemsStr) {
    if (!itemsStr || typeof itemsStr !== 'string') return 'Unknown';

    for (const { pattern, cuisine } of CUISINE_PATTERNS) {
        if (pattern.test(itemsStr)) {
            return cuisine;
        }
    }
    return 'Unknown';
}

// Infer brand from restaurant name
function inferBrand(restaurantName) {
    if (!restaurantName || typeof restaurantName !== 'string') return 'Local Restaurant';

    for (const { pattern, brand } of BRAND_PATTERNS) {
        if (pattern.test(restaurantName)) {
            return brand;
        }
    }
    return 'Local Restaurant';
}

// Parse price from various formats
function parsePrice(p) {
    if (!p) return 0;
    if (typeof p === 'number') return p;
    // Remove currency symbols, commas, whitespace - keep only digits, dot, minus
    const cleaned = ('' + p).replace(/[^\d.\-]/g, '');
    return parseFloat(cleaned) || 0;
}

// Parse timestamp
function parseOrderTimestamp(timestampStr) {
    if (!timestampStr) return null;
    try {
        const formats = [
            'MMMM DD, YYYY hh:mm A',
            'MMMM D, YYYY hh:mm A',
            'YYYY-MM-DDTHH:mm:ssZ',
            'YYYY-MM-DD HH:mm:ss',
            'MM/DD/YYYY HH:mm',
            'MM-DD-YYYY HH:mm',
            'DD/MM/YYYY HH:mm',
        ];

        const cleaned = timestampStr.replace(' at ', ' ').trim();
        const dt = dayjs(cleaned, formats, true);
        return dt.isValid() ? dt.toDate() : null;
    } catch (e) {
        return null;
    }
}

// Extract dishes from items string
function extractDishes(itemsStr) {
    if (!itemsStr || typeof itemsStr !== 'string') return [];
    return itemsStr.split(',').map(item => {
        const trimmed = item.trim();
        const match = trimmed.match(/^\d+\s*x\s*(.+)$/i);
        return match ? match[1].trim() : trimmed;
    }).filter(d => d.length > 0);
}

// Get spend bracket for anonymization
function getSpendBracket(totalSpend, orderCount) {
    const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;

    if (avgOrderValue >= 50) return 'premium_spender';
    if (avgOrderValue >= 25) return 'regular_spender';
    if (avgOrderValue >= 15) return 'budget_conscious';
    return 'value_seeker';
}

// Calculate price sensitivity
function calculatePriceSensitivity(orders) {
    const prices = orders.map(o => parsePrice(o.price)).filter(p => p > 0);
    if (prices.length === 0) return { index: 50, category: 'moderate' };

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length);
    const cv = avg > 0 ? (stdDev / avg) : 0;

    const index = Math.round(Math.min(100, Math.max(0, cv * 150)));

    return {
        index,
        category: cv > 0.5 ? 'price_elastic' : cv > 0.3 ? 'moderately_elastic' : 'price_inelastic'
    };
}

// Calculate temporal behavior
function calculateTemporalBehavior(orders) {
    const dayOfWeekCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const hourBuckets = { morning: 0, afternoon: 0, evening: 0, dinner: 0, late_night: 0 };

    orders.forEach(order => {
        const date = parseOrderTimestamp(order.timestamp);
        if (!date) return;

        const dayOfWeek = date.getDay();
        const hour = date.getHours();

        dayOfWeekCount[dayOfWeek]++;

        if (hour >= 6 && hour < 12) hourBuckets.morning++;
        else if (hour >= 12 && hour < 16) hourBuckets.afternoon++;
        else if (hour >= 16 && hour < 19) hourBuckets.evening++;
        else if (hour >= 19 && hour < 22) hourBuckets.dinner++;
        else hourBuckets.late_night++;
    });

    const peakDay = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1])[0];
    const peakTime = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
        peak_ordering_day: dayNames[parseInt(peakDay[0])],
        peak_ordering_time: peakTime[0],
        time_of_day_curve: hourBuckets,
        late_night_eater: hourBuckets.late_night > orders.length * 0.1
    };
}

// ================================
// MAIN PROCESSING FUNCTION
// ================================

/**
 * Process Uber Eats order data from Reclaim proof
 * @param {Object} extractedData - Data from Reclaim proof
 * @param {Object} options - Processing options
 * @returns {Object} Processed sellable data
 */
export function processUberEatsData(extractedData, options = {}) {
    console.log('🍔 Processing Uber Eats data...');
    console.log('🔍 Input data:', JSON.stringify(extractedData, null, 2).substring(0, 500));

    // Extract orders array from various possible locations
    let orders = extractedData.orders || extractedData.order_history || [];

    // If orders is a string, try to parse it
    if (typeof orders === 'string') {
        try {
            orders = JSON.parse(orders);
        } catch (e) {
            console.log('⚠️ Could not parse orders string');
            orders = [];
        }
    }

    if (!Array.isArray(orders)) {
        orders = [];
    }

    console.log(`📦 Found ${orders.length} orders`);

    // Process each order
    const processedOrders = [];
    const cuisineCount = {};
    const brandCount = {};
    const allDishes = [];
    let totalSpend = 0;
    const validDates = [];

    orders.forEach(order => {
        const price = parsePrice(order.price || order.total || order.amount);
        const restaurant = order.restaurant || order.restaurant_name || order.store_name || 'Unknown';
        const items = order.items || order.item_name || order.order_items || '';
        const timestamp = order.timestamp || order.date || order.order_date || order.created_at;

        totalSpend += price;

        // Infer cuisine and brand
        const cuisine = inferCuisineFromItems(items);
        const brand = inferBrand(restaurant);

        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
        brandCount[brand] = (brandCount[brand] || 0) + 1;

        // Extract dishes
        const dishes = extractDishes(items);
        allDishes.push(...dishes);

        // Parse date
        const parsedDate = parseOrderTimestamp(timestamp);
        if (parsedDate) {
            validDates.push(parsedDate);
        }

        processedOrders.push({
            price,
            restaurant,
            items,
            timestamp,
            cuisine,
            brand,
            dishCount: dishes.length
        });
    });

    // Calculate analytics
    const orderCount = processedOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalSpend / orderCount * 100) / 100 : 0;
    const priceSensitivity = calculatePriceSensitivity(orders);
    const temporalBehavior = calculateTemporalBehavior(orders);
    const spendBracket = getSpendBracket(totalSpend, orderCount);

    // Get top cuisines and brands
    const topCuisines = Object.entries(cuisineCount)
        .filter(([c]) => c !== 'Unknown')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cuisine, count]) => ({ cuisine, count, percentage: Math.round((count / orderCount) * 100) }));

    const topBrands = Object.entries(brandCount)
        .filter(([b]) => b !== 'Local Restaurant')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([brand, count]) => ({ brand, count, percentage: Math.round((count / orderCount) * 100) }));

    // Calculate data window
    let dataWindowDays = 0;
    if (validDates.length > 1) {
        validDates.sort((a, b) => a - b);
        dataWindowDays = Math.round((validDates[validDates.length - 1] - validDates[0]) / (1000 * 60 * 60 * 24));
    }

    // Generate sellable data record
    const sellableData = {
        schema_version: '1.0',
        dataset_id: DATASET_CONFIG.ubereats.dataset_id,
        record_type: 'order_history',
        generated_at: new Date().toISOString(),

        // Transaction summary
        transaction_data: {
            summary: {
                total_orders: orderCount,
                total_spend: Math.round(totalSpend * 100) / 100,
                avg_order_value: avgOrderValue,
                data_window_days: dataWindowDays,
                data_window_start: validDates.length > 0 ? validDates[0].toISOString() : null,
                data_window_end: validDates.length > 0 ? validDates[validDates.length - 1].toISOString() : null
            }
        },

        // Cuisine preferences
        cuisine_preferences: {
            top_cuisines: topCuisines,
            cuisine_diversity_score: Object.keys(cuisineCount).filter(c => c !== 'Unknown').length * 10
        },

        // Brand affinity
        brand_affinity: {
            top_brands: topBrands,
            brand_loyalty_score: topBrands.length > 0 && topBrands[0].percentage > 30 ? 'high' : 'moderate'
        },

        // Behavioral insights
        behavioral_insights: {
            spend_bracket: spendBracket,
            price_sensitivity: priceSensitivity,
            temporal_behavior: temporalBehavior,
            avg_items_per_order: orderCount > 0 ? Math.round(allDishes.length / orderCount * 10) / 10 : 0
        },

        // Audience segment for ad targeting
        audience_segment: {
            segment_id: `ubereats_${spendBracket}_${priceSensitivity.category}`,
            dmp_attributes: {
                interest_food_delivery: true,
                interest_convenience: true,
                platform_uber_eats: true,
                engagement_level: orderCount >= 20 ? 'high' : orderCount >= 10 ? 'medium' : 'low'
            }
        },

        // Metadata
        metadata: {
            source: 'reclaim_protocol',
            platform: DATASET_CONFIG.ubereats.platform,
            schema_standard: 'myrad_food_delivery_v1',
            verification: {
                status: 'zk_verified',
                proof_type: 'zero_knowledge',
                attestor: 'reclaim_network'
            },
            privacy_compliance: {
                pii_stripped: true,
                gdpr_compatible: true,
                ccpa_compatible: true
            },
            data_quality: {
                score: Math.min(100, orderCount * 5 + (topCuisines.length * 10) + (validDates.length > 0 ? 20 : 0)),
                completeness: orderCount > 0 ? 'good' : 'empty',
                orders_with_valid_dates: validDates.length,
                orders_with_prices: processedOrders.filter(o => o.price > 0).length
            }
        }
    };

    console.log('✅ Uber Eats data processed successfully');
    console.log(`📊 Order count: ${orderCount}, Total spend: $${totalSpend}`);

    return {
        success: true,
        sellableRecord: sellableData,
        rawProcessed: {
            orderCount,
            totalSpend,
            avgOrderValue,
            topCuisines,
            topBrands
        }
    };
}

// ================================
// EXPORT
// ================================

export default {
    processUberEatsData,
    inferBrand,
    inferCuisineFromItems,
    parsePrice,
    getSpendBracket
};
