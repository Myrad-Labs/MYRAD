// Zepto Order History Pipeline for MYRAD
// Transforms Zepto grocery order data into sellable, anonymized datasets
// Focus on quick commerce / grocery delivery insights
// Supports multi-order format from new Zepto provider

import 'dotenv/config';
import dayjs from 'dayjs';

// ================================
// CONFIGURATION
// ================================

const DATASET_CONFIG = {
    zepto: {
        dataset_id: 'myrad_zepto_v1',
        platform: 'zepto',
        version: '2.0.0'
    }
};

// Grocery category mappings (same as Blinkit for consistency)
const GROCERY_CATEGORIES = {
    'fruits': { l1: 'Fresh Produce', l2: 'Fruits' },
    'vegetables': { l1: 'Fresh Produce', l2: 'Vegetables' },
    'dairy': { l1: 'Dairy & Eggs', l2: 'Dairy' },
    'milk': { l1: 'Dairy & Eggs', l2: 'Milk' },
    'eggs': { l1: 'Dairy & Eggs', l2: 'Eggs' },
    'bread': { l1: 'Bakery', l2: 'Bread' },
    'snacks': { l1: 'Snacks & Beverages', l2: 'Snacks' },
    'chips': { l1: 'Snacks & Beverages', l2: 'Chips' },
    'beverages': { l1: 'Snacks & Beverages', l2: 'Beverages' },
    'beer': { l1: 'Snacks & Beverages', l2: 'Beer & Non-Alcoholic' },
    'soft_drinks': { l1: 'Snacks & Beverages', l2: 'Soft Drinks' },
    'juice': { l1: 'Snacks & Beverages', l2: 'Juice' },
    'water': { l1: 'Snacks & Beverages', l2: 'Water' },
    'rice': { l1: 'Staples', l2: 'Rice' },
    'atta': { l1: 'Staples', l2: 'Flour' },
    'oil': { l1: 'Staples', l2: 'Cooking Oil' },
    'spices': { l1: 'Staples', l2: 'Spices' },
    'cleaning': { l1: 'Household', l2: 'Cleaning' },
    'personal_care': { l1: 'Personal Care', l2: 'General' },
    'baby': { l1: 'Baby Care', l2: 'Baby Products' },
    'pet': { l1: 'Pet Care', l2: 'Pet Food' },
    'frozen': { l1: 'Frozen', l2: 'Frozen Foods' },
    'instant': { l1: 'Ready to Eat', l2: 'Instant Food' },
    'muesli': { l1: 'Health & Wellness', l2: 'Muesli & Granola' },
    'cereal': { l1: 'Health & Wellness', l2: 'Cereal' },
    'tobacco': { l1: 'Tobacco', l2: 'Cigarettes' },
    'default': { l1: 'Groceries', l2: 'General' }
};

// Category inference patterns
const CATEGORY_PATTERNS = [
    { pattern: /apple|banana|orange|mango|grape|fruit/i, category: 'fruits' },
    { pattern: /tomato|onion|potato|vegetable|carrot|spinach/i, category: 'vegetables' },
    { pattern: /milk|curd|yogurt|paneer|cheese|butter|cream/i, category: 'dairy' },
    { pattern: /egg|anda/i, category: 'eggs' },
    { pattern: /bread|pav|bun|cake|cookie|biscuit/i, category: 'bread' },
    { pattern: /chips|namkeen|snack|kurkure|lays|multigrain.*chips|potato chips/i, category: 'chips' },
    { pattern: /beer|non.?alcoholic.*beer|coolberg|kingfisher|budweiser|heineken/i, category: 'beer' },
    { pattern: /cola|pepsi|sprite|fanta|soda|soft drink|thumbs up/i, category: 'soft_drinks' },
    { pattern: /juice|real|tropicana/i, category: 'juice' },
    { pattern: /water|bisleri|kinley/i, category: 'water' },
    { pattern: /rice|chawal|basmati/i, category: 'rice' },
    { pattern: /atta|flour|maida/i, category: 'atta' },
    { pattern: /oil|ghee|refined/i, category: 'oil' },
    { pattern: /masala|spice|haldi|mirch/i, category: 'spices' },
    { pattern: /surf|detergent|cleaner|mop|wipe/i, category: 'cleaning' },
    { pattern: /shampoo|soap|toothpaste|deodorant/i, category: 'personal_care' },
    { pattern: /diaper|baby|pamper/i, category: 'baby' },
    { pattern: /dog|cat|pet food/i, category: 'pet' },
    { pattern: /frozen|ice cream/i, category: 'frozen' },
    { pattern: /maggi|noodle|instant|ready to eat/i, category: 'instant' },
    { pattern: /muesli|granola|yoga bar|oats/i, category: 'muesli' },
    { pattern: /cereal|corn flakes|chocos/i, category: 'cereal' },
    { pattern: /marlboro|cigarette|classic milds|gold flake|kings?/i, category: 'tobacco' }
];

