// Zepto Order History Pipeline for MYRAD
// Transforms Zepto grocery order data into sellable, anonymized datasets
// Focus on quick commerce / grocery delivery insights

import 'dotenv/config';
import dayjs from 'dayjs';

// ================================
// CONFIGURATION
// ================================

const DATASET_CONFIG = {
    zepto: {
        dataset_id: 'myrad_zepto_v1',
        platform: 'zepto',
        version: '1.0.0'
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
    'default': { l1: 'Groceries', l2: 'General' }
};

// Category inference patterns
const CATEGORY_PATTERNS = [
    { pattern: /apple|banana|orange|mango|grape|fruit/i, category: 'fruits' },
    { pattern: /tomato|onion|potato|vegetable|carrot|spinach/i, category: 'vegetables' },
    { pattern: /milk|curd|yogurt|paneer|cheese|butter/i, category: 'dairy' },
    { pattern: /egg|anda/i, category: 'eggs' },
    { pattern: /bread|pav|bun|cake|cookie|biscuit/i, category: 'bread' },
    { pattern: /chips|namkeen|snack|kurkure|lays/i, category: 'chips' },
    { pattern: /cola|pepsi|sprite|fanta|soda|soft drink/i, category: 'soft_drinks' },
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
    { pattern: /maggi|noodle|instant|ready to eat/i, category: 'instant' }
];

// Brand patterns for quick commerce
const BRAND_PATTERNS = [
    { pattern: /amul/i, brand: 'Amul' },
    { pattern: /mother dairy/i, brand: 'Mother Dairy' },
    { pattern: /nestle|maggi|nescafe/i, brand: 'Nestle' },
    { pattern: /britannia/i, brand: 'Britannia' },
    { pattern: /parle/i, brand: 'Parle' },
    { pattern: /haldiram/i, brand: 'Haldirams' },
    { pattern: /lays|pepsi|kurkure/i, brand: 'PepsiCo' },
    { pattern: /coca cola|sprite|fanta|minute maid/i, brand: 'Coca-Cola' },
    { pattern: /hindustan unilever|surf|dove|lifebuoy/i, brand: 'HUL' },
    { pattern: /p&g|pantene|head.*shoulders|gillette/i, brand: 'P&G' },
    { pattern: /dabur/i, brand: 'Dabur' },
    { pattern: /itc|aashirvaad|sunfeast/i, brand: 'ITC' },
    { pattern: /tata|tata salt|tata tea/i, brand: 'Tata' },
    { pattern: /patanjali/i, brand: 'Patanjali' },
    { pattern: /mtr/i, brand: 'MTR' },
    { pattern: /fortune/i, brand: 'Fortune' },
    { pattern: /saffola/i, brand: 'Saffola' }
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

// Parse price from various formats
function parsePrice(p) {
    if (!p) return 0;
    if (typeof p === 'number') return p;
    const cleaned = ('' + p).replace(/[^\d.\-]/g, '');
    return parseFloat(cleaned) || 0;
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

// Parse Zepto's productsNamesAndCounts JSON string
function parseZeptoProducts(productsStr) {
    if (!productsStr) return [];

    try {
        // Parse the JSON string
        const products = typeof productsStr === 'string' ? JSON.parse(productsStr) : productsStr;

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

// ================================
// MAIN PROCESSING FUNCTION
// ================================

/**
 * Process Zepto order data from Reclaim proof
 * @param {Object} extractedData - Data from Reclaim proof
 * @param {Object} options - Processing options
 * @returns {Object} Processed sellable data
 */
export function processZeptoData(extractedData, options = {}) {
    console.log('🛒 Processing Zepto data...');
    console.log('🔍 Input data:', JSON.stringify(extractedData, null, 2).substring(0, 500));

    // Zepto data comes in a different format from Reclaim:
    // - grandTotalAmount: total order value
    // - itemQuantityCount: number of items
    // - productsNamesAndCounts: JSON string of products array

    const grandTotalAmount = parsePrice(extractedData.grandTotalAmount);
    const itemQuantityCount = parseInt(extractedData.itemQuantityCount, 10) || 0;
    const products = parseZeptoProducts(extractedData.productsNamesAndCounts);

    console.log(`📦 Zepto order: ₹${grandTotalAmount}, ${itemQuantityCount} items, ${products.length} products parsed`);

    // Process product data
    const categoryCount = {};
    const brandCount = {};
    const allItems = [];

    products.forEach(product => {
        const itemName = product.name;
        allItems.push(itemName);

        const category = inferCategoryFromItems(itemName);
        const brand = inferBrand(itemName);

        categoryCount[category] = (categoryCount[category] || 0) + (product.count || 1);
        brandCount[brand] = (brandCount[brand] || 0) + (product.count || 1);
    });

    // Since we only have one order from Zepto currently, treat it as a single order
    const orderCount = grandTotalAmount > 0 ? 1 : 0;
    const totalSpend = grandTotalAmount;
    const avgOrderValue = grandTotalAmount;
    const spendBracket = getSpendBracket(totalSpend, orderCount);

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
    const hasEssentials = ['dairy', 'vegetables', 'fruits', 'rice', 'atta'].some(c => categoryCount[c] > 0);
    const hasSnacks = ['chips', 'snacks', 'soft_drinks'].some(c => categoryCount[c] > 0);
    const hasPersonalCare = categoryCount['personal_care'] > 0 || categoryCount['cleaning'] > 0;

    // Generate sellable data record
    const sellableData = {
        schema_version: '1.0',
        dataset_id: DATASET_CONFIG.zepto.dataset_id,
        record_type: 'quick_commerce_orders',
        generated_at: new Date().toISOString(),

        // Transaction summary
        transaction_data: {
            summary: {
                total_orders: orderCount,
                total_spend: Math.round(totalSpend * 100) / 100,
                avg_order_value: avgOrderValue,
                total_items: itemQuantityCount,
                avg_items_per_order: orderCount > 0 ? Math.round(itemQuantityCount / orderCount * 10) / 10 : 0,
                data_window_days: 0 // Single order, no time span
            }
        },

        // Category preferences
        category_preferences: {
            top_categories: topCategories,
            category_diversity_score: Object.keys(categoryCount).filter(c => c !== 'default').length * 10,
            essentials_buyer: hasEssentials,
            snacks_buyer: hasSnacks,
            personal_care_buyer: hasPersonalCare
        },

        // Brand affinity
        brand_affinity: {
            top_brands: topBrands,
            brand_loyalty_score: topBrands.length > 0 && topBrands[0].percentage > 30 ? 'high' : 'moderate'
        },

        // Behavioral insights
        behavioral_insights: {
            spend_bracket: spendBracket,
            quick_commerce_user: true,
            convenience_oriented: true,
            order_frequency: 'occasional' // Single order for now
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
                engagement_level: 'low' // Single order
            }
        },

        // Metadata
        metadata: {
            source: 'reclaim_protocol',
            platform: DATASET_CONFIG.zepto.platform,
            schema_standard: 'myrad_quick_commerce_v1',
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
                score: Math.min(100, orderCount * 20 + (topCategories.length * 10) + (products.length * 5)),
                completeness: orderCount > 0 ? 'good' : 'empty',
                products_parsed: products.length,
                items_count: itemQuantityCount
            }
        }
    };

    console.log('✅ Zepto data processed successfully');
    console.log(`📊 Order count: ${orderCount}, Total spend: ₹${totalSpend}`);

    return {
        success: true,
        sellableRecord: sellableData,
        rawProcessed: {
            orderCount,
            totalSpend,
            avgOrderValue,
            topCategories,
            topBrands,
            itemQuantityCount,
            productsCount: products.length
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
    parseZeptoProducts
};
