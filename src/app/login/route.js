// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'; // Next.js response utility
import bcrypt from 'bcrypt';                 // For comparing password hashes
import jwt from 'jsonwebtoken';              // For creating session tokens (JWT)
import { serialize } from 'cookie';          // For creating the Set-Cookie header string
import sql from 'mssql';                     // Import sql types if needed directly
import { getDbPool } from '@/lib/db';        // Utility to get DB connection pool

// Environment variables (ensure these are set in .env.local)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day if not set
const COOKIE_NAME = 'authToken'; // Consistent name for your session cookie

// Define the POST handler for the /api/auth/login route
export async function POST(request) {
  console.log("--- LOGIN API ROUTE HIT ---"); // Log that the route was reached

  // 1. Check if JWT_SECRET is configured (critical for security)
  if (!JWT_SECRET) {
      console.error("FATAL: JWT_SECRET environment variable is not set!");
      // Return a generic server error without revealing details
      return NextResponse.json({ message: 'Server configuration error. Please contact administrator.' }, { status: 500 });
  }

  try {
    // 2. Parse the request body to get email and password
    const { email, password } = await request.json();
    console.log("Login attempt for email:", email); // Don't log password

    // 3. Basic Input Validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 }); // Bad Request
    }

    // 4. Get Database Connection Pool
    console.log("Attempting to get DB pool...");
    const pool = await getDbPool();
    console.log("DB pool acquired.");

    // 5. Find User by Email in the Database
    console.log(`Querying database for user: ${email}`);
    const userResult = await pool.request()
      // Use parameterized query to prevent SQL injection
      .input('Email', sql.NVarChar, email.trim().toLowerCase()) // Use consistent casing
      // Select necessary fields, including the PasswordHash for comparison
      .query('SELECT UserID, Name, Email, PasswordHash FROM Users WHERE Email = @Email');

    // 6. Check if User Exists
    if (userResult.recordset.length === 0) {
      console.log(`Login failed: User not found for email ${email}`);
      // Return a generic message for security (don't reveal if email exists)
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // 7. User Found - Compare Password Hashes
    const user = userResult.recordset[0];
    console.log(`User found (ID: ${user.UserID}), comparing password...`);
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash); // Compare plain password with stored hash

    // 8. Check if Password is Valid
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for email ${email}`);
      // Return the same generic message for security
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // --- Password is Valid - Authentication Successful ---
    console.log(`Password valid for user: ${email}`);

    // 9. Create JWT Payload (data to store in the token)
    // Only include non-sensitive information needed for session identification/display
    const tokenPayload = {
      userId: user.UserID,
      email: user.Email,
      name: user.Name,
      // Example: Add roles if you have them: roles: ['user']
    };
    console.log("Creating JWT with payload:", tokenPayload);

    // 10. Sign the JWT
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN, // Set token expiration
    });
    console.log("JWT created successfully.");

    // 11. Serialize the Cookie for the Set-Cookie Header
    const cookie = serialize(COOKIE_NAME, token, {
      httpOnly: true, // Cookie cannot be accessed by client-side JavaScript (security+)
      secure: process.env.NODE_ENV !== 'development', // Use 'secure' (HTTPS only) in production
      maxAge: 60 * 60 * 24 * 1, // Cookie expiry in seconds (e.g., 1 day) - adjust as needed
      path: '/', // Cookie is valid for all paths on your domain
      sameSite: 'lax', // CSRF protection ('strict' is more secure but can break cross-origin links)
    });
    console.log("Cookie serialized.");

    // 12. Prepare User Data for Response (exclude sensitive info)
    const userResponse = {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
    };

    // 13. Send Success Response with User Data and Set-Cookie Header
    console.log("--- LOGIN API SUCCESS ---");
    return new NextResponse(
        JSON.stringify({ // Body must be a string
            user: userResponse,
            message: 'Login successful'
        }),
        {
            status: 200, // OK
            headers: { 'Set-Cookie': cookie }, // Set the session cookie
        }
    );

  } catch (error) {
    // 14. Handle Generic Errors (Database connection, JWT signing issues, etc.)
    console.error('--- LOGIN API ERROR ---:', error);
    // Return a generic server error message
    return NextResponse.json({ message: 'An error occurred during login. Please try again later.' }, { status: 500 }); // Internal Server Error
  }
}