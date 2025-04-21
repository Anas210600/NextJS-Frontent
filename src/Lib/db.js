// src/lib/db.js
import sql from 'mssql';

const useWindowsAuth = process.env.DB_WINDOWS_AUTH === 'true';

// Base configuration
const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

// Conditionally add authentication options
if (useWindowsAuth) {
  console.log("Configuring DB connection for Windows Authentication");
  config.options.integratedSecurity = true; // Use integrated security
  // Alternatively, some drivers might use 'trustedConnection: true'
  // config.options.trustedConnection = true; // Check mssql docs if integratedSecurity doesn't work
} else {
   console.log("Configuring DB connection with SQL Login");
   // Ensure user/password are provided if not using Windows Auth
   if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
       console.error("DB_USER and DB_PASSWORD must be set in .env.local when not using Windows Authentication!");
       // Optionally throw an error here to prevent startup without credentials
   }
   config.user = process.env.DB_USER;
   config.password = process.env.DB_PASSWORD;
}


let pool = null;

export async function getDbPool() {
  if (!pool) {
    try {
      console.log("Creating new DB connection pool...");
      pool = await sql.connect(config); // Use the updated config object
      console.log("DB Connection Pool Created.");
      // Optional: Add listener for errors on the pool
      pool.on('error', err => {
        console.error('Database Pool Error:', err);
        // Attempt to reset pool on critical errors? Depends on error type.
        pool = null;
      });
    } catch (err) {
      console.error('Database Connection Failed on Startup:', err);
      pool = null;
      throw err; // Re-throw error
    }
  } else {
     // Basic check if pool seems usable (might need more robust checks)
     if (pool.connected === false || pool.connecting === true) {
         console.warn("DB Pool seems disconnected or connecting, attempting to reset...");
         try {
             await pool.close(); // Attempt to close gracefully
         } catch (closeErr) {
             console.error("Error closing potentially broken pool:", closeErr);
         }
         pool = null; // Force recreation on next call
         return getDbPool(); // Retry connection immediately
     }
     console.log("Reusing existing DB connection pool.");
  }
  return pool;
}