// Brand patterns for quick commerce
const BRAND_PATTERNS = [
    { pattern: /amul/i, brand: 'Amul' },
    { pattern: /mother dairy/i, brand: 'Mother Dairy' },
    { pattern: /nestle|maggi|nescafe/i, brand: 'Nestle' },
    { pattern: /britannia/i, brand: 'Britannia' },
    { pattern: /parle/i, brand: 'Parle' },
    { pattern: /haldiram/i, brand: 'Haldirams' },
    { pattern: /lays|pepsi|kurkure|too yumm/i, brand: 'PepsiCo' },
    { pattern: /coca cola|sprite|fanta|minute maid|thumbs up/i, brand: 'Coca-Cola' },
    { pattern: /hindustan unilever|surf|dove|lifebuoy/i, brand: 'HUL' },
    { pattern: /p&g|pantene|head.*shoulders|gillette/i, brand: 'P&G' },
    { pattern: /dabur/i, brand: 'Dabur' },
    { pattern: /itc|aashirvaad|sunfeast/i, brand: 'ITC' },
    { pattern: /tata|tata salt|tata tea/i, brand: 'Tata' },
    { pattern: /patanjali/i, brand: 'Patanjali' },
    { pattern: /mtr/i, brand: 'MTR' },
    { pattern: /fortune/i, brand: 'Fortune' },
    { pattern: /saffola/i, brand: 'Saffola' },
    { pattern: /coolberg/i, brand: 'Coolberg' },
    { pattern: /yoga bar/i, brand: 'Yoga Bar' },
    { pattern: /marlboro/i, brand: 'Marlboro' }
];

// ================================
// HELPER FUNCTIONS
// ================================

// Infer category from item name
function inferCategoryFromItems(itemsStr) {
    if (!itemsStr || typeof itemsStr !== 'string') return 'default';

    for (const { pattern, category } of CATEGORY_PATTERNS) {
        if (pattern.test(itemsStr)) {
            return category;
        }
    }
    return 'default';
}

// Infer brand from item name
function inferBrand(itemName) {
    if (!itemName || typeof itemName !== 'string') return 'Store Brand';

    for (const { pattern, brand } of BRAND_PATTERNS) {
        if (pattern.test(itemName)) {
            return brand;
        }
    }
    return 'Store Brand';
}

// Parse price from various formats (handles paise values from Zepto)
function parsePrice(p) {
    if (!p) return 0;
    if (typeof p === 'number') return p;
    const cleaned = ('' + p).replace(/[^\d.\-]/g, '');
    return parseFloat(cleaned) || 0;
}

// Convert paise to rupees (Zepto sends amounts in paise, e.g. 19400 = ₹194)
function paiseToRupees(paise) {
    const val = parsePrice(paise);

    // If the original string contains a decimal point, it is likely already in rupees
    if (typeof paise === 'string' && paise.includes('.')) {
        return val;
    }

    // Assume Zepto amounts are in paise and divide by 100
    // (If value >= 100 paise i.e., at least Rs 1)
    if (val >= 100) return Math.round(val) / 100;

    return val;
}

// Parse timestamp
function parseOrderTimestamp(timestampStr) {
    if (!timestampStr) return null;
    try {
        const dt = dayjs(timestampStr);
        return dt.isValid() ? dt.toDate() : null;
    } catch (e) {
        return null;
    }
}

// Get spend bracket
function getSpendBracket(totalSpend, orderCount) {
    const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;

    if (avgOrderValue >= 1000) return 'premium_shopper';
    if (avgOrderValue >= 500) return 'regular_shopper';
    if (avgOrderValue >= 200) return 'budget_shopper';
    return 'value_seeker';
}

