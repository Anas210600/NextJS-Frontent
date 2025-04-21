// src/app/signup/page.js
'use client'; // Mark as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Using the same styles as login for consistency, or create signup.module.css if needed
import styles from '../login/login.module.css';

export default function SignUpPage() {
  const [name, setName] = useState(''); // Added name field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors

    // --- Client-Side Validation ---
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return; // Stop submission
    }
    if (password.length < 6) { // Example minimum length
        setError('Password must be at least 6 characters long.');
        return;
    }
    // Add other validations (e.g., name not empty) if needed
    // ---------------------------

    setIsSubmitting(true);
    console.log('Sign Up attempt:', { name, email, password }); // Don't log confirmPassword

    // --- !!! Placeholder for Actual Registration API Call !!! ---
    try {
      // Example: Replace with your fetch call to the registration endpoint
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });
      //
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Sign up failed');
      // }
      // const newUser = await response.json();
      // console.log('Sign up successful:', newUser);

      // --- Simulate API call ---
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      // Simulate success - in a real app, the API would handle this
      console.log('Sign up successful (simulated)');
      // Redirect to login page after successful signup
      router.push('/login'); // Or redirect to '/' if API logs them in directly
      // --- End Placeholder ---

    } catch (err) {
        console.error('Sign Up error:', err);
        // Display specific errors from API if available, otherwise generic
        setError(err.message || 'An error occurred during sign up.');
    } finally {
        setIsSubmitting(false);
    }
    // --- End Actual Registration Placeholder ---
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        {/* Changed Title */}
        <h1 className={styles.title}>Create Account</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}

          {/* Added Name Field */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              disabled={isSubmitting}
              aria-describedby="passwordHelp" // For accessibility hints
            />
             <small id="passwordHelp" style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '4px' }}>
                (Minimum 6 characters)
            </small>
          </div>

          {/* Added Confirm Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {/* Changed Button Text */}
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className={styles.links}>
            {/* Changed Link Text and Target */}
            <Link href="/login" className={styles.link}>
              Already have an account? Sign In
            </Link>
        </div>
      </div>
    </div>
  );
}