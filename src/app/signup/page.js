// src/app/signup/page.js
'use client'; // Mark as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Using the same styles as login for consistency
import styles from '../login/login.module.css';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors

    // Client-Side Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!name.trim()) {
        setError('Full Name is required.');
        return;
    }
    // Basic email format check (optional, backend should validate more thoroughly)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    // ---------------------------

    setIsSubmitting(true);
    console.log('Attempting Sign Up via API for:', { name, email }); // Log attempt

    // --- Call the Registration API ---
    try {
      const response = await fetch('/api/auth/register', { // Target your API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ // Send user data
            name: name.trim(),
            email: email.trim().toLowerCase(), // Send consistent casing
            password: password // Send plain password, backend will hash
        }),
      });

      const data = await response.json(); // Parse the JSON response body

      if (!response.ok) {
        // If response status is not 2xx, handle API errors
        console.error('API Registration Error:', data.message || `Status ${response.status}`);
        throw new Error(data.message || 'Sign up failed. Please try again.'); // Use message from API if available
      }

      // --- Sign Up Success ---
      console.log('Sign up successful:', data.message);

      // Optional: Show a success message before redirecting
      // alert('Account created successfully! Please log in.');

      // Redirect to login page
      router.push('/login');

    } catch (err) {
      // Handle fetch errors or errors thrown from response handling
      console.error('Sign Up Page Fetch Error:', err);
      // Display the error message to the user
      setError(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      // Ensure loading state is turned off regardless of success/failure
      setIsSubmitting(false);
    }
    // --- End API Call ---
  };

  // --- JSX remains the same ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Create Account</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          {/* Name Input */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} disabled={isSubmitting}/>
          </div>
          {/* Email Input */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} disabled={isSubmitting}/>
          </div>
          {/* Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} disabled={isSubmitting} aria-describedby="passwordHelp"/>
            <small id="passwordHelp" style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '4px' }}>(Minimum 6 characters)</small>
          </div>
          {/* Confirm Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={styles.input} disabled={isSubmitting}/>
          </div>
          {/* Submit Button */}
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        {/* Link to Sign In */}
        <div className={styles.links}>
          <Link href="/login" className={styles.link}>Already have an account? Sign In</Link>
        </div>
      </div>
    </div>
  );
}