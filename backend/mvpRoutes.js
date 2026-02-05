// MVP API Routes for MYRAD
import express from 'express';
import rateLimit from 'express-rate-limit';
import * as jsonStorage from './jsonStorage.js';
import * as cohortService from './cohortService.js';
import * as consentLedger from './consentLedger.js';
import * as rewardService from './rewardService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEBUG_LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');

function debugLog(data) {
    try {
        const logLine = JSON.stringify({ ...data, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(DEBUG_LOG_PATH, logLine);
    } catch (e) {
        // Ignore log errors
    }
}


const router = express.Router();

// Rate limiting for enterprise/export endpoints (prevent abuse)
const enterpriseRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each API key to 100 requests per windowMs
    message: 'Too many requests from this API key, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit by API key instead of IP
        // Using only the API key avoids IPv6 handling issues
        return req.headers['x-api-key'] || 'unknown';
    },
    skip: (req) => {
        // Skip rate limiting if no API key (will fail auth anyway)
        return !req.headers['x-api-key'];
    },
    validate: { xForwardedForHeader: false, default: true }
});


// Middleware to verify Privy token (stub for now)
const verifyPrivyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    // For MVP, we'll extract user info from token (stub)
    // In production, verify with Privy API
    const token = authHeader.split(' ')[1];

    // STUB: For now, decode a simple token format: "privy_userId_email"
    try {
        const parts = token.split('_');
        if (parts[0] !== 'privy' || parts.length < 3) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        req.user = {
            privyId: parts[1],
            email: parts.slice(2).join('_')
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to verify API key for enterprise endpoints
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            message: 'Please provide your API key in the X-API-Key header'
        });
    }

    const isValid = jsonStorage.validateApiKey(apiKey);
    if (!isValid) {
        // Log failed attempts (for security monitoring)
        console.warn(`⚠️  Failed API key attempt from IP: ${req.ip}`);
        return res.status(401).json({
            error: 'Invalid or inactive API key',
            message: 'The provided API key is invalid, expired, or inactive'
        });
    }

    // Log successful API usage (for audit trail)
    console.log(`✅ API key validated for endpoint: ${req.path}`);

    next();
};

// ===================
// USER ENDPOINTS
// ===================

// Set user username
router.post('/user/username', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);
        const { username } = req.body;

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!username || username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });

        if (await jsonStorage.isUsernameAvailable(username)) {
            const updatedUser = await jsonStorage.updateUserProfile(user.id, { username });
            res.json({ success: true, username: updatedUser.username });
        } else {
            res.status(409).json({ error: 'Username already taken' });
        }
    } catch (error) {
        console.error('Set username error:', error);
        res.status(500).json({ error: 'Failed to set username' });
    }
});