// Parse Zepto's productsNamesAndCounts (can be JSON string or array)
function parseZeptoProducts(productsData) {
    if (!productsData) return [];

    try {
        const products = typeof productsData === 'string' ? JSON.parse(productsData) : productsData;

        if (!Array.isArray(products)) return [];

        return products.map(p => ({
            name: p.name || '',
            count: p.count || 1,
            id: p.id || p.productVariantId || ''
        }));
    } catch (e) {
        console.log('⚠️ Could not parse Zepto products:', e.message);
        return [];
    }
}

// Calculate temporal behavior from order timestamps
function calculateTemporalBehavior(orderDates) {
    if (!orderDates || orderDates.length === 0) {
        return {
            peak_ordering_time: 'unknown',
            peak_ordering_day: 'unknown',
            time_of_day_curve: { morning: 0, afternoon: 0, evening: 0, dinner: 0, late_night: 0 },
            weekday_vs_weekend: { weekday: 0, weekend: 0 },
            late_night_shopper: false
        };
    }

    const hourBuckets = { morning: 0, afternoon: 0, evening: 0, dinner: 0, late_night: 0 };
    const dayOfWeekCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const weekdayVsWeekend = { weekday: 0, weekend: 0 };

    orderDates.forEach(date => {
        const hour = date.getHours();
        const dayOfWeek = date.getDay();

        // Time of day buckets
        if (hour >= 6 && hour < 12) hourBuckets.morning++;
        else if (hour >= 12 && hour < 16) hourBuckets.afternoon++;
        else if (hour >= 16 && hour < 19) hourBuckets.evening++;
        else if (hour >= 19 && hour < 22) hourBuckets.dinner++;
        else hourBuckets.late_night++;

        // Day of week
        dayOfWeekCount[dayOfWeek]++;

        // Weekend vs weekday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekdayVsWeekend.weekend++;
        } else {
            weekdayVsWeekend.weekday++;
        }
    });

    const peakTime = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
    const peakDay = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1])[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
        peak_ordering_time: peakTime[0],
        peak_ordering_day: dayNames[parseInt(peakDay[0])],
        time_of_day_curve: hourBuckets,
        weekday_vs_weekend: weekdayVsWeekend,
        late_night_shopper: hourBuckets.late_night > orderDates.length * 0.2
    };
}

// ================================
// MAIN PROCESSING FUNCTION
// ================================

/**
 * Process Zepto order data from Reclaim proof
 * Now supports multi-order format: { orders: [...] }
 * @param {Object} extractedData - Data from Reclaim proof
 * @param {Object} options - Processing options
 * @returns {Object} Processed sellable data
 */
