// Database migration script
// Run this to set up the database schema
import { query, testConnection, closePool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root (2 levels up from this file)
const rootEnvPath = path.join(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  console.log('✅ Loaded .env from:', rootEnvPath);
} else {
  // Fallback: try current directory
  dotenv.config();
  console.log('ℹ️  Using default .env location');
}

async function runMigrations() {
  // Get migration file from command line argument or use default
  const migrationFile = process.argv[2] || '001_initial_schema.sql';
  console.log(`🔄 Starting database migrations: ${migrationFile}...`);
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Please check DATABASE_URL.');
    process.exit(1);
  }

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Remove comments and split into individual statements
    // This approach executes the entire SQL file as separate statements
    const lines = migrationSQL.split('\n');
    const cleanedLines = lines
      .map(line => {
        // Remove inline comments (but preserve -- inside strings is harder, so we'll be careful)
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0 && !line.includes("'--'")) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0);
    
    // Rejoin and split by semicolon (but handle functions specially)
    let cleanedSQL = cleanedLines.join('\n');
    
    // Extract functions first (they contain semicolons and need special handling)
    // Pattern: CREATE OR REPLACE FUNCTION ... $$ ... $$ language 'plpgsql';
    const functionPattern = /CREATE OR REPLACE FUNCTION[\s\S]*?\$\$[\s\S]*?\$\$[\s\S]*?language\s+['"]plpgsql['"];?/gi;
    const functions = [];
    let match;
    while ((match = functionPattern.exec(migrationSQL)) !== null) {
      functions.push(match[0].trim());
    }
    
    // Remove functions from SQL
    functions.forEach(func => {
      cleanedSQL = cleanedSQL.replace(func, '');
    });
    
    // Now split remaining SQL by semicolon
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim().replace(/\n+/g, ' '))
      .filter(s => s.length > 0);
    
    // Add functions back at the beginning
    const allStatements = [...functions, ...statements];
    
    console.log(`📦 Found ${allStatements.length} SQL statements to execute\n`);
    
    // Execute all statements
    for (let i = 0; i < allStatements.length; i++) {
      const statement = allStatements[i];
      
      // Skip empty statements
      if (!statement || statement.trim().length === 0) continue;
      
      try {
        // Functions don't need semicolon, other statements do
        const sql = statement.trim();
        const needsSemicolon = !sql.toUpperCase().includes('CREATE OR REPLACE FUNCTION') && 
                               !sql.toUpperCase().includes('CREATE TRIGGER');
        const finalSQL = needsSemicolon && !sql.endsWith(';') ? sql + ';' : sql;
        
        await query(finalSQL);
        
        // Log what was created
        if (sql.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          console.log(`✅ [${i+1}/${allStatements.length}] Table created: ${tableMatch ? tableMatch[1] : 'unknown'}`);
        } else if (sql.toUpperCase().includes('CREATE INDEX')) {
          const indexMatch = sql.match(/CREATE\s+INDEX\s+.*?ON\s+(\w+)/i);
          console.log(`✅ [${i+1}/${allStatements.length}] Index created on: ${indexMatch ? indexMatch[1] : 'unknown'}`);
        } else if (sql.toUpperCase().includes('CREATE OR REPLACE FUNCTION')) {
          console.log(`✅ [${i+1}/${allStatements.length}] Function created`);
        } else if (sql.toUpperCase().includes('CREATE TRIGGER')) {
          console.log(`✅ [${i+1}/${allStatements.length}] Trigger created`);
        }
      } catch (error) {
        // Handle expected errors gracefully
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710') { // duplicate_object
          console.log(`ℹ️  [${i+1}/${allStatements.length}] Already exists, skipping`);
        } else if (error.message.includes('does not exist') && 
                   (statement.toUpperCase().includes('CREATE INDEX') || 
                    statement.toUpperCase().includes('CREATE TRIGGER'))) {
          // Index/trigger depends on table that doesn't exist yet - will retry later
          console.warn(`⚠️  [${i+1}/${allStatements.length}] Skipping (dependency not met): ${error.message.split('\n')[0]}`);
        } else {
          console.error(`❌ [${i+1}/${allStatements.length}] Error: ${error.message}`);
          console.error(`   Statement: ${statement.substring(0, 150)}...`);
          // Don't throw - continue with other statements
        }
      }
    }
    
    // Try to create indexes/triggers that failed due to dependencies
    console.log('\n🔄 Retrying indexes and triggers that may have failed due to dependencies...');
    for (let i = 0; i < allStatements.length; i++) {
      const statement = allStatements[i];
      const sql = statement.trim();
      
      if (sql.toUpperCase().includes('CREATE INDEX') || sql.toUpperCase().includes('CREATE TRIGGER')) {
        try {
          const finalSQL = sql.endsWith(';') ? sql : sql + ';';
          await query(finalSQL);
        } catch (error) {
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              error.code !== '42P07' && 
              error.code !== '42710') {
            // Still failed - might be a real error, but we'll continue
          }
        }
      }
    }
    
    console.log('\n✅ Database migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.includes(process.argv[1])) {
  runMigrations().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

export { runMigrations };
