// src/app/page.js
'use client';

// --- React and Next.js Imports ---
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import dynamic from 'next/dynamic'; // For client-side component loading

// --- Component Imports ---
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MapControls from '@/components/MapControls';
import MeasurePopup from '@/components/MeasurePopup'; // The measurement units popup

// --- Styles and Icons ---
import styles from './page.module.css';
import { FaBars } from 'react-icons/fa'; // Icon for opening sidebar

// --- Dynamically Import Map Component ---
const MapComponentWithNoSSR = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false } // Disable Server-Side Rendering for this component
);

// --- Sample Data (Vehicle Paths) ---
const carPath = [
  [24.865, 67.01], [24.868, 67.02], [24.870, 67.03],
  [24.872, 67.045], [24.870, 67.055], [24.868, 67.06],
];
const bikePath = [
  [24.880, 67.05], [24.878, 67.055], [24.875, 67.058], [24.872, 67.065],
];
const truckPath = [
  [24.850, 67.03], [24.855, 67.035], [24.858, 67.045],
  [24.860, 67.055], [24.862, 67.065],
];

// --- Main Page Component Definition ---
export default function Home() {
  // --- State Variables ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar visibility
  const [activeNavItem, setActiveNavItem] = useState('dashboard'); // Active item in sidebar
  const mapRef = useRef(null); // Reference to the Leaflet map instance
  const [showVehicles, setShowVehicles] = useState(false); // Toggle vehicle animation
  const [isSearching, setIsSearching] = useState(false); // Loading state for location search
  const [searchError, setSearchError] = useState(null); // Error message for search
  const [isMeasurePopupOpen, setIsMeasurePopupOpen] = useState(false); // Measurement popup visibility
  // --- State for Auth Check ---
  const [authChecked, setAuthChecked] = useState(false); // Tracks if the check has run
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Stores the result of the auth check

  // --- Hooks ---
  const router = useRouter(); // Next.js router instance for navigation

  // --- EFFECT FOR AUTH CHECK & REDIRECTION ---
  useEffect(() => {
    let loggedIn = false;
    // Check sessionStorage (only runs in the browser)
    try {
      loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    } catch (e) {
      console.error("Could not read sessionStorage:", e);
      // Handle error - default to not logged in
    }

    setIsAuthenticated(loggedIn); // Update state based on check
    setAuthChecked(true);       // Mark check as complete

    // --- Conditional Redirect ---
    if (!loggedIn) {
      // If not logged in according to sessionStorage, THEN redirect
      console.log("Auth check: User not authenticated, redirecting to /login...");
      router.replace('/login');
    } else {
      // If logged in, DO NOT redirect, allow component to render
      console.log("Auth check: User is authenticated, allowing map page render.");
    }

  }, [router]); // Dependency array - runs once on mount

  // --- Component Handlers ---
  const handleMapReady = (mapInstance) => { console.log('Map instance ready.'); mapRef.current = mapInstance; };
  const handleZoomIn = () => { mapRef.current?.zoomIn(); };
  const handleZoomOut = () => { mapRef.current?.zoomOut(); };
  const toggleSidebar = () => { setIsSidebarOpen((prev) => !prev); setTimeout(() => { mapRef.current?.invalidateSize(); }, 300); };
  const handleSearch = async (term) => {
    if (!term || !term.trim()) { setSearchError("Please enter a location..."); return; }
    if (!mapRef.current) { setSearchError("Map not ready..."); return; }
    setIsSearching(true); setSearchError(null);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Search failed (${response.status})`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 15);
      } else { setSearchError(`Could not find: "${term}"`); }
    } catch (error) { setSearchError(`Search error: ${error.message}`); }
    finally { setIsSearching(false); }
  };
  const toggleVehicleDisplay = () => { setShowVehicles((prev) => !prev); };
  const handleMapControlClick = (id) => {
    if (id === 'send') toggleVehicleDisplay();
    else if (id === 'measure') setIsMeasurePopupOpen(true);
  };
  const closeMeasurePopup = () => { setIsMeasurePopupOpen(false); };
  const handleApplyMeasureSettings = (settings) => { console.log("Applying measure settings:", settings); closeMeasurePopup(); };

  // --- Conditional Rendering ---
  // Show loading message until the authentication check is complete
  if (!authChecked) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Checking authentication...</div>;
  }

  // If check is done and user is not authenticated, render nothing (redirect handles it)
  if (!isAuthenticated) {
      return null;
  }

  // --- Render Main UI ONLY IF AUTHENTICATED ---
  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeItem={activeNavItem}
        setActiveItem={setActiveNavItem}
      />
      {!isSidebarOpen && (
        <button className={styles.openSidebarButton} onClick={toggleSidebar}>
          <FaBars size={20}/>
        </button>
      )}
      <Header onSearch={handleSearch} isSearching={isSearching} />
      <div
        className={styles.contentArea}
        style={{ marginLeft: isSidebarOpen ? '260px' : '0' }}
      >
        {searchError && (
            <div className={styles.searchErrorBanner}>
                {searchError}
                <button onClick={() => setSearchError(null)} style={{ marginLeft: '15px', cursor: 'pointer', background:'none', border:'none', color:'inherit', fontWeight:'bold', fontSize: '1rem' }}>×</button>
            </div>
        )}
        <div className={styles.mapContainer}>
          <MapComponentWithNoSSR
            whenReady={handleMapReady}
            showVehicles={showVehicles}
            vehiclePaths={{ car: carPath, bike: bikePath, truck: truckPath }}
          />
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onControlClick={handleMapControlClick}
          />
        </div>
      </div>
      <MeasurePopup
          isOpen={isMeasurePopupOpen}
          onClose={closeMeasurePopup}
          onApply={handleApplyMeasureSettings}
      />
    </>
  );
}