// Verify Privy token and get/create user
router.post('/auth/verify', verifyPrivyToken, async (req, res) => {
    try {
        // Get email and wallet address from request body (more reliable than token)
        const email = req.body.email || req.user.email || null;
        const walletAddress = req.body.walletAddress || null;

        let user = await jsonStorage.getUserByPrivyId(req.user.privyId);

        if (!user) {
            // Create new user with email and wallet address
            user = await jsonStorage.createUser(req.user.privyId, email, walletAddress);
        } else {
            // Update existing user: set email if missing, set wallet if missing
            let needsRefetch = false;
            const updates = {};

            if (email && !user.email) {
                updates.email = email;
                needsRefetch = true;
            }
            if (walletAddress && !user.walletAddress) {
                await jsonStorage.updateUserWallet(user.id, walletAddress);
                needsRefetch = true;
            }
            if (Object.keys(updates).length > 0) {
                await jsonStorage.updateUserProfile(user.id, updates);
            }
            // Refetch user to get latest data after updates
            if (needsRefetch) {
                user = await jsonStorage.getUserById(user.id);
            }
            await jsonStorage.updateUserActivity(user.id);
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                totalPoints: user.totalPoints || 0,
                league: user.league || 'Bronze',
                streak: user.streak || 0,
                createdAt: user.createdAt,
                lastActiveAt: user.lastActiveAt
            }
        });
    } catch (error) {
        console.error('Auth verify error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get user profile
router.get('/user/profile', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const contributions = await jsonStorage.getUserContributions(user.id);

        res.json({
            success: true,
            profile: {
                id: user.id,
                email: user.email,
                username: user.username,
                totalPoints: user.totalPoints || 0,
                league: user.league || 'Bronze',
                streak: user.streak || 0,
                contributionsCount: contributions.length,
                createdAt: user.createdAt,
                lastActiveAt: user.lastActiveAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user points balance and history
router.get('/user/points', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const pointsHistory = await jsonStorage.getUserPoints(user.id);
        const totalPoints = await jsonStorage.getUserTotalPoints(user.id);

        res.json({
            success: true,
            points: {
                balance: totalPoints,
                history: pointsHistory.slice(0, 50) // Last 50 transactions (already sorted by DESC)
            }
        });
    } catch (error) {
        console.error('Get points error:', error);
        res.status(500).json({ error: 'Failed to fetch points' });
    }
});

// Get user contributions
router.get('/user/contributions', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const contributions = await jsonStorage.getUserContributions(user.id);

        res.json({
            success: true,
            contributions: contributions.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0);
                const dateB = new Date(b.createdAt || b.created_at || 0);
                return dateB.getTime() - dateA.getTime();
            })
        });
    } catch (error) {
        console.error('Get contributions error:', error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

// Submit data contribution with enterprise data pipeline
router.post('/contribute', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { anonymizedData, dataType, reclaimProofId } = req.body;

        // #region agent log
        debugLog({ location: 'mvpRoutes.contribute.received', message: 'Data received from frontend', data: { dataType, hasAnonymizedData: !!anonymizedData, anonymizedDataKeys: anonymizedData ? Object.keys(anonymizedData) : [], hasOrders: !!anonymizedData?.orders, ordersLength: Array.isArray(anonymizedData?.orders) ? anonymizedData.orders.length : 0 }, sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' });
        // #endregion

        if (!anonymizedData) {
            return res.status(400).json({ error: 'anonymizedData is required' });
        }

        // Extract wallet address from the data if present
        const walletAddress = anonymizedData?.walletAddress || null;
        if (walletAddress && !user.walletAddress) {
            await jsonStorage.updateUserWallet(user.id, walletAddress);
            console.log(`💳 Wallet address updated for user ${user.id}: ${walletAddress}`);
        }

        // ========================================
        // DUPLICATE SUBMISSION PREVENTION
        // ========================================
        // Check if this exact proof has already been submitted (using database)
        if (reclaimProofId) {
            const { findContributionByProofId } = await import('./database/contributionService.js');
            const duplicateProof = await findContributionByProofId(reclaimProofId);

            if (duplicateProof) {
                console.log(`⚠️ Duplicate submission blocked: proofId ${reclaimProofId} already exists`);
                return res.status(409).json({
                    error: 'Duplicate submission',
                    message: 'This data has already been submitted. You cannot earn points for the same data twice.',
                    existingContributionId: duplicateProof.id
                });
            }
        }

        // Content-based duplicate detection (check across ALL users/wallets)
        const { findDuplicateByContent } = await import('./database/contributionService.js');

        // Generate content hash based on data type
        let contentSignature = null;
        if (dataType === 'zomato_order_history' && anonymizedData.orders?.length > 0) {
            // For Zomato: hash based on order count + first order details + userId (from Zomato)
            const orders = anonymizedData.orders;
            const firstOrder = orders[0];
            contentSignature = `zomato_${anonymizedData.userId || ''}_${orders.length}_${firstOrder?.restaurant || ''}_${firstOrder?.timestamp || ''}`;
        } else if (dataType === 'github_profile') {
            // For GitHub: hash based on username + followers + contributions
            contentSignature = `github_${anonymizedData.username || anonymizedData.login || ''}_${anonymizedData.followers || 0}_${anonymizedData.contributions || 0}`;
        } else if (dataType === 'netflix_watch_history' && anonymizedData.titles?.length > 0) {
            // For Netflix: hash based on title count + first title
            const titles = anonymizedData.titles;
            const firstTitle = titles[0];
            contentSignature = `netflix_${titles.length}_${firstTitle?.title || firstTitle?.name || ''}`;
        } else if (dataType === 'ubereats_order_history' && anonymizedData.orders?.length > 0) {
            // For Uber Eats: hash based on order count + first order details
            const orders = anonymizedData.orders;
            const firstOrder = orders[0];
            contentSignature = `ubereats_${anonymizedData.userId || ''}_${orders.length}_${firstOrder?.restaurant || firstOrder?.restaurant_name || ''}_${firstOrder?.timestamp || firstOrder?.date || ''}`;
        } else if (dataType === 'strava_fitness') {
            // For Strava: hash based on activity totals and primary stats
            contentSignature = `strava_${anonymizedData.running_total || 0}_${anonymizedData.cycling_total || 0}_${anonymizedData.total_activities || 0}_${anonymizedData.location || ''}`;
        } else if (dataType === 'blinkit_order_history' && anonymizedData.orders?.length > 0) {
            // For Blinkit: hash based on order count + first order details
            const orders = anonymizedData.orders;
            const firstOrder = orders[0];
            contentSignature = `blinkit_${orders.length}_${firstOrder?.items || ''}_${firstOrder?.total || firstOrder?.price || ''}`;
        } else if (dataType === 'uber_ride_history' && anonymizedData.rides?.length > 0) {
            // For Uber Rides: hash based on ride count + first ride details
            const rides = anonymizedData.rides;
            const firstRide = rides[0];
            contentSignature = `uber_rides_${rides.length}_${firstRide?.fare || firstRide?.total || ''}_${firstRide?.timestamp || firstRide?.date || ''}`;
        }

        if (contentSignature) {
            const duplicateContent = await findDuplicateByContent(dataType, contentSignature);
            if (duplicateContent) {
                console.log(`⚠️ Duplicate content blocked: ${contentSignature} already exists (contribution ${duplicateContent.id})`);
                return res.status(409).json({
                    error: 'Duplicate data',
                    message: 'This exact data has already been submitted by someone. Each unique data set can only earn points once.',
                    existingContributionId: duplicateContent.id
                });
            }
        }

        let sellableData = null;
        let processedData = anonymizedData;
        let behavioralInsights = null;

        // Process Zomato data through enterprise pipeline
        if (dataType === 'zomato_order_history') {
            try {
                const { transformToSellableData } = await import('./zomatoPipeline.js');

                console.log('📦 Processing zomato data through enterprise pipeline...');
                // Raw data logging removed for security

                const result = await transformToSellableData(anonymizedData, 'zomato', user.id);

                sellableData = result.sellableRecord;
                processedData = result.rawProcessed;
                behavioralInsights = result.geminiInsights;

                console.log('✅ Enterprise data pipeline complete');
                console.log(`📊 Generated cohort: ${sellableData?.audience_segment?.segment_id || 'unknown'}`);
            } catch (pipelineError) {
                console.error('⚠️ Pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Process GitHub data through developer profile pipeline
        if (dataType === 'github_profile') {
            try {
                const { processGithubData } = await import('./githubPipeline.js');

                console.log('📦 Processing GitHub data through developer pipeline...');
                // Raw data logging removed for security

                const result = processGithubData(anonymizedData);

                if (result.success) {
                    sellableData = result.sellableData;
                    processedData = result.data;
                    console.log('✅ GitHub developer pipeline complete');
                    console.log(`📊 Developer tier: ${sellableData?.developer_profile?.tier || 'unknown'}`);
                }
            } catch (pipelineError) {
                console.error('⚠️ GitHub pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Process Netflix data through streaming intelligence pipeline
        if (dataType === 'netflix_watch_history') {
            try {
                const { processNetflixData } = await import('./netflixPipeline.js');

                console.log('📺 Processing Netflix data through streaming intelligence pipeline...');
                // Raw data logging removed for security

                const result = await processNetflixData(anonymizedData);

                if (result.success) {
                    sellableData = result.sellableRecord;
                    processedData = result.rawProcessed;
                    console.log('✅ Netflix streaming pipeline complete');
                    console.log(`📊 Binge score: ${sellableData?.viewing_behavior?.binge_score || 'unknown'}`);
                }
            } catch (pipelineError) {
                console.error('⚠️ Netflix pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Process Uber Eats data through order history pipeline
        if (dataType === 'ubereats_order_history') {
            try {
                const { processUberEatsData } = await import('./ubereatsPipeline.js');

                console.log('🍔 Processing Uber Eats data through order pipeline...');
                // Raw data logging removed for security

                const result = processUberEatsData(anonymizedData);

                if (result.success) {
                    sellableData = result.sellableRecord;
                    processedData = result.rawProcessed;
                    console.log('✅ Uber Eats order pipeline complete');
                    console.log(`📊 Order count: ${sellableData?.transaction_data?.summary?.total_orders || 'unknown'}`);
                }
            } catch (pipelineError) {
                console.error('⚠️ Uber Eats pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Process Strava data through fitness pipeline
        if (dataType === 'strava_fitness') {
            try {
                const { processStravaData } = await import('./stravaPipeline.js');

                console.log('🏃 Processing Strava fitness data through pipeline...');

                const result = processStravaData(anonymizedData);

                if (result.success) {
                    sellableData = result.sellableRecord;
                    processedData = result.rawProcessed;
                    console.log('✅ Strava fitness pipeline complete');
                    console.log(`🏆 Fitness tier: ${sellableData?.fitness_profile?.tier || 'unknown'}`);
                }
            } catch (pipelineError) {
                console.error('⚠️ Strava pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Process Blinkit data through grocery order pipeline
        if (dataType === 'blinkit_order_history') {
            try {
                const { processBlinkitData } = await import('./blinkitPipeline.js');

                console.log('🛒 Processing Blinkit data through order pipeline...');

                const result = processBlinkitData(anonymizedData);

                if (result.success) {
                    sellableData = result.sellableRecord;
                    processedData = result.rawProcessed;
                    console.log('✅ Blinkit order pipeline complete');
                    console.log(`📊 Order count: ${sellableData?.transaction_data?.summary?.total_orders || 'unknown'}`);
                }
            } catch (pipelineError) {
                console.error('⚠️ Blinkit pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Process Uber Rides data through mobility pipeline
        if (dataType === 'uber_ride_history') {
            try {
                const { processUberRidesData } = await import('./uberRidesPipeline.js');

                console.log('🚗 Processing Uber Rides data through mobility pipeline...');

                const result = processUberRidesData(anonymizedData);

                if (result.success) {
                    sellableData = result.sellableRecord;
                    processedData = result.rawProcessed;
                    console.log('✅ Uber Rides pipeline complete');
                    console.log(`🚕 Ride count: ${sellableData?.ride_summary?.total_rides || 'unknown'}`);
                }
            } catch (pipelineError) {
                console.error('⚠️ Uber Rides pipeline error:', pipelineError.message);
                console.error('⚠️ Pipeline stack:', pipelineError.stack);
            }
        }

        // Store contribution with sellable data format
        const finalWalletAddress = user.walletAddress || walletAddress || null;
        let contribution;
        try {
            contribution = await jsonStorage.addContribution(user.id, {
                anonymizedData: processedData,
                sellableData,
                behavioralInsights,
                dataType,
                reclaimProofId,
                processingMethod: sellableData ? 'enterprise_pipeline' : 'raw',
                walletAddress: finalWalletAddress
            });
        } catch (saveError) {
            // Check if it's a duplicate error from the database layer
            if (saveError.isDuplicate) {
                console.log(`⚠️ Duplicate data rejected for user ${user.id}: ${saveError.message}`);
                return res.status(409).json({
                    error: 'Duplicate data',
                    message: saveError.message || 'This data has already been submitted. You cannot earn points for the same data twice.',
                    existingContributionId: saveError.existingId
                });
            }
            throw saveError;
        }

        // Check if contribution save returned a duplicate flag
        if (contribution?.isDuplicate) {
            console.log(`⚠️ Duplicate data rejected for user ${user.id}`);
            return res.status(409).json({
                error: 'Duplicate data',
                message: contribution.message || 'This data has already been submitted. You cannot earn points for the same data twice.',
                existingContributionId: contribution.existingId
            });
        }

        // ========================================
        // COMPUTE REWARDS
        // ========================================
        const dataQualityScore = sellableData?.metadata?.data_quality?.score || 0;
        const orderCount = sellableData?.transaction_data?.summary?.total_orders || 0;
        const githubContributions = sellableData?.activity_metrics?.yearly_contributions || 0;

        // BLOCK CONTRIBUTION IF NO DATA (dataType-specific validation)
        if (dataType === 'zomato_order_history' && orderCount === 0) {
            console.log(`⚠️ Zero orders detected for user ${user.id}. No points awarded.`);
            return res.status(400).json({
                success: false,
                error: 'No orders found',
                message: 'Your order history appears to be empty. We can only award points for verifiable order data.',
                contribution: {
                    id: contribution.id,
                    pointsAwarded: 0,
                    orderCount: 0,
                    createdAt: contribution.createdAt
                }
            });
        }

        // Validate Netflix watch history
        const netflixTitles = sellableData?.viewing_summary?.total_titles_watched || 0;
        if (dataType === 'netflix_watch_history' && netflixTitles === 0) {
            console.log(`⚠️ Zero titles detected for user ${user.id}. No points awarded.`);
            return res.status(400).json({
                success: false,
                error: 'No watch history found',
                message: 'Your Netflix watch history appears to be empty. We can only award points for verifiable viewing data.',
                contribution: {
                    id: contribution.id,
                    pointsAwarded: 0,
                    titlesWatched: 0,
                    createdAt: contribution.createdAt
                }
            });
        }

        // Validate Uber Eats order history
        const ubereatsOrderCount = sellableData?.transaction_data?.summary?.total_orders || 0;
        if (dataType === 'ubereats_order_history' && ubereatsOrderCount === 0) {
            console.log(`⚠️ Zero Uber Eats orders detected for user ${user.id}. No points awarded.`);
            return res.status(400).json({
                success: false,
                error: 'No orders found',
                message: 'Your Uber Eats order history appears to be empty. We can only award points for verifiable order data.',
                contribution: {
                    id: contribution.id,
                    pointsAwarded: 0,
                    orderCount: 0,
                    createdAt: contribution.createdAt
                }
            });
        }

        // Validate Strava fitness data
        const stravaActivities = sellableData?.activity_totals?.total_activities || 0;
        if (dataType === 'strava_fitness' && stravaActivities === 0) {
            console.log(`⚠️ Zero Strava activities detected for user ${user.id}. No points awarded.`);
            return res.status(400).json({
                success: false,
                error: 'No fitness activities found',
                message: 'Your Strava activity history appears to be empty. We can only award points for verifiable fitness data.',
                contribution: {
                    id: contribution.id,
                    pointsAwarded: 0,
                    activities: 0,
                    createdAt: contribution.createdAt
                }
            });
        }

        // Validate Blinkit order history
        const blinkitOrderCount = sellableData?.transaction_data?.summary?.total_orders || 0;
        if (dataType === 'blinkit_order_history' && blinkitOrderCount === 0) {
            console.log(`⚠️ Zero Blinkit orders detected for user ${user.id}. No points awarded.`);
            return res.status(400).json({
                success: false,
                error: 'No orders found',
                message: 'Your Blinkit order history appears to be empty. We can only award points for verifiable order data.',
                contribution: {
                    id: contribution.id,
                    pointsAwarded: 0,
                    orderCount: 0,
                    createdAt: contribution.createdAt
                }
            });
        }

        // Validate Uber Rides history
        const uberRidesCount = sellableData?.ride_summary?.total_rides || 0;
        if (dataType === 'uber_ride_history' && uberRidesCount === 0) {
            console.log(`⚠️ Zero Uber rides detected for user ${user.id}. No points awarded.`);
            return res.status(400).json({
                success: false,
                error: 'No rides found',
                message: 'Your Uber ride history appears to be empty. We can only award points for verifiable ride data.',
                contribution: {
                    id: contribution.id,
                    pointsAwarded: 0,
                    rideCount: 0,
                    createdAt: contribution.createdAt
                }
            });
        }

        // Calculate rewards based on new points system
        let rewardResult;
        if (dataType === 'github_profile') {
            // GitHub: 20 points base
            rewardResult = {
                totalPoints: 20,
                breakdown: {
                    base: 20,
                    bonus: 0
                }
            };
            console.log(`🐙 GitHub profile verified for user ${user.id}. Awarding 20 points.`);
        } else if (dataType === 'netflix_watch_history') {
            // Netflix: 50 points base + (total_titles_watched * 10) additional
            const additionalPoints = netflixTitles * 10;
            const totalPoints = 50 + additionalPoints;
            rewardResult = {
                totalPoints,
                breakdown: {
                    base: 50,
                    bonus: additionalPoints
                }
            };
            console.log(`📺 Netflix watch history verified for user ${user.id}. Awarding ${totalPoints} points (50 base + ${additionalPoints} bonus for ${netflixTitles} titles).`);
        } else if (dataType === 'zomato_order_history') {
            // Zomato: 50 points base + (total_orders * 10) additional
            const additionalPoints = orderCount * 10;
            const totalPoints = 50 + additionalPoints;
            rewardResult = {
                totalPoints,
                breakdown: {
                    base: 50,
                    bonus: additionalPoints
                }
            };
            console.log(`🍽️ Zomato order history verified for user ${user.id}. Awarding ${totalPoints} points (50 base + ${additionalPoints} bonus for ${orderCount} orders).`);
        } else if (dataType === 'ubereats_order_history') {
            // Uber Eats: 50 points base + (total_orders * 10) additional (same as Zomato)
            const additionalPoints = ubereatsOrderCount * 10;
            const totalPoints = 50 + additionalPoints;
            rewardResult = {
                totalPoints,
                breakdown: {
                    base: 50,
                    bonus: additionalPoints
                }
            };
            console.log(`🍔 Uber Eats order history verified for user ${user.id}. Awarding ${totalPoints} points (50 base + ${additionalPoints} bonus for ${ubereatsOrderCount} orders).`);
        } else if (dataType === 'strava_fitness') {
            // Strava: HIGH VALUE - 75 points base + (activities * 5) additional (premium fitness audience)
            const fitnessTier = sellableData?.fitness_profile?.tier || 'casual';
            const tierBonus = fitnessTier === 'elite' ? 50 : fitnessTier === 'enthusiast' ? 25 : 0;
            const additionalPoints = (stravaActivities * 5) + tierBonus;
            const totalPoints = 75 + additionalPoints;
            rewardResult = {
                totalPoints,
                breakdown: {
                    base: 75,
                    bonus: additionalPoints,
                    tierBonus
                }
            };
            console.log(`🏃 Strava fitness verified for user ${user.id}. Awarding ${totalPoints} points (75 base + ${additionalPoints} bonus, tier: ${fitnessTier}).`);
        } else if (dataType === 'blinkit_order_history') {
            // Blinkit: 50 points base + (total_orders * 10) additional
            const additionalPoints = blinkitOrderCount * 10;
            const totalPoints = 50 + additionalPoints;
            rewardResult = {
                totalPoints,
                breakdown: {
                    base: 50,
                    bonus: additionalPoints
                }
            };
            console.log(`🛒 Blinkit order history verified for user ${user.id}. Awarding ${totalPoints} points (50 base + ${additionalPoints} bonus for ${blinkitOrderCount} orders).`);
        } else if (dataType === 'uber_ride_history') {
            // Uber Rides: 60 points base + (rides * 5) + commuter bonus
            const isCommuter = sellableData?.temporal_behavior?.is_commuter || false;
            const commuterBonus = isCommuter ? 20 : 0;
            const additionalPoints = (uberRidesCount * 5) + commuterBonus;
            const totalPoints = 60 + additionalPoints;
            rewardResult = {
                totalPoints,
                breakdown: {
                    base: 60,
                    bonus: additionalPoints,
                    commuterBonus
                }
            };
            console.log(`🚗 Uber Rides verified for user ${user.id}. Awarding ${totalPoints} points (60 base + ${additionalPoints} bonus, commuter: ${isCommuter}).`);
        } else {
            // Fallback for unknown data types
            rewardResult = {
                totalPoints: 0,
                breakdown: {
                    base: 0,
                    bonus: 0
                }
            };
            console.log(`⚠️ Unknown dataType: ${dataType}, no points awarded.`);
        }


        // Award dynamic points
        await jsonStorage.addPoints(user.id, rewardResult.totalPoints, 'data_contribution');

        // Update user stats (only league, no streaks)
        const updatedUser = await jsonStorage.getUserById(user.id);
        const newTotalPoints = (updatedUser?.totalPoints || 0);
        await jsonStorage.updateUserProfile(user.id, {
            lastContributionDate: new Date().toISOString(),
            league: rewardService.calculateLeague(newTotalPoints)
        });

        // ========================================
        // K-ANONYMITY COMPLIANCE CHECK
        // ========================================
        const cohortId = sellableData?.audience_segment?.segment_id;
        let kAnonymityCompliant = null;
        let cohortSize = 0;

        if (cohortId) {
            const { getCohortSize } = await import('./database/contributionService.js');
            cohortSize = await getCohortSize(cohortId);
            const MIN_K = 10; // k-anonymity threshold
            kAnonymityCompliant = cohortSize >= MIN_K;

            console.log(`📊 Cohort ${cohortId}: size=${cohortSize}, k_compliant=${kAnonymityCompliant}`);

            // ========================================
            // INCREMENT COHORT COUNTER (Production)
            // ========================================
            const cohortData = cohortService.incrementCohort(cohortId);
            cohortSize = cohortData.count;
            kAnonymityCompliant = cohortData.k_anonymity_compliant;

            // Update the contribution's sellable data with k-anonymity status in database
            // Note: The database already has these fields indexed, so we update them directly
            if (sellableData?.metadata?.privacy_compliance && kAnonymityCompliant !== undefined) {
                try {
                    const { query } = await import('./database/db.js');
                    const tableName = dataType === 'zomato_order_history' ? 'zomato_contributions' : 'github_contributions';
                    const aggregationStatus = kAnonymityCompliant ? 'sellable' : 'pending_more_contributors';

                    await query(
                        `UPDATE ${tableName} 
                         SET sellable_data = jsonb_set(
                             jsonb_set(
                                 jsonb_set(sellable_data::jsonb, 
                                     '{metadata,privacy_compliance,k_anonymity_compliant}', $1::jsonb),
                                 '{metadata,privacy_compliance,cohort_size}', $2::jsonb
                             ),
                             '{metadata,privacy_compliance,aggregation_status}', $4::jsonb
                         )
                         WHERE id = $3`,
                        [
                            JSON.stringify(kAnonymityCompliant),
                            JSON.stringify(cohortSize),
                            contribution.id,
                            JSON.stringify(aggregationStatus)
                        ]
                    );
                    console.log(`✅ Updated k-anonymity status for contribution ${contribution.id}: compliant=${kAnonymityCompliant}, cohort_size=${cohortSize}`);
                } catch (updateError) {
                    console.error('Warning: Could not update k-anonymity status in database:', updateError.message);
                }
            }
        }

        // ========================================
        // LOG CONSENT (Compliance Audit Trail)
        // ========================================
        const consentEntry = consentLedger.logConsent({
            userId: user.id,
            reclaimProofId,
            dataType,
            datasetSource: 'reclaim_protocol',
            geoRegion: sellableData?.geo_data?.city_cluster || 'unknown',
            cohortId,
            contributionId: contribution.id,
            orderCount: sellableData?.transaction_data?.summary?.total_orders || 0,
            dataWindowStart: sellableData?.transaction_data?.summary?.data_window_start,
            dataWindowEnd: sellableData?.transaction_data?.summary?.data_window_end,
            walletAddress: user.walletAddress || walletAddress
        });
        console.log(`📋 Consent logged: ${consentEntry.id}`);

        // Update user activity
        await jsonStorage.updateUserActivity(user.id);

        res.json({
            success: true,
            contribution: {
                id: contribution.id,
                pointsAwarded: rewardResult.totalPoints,
                pointsBreakdown: rewardResult.breakdown,
                createdAt: contribution.createdAt,
                cohortId: cohortId || null,
                cohortSize,
                kAnonymityCompliant,
                dataQualityScore: sellableData?.metadata?.data_quality?.score || null,
                hasSellableData: !!sellableData
            },
            message: `Contribution received! ${rewardResult.totalPoints} points awarded.`
        });
    } catch (error) {
        console.error('Contribute error:', error);
        res.status(500).json({ error: 'Failed to submit contribution' });
    }
});

// Client-side debug logging endpoint (for tracking frontend debug data in server logs)
router.post('/logs/debug', async (req, res) => {
    try {
        const { location, message, data, timestamp, sessionId, runId, hypothesisId } = req.body;

        // Log to server console (will appear in Render logs)
        console.log('🔵 DEBUG LOG:', JSON.stringify({
            type: 'DEBUG',
            timestamp: timestamp || Date.now(),
            location: location || 'unknown',
            message: message || '',
            data: data || null,
            sessionId: sessionId || null,
            runId: runId || null,
            hypothesisId: hypothesisId || null
        }, null, 2));

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error in debug log:', err);
        res.status(200).json({ success: true });
    }
});

// Client-side error logging endpoint (for tracking frontend errors in server logs)
router.post('/logs/error', async (req, res) => {
    try {
        const { message, error, stack, location, userAgent, userId, timestamp, context } = req.body;

        // Log to server console (will appear in Render logs)
        const logMessage = {
            type: 'CLIENT_ERROR',
            timestamp: timestamp || new Date().toISOString(),
            location: location || 'unknown',
            message: message || 'Unknown error',
            error: error || null,
            stack: stack || null,
            userAgent: userAgent || req.headers['user-agent'] || 'unknown',
            userId: userId || null,
            context: context || null,
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
        };

        // Log to server console with structured format
        console.error('🔴 CLIENT ERROR:', JSON.stringify(logMessage, null, 2));

        // Also log stack trace if available
        if (stack) {
            console.error('Stack trace:', stack);
        }

        res.status(200).json({ success: true, logged: true });
    } catch (err) {
        // Don't fail if logging fails
        console.error('Error logging client error:', err);
        res.status(200).json({ success: true, logged: false });
    }
});

// Get leaderboard (Database-only, no JSON fallback)
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100; // Default to 100 for full leaderboard
        const timeframe = req.query.timeframe || 'all_time'; // 'all_time' or 'weekly'

        // Direct database query - no JSON storage involved
        if (timeframe === 'weekly') {
            const { getWeeklyLeaderboard } = await import('./database/userService.js');
            const leaderboard = await getWeeklyLeaderboard(limit);

            res.json({
                success: true,
                leaderboard: leaderboard.map(u => ({
                    id: u.id,
                    username: u.username || `User ${u.id?.substr(-4) || 'Unknown'}`,
                    walletAddress: u.walletAddress || null,
                    totalPoints: u.totalPoints || 0,
                    league: u.league || 'Bronze',
                    weeklyPoints: u.weeklyPoints || 0,
                    lastContributionDate: u.lastContributionDate || null
                })),
                timeframe
            });
        } else {
            // All-time leaderboard - query users table directly
            const { getAllUsers } = await import('./database/userService.js');
            const users = await getAllUsers(limit);

            const leaderboard = users.map(u => {
                // Ensure walletAddress is properly extracted
                const walletAddr = u.walletAddress || u.wallet_address || null;
                return {
                    id: u.id,
                    username: u.username || `User ${u.id?.substr(-4) || 'Unknown'}`,
                    walletAddress: walletAddr,
                    totalPoints: u.totalPoints || u.total_points || 0,
                    league: u.league || 'Bronze',
                    streak: u.streak || 0,
                    lastContributionDate: u.lastContributionDate || u.last_contribution_date || null
                };
            });

            res.json({
                success: true,
                leaderboard,
                timeframe
            });
        }
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// ===================
// ENTERPRISE ENDPOINTS
// ===================

// Get cohort statistics
router.get('/enterprise/cohorts', enterpriseRateLimit, verifyApiKey, (req, res) => {
    try {
        const stats = cohortService.getCohortStats();
        const allCohorts = cohortService.getAllCohorts();
        const compliantCohorts = cohortService.getCompliantCohorts();

        res.json({
            success: true,
            stats,
            cohorts: allCohorts,
            compliant_cohorts: compliantCohorts,
            k_threshold: cohortService.K_THRESHOLD
        });
    } catch (error) {
        console.error('Cohort stats error:', error);
        res.status(500).json({ error: 'Failed to fetch cohort statistics' });
    }
});

// Get consent ledger for audit
router.get('/enterprise/consent-ledger', enterpriseRateLimit, verifyApiKey, (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const stats = consentLedger.getConsentStats();
        const entries = consentLedger.exportForAudit(start_date, end_date);

        res.json({
            success: true,
            stats,
            entries,
            exported_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Consent ledger error:', error);
        res.status(500).json({ error: 'Failed to fetch consent ledger' });
    }
});

// Get sellable data in enterprise format (enhanced with database support)
router.get('/enterprise/dataset', enterpriseRateLimit, verifyApiKey, async (req, res) => {
    try {
        const {
            platform,
            format = 'json',
            limit = 1000,
            dataType,
            minOrders,
            minGMV,
            lifestyleSegment,
            cityCluster,
            startDate,
            endDate
        } = req.query;

        // Build filters object
        const filters = {
            dataType,
            minOrders: minOrders ? parseInt(minOrders) : null,
            minGMV: minGMV ? parseFloat(minGMV) : null,
            lifestyleSegment,
            cityCluster,
            startDate,
            endDate,
            limit: parseInt(limit)
        };

        // Remove null filters
        Object.keys(filters).forEach(key => filters[key] === null && delete filters[key]);

        // Use database export service if available
        const { exportContributionsJSON, exportContributionsCSV } = await import('./database/exportService.js');

        let contributions;
        let sellableRecords;

        if (format === 'csv') {
            const csv = await exportContributionsCSV(filters);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition',
                `attachment; filename="MYRAD_Dataset_${new Date().toISOString().split('T')[0]}.csv"`
            );
            return res.send(csv);
        }

        // Get contributions from database or JSON fallback
        contributions = await exportContributionsJSON(filters);

        // Filter to only contributions with sellable data
        sellableRecords = contributions
            .filter(c => c.sellable_data || c.sellableData)
            .map(c => c.sellable_data || c.sellableData);

        // Filter by platform if specified (legacy support)
        if (platform) {
            sellableRecords = sellableRecords.filter(r =>
                r.dataset_id?.includes(platform) || r.platform?.includes(platform)
            );
        }

        // Return in requested format
        if (format === 'jsonl') {
            res.setHeader('Content-Type', 'application/x-ndjson');
            res.setHeader('Content-Disposition',
                `attachment; filename="MYRAD_Dataset_${new Date().toISOString().split('T')[0]}.jsonl"`
            );
            return res.send(sellableRecords.map(r => JSON.stringify(r)).join('\n'));
        }

        res.json({
            success: true,
            dataset_info: {
                total_records: sellableRecords.length,
                platforms: [...new Set(sellableRecords.map(r => r.dataset_id || r.platform))],
                generated_at: new Date().toISOString(),
                format: 'myrad_v2'
            },
            records: sellableRecords
        });
    } catch (error) {
        console.error('Enterprise dataset error:', error);
        res.status(500).json({ error: 'Failed to generate dataset' });
    }
});

// Enhanced analytics export endpoint with filtering
router.get('/enterprise/export/analytics', enterpriseRateLimit, verifyApiKey, async (req, res) => {
    try {
        const {
            format = 'json',
            dataType,
            minOrders,
            minGMV,
            lifestyleSegment,
            cityCluster,
            startDate,
            endDate,
            limit,
            offset
        } = req.query;

        const filters = {};
        if (dataType) filters.dataType = dataType;
        if (minOrders) filters.minOrders = parseInt(minOrders);
        if (minGMV) filters.minGMV = parseFloat(minGMV);
        if (lifestyleSegment) filters.lifestyleSegment = lifestyleSegment;
        if (cityCluster) filters.cityCluster = cityCluster;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (limit) filters.limit = parseInt(limit);
        if (offset) filters.offset = parseInt(offset);

        const { exportContributionsJSON, exportContributionsCSV, getExportMetadata } = await import('./database/exportService.js');

        if (format === 'csv') {
            const csv = await exportContributionsCSV(filters);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition',
                `attachment; filename="MYRAD_Analytics_${new Date().toISOString().split('T')[0]}.csv"`
            );
            return res.send(csv);
        }

        const data = await exportContributionsJSON(filters);
        const metadata = await getExportMetadata(filters);

        res.json({
            success: true,
            metadata,
            data,
            count: data.length,
            exported_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Analytics export error:', error);
        res.status(500).json({ error: 'Failed to export analytics data' });
    }
});

// Get anonymized data (legacy endpoint)
router.get('/enterprise/data', enterpriseRateLimit, verifyApiKey, (req, res) => {
    try {
        const { limit, offset, dataType } = req.query;

        let data = jsonStorage.getAllAnonymizedData();

        // Filter by data type if specified
        if (dataType) {
            data = data.filter(d => d.dataType === dataType);
        }

        // Pagination
        const start = parseInt(offset) || 0;
        const end = start + (parseInt(limit) || 100);
        const paginatedData = data.slice(start, end);

        res.json({
            success: true,
            data: paginatedData,
            total: data.length,
            offset: start,
            limit: end - start
        });
    } catch (error) {
        console.error('Enterprise data error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Get aggregated insights
router.get('/enterprise/insights', enterpriseRateLimit, verifyApiKey, (req, res) => {
    try {
        const allData = jsonStorage.getAllAnonymizedData();
        const users = jsonStorage.getUsers();
        const allPoints = jsonStorage.getPoints();

        const insights = {
            totalContributions: allData.length,
            totalUsers: users.length,
            averagePointsPerUser: users.length > 0
                ? Math.round(allPoints.reduce((sum, p) => sum + p.points, 0) / users.length)
                : 0,
            dataTypeBreakdown: {},
            recentActivity: {
                last24Hours: allData.filter(d =>
                    new Date(d.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length,
                last7Days: allData.filter(d =>
                    new Date(d.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
            }
        };

        // Calculate data type breakdown
        allData.forEach(d => {
            insights.dataTypeBreakdown[d.dataType] =
                (insights.dataTypeBreakdown[d.dataType] || 0) + 1;
        });

        res.json({
            success: true,
            insights
        });
    } catch (error) {
        console.error('Enterprise insights error:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

// Generate API key (admin endpoint - protected by ADMIN_SECRET)
const apiKeyGenerationRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Only 5 API key generations per hour
    message: 'Too many API key generation attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/enterprise/keys', apiKeyGenerationRateLimit, (req, res) => {
    try {
        const { name, adminSecret } = req.body;

        // Admin authentication required
        if (!process.env.ADMIN_SECRET) {
            console.error('❌ ADMIN_SECRET not configured - API key generation disabled');
            return res.status(503).json({
                error: 'API key generation is not configured',
                message: 'Admin secret not set on server'
            });
        }

        if (adminSecret !== process.env.ADMIN_SECRET) {
            console.warn(`⚠️  Failed admin secret attempt from IP: ${req.ip}`);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid admin secret'
            });
        }

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const apiKey = jsonStorage.generateApiKey(name);

        res.json({
            success: true,
            apiKey: {
                id: apiKey.id,
                key: apiKey.key,
                name: apiKey.name,
                createdAt: apiKey.createdAt
            },
            message: 'API key generated successfully. Store it securely - it will not be shown again.'
        });
    } catch (error) {
        console.error('Generate API key error:', error);
        res.status(500).json({ error: 'Failed to generate API key' });
    }
});

// ===================
// CONTACT FORM ENDPOINT
// ===================

// Submit contact form inquiry
router.post('/contact', (req, res) => {
    try {
        const { name, company, email, industry, message } = req.body;

        if (!name || !email || !company) {
            return res.status(400).json({ error: 'Name, company, and email are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const inquiry = {
            id: Date.now().toString(),
            name,
            company,
            email,
            industry: industry || 'Not specified',
            message: message || '',
            createdAt: new Date().toISOString(),
            status: 'new'
        };

        // Store inquiry using jsonStorage pattern
        const fs = require('fs');
        const path = require('path');
        const INQUIRIES_FILE = path.join(__dirname, 'data', 'inquiries.json');

        let inquiries = [];
        if (fs.existsSync(INQUIRIES_FILE)) {
            try {
                inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
            } catch (e) {
                inquiries = [];
            }
        }

        inquiries.push(inquiry);
        fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));

        console.log('📬 New contact inquiry:', { name, company, email, industry });

        res.json({
            success: true,
            message: 'Your inquiry has been received. We will get back to you within 1-2 business days.',
            inquiryId: inquiry.id
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

// ===================
// RECLAIM CALLBACK ENDPOINT (for mobile deep-link reliability)
// ===================
// This endpoint receives POST data from Reclaim app after verification
// and redirects the user back to the dashboard with proof data in URL hash
// Temporary storage for proofs received via callback (TTL: 5 minutes)
const pendingProofs = new Map();
const PROOF_TTL = 5 * 60 * 1000; // 5 minutes

// Clean up old proofs periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of pendingProofs.entries()) {
        if (now - value.timestamp > PROOF_TTL) {
            pendingProofs.delete(key);
        }
    }
}, 60 * 1000); // Check every minute

router.post('/reclaim-callback', async (req, res) => {
    // CRITICAL: Set a response timeout to ensure we ALWAYS respond to Reclaim app
    // The Reclaim app will show an error if it doesn't get a response within ~10 seconds
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            console.error('⚠️ Callback timeout - sending 200 response to prevent app error');
            const fallbackSessionId = req.query?.sessionId || req.query?.sessionld || `timeout_${Date.now()}`;
            res.status(200).json({ 
                success: true, 
                sessionId: fallbackSessionId,
                message: 'Proof received',
                warning: 'Response delayed but proof was received'
            });
        }
    }, 8000); // 8 second timeout (Reclaim app times out around 10 seconds)

    try {
        console.log('📲 Reclaim callback received at /api/reclaim-callback');
        console.log('📲 Query params:', JSON.stringify(req.query));
        console.log('📲 Request method:', req.method);
        console.log('📲 Content-Type:', req.headers['content-type']);

        // Get the user's session ID from query parameter (passed by frontend when setting callback URL)
        // Handle both sessionId and sessionld (typo in some cases)
        const userSessionId = req.query.sessionId || req.query.sessionld;
        console.log('📲 User session ID from query:', userSessionId);
        console.log('📲 Raw body available:', !!req.rawBody);
        console.log('📲 Raw body length:', req.rawBody?.length || 0);

        // Parse the proof data - prefer raw body to avoid depth truncation
        let proofData = null;
        let extractedIdentifier = null;

        // FIRST: Try to use the raw body (captured before body parsers could truncate it)
        if (req.rawBody && req.rawBody.length > 0) {
            console.log('📲 Using raw body for parsing (avoids depth truncation)');
            // Raw body is URL-encoded, decode it first
            // Use try-catch to handle malformed encoding
            let decoded;
            try {
                decoded = decodeURIComponent(req.rawBody);
            } catch (decodeError) {
                console.warn('⚠️ Failed to decode raw body, using as-is:', decodeError.message);
                decoded = req.rawBody;
            }
            console.log('📲 Decoded raw body length:', decoded.length);

            // Instead of trying to reconstruct the malformed object structure,
            // store the entire decoded string as a single key for the frontend to parse
            // This preserves ALL the data without splitting on = signs
            proofData = { _rawProofString: decoded };

            // Extract identifier using regex from the full string
            const identifierMatch = decoded.match(/"identifier"\s*:\s*"(0x[a-fA-F0-9]+)"/);
            if (identifierMatch) {
                extractedIdentifier = identifierMatch[1];
                console.log('📲 Extracted identifier from raw body:', extractedIdentifier);
            }

            console.log('📲 Stored raw proof string, length:', decoded.length);
        }

        // FALLBACK: Use parsed body if raw body didn't work
        if (!proofData || Object.keys(proofData).length === 0) {
            console.log('📲 Falling back to parsed body');
            proofData = req.body;

            // Try to extract the identifier from the first key if it looks like JSON
            if (typeof req.body === 'object' && !Array.isArray(req.body)) {
                const bodyKeys = Object.keys(req.body);
                if (bodyKeys.length > 0) {
                    const firstKey = bodyKeys[0];

                    // Try to parse the first key as JSON to get the identifier
                    if (firstKey.startsWith('{')) {
                        try {
                            const parsed = JSON.parse(firstKey);
                            if (parsed.identifier) {
                                extractedIdentifier = parsed.identifier;
                                proofData = parsed;
                                console.log('📲 Parsed proof from form-urlencoded key, identifier:', extractedIdentifier);
                            }
                        } catch (e) {
                            // Try to extract identifier using regex from the raw key
                            const identifierMatch = firstKey.match(/"identifier"\s*:\s*"(0x[a-fA-F0-9]+)"/);
                            if (identifierMatch) {
                                extractedIdentifier = identifierMatch[1];
                                console.log('📲 Extracted identifier via regex:', extractedIdentifier);
                            }
                            console.log('📲 Keeping body for frontend parsing');
                        }
                    }
                }
            }
        }

        // Handle case where body is a string
        if (typeof proofData === 'string') {
            try {
                const parsed = JSON.parse(proofData);
                proofData = parsed;
                if (parsed.identifier) {
                    extractedIdentifier = parsed.identifier;
                }
            } catch (e) {
                // Try regex extraction
                const identifierMatch = proofData.match(/"identifier"\s*:\s*"(0x[a-fA-F0-9]+)"/);
                if (identifierMatch) {
                    extractedIdentifier = identifierMatch[1];
                }
                console.log('📲 Failed to parse string body as JSON');
            }
        }

        // Use user's session ID (most reliable), then extracted identifier, then fallback
        const proof = Array.isArray(proofData) ? proofData[0] : proofData;
        const sessionId = userSessionId || extractedIdentifier || proof?.identifier || `proof_${Date.now()}`;

        console.log('📲 Final sessionId:', sessionId);

        // Store the proof for frontend to fetch - keyed by the user's session ID
        // Use safe stringify to handle circular references or very large objects
        let proofDataStr = '';
        try {
            proofDataStr = JSON.stringify(proofData);
            console.log('📲 STORING proofData type:', typeof proofData);
            console.log('📲 STORING proofData keys:', Object.keys(proofData || {}));
            console.log('📲 STORING proofData length:', proofDataStr.length);
            console.log('📲 STORING proofData sample (first 1000 chars):', proofDataStr.substring(0, 1000));
        } catch (stringifyError) {
            console.warn('⚠️ Failed to stringify proofData (might have circular refs):', stringifyError.message);
            // Store as-is even if stringify fails
            proofDataStr = '[Unable to stringify - stored as object]';
        }

        // Store the proof - wrap in try-catch in case storage fails
        try {
            pendingProofs.set(sessionId, {
                proof: proofData,
                timestamp: Date.now()
            });
            console.log('📲 Stored proof with sessionId:', sessionId);
            console.log('📲 Pending proofs count:', pendingProofs.size);
        } catch (storageError) {
            console.error('❌ Failed to store proof in memory:', storageError);
            // Continue anyway - we'll still return success
        }

        // Return success IMMEDIATELY - the Reclaim app just needs a 200 response
        // Don't wait for anything else - respond as fast as possible
        clearTimeout(timeout);
        if (!res.headersSent) {
            res.status(200).json({
                success: true,
                sessionId,
                message: 'Proof received and stored'
            });
            console.log('✅ Response sent to Reclaim app');
        } else {
            console.warn('⚠️ Response already sent, skipping');
        }
    } catch (error) {
        clearTimeout(timeout);
        console.error('❌ Reclaim callback error:', error);
        console.error('❌ Error stack:', error.stack);
        
        // CRITICAL: Always return 200 to Reclaim app, even on error
        // The Reclaim app will show an error if it gets anything other than 200
        // We'll log the error but still return success so the app doesn't fail
        if (!res.headersSent) {
            const fallbackSessionId = req.query?.sessionId || req.query?.sessionld || `error_${Date.now()}`;
            console.log('📲 Returning 200 to Reclaim app despite error (to prevent app error)');
            res.status(200).json({ 
                success: true, 
                sessionId: fallbackSessionId,
                message: 'Proof received',
                warning: 'Processing encountered issues but proof was received'
            });
        }
    }
});

// Endpoint for frontend to fetch stored proof
router.get('/reclaim-proof/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const stored = pendingProofs.get(sessionId);

    if (stored) {
        // Delete after fetching (one-time use)
        pendingProofs.delete(sessionId);
        const proofStr = JSON.stringify(stored.proof);
        console.log('📲 FETCHING proof for sessionId:', sessionId);
        console.log('📲 FETCHING proof type:', typeof stored.proof);
        console.log('📲 FETCHING proof keys:', Object.keys(stored.proof || {}));
        console.log('📲 FETCHING proof length:', proofStr.length);
        console.log('📲 FETCHING proof sample (first 1000 chars):', proofStr.substring(0, 1000));
        res.json({ success: true, proof: stored.proof });
    } else {
        console.log('📲 Proof NOT FOUND for sessionId:', sessionId);
        res.status(404).json({ success: false, error: 'Proof not found or expired' });
    }
});

// Endpoint to list pending proof session IDs (for polling)
router.get('/reclaim-proofs/pending', (req, res) => {
    const sessionIds = Array.from(pendingProofs.keys());
    res.json({ success: true, sessionIds, count: sessionIds.length });
});

// Also handle GET for when user manually visits the callback URL
router.get('/reclaim-callback', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.myradhq.xyz';
    res.redirect(302, `${frontendUrl}/dashboard`);
});

// ============================================
// OPT-OUT ENDPOINTS
// ============================================

// Get user's opt-out status
router.get('/user/opt-out-status', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { getUserOptOutStatus } = await import('./database/contributionService.js');
        const status = await getUserOptOutStatus(user.id);

        res.json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('Get opt-out status error:', error);
        res.status(500).json({ error: 'Failed to get opt-out status' });
    }
});

// Process user opt-out
router.post('/user/opt-out', verifyPrivyToken, async (req, res) => {
    try {
        const user = await jsonStorage.getUserByPrivyId(req.user.privyId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`🚫 Opt-out request received for user ${user.id}`);

        const { optOutUser } = await import('./database/contributionService.js');
        const result = await optOutUser(user.id);

        res.json({
            success: true,
            message: 'Successfully opted out. Your data contributions have been excluded from the marketplace and your points have been reset.',
            ...result
        });
    } catch (error) {
        console.error('Opt-out error:', error);
        res.status(500).json({ 
            error: 'Failed to process opt-out request',
            message: error.message 
        });
    }
});

export default router;

