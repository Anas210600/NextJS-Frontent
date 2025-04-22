// src/app/login/page.js
'use client'; // Mark as a Client Component because it uses hooks (useState, useRouter)

import React, { useState } from 'react'; // Import React and useState hook
import { useRouter } from 'next/navigation'; // Import Next.js router hook
import Link from 'next/link'; // Import Next.js Link component for navigation
import styles from './login.module.css'; // Import CSS module for styling

// Define the Login Page component
export default function LoginPage() {
  debugger;
  // --- State Variables ---
  const [email, setEmail] = useState(''); // State for the email input
  const [password, setPassword] = useState(''); // State for the password input
  const [error, setError] = useState(''); // State for displaying login errors
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission status (for disabling button)

  // --- Hooks ---
  const router = useRouter(); // Initialize the router for navigation

  // --- Form Submission Handler ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default browser form submission
    setError(''); // Clear any previous errors
    setIsSubmitting(true); // Set loading state

    console.log('Attempting Login via API for:', { email }); // Log the attempt (don't log password)

    // --- API Call to Backend ---
    try {
      // Send a POST request to the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indicate JSON data is being sent
        },
        body: JSON.stringify({ // Convert data to JSON string
            email: email.trim().toLowerCase(), // Send trimmed and lowercased email
            password: password // Send the plain password (backend handles hashing comparison)
        }),
      });

      // Parse the JSON response from the API
      const data = await response.json();

      // Check if the API request was successful (status code 2xx)
      if (!response.ok) {
        // If not successful, throw an error using the message from the API if available
        console.error('API Login Error:', data.message || `Status ${response.status}`);
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // --- Login Success ---
      // The backend API ('/api/auth/login') handles setting the authentication cookie.
      console.log('Login successful via API:', data.message);
      if (data.user) {
        console.log('User Data Received:', data.user); // Log user data if API returns it
      }

      // Redirect the user to the homepage (map page) after successful login
      router.push('/');

    } catch (err) {
      // Handle errors from the fetch call or the response handling
      console.error('Login Page Fetch Error:', err);
      // Set the error state to display the message to the user
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      // Ensure the submitting state is turned off, whether successful or not
      setIsSubmitting(false);
    }
    // --- End API Call ---
  };

  // --- JSX Rendering ---
  return (
    // Outermost container for centering the form
     // --- JSX Rendering ---
  
    // Outermost container for centering the form
    <div className={styles.pageContainer}>
      {/* The actual form card */}
      <div className={styles.formContainer}>
        {/* Page Title */}
        <h1 className={styles.title}>Sign In</h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Display error messages if any */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Email Input Group */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email} // Controlled input
              onChange={(e) => setEmail(e.target.value)} // Update state on change
              required // HTML5 validation
              className={styles.input}
              disabled={isSubmitting} // Disable while submitting
            />
          </div>

          {/* Password Input Group */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password} // Controlled input
              onChange={(e) => setPassword(e.target.value)} // Update state on change
              required // HTML5 validation
              className={styles.input}
              disabled={isSubmitting} // Disable while submitting
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting} // Disable while submitting
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'} {/* Change text during submission */}
          </button>
        </form>

        {/* Links below the form */}
        <div className={styles.links}>
          <Link href="/forgot-password" className={styles.link}>Forgot Password?</Link>
          <span className={styles.separator}>|</span>
          {/* Explicitly use ' for the apostrophe */}
          <Link href="/signup" className={styles.link}>
  Don&apos;t have an account? Sign Up
</Link>
        </div>

      </div> {/* End formContainer */}
    </div> // End pageContainer
  
  );
}