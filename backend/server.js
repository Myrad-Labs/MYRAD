import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";
import mvpRoutes from "./mvpRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { PORT } = config;

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: ['https://myradhq.xyz', 'https://www.myradhq.xyz', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: false
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static frontend files from 'dist' folder (production build)
app.use(express.static(path.join(__dirname, "../dist")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

// MVP API Routes
app.use("/api", mvpRoutes);

// Serve frontend for all other routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Test database connection on startup (if enabled)
if (config.DB_USE_DATABASE && config.DATABASE_URL) {
  import('./database/db.js').then(({ testConnection }) => {
    testConnection().catch(err => {
      console.warn('⚠️  Database connection test failed (continuing without DB):', err.message);
    });
  }).catch(err => {
    console.warn('⚠️  Could not load database module:', err.message);
  });
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 MYRAD Backend API listening at http://localhost:${PORT}`);
  console.log(`📊 MVP Routes: /api/*`);
  console.log(`🏥 Health check: /health`);
  if (config.DB_USE_DATABASE && config.DATABASE_URL) {
    console.log(`🗄️  Database: Enabled (PostgreSQL)`);
  } else {
    console.log(`🗄️  Database: Disabled (JSON storage only)`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
