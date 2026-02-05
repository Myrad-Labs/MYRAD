import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root (2 levels up from backend/config.js)
const rootEnvPath = path.join(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  // Fallback: try current directory (for when running from root)
  dotenv.config();
}

const DEFAULT_RPC_URL = "https://sepolia.base.org";
const RPC_URL = process.env.BASE_RPC_URL || DEFAULT_RPC_URL;

export default {
  RPC: RPC_URL,
  RPC_URLS: [RPC_URL], // Keep array format for compatibility
  PORT: process.env.PORT || 4000,
  DOWNLOAD_SECRET: process.env.DOWNLOAD_SECRET || "secret",
  DB_FILE: path.join(__dirname, "db.json"),
  DATASETS_FILE: path.join(__dirname, "../datasets.json"),
  MAX_BLOCK_RANGE: parseInt(process.env.MAX_BLOCK_RANGE) || 10, // Free tier RPC limit
  // PostgreSQL Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  DB_USE_DATABASE: process.env.DB_USE_DATABASE !== 'false', // Enable DB by default, disable with DB_USE_DATABASE=false
  
  // JSON File Storage Configuration
  // DATABASE-ONLY MODE: JSON storage is disabled by default
  // Set JSON_STORAGE_ENABLED=true only for development/backup purposes
  JSON_STORAGE_ENABLED: process.env.JSON_STORAGE_ENABLED === 'true', // Disabled by default - database is primary
};