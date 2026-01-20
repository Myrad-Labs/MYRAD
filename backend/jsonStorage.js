// Database-first storage helper
// All user, points, and contribution data is stored in PostgreSQL database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// API Keys file (still using JSON for simplicity)
const API_KEYS_FILE = path.join(DATA_DIR, 'api_keys.json');

// Initialize API keys file if it doesn't exist
if (!fs.existsSync(API_KEYS_FILE)) {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify([], null, 2));
}

// Read JSON file (for API keys only)
const readJSON = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data || data.trim() === '') {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof SyntaxError && fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
                fs.writeFileSync(filePath, JSON.stringify([], null, 2));
                return [];
            }
        }
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 0) {
                console.error(`Error reading ${filePath}:`, error.message);
            }
        }
        return [];
    }
};

// Write JSON file (for API keys only)
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// Users & Points - Database-only
let userService = null;
const getUserService = async () => {
    if (!userService) {
        userService = await import('./database/userService.js');
    }
    return userService;
};

export const isUsernameAvailable = async (username) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.isUsernameAvailable(username);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getUserByPrivyId = async (privyId) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.getUserByPrivyId(privyId);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getUserById = async (userId) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.getUserById(userId);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const createUser = async (privyId, email, walletAddress = null) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.createUser(privyId, email, walletAddress);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const updateUserWallet = async (userId, walletAddress) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.updateUserWallet(userId, walletAddress);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const updateUserActivity = async (userId) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        await service.updateUserActivity(userId);
        return;
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const updateUserProfile = async (userId, updates) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.updateUserProfile(userId, updates);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getUserPoints = async (userId) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.getUserPoints(userId);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getUserTotalPoints = async (userId) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.getUserTotalPoints(userId);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const addPoints = async (userId, points, reason) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.addPoints(userId, points, reason);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getLeaderboard = async (limit = 10) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        const users = await service.getAllUsers();
        return users
            .slice(0, limit)
            .map(u => ({
                id: u.id,
                email: u.email,
                username: u.username || `User ${u.id.substr(-4)}`,
                walletAddress: u.walletAddress || null,
                totalPoints: u.totalPoints || 0,
                league: u.league || 'Bronze',
                streak: u.streak || 0,
                createdAt: u.createdAt
            }));
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getWeeklyLeaderboard = async (limit = 10) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const service = await getUserService();
        return await service.getWeeklyLeaderboard(limit);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

// Contributions - Database-only
export const getUserContributions = async (userId) => {
    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        const { getUserContributions: dbGetUserContributions } = await import('./database/contributionService.js');
        return await dbGetUserContributions(userId);
    }
    throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
};

export const getContributionsByUserId = getUserContributions;

export const addContribution = async (userId, data) => {
    const dataType = data.dataType || 'general';
    const newContribution = {
        id: Date.now().toString(),
        userId,
        data: data.anonymizedData,
        sellableData: data.sellableData || null,
        behavioralInsights: data.behavioralInsights || null,
        dataType,
        reclaimProofId: data.reclaimProofId || null,
        processingMethod: data.processingMethod || 'raw',
        status: 'verified',
        createdAt: new Date().toISOString(),
        walletAddress: data.walletAddress || null
    };

    const config = await import('./config.js');
    if (config.default.DB_USE_DATABASE && config.default.DATABASE_URL) {
        try {
            const { saveContribution } = await import('./database/contributionService.js');
            const result = await saveContribution(newContribution);
            
            // Check if it's a duplicate rejection
            if (result?.isDuplicate) {
                // Return the duplicate info so mvpRoutes can handle it
                return {
                    ...newContribution,
                    isDuplicate: true,
                    existingId: result.existingId,
                    message: result.message
                };
            }
            
            if (!result?.success) {
                throw new Error('Database save failed');
            }
        } catch (dbError) {
            console.error('❌ Failed to save to database:', dbError.message);
            throw new Error('Failed to save contribution to database');
        }
    } else {
        throw new Error('Database is required but not configured. Set DATABASE_URL environment variable.');
    }

    return newContribution;
};

// API Keys (still using JSON for simplicity)
export const getApiKeys = () => readJSON(API_KEYS_FILE);
export const saveApiKeys = (keys) => writeJSON(API_KEYS_FILE, keys);

export const generateApiKey = (name) => {
    const keys = getApiKeys();
    const newKey = {
        id: Date.now().toString(),
        key: `myrad_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        name,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        isActive: true
    };
    keys.push(newKey);
    saveApiKeys(keys);
    return newKey;
};

export const validateApiKey = (key) => {
    const keys = getApiKeys();
    const apiKey = keys.find(k => k.key === key && k.isActive);

    if (apiKey) {
        const keyIndex = keys.findIndex(k => k.key === key);
        keys[keyIndex].lastUsedAt = new Date().toISOString();
        saveApiKeys(keys);
    }

    return !!apiKey;
};

export const updateApiKeyUsage = (key) => {
    const keys = getApiKeys();
    const keyIndex = keys.findIndex(k => k.key === key);
    if (keyIndex !== -1) {
        keys[keyIndex].lastUsedAt = new Date().toISOString();
        saveApiKeys(keys);
    }
};