export function processZeptoData(extractedData, options = {}) {
    console.log('🛒 Processing Zepto data...');
    console.log('🔍 Input data keys:', Object.keys(extractedData || {}));

    // ========================================
    // STEP 1: Extract orders array
    // ========================================
    let rawOrders = [];

    // New format: orders array with full order objects
    if (extractedData.orders && Array.isArray(extractedData.orders)) {
        rawOrders = extractedData.orders;
        console.log(`📦 Found ${rawOrders.length} orders in orders array`);
    }
    // Try parsing if orders is a string
    else if (typeof extractedData.orders === 'string') {
        try {
            rawOrders = JSON.parse(extractedData.orders);
            console.log(`📦 Parsed ${rawOrders.length} orders from string`);
        } catch (e) {
            console.log('⚠️ Could not parse orders string');
        }
    }
    // Legacy single-order format (backward compatibility)
    else if (extractedData.grandTotalAmount !== undefined || extractedData.productsNamesAndCounts !== undefined) {
        console.log('📦 Using legacy single-order format');
        rawOrders = [{
            grandTotalAmount: extractedData.grandTotalAmount,
            itemQuantityCount: extractedData.itemQuantityCount,
            productsNamesAndCounts: extractedData.productsNamesAndCounts,
            status: 'DELIVERED',
            placedTime: null
        }];
    }

    if (rawOrders.length === 0) {
        console.log('⚠️ No orders found in Zepto data');
        return {
            success: false,
            sellableRecord: null,
            rawProcessed: { orderCount: 0, totalSpend: 0 }
        };
    }

    // ========================================
    // STEP 2: Filter and process orders
    // ========================================
    // Only count DELIVERED orders for insights (skip CANCELLED etc.)
    const deliveredOrders = rawOrders.filter(o => {
        const status = (o.status || '').toUpperCase();
        const formattedStatus = (o.formattedStatus || '').toUpperCase();

        if (formattedStatus === 'CANCELLED' || status === 'CANCELLED') return false;

        return status === 'DELIVERED' || formattedStatus === 'DELIVERED' || status === 'ARRIVED' || status === '';  // empty status = legacy format
    });
    const cancelledOrders = rawOrders.filter(o => {
        const status = (o.status || '').toUpperCase();
        const formattedStatus = (o.formattedStatus || '').toUpperCase();
        return status === 'CANCELLED' || formattedStatus === 'CANCELLED';
    });

    console.log(`📊 ${deliveredOrders.length} delivered, ${cancelledOrders.length} cancelled out of ${rawOrders.length} total`);

    // Process delivered orders
    const categoryCount = {};
    const brandCount = {};
    const allItems = [];
    let totalSpend = 0;
    let totalItems = 0;
    const validDates = [];
    const orderValues = [];

    deliveredOrders.forEach(order => {
        // Parse amount (Zepto sends in paise)
        const amount = paiseToRupees(order.grandTotalAmount);
        totalSpend += amount;
        orderValues.push(amount);

        // Parse item count
        const itemCount = parseInt(order.itemQuantityCount, 10) || 0;
        totalItems += itemCount;

        // Parse products
        const products = parseZeptoProducts(order.productsNamesAndCounts);

        products.forEach(product => {
            const itemName = product.name;
            allItems.push(itemName);

            const category = inferCategoryFromItems(itemName);
            const brand = inferBrand(itemName);

            categoryCount[category] = (categoryCount[category] || 0) + (product.count || 1);
            brandCount[brand] = (brandCount[brand] || 0) + (product.count || 1);
        });

        // Parse timestamp
        const placedDate = parseOrderTimestamp(order.placedTime);
        if (placedDate) {
            validDates.push(placedDate);
        }
    });

    // ========================================
    // STEP 3: Calculate analytics
    // ========================================
    const orderCount = deliveredOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalSpend / orderCount * 100) / 100 : 0;
    const spendBracket = getSpendBracket(totalSpend, orderCount);

    // Calculate data window
    let dataWindowDays = 0;
    if (validDates.length > 1) {
        validDates.sort((a, b) => a - b);
        dataWindowDays = Math.round((validDates[validDates.length - 1] - validDates[0]) / (1000 * 60 * 60 * 24));
    }

    // Calculate order frequency
    let orderFrequency = 'occasional';
    if (orderCount >= 10) orderFrequency = 'frequent';
    else if (orderCount >= 5) orderFrequency = 'regular';
    else if (orderCount >= 2) orderFrequency = 'moderate';

    // Temporal behavior
    const temporalBehavior = calculateTemporalBehavior(validDates);

    // Get top categories and brands
    const topCategories = Object.entries(categoryCount)
        .filter(([c]) => c !== 'default')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({
            category,
            label: GROCERY_CATEGORIES[category]?.l2 || category,
            count,
            percentage: allItems.length > 0 ? Math.round((count / allItems.length) * 100) : 0
        }));

    const topBrands = Object.entries(brandCount)
        .filter(([b]) => b !== 'Store Brand')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([brand, count]) => ({
            brand,
            count,
            percentage: allItems.length > 0 ? Math.round((count / allItems.length) * 100) : 0
        }));

    // Determine shopper profile
    const hasEssentials = ['dairy', 'vegetables', 'fruits', 'rice', 'atta', 'eggs', 'milk'].some(c => categoryCount[c] > 0);
    const hasSnacks = ['chips', 'snacks', 'soft_drinks', 'beer'].some(c => categoryCount[c] > 0);
    const hasPersonalCare = categoryCount['personal_care'] > 0 || categoryCount['cleaning'] > 0;
    const hasHealthFood = categoryCount['muesli'] > 0 || categoryCount['cereal'] > 0;

    // Price bucket distribution
    const priceBuckets = { budget: 0, mid_range: 0, premium: 0 };
    orderValues.forEach(val => {
        if (val < 200) priceBuckets.budget++;
        else if (val < 500) priceBuckets.mid_range++;
        else priceBuckets.premium++;
    });

    // Cancellation rate
    const cancellationRate = rawOrders.length > 0
        ? Math.round((cancelledOrders.length / rawOrders.length) * 100)
        : 0;

    // ========================================
    // STEP 4: Generate sellable data record
    // ========================================
    const sellableData = {
        schema_version: '2.0',
        dataset_id: DATASET_CONFIG.zepto.dataset_id,
        record_type: 'quick_commerce_orders',
        generated_at: new Date().toISOString(),

        // Transaction summary
        transaction_data: {
            summary: {
                total_orders: orderCount,
                total_orders_including_cancelled: rawOrders.length,
                cancelled_orders: cancelledOrders.length,
                cancellation_rate_pct: cancellationRate,
                total_spend: Math.round(totalSpend * 100) / 100,
                avg_order_value: avgOrderValue,
                total_items: totalItems,
                avg_items_per_order: orderCount > 0 ? Math.round(totalItems / orderCount * 10) / 10 : 0,
                data_window_days: dataWindowDays,
                unique_products: allItems.length
            },
            price_distribution: {
                budget_pct: orderCount > 0 ? Math.round((priceBuckets.budget / orderCount) * 100) : 0,
                mid_range_pct: orderCount > 0 ? Math.round((priceBuckets.mid_range / orderCount) * 100) : 0,
                premium_pct: orderCount > 0 ? Math.round((priceBuckets.premium / orderCount) * 100) : 0
            }
        },

        // Category preferences
        category_preferences: {
            top_categories: topCategories,
            category_diversity_score: Math.min(100, Object.keys(categoryCount).filter(c => c !== 'default').length * 15),
            essentials_buyer: hasEssentials,
            snacks_buyer: hasSnacks,
            personal_care_buyer: hasPersonalCare,
            health_food_buyer: hasHealthFood
        },

        // Brand affinity
        brand_affinity: {
            top_brands: topBrands,
            brand_loyalty_score: topBrands.length > 0 && topBrands[0].percentage > 30 ? 'high' : 'moderate',
            unique_brands: Object.keys(brandCount).filter(b => b !== 'Store Brand').length
        },

        // Temporal behavior
        temporal_behavior: temporalBehavior,

        // Behavioral insights
        behavioral_insights: {
            spend_bracket: spendBracket,
            quick_commerce_user: true,
            convenience_oriented: true,
            order_frequency: orderFrequency,
            cancellation_tendency: cancellationRate > 20 ? 'high' : cancellationRate > 5 ? 'moderate' : 'low'
        },

        // Audience segment for targeting
        audience_segment: {
            segment_id: `zepto_${spendBracket}_${hasEssentials ? 'essentials' : 'convenience'}`,
            dmp_attributes: {
                interest_groceries: true,
                interest_quick_commerce: true,
                interest_convenience: true,
                platform_zepto: true,
                urban_consumer: true,
                engagement_level: orderCount >= 10 ? 'high' : orderCount >= 5 ? 'medium' : 'low',
                health_conscious: hasHealthFood,
                snack_lover: hasSnacks
            }
        },

        // Metadata
        metadata: {
            source: 'reclaim_protocol',
            platform: DATASET_CONFIG.zepto.platform,
            schema_standard: 'myrad_quick_commerce_v2',
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
                score: Math.min(100,
                    (orderCount * 10) +
                    (topCategories.length * 10) +
                    (validDates.length > 0 ? 20 : 0) +
                    (topBrands.length * 5)
                ),
                completeness: orderCount >= 5 ? 'excellent' : orderCount > 0 ? 'good' : 'empty',
                orders_with_valid_dates: validDates.length,
                products_parsed: allItems.length,
                items_count: totalItems
            }
        }
    };

    console.log('✅ Zepto data processed successfully');
    console.log(`📊 Orders: ${orderCount} delivered (${cancelledOrders.length} cancelled), Total spend: ₹${totalSpend.toFixed(2)}, Avg: ₹${avgOrderValue}`);

    return {
        success: true,
        sellableRecord: sellableData,
        rawProcessed: {
            orderCount,
            totalSpend: Math.round(totalSpend * 100) / 100,
            avgOrderValue,
            topCategories,
            topBrands,
            totalItems,
            productsCount: allItems.length,
            dataWindowDays,
            cancelledOrders: cancelledOrders.length
        }
    };
}

// ================================
// EXPORT
// ================================

export default {
    processZeptoData,
    inferBrand,
    inferCategoryFromItems,
    parsePrice,
    getSpendBracket,
    parseZeptoProducts,
    paiseToRupees
};
