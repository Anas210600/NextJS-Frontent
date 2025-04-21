// src/app/login/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    console.log('Login attempt:', { email, password });

    // --- Placeholder for Actual Authentication ---
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // --- Check Credentials ---
      if (email === "test@example.com" && password === "password") {
        console.log('Login successful (simulated)');

        // --- SET LOGIN STATUS IN SESSION STORAGE ---
        try {
            sessionStorage.setItem('isLoggedIn', 'true'); // Store flag
            console.log('Set isLoggedIn=true in sessionStorage');
        } catch (e) {
            // Handle potential errors if storage is disabled (e.g., private browsing)
            console.error("Failed to set sessionStorage:", e);
            setError("Could not save login status. Check browser settings.");
            setIsSubmitting(false); // Stop submission
            return; // Prevent redirect
        }
        // --- END SET STATUS ---

        // On successful login, redirect to the main map page
        router.push('/'); // Redirect to the home page (which will now check sessionStorage)

      } else {
        // Incorrect credentials
        throw new Error('Invalid email or password');
      }
      // --- End Check Credentials ---

    } catch (err) {
        console.error('Login error:', err);
        setError(err.message || 'An error occurred during login.');
    } finally {
        setIsSubmitting(false);
    }
    // --- End Placeholder ---
  };

  // --- JSX remains the same ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        {/* ... form JSX ... */}
         <h1 className={styles.title}>Sign In</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          {/* ... email input ... */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} disabled={isSubmitting} />
          </div>
          {/* ... password input ... */}
           <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} disabled={isSubmitting} />
          </div>
          {/* ... submit button ... */}
           <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
         {/* ... links ... */}
         <div className={styles.links}>
            <Link href="/forgot-password" className={styles.link}>Forgot Password?</Link>
            <span className={styles.separator}>|</span>
            <Link href="/signup" className={styles.link}>Don't have an account? Sign Up</Link>
        </div>
      </div>
    </div>
  );
}