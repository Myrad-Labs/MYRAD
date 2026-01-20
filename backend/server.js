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

// Handle OPTIONS preflight requests explicitly (before any redirects)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// Enable CORS for all origins
app.use(cors({
  origin: ['https://myradhq.xyz', 'https://www.myradhq.xyz', 'http://localhost:5173', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: false
}));

// Capture raw body for Reclaim callback BEFORE body parsers can truncate it
// This middleware runs only for the reclaim-callback endpoint
app.use('/api/reclaim-callback', (req, res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
        req.rawBody = data;
        next();
    });
});

// Body parsers with very generous limits for Reclaim proofs
// Reclaim SDK sends proofs as deeply nested JSON-as-keys structures
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ 
    limit: "50mb", 
    extended: true, 
    parameterLimit: 100000,
    depth: 100,  // Depth limit for urlencoded - raw body fallback handles deeper proofs
}));
app.use(express.text({ limit: "50mb", type: 'text/plain' }));

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

// Handle Reclaim callback at /dashboard (fallback for when Reclaim app POSTs to dashboard instead of /api/reclaim-callback)
// This happens when Reclaim SDK uses page URL as callback instead of configured callback URL
app.post("/dashboard", async (req, res) => {
  console.log('📲 Reclaim callback received at /dashboard (fallback route)');
  console.log('📲 Request details:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    referer: req.headers.referer,
    bodyKeys: Object.keys(req.body || {})
  });
  
  try {
    // The Reclaim app POSTs proof data here
    const proofData = req.body;
    
    // Encode the proof data to pass via URL (base64 to avoid URL encoding issues)
    const encodedProof = Buffer.from(JSON.stringify(proofData)).toString('base64');
    
    // Redirect to dashboard with proof data in fragment (not sent to server, only client)
    // Using fragment (#) so it's only visible to the frontend JavaScript
    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'https://www.myradhq.xyz';
    const redirectUrl = `${frontendUrl}/dashboard#reclaim_proof=${encodedProof}`;
    
    console.log('✅ Redirecting to dashboard with proof data:', redirectUrl);
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('Reclaim callback error at /dashboard:', error);
    // Even on error, redirect to dashboard (frontend will handle missing data)
    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'https://www.myradhq.xyz';
    res.redirect(302, `${frontendUrl}/dashboard#reclaim_error=true`);
  }
});

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

// Global error handler - ensures JSON responses instead of HTML error pages
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.message);
  console.error('Error stack:', err.stack);
  
  // For Reclaim callbacks, always return 200 to prevent the Reclaim app from showing errors
  if (req.path.includes('reclaim-callback')) {
    console.log('📲 Error in Reclaim callback, returning success to prevent app error');
    const sessionId = req.query.sessionId || `error_${Date.now()}`;
    return res.status(200).json({ 
      success: true, 
      sessionId,
      message: 'Proof received',
      warning: 'Processing had issues'
    });
  }
  
  // For other routes, return proper JSON error
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    path: req.path
  });
});

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
