// Simple JSON file storage helper
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

// File paths
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POINTS_FILE = path.join(DATA_DIR, 'points.json');
const CONTRIBUTIONS_FILE = path.join(DATA_DIR, 'contributions.json');
const API_KEYS_FILE = path.join(DATA_DIR, 'api_keys.json');

// Initialize files if they don't exist
const initFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

initFile(USERS_FILE, []);
initFile(POINTS_FILE, []);
initFile(CONTRIBUTIONS_FILE, []);
initFile(API_KEYS_FILE, []);

// Read JSON file
const readJSON = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Write JSON file
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// Users
export const getUsers = () => readJSON(USERS_FILE);
export const saveUsers = (users) => writeJSON(USERS_FILE, users);

export const getUserByPrivyId = (privyId) => {
    const users = getUsers();
    return users.find(u => u.privyId === privyId);
};

export const createUser = (privyId, email) => {
    const users = getUsers();
    const newUser = {
        id: Date.now().toString(),
        privyId,
        email,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        totalPoints: 100 // Signup bonus
    };
    users.push(newUser);
    saveUsers(users);

    // Award signup points
    addPoints(newUser.id, 100, 'signup_bonus');

    return newUser;
};

export const updateUserActivity = (userId) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].lastActiveAt = new Date().toISOString();
        saveUsers(users);
    }
};

// Points
export const getPoints = () => readJSON(POINTS_FILE);
export const savePoints = (points) => writeJSON(POINTS_FILE, points);

export const getUserPoints = (userId) => {
    const points = getPoints();
    return points.filter(p => p.userId === userId);
};

export const getUserTotalPoints = (userId) => {
    const userPoints = getUserPoints(userId);
    return userPoints.reduce((sum, p) => sum + p.points, 0);
};

export const addPoints = (userId, points, reason) => {
    const pointsData = getPoints();
    const newEntry = {
        id: Date.now().toString(),
        userId,
        points,
        reason,
        createdAt: new Date().toISOString()
    };
    pointsData.push(newEntry);
    savePoints(pointsData);

    // Update user's total points
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].totalPoints = getUserTotalPoints(userId);
        saveUsers(users);
    }

    return newEntry;
};

export const getLeaderboard = (limit = 10) => {
    const users = getUsers();
    return users
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, limit)
        .map(u => ({
            id: u.id,
            email: u.email,
            totalPoints: u.totalPoints || 0,
            createdAt: u.createdAt
        }));
};

// Contributions
export const getContributions = () => readJSON(CONTRIBUTIONS_FILE);
export const saveContributions = (contributions) => writeJSON(CONTRIBUTIONS_FILE, contributions);

export const getUserContributions = (userId) => {
    const contributions = getContributions();
    return contributions.filter(c => c.userId === userId);
};

// Alias for compatibility
export const getContributionsByUserId = getUserContributions;

// Get cohort size for k-anonymity compliance
export const getCohortSize = (cohortId) => {
    const contributions = getContributions();
    return contributions.filter(c =>
        c.sellableData?.audience_segment?.segment_id === cohortId
    ).length;
};

// Get all unique cohorts with their sizes
export const getCohortSizes = () => {
    const contributions = getContributions();
    const cohortCounts = {};

    contributions.forEach(c => {
        const cohortId = c.sellableData?.audience_segment?.segment_id;
        if (cohortId) {
            cohortCounts[cohortId] = (cohortCounts[cohortId] || 0) + 1;
        }
    });

    return cohortCounts;
};

export const addContribution = (userId, data) => {
    const contributions = getContributions();
    const newContribution = {
        id: Date.now().toString(),
        userId,
        data: data.anonymizedData,
        sellableData: data.sellableData || null,  // Enterprise-ready format
        behavioralInsights: data.behavioralInsights || null,
        dataType: data.dataType || 'general',
        reclaimProofId: data.reclaimProofId || null,
        processingMethod: data.processingMethod || 'raw',
        status: 'verified',
        createdAt: new Date().toISOString()
    };
    contributions.push(newContribution);
    saveContributions(contributions);

    // Award points for contribution
    addPoints(userId, 500, 'data_contribution');

    return newContribution;
};

// Get all anonymized data for enterprise API
export const getAllAnonymizedData = () => {
    const contributions = getContributions();
    return contributions.map(c => ({
        id: c.id,
        data: c.data,
        dataType: c.dataType,
        timestamp: c.createdAt,
        status: c.status
    }));
};

// API Keys
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
        // Update last used timestamp
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
