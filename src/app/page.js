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
import InfoPanel from '@/components/InfoPanel';      // The slide-out info panel

// --- Styles and Icons ---
import styles from './page.module.css';
import { FaBars } from 'react-icons/fa'; // Icon for opening sidebar

// --- Dynamically Import Map Component ---
const MapComponentWithNoSSR = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
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

// --- Placeholder Data for Info Panel ---
// Needs to be defined outside the component or imported if it's large/shared
const placeholderVehicleData = {
    vehicleType: "Delivery Van",
    vehicleImage: "/icons/truck.png", // Ensure this exists in public/icons
    plate: "KHI-457",
    status: "Running",
    tripDistance: "8.7 km",
    odometer: "0115321",
    driver: "Imran Shah",
    mobile: "0301-1234567",
    detailsLink: "#",
    location: "24.87123, 67.05987",
    geofence: "Karachi Warehouse Zone",
    geofenceCoords: "24.87000, 67.06000",
    runningTime: "00:45 hrs",
    stopTime: "00:15 hrs",
    idleTime: "00:05 hrs",
    inactiveTime: "01:30 hrs",
    workHour: "01:05 hrs",
    averageSpeed: "35 km/h",
    maxSpeed: "68 km/h",
    speedLimit: "70",
    lastUpdated: "2 mins ago"
};
// --------------------------------------


// --- Main Page Component Definition ---
export default function Home() {
  // --- State Variables ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const mapRef = useRef(null);
  const [showVehicles, setShowVehicles] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isMeasurePopupOpen, setIsMeasurePopupOpen] = useState(false);
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState(null); // Initialize as null
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Hooks ---
  const router = useRouter();

  // --- EFFECT FOR AUTH CHECK & REDIRECTION ---
  useEffect(() => {
    let loggedIn = false;
    try {
      loggedIn = sessionStorage.getItem('isLoggedIn') === 'true'; // Simulated auth
    } catch (e) { console.error("Could not read sessionStorage:", e); }
    setIsAuthenticated(loggedIn);
    setAuthChecked(true);
    if (!loggedIn) {
      router.replace('/login');
    } else {
      console.log("Auth check: User authenticated.");
    }
  }, [router]);

  // --- Component Handlers ---
  const handleMapReady = (mapInstance) => { console.log('Map ready.'); mapRef.current = mapInstance; };
  const handleZoomIn = () => { mapRef.current?.zoomIn(); };
  const handleZoomOut = () => { mapRef.current?.zoomOut(); };
  const toggleSidebar = () => { setIsSidebarOpen((prev) => !prev); setTimeout(() => { mapRef.current?.invalidateSize(); }, 300); };
  const handleSearch = async (term) => {
    if (!term?.trim()) { setSearchError("Please enter a location..."); return; }
    if (!mapRef.current) { setSearchError("Map not ready..."); return; }
    setIsSearching(true); setSearchError(null);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Search failed (${response.status})`);
      const data = await response.json();
      if (data?.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 15);
      } else { setSearchError(`Could not find: "${term}"`); }
    } catch (error) { setSearchError(`Search error: ${error.message}`); }
    finally { setIsSearching(false); }
  };
  const toggleVehicleDisplay = () => { setShowVehicles((prev) => !prev); };

  // --- CORRECTED MapControls Click Handler ---
  const handleMapControlClick = (id) => {
    console.log('Map control clicked:', id);
    if (id === 'send') {
      toggleVehicleDisplay();
    } else if (id === 'measure') {
      setIsMeasurePopupOpen(true);
    } else if (id === 'toggleSidebar') { // Handle the Info Panel toggle button ID
      // --- FIX: Set data BEFORE making panel visible ---
      // In a real app, replace placeholderVehicleData with fetched/selected data
      setSelectedVehicleData(placeholderVehicleData);
      // --- END FIX ---
      setIsInfoPanelVisible((prev) => !prev); // Then toggle visibility
    }
    // Add handlers for other IDs...
  };
  // --- End Corrected Handler ---

  const closeMeasurePopup = () => { setIsMeasurePopupOpen(false); };
  const handleApplyMeasureSettings = (settings) => { console.log("Applying measure settings:", settings); closeMeasurePopup(); };
  const closeInfoPanel = () => {
      setIsInfoPanelVisible(false);
      setSelectedVehicleData(null); // Clear data when closing
  }

  // --- Conditional Rendering ---
  if (!authChecked) { return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2em' }}>Checking authentication...</div>; }
  if (!isAuthenticated) { return null; } // Redirecting or render nothing

  // --- Render Main UI ---
  return (
    <>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeItem={activeNavItem} setActiveItem={setActiveNavItem} />
      {!isSidebarOpen && (<button className={styles.openSidebarButton} onClick={toggleSidebar} title="Open Sidebar"><FaBars size={20}/></button>)}
      <Header onSearch={handleSearch} isSearching={isSearching} />
      <div className={styles.contentArea} style={{ marginLeft: isSidebarOpen ? '260px' : '0' }}>
        {searchError && (<div className={styles.searchErrorBanner}>{searchError}<button onClick={() => setSearchError(null)} title="Dismiss error" style={{ marginLeft: '15px', cursor: 'pointer', background:'none', border:'none', color:'inherit', fontWeight:'bold', fontSize: '1rem' }}>×</button></div>)}
        <div className={styles.mapContainer}>
          <MapComponentWithNoSSR whenReady={handleMapReady} showVehicles={showVehicles} vehiclePaths={{ car: carPath, bike: bikePath, truck: truckPath }} />
          <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onControlClick={handleMapControlClick} />
        </div>
      </div>
      <MeasurePopup isOpen={isMeasurePopupOpen} onClose={closeMeasurePopup} onApply={handleApplyMeasureSettings} />
      {/* <InfoPanel isVisible={isInfoPanelVisible} onClose={closeInfoPanel} data={selectedVehicleData} /> */}
      <InfoPanel
    isVisible={isInfoPanelVisible}
    onClose={closeInfoPanel}
    // Pass actual vehicle data instead of placeholder when available
    // data={selectedVehicleData}
/>
    </>
  );
}