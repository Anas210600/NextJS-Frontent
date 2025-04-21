// src/components/Header.js
'use client'; // Mark as client component for useState

import React, { useState, useEffect } from 'react'; // Added useEffect for potential auth check
import Link from 'next/link'; // Import Link for navigation
import styles from './Header.module.css'; // Import CSS module
import { FaBell, FaQuestionCircle, FaSearch, FaSpinner, FaUserCircle } from 'react-icons/fa'; // Import icons

// Define the Header component, accepting props for search functionality
const Header = ({ onSearch, isSearching }) => {
  // State for the search input field
  const [searchTerm, setSearchTerm] = useState('');
  // Example state for user login status - replace with actual auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Update search term state when input changes
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search submission (e.g., when Enter is pressed)
  const handleSearchSubmit = (event = null) => {
    // Prevent default form submission if triggered by an event
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    // Trigger search only if not already searching, handler exists, and term is valid
    if (!isSearching && onSearch && searchTerm.trim()) {
      onSearch(searchTerm); // Call the parent's search handler
    }
  };

  // Handle Enter key press specifically for the search input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isSearching) {
      handleSearchSubmit();
    }
  };

  // --- Placeholder for Real Authentication Check ---
  // In a real application, you would use useEffect to check
  // authentication status (e.g., from context, cookies, API)
  // when the component mounts or when relevant dependencies change.
  useEffect(() => {
    // Example: Replace with your actual auth check logic
    const checkAuthenticationStatus = async () => {
      // const userIsAuthenticated = await yourAuthCheckFunction();
      // setIsLoggedIn(userIsAuthenticated);
      console.log("Auth check placeholder - currently set to logged out.");
    };
    checkAuthenticationStatus();
  }, []); // Empty dependency array means this runs once on mount
  // --- End Auth Placeholder ---

  // --- Placeholder for Logout Logic ---
  const handleLogout = () => {
      console.log("Logout initiated (placeholder)");
      // TODO: Implement API call to logout endpoint
      // TODO: Clear authentication state (context, cookies, local storage)
      setIsLoggedIn(false); // Update local state
      // Optionally redirect: router.push('/login');
  }
  // --- End Logout Placeholder ---


  // --- JSX Rendering ---
  return (
    <div className={styles.header}> {/* Main header container */}

      {/* Search Bar Section */}
      <div className={styles.searchContainer}>
        <FaSearch size={16} className={styles.searchIconInternal} /> {/* Search icon */}
        <input
          type="text"
          placeholder="Search" // Input field
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleInputChange} // Controlled input
          onKeyDown={handleKeyDown}    // Handle Enter key
          disabled={isSearching}      // Disable during search
        />
        {/* Show loading spinner if a search is in progress */}
        {isSearching && <FaSpinner className={styles.searchSpinner} size={16} />}
      </div>

      {/* Right-Aligned Controls Section */}
      <div className={styles.controls}>

        {/* Notification Button */}
        <button className={styles.iconButtonWrapper} title="Notifications">
          <FaBell size={18} className={styles.iconButtonIcon} />
          {/* Example notification badge - Conditionally render based on real data */}
          <span className={styles.notificationBadge}></span>
        </button>

        {/* Help/Info Button */}
        <button className={styles.iconButtonWrapper} title="Help">
          <FaQuestionCircle size={18} className={styles.iconButtonIcon} />
        </button>

        {/* --- Conditional User Section (Logged In vs Logged Out) --- */}
        {isLoggedIn ? (
          // --- User is Logged In ---
          <>
            <div className={styles.userIconWrapper} title="User Profile">
              <FaUserCircle size={22} className={styles.userIcon} />
              <span className={styles.statusIndicator}></span> {/* Online status */}
            </div>
            {/* Example Logout Button */}
            <button onClick={handleLogout} className={styles.loginButton} style={{marginLeft: '10px'}}>
                Logout
            </button>
          </>

        ) : (
          // --- User is Logged Out ---
          <>
            {/* Link to Sign In page */}
            <Link href="/login" className={styles.signInLink}>
              Sign In
            </Link>
            {/* Link to Sign Up page */}
            <Link href="/signup" className={styles.loginButton}>
              Sign Up
            </Link>
          </>
        )}
        {/* --- End Conditional User Section --- */}

      </div> {/* End Controls Section */}
    </div> // End Header Container
  );
};

// Export the component for use elsewhere
export default Header;