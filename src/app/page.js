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
// Ensure MapComponent correctly handles receiving path data as props
const MapComponentWithNoSSR = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);

// --- Placeholder Data for Info Panel (Can stay outside if static) ---
// This data is only used for the InfoPanel when the toggleSidebar button is clicked
// and is separate from the vehicle path data fetched from the API.
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
  const [showVehicles, setShowVehicles] = useState(false); // State to toggle showing paths/vehicles on map
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isMeasurePopupOpen, setIsMeasurePopupOpen] = useState(false);
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState(null); // Data for the InfoPanel

  // State variables for fetched paths - These will hold the data from the API
  const [carPath, setCarPath] = useState([]);
  const [bikePath, setBikePath] = useState([]);
  const [truckPath, setTruckPath] = useState([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true); // To track loading state
  const [pathError, setPathError] = useState(null);         // To track fetch errors

  // Authentication state
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Hooks ---
  const router = useRouter();

  // --- EFFECT FOR AUTH CHECK & REDIRECTION ---
  // This runs once on mount to check authentication status.
  useEffect(() => {
    let loggedIn = false;
    try {
      // Check authentication status (e.g., from session storage or a cookie)
      loggedIn = sessionStorage.getItem('isLoggedIn') === 'true'; // Simulated auth check
    } catch (e) {
      console.error("Could not read sessionStorage:", e);
      // Assume not logged in if storage access fails
      loggedIn = false;
    }

    setIsAuthenticated(loggedIn);
    setAuthChecked(true);

    if (!loggedIn) {
      console.log("Auth check: User not authenticated, redirecting to login.");
      router.replace('/login'); // Redirect to login page if not logged in
    } else {
      console.log("Auth check: User authenticated.");
    }
  }, [router]); // Depend on router for Next.js 13's router hook compatibility


  // --- EFFECT FOR FETCHING VEHICLE PATHS PERIODICALLY ---
  // This runs when isAuthenticated changes or initially if true.
  useEffect(() => {
      let intervalId = null; // Variable to store the interval ID

      const fetchVehiclePaths = async () => {
          // Only show loading state on the *first* fetch or if a fetch fails
          // Subsequent fetches happen in the background
          // setIsLoadingPaths(true); // Uncomment if you want loading state for *every* fetch
          setPathError(null); // Clear previous errors on new fetch attempt

          try {
              const response = await fetch('https://py.valstechnologies.com/api/ts4/mapview?company=Shah%20Jee%20Transport', {
                  headers: {
                      'Authorization': 'Bearer vtslivemapview_sec987'
                  }
              });

              if (!response.ok) {
                  // Throw an error for bad responses (e.g., 401, 404, 500)
                  // If 401 Unauthorized, maybe trigger re-auth or logout
                  if (response.status === 401) {
                       console.error("Authentication failed during fetch, redirecting to login.");
                       // Clear authentication state and redirect
                       setIsAuthenticated(false); // This will trigger the auth check useEffect
                       try { sessionStorage.removeItem('isLoggedIn'); } catch(e) { console.error("Failed to clear sessionStorage", e); }
                       // The auth check useEffect will handle the router.replace('/login')
                       return; // Stop processing if unauthorized
                  }
                  throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              console.log("API Response Data (from useEffect):", data); // Log the raw data

              // --- Process the fetched data and update state ---
              // ASSUMPTION: The 'data' returned by the API is an array of objects,
              // where each object represents a vehicle and has properties like
              // 'type' (or 'category') and 'path' (or 'coordinates' - an array of [lat, lon]).
              // Adjust 'vehicle.type' and 'vehicle.path' property names based on your actual API response.
              // This example collects ALL path coordinates for each type found into a single array per type.
              const newCarPath = [];
              const newBikePath = [];
              const newTruckPath = [];
              // Add state variables and arrays for other vehicle types if needed

              if (Array.isArray(data)) { // Ensure data is an array before processing
                data.forEach(vehicle => {
                    // Basic validation: check if vehicle object and vehicle.path array exist
                    if (vehicle && typeof vehicle === 'object' && Array.isArray(vehicle.path)) {
                        // Adjust 'vehicle.type' based on the actual API response property name
                        // Assuming vehicle objects have a 'type' property like 'car', 'bike', 'truck'
                        if (vehicle.type === 'car') {
                            newCarPath.push(...vehicle.path); // Concatenate coordinates for all cars
                        } else if (vehicle.type === 'bike') {
                            newBikePath.push(...vehicle.path); // Concatenate coordinates for all bikes
                        } else if (vehicle.type === 'truck') {
                            newTruckPath.push(...vehicle.path); // Concatenate coordinates for all trucks
                        }
                        // Add handling for other vehicle types here
                        // else if (vehicle.type === 'bus') { /* ... */ }
                    } else {
                         console.warn("Skipping invalid vehicle data format:", vehicle);
                    }
                });
              } else {
                console.warn("API response is not an array:", data);
                setPathError("Unexpected API response format.");
              }

              // Update state - This will trigger a re-render with the new data
              // React will only re-render if the new array is different from the previous state
              setCarPath(newCarPath);
              setBikePath(newBikePath);
              setTruckPath(newTruckPath);
              // Update state for other vehicle types here

              console.log("Fetched Car Path (state updated):", newCarPath.length ? `${newCarPath.length} points` : 'No points');
              console.log("Fetched Bike Path (state updated):", newBikePath.length ? `${newBikePath.length} points` : 'No points');
              console.log("Fetched Truck Path (state updated):", newTruckPath.length ? `${newTruckPath.length} points` : 'No points');
              // Log other vehicle types

          } catch (error) {
              // Handle any errors during the fetch or processing
              console.error('Error fetching or processing vehicle data:', error);
              setPathError(`Failed to load vehicle data: ${error.message}`);
              // Note: The interval will continue to run even if a fetch fails,
              // attempting to fetch again after 10 seconds.
          } finally {
              // Set loading to false after the first fetch attempt (successful or failed)
              // You might want more granular loading state if showing indicators for each interval fetch.
              setIsLoadingPaths(false);
          }
      };

      // Start fetching only if authenticated
      if (isAuthenticated) {
          // 1. Fetch data immediately when the component mounts AND is authenticated
          fetchVehiclePaths();

          // 2. Set up interval for subsequent fetches every 10 seconds (10000ms)
          intervalId = setInterval(fetchVehiclePaths, 10000);

          console.log("Vehicle data fetching interval started (every 10s).");
      }

      // 3. Cleanup function: This runs when the component unmounts
      // or when the dependencies ([isAuthenticated, router]) change BEFORE the effect runs again.
      return () => {
          // Clear the interval to prevent memory leaks when the component is not visible
          if (intervalId !== null) {
              clearInterval(intervalId);
              console.log("Vehicle data fetching interval cleared.");
          }
          // Optionally reset state or loading indicators on cleanup
          setIsLoadingPaths(false);
      };

      // Dependency array: Rerun this effect if isAuthenticated state changes.
      // Added router as a dependency because it's used within the effect's fetchVehiclePaths function.
  }, [isAuthenticated, router]);

  // --- Component Handlers ---
  const handleMapReady = (mapInstance) => {
    console.log('Map ready.');
    mapRef.current = mapInstance;
    // Optionally fit map bounds to fetched data if available on initial load
    // if (mapInstance && (carPath.length > 0 || bikePath.length > 0 || truckPath.length > 0)) {
    //    const allPoints = [...carPath, ...bikePath, ...truckPath];
    //    if (allPoints.length > 0) {
    //        mapInstance.fitBounds(allPoints);
    //    }
    // }
  };
  const handleZoomIn = () => { mapRef.current?.zoomIn(); };
  const handleZoomOut = () => { mapRef.current?.zoomOut(); };
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    // Give the sidebar animation time to complete before invalidating map size
    setTimeout(() => {
        mapRef.current?.invalidateSize();
    }, 300); // Adjust timeout based on your sidebar transition duration
  };
  const handleSearch = async (term) => {
    if (!term?.trim()) { setSearchError("Please enter a location..."); return; }
    if (!mapRef.current) { setSearchError("Map not ready..."); return; } // Ensure map is initialized
    setIsSearching(true);
    setSearchError(null); // Clear previous errors
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Search failed (${response.status})`);
      const data = await response.json();
      if (data?.length > 0) {
        const { lat, lon } = data[0];
        // Fly to the found location on the map
        mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 15); // Zoom level 15
      } else {
        setSearchError(`Could not find: "${term}"`);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(`Search error: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // This function toggles the `showVehicles` state, which is passed to MapComponent
  // MapComponent should use this prop to conditionally render the vehicle paths/markers
  const toggleVehicleDisplay = () => {
     setShowVehicles(prev => !prev);
     console.log(`Toggling vehicle display: ${!showVehicles}`);
  };

  // --- MapControls Click Handler ---
  // This function is called by the MapControls component when a button is clicked
  const handleMapControlClick = (id) => {
    console.log('Map control clicked:', id);
    // Implement actions based on the clicked button's ID
    if (id === 'send') { // Assuming 'send' button ID triggers vehicle visibility toggle
      toggleVehicleDisplay();
    } else if (id === 'measure') { // Assuming 'measure' button ID opens the measure popup
      setIsMeasurePopupOpen(true);
    } else if (id === 'infoPanel') { // Assuming you have a button with ID 'infoPanel' for the info panel
      // In a real application, clicking a vehicle marker on the map would likely
      // set the selectedVehicleData state. Here, we're using a placeholder.
      setSelectedVehicleData(placeholderVehicleData); // Set data before showing panel
      setIsInfoPanelVisible((prev) => !prev); // Toggle panel visibility
    }
    // Add handlers for other MapControls button IDs...
    // e.g., case 'centerMap': mapRef.current?.setView([/* default lat, lon */], /* default zoom */); break;
  };
  // --- End MapControls Handler ---


  const closeMeasurePopup = () => { setIsMeasurePopupOpen(false); };
  const handleApplyMeasureSettings = (settings) => { console.log("Applying measure settings:", settings); closeMeasurePopup(); };

  // Function to close the InfoPanel
  const closeInfoPanel = () => {
      setIsInfoPanelVisible(false);
      setSelectedVehicleData(null); // Clear the selected vehicle data when closing the panel
  }

  // --- Conditional Rendering for Authentication ---
  // While checking authentication status, show a loading message
  if (!authChecked) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2em' }}>Checking authentication...</div>;
  }

  // If auth check is done and the user is not authenticated,
  // the useEffect for auth check has already triggered the redirect to /login.
  // We can return null or a simple "Redirecting..." message here.
  if (!isAuthenticated) {
      return null; // Or <div style={{ ... }}>Redirecting to login...</div>;
  }

  // --- Render Main UI (only if isAuthenticated is true) ---
  return (
    <>
      {/* Sidebar component */}
<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeItem={activeNavItem} setActiveItem={setActiveNavItem} />

      {/* Button to open sidebar when it's closed */}
      {!isSidebarOpen && (
        <button className={styles.openSidebarButton} onClick={toggleSidebar} title="Open Sidebar">
          <FaBars size={20}/>
        </button>
      )}

      {/* Header component with search functionality */}
      <Header onSearch={handleSearch} isSearching={isSearching} />

      {/* Main content area, adjusts margin based on sidebar state */}
      <div className={styles.contentArea} style={{ marginLeft: isSidebarOpen ? '260px' : '0' }}>
        {/* Display Search Errors */}
        {searchError && (
          <div className={styles.searchErrorBanner}>
            {searchError}
            <button onClick={() => setSearchError(null)} title="Dismiss error" className={styles.dismissErrorButton}>×</button>
          </div>
        )}

        {/* Display Path Loading/Fetch Errors/Status */}
        {isLoadingPaths && !pathError && (
             // Show initial loading state. Can use a less intrusive indicator for periodic fetches.
            <div className={styles.loadingBanner}>Loading vehicle data...</div>
        )}
        {pathError && (
             // Show error message if fetch failed
             <div className={styles.errorBanner}>
                {pathError}
                 {/* Optional: Add a retry button or note that retrying automatically */}
             </div>
        )}


        {/* Map Container */}
        <div className={styles.mapContainer}>
          {/* Dynamically imported Map Component */}
          {/* Pass the state variables containing fetched data to MapComponent */}
          {/* MapComponent must be designed to update when these props change periodically */}
          <MapComponentWithNoSSR
            whenReady={handleMapReady} // Callback when map instance is ready
            showVehicles={showVehicles} // Pass state to control vehicle visibility
            // Pass the state variables here! These will update when fetch completes.
            vehiclePaths={{ car: carPath, bike: bikePath, truck: truckPath }}
            // You might also pass isLoadingPaths or pathError to MapComponent
            // if you want it to show loading/error states on the map itself.
          />
          {/* Map Controls component */}
          <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onControlClick={handleMapControlClick} />
        </div>
      </div>

      {/* Measurement Popup */}
      <MeasurePopup isOpen={isMeasurePopupOpen} onClose={closeMeasurePopup} onApply={handleApplyMeasureSettings} />

      {/* Info Panel component */}
      <InfoPanel
        isVisible={isInfoPanelVisible}
        onClose={closeInfoPanel}
        data={selectedVehicleData} // Pass the selected vehicle data (from state)
      />
    </>
  );
}