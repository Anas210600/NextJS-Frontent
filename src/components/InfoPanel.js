// src/components/InfoPanel.js
'use client'; // Mark as a Client Component as it uses client-side APIs (clipboard) and might have internal state later

import React from 'react';
import Image from 'next/image'; // Using Next.js Image for optimization
import styles from './InfoPanel.module.css'; // Assuming CSS Module is named like this
import {
  FaTimes, FaMapMarkerAlt, FaRoute, FaTachometerAlt, FaInfoCircle,
  FaEye, FaShareAlt, FaPaperPlane, FaMapPin, FaThumbsUp,
  FaRegClock, FaUndoAlt, FaCog, FaCopy // Added FaCog, FaCopy
} from 'react-icons/fa'; // Import necessary icons

// Placeholder data - Replace with actual data passed via props
// It's good practice to define a type/interface for this data shape in a real project
const placeholderData = {
    vehicleType: "SUV",
    vehicleImage: "/icons/car.png", // ** IMPORTANT: Make sure this image exists in /public or adjust path **
    plate: "TS-0001",
    status: "Stop", // Example: "Running", "Idle", "Inactive", "Stop"
    tripDistance: "0.00", // Should ideally be a number, formatted for display
    odometer: "0048889", // Ensure this is treated as a string if leading zeros are important
    driver: "Samana Anees",
    mobile: "03132258597",
    location: "28.7203516, 70.3111349", // Lat, Lng string
    geofence: "Office Zone", // Can be a name or coordinates string
    runningTime: "02:15", // Example formatted time string (HH:MM)
    stopTime: "00:45",
    idleTime: "01:05",
    inactiveTime: "00:00",
    workHour: "04:00",
    averageSpeed: "35", // String or number, unit added in display
    maxSpeed: "85",
    speedLimit: "60"
};

// The InfoPanel Component
const InfoPanel = ({ isVisible, onClose, data }) => { // Receive data prop

    // Use passed data, but fall back to placeholder if data or its properties are missing
    // This prevents errors if 'data' is null or missing expected fields
    const currentData = { ...placeholderData, ...data };

    // Function to copy text to clipboard
    const copyToClipboard = (text, type) => {
        if (!text) { // Don't try to copy if text is empty/null
            console.warn(`Attempted to copy empty ${type}`);
            return;
        }
        if (!navigator.clipboard) {
            console.error('Clipboard API not available (requires HTTPS or localhost).');
            alert('Clipboard access not available.');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            console.log(`${type} copied: ${text}`);
            // Optional: Add visual feedback like a temporary "Copied!" message
        }).catch(err => {
            console.error(`Failed to copy ${type}: `, err);
            alert(`Failed to copy ${type}.`);
        });
    };

    // Render nothing if the panel should not be visible
    if (!isVisible) {
        return null;
    }

    // Helper to get the CSS class for status badge based on status text
    const getStatusClass = (status) => {
        const statusKey = status?.trim().toLowerCase() || 'inactive'; // Handle potential null/undefined, trim whitespace, default
        return styles[statusKey] || styles.inactive; // Use computed property name, fallback
    }

    // --- MOCK ACTION HANDLERS ---
    // Replace these with actual function calls or props passed from parent
    const handleGenericAction = (actionName) => {
        console.log(`Action button clicked: ${actionName} for ${currentData.plate}`);
        alert(`Action: ${actionName}`);
    };
    const handleDetailsClick = () => alert(`Details for ${currentData.plate}`);
    const handleShowLog = () => alert(`Show Log for ${currentData.plate}`);
    const handleRefresh = (section) => alert(`Refresh ${section}`);
    // --- END MOCK ACTION HANDLERS ---


    return (
        // Main container div, conditionally applies 'visible' class for CSS transition
        <div className={`${styles.panelContainer} ${isVisible ? styles.visible : ''}`}>

            {/* Panel Header Section */}
            <div className={styles.panelHeader}>
                <div className={styles.headerLeft}>
                    <button className={styles.headerButton} title="Vehicle Actions" onClick={() => handleGenericAction('Vehicle Actions')}><FaRoute /></button>
                    <button className={styles.headerButton} title="Geofence Info" onClick={() => handleGenericAction('Geofence Info')}><FaMapPin /></button>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.headerButton} title="Settings" onClick={() => handleGenericAction('Settings')}><FaCog /></button>
                    <button className={styles.headerButtonClose} onClick={onClose} title="Close Panel"><FaTimes /></button> {/* Calls the onClose prop */}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className={styles.panelContent}>

                {/* Vehicle Information Section */}
                <div className={styles.vehicleInfo}>
                    {/* Left side: Text Details */}
                    <div className={styles.vehicleDetails}>
                        <div className={styles.vehicleType}>{currentData.vehicleType}</div>
                        <div className={styles.plateContainer}>
                            <span className={styles.plateNumber}>{currentData.plate}</span>
                            <span className={`${styles.status} ${getStatusClass(currentData.status)}`}>
                                {currentData.status || 'N/A'} {/* Show status or N/A */}
                            </span>
                        </div>
                         <div className={styles.tripInfo}>Current Trip: <span className={styles.tripValue}>{currentData.tripDistance} km</span></div>
                        {/* Odometer */}
                        <div className={styles.odometer}>
                            {currentData.odometer?.toString().padStart(7,'0').split('').map((digit, index) => ( // PadStart for consistent length
                                <span key={index} className={styles.odoDigit}>{digit}</span>
                            ))}
                        </div>
                         <div className={styles.driverInfo}>
                            <div>Driver: <span className={styles.driverValue}>{currentData.driver}</span></div>
                            <div>Mobile: <span className={styles.driverValue}>{currentData.mobile}</span></div>
                        </div>
                         <div className={styles.detailsLink} onClick={handleDetailsClick}>
                            Details <FaInfoCircle size={12} style={{marginLeft: '4px'}}/>
                        </div>
                    </div>
                    {/* Right side: Image */}
                    <div className={styles.vehicleImageContainer}>
                        <Image
                            src={currentData.vehicleImage} // Use potentially updated data
                            alt={currentData.vehicleType || 'Vehicle'}
                            width={130} // Specify width
                            height={80} // Specify height
                            className={styles.vehicleImage}
                            priority // Load image sooner if it's important
                            unoptimized={currentData.vehicleImage.startsWith('http')} // Example if using external URLs sometimes
                            onError={(e) => e.target.src = '/icons/placeholder-suv.png'} // Fallback image on error
                        />
                    </div>
                </div>

                {/* Row of Action Buttons Below Vehicle Info */}
                <div className={styles.actionButtons}>
                    <button className={styles.actionButton} title="View Details" onClick={() => handleGenericAction('View Details')}><FaEye /></button>
                    <button className={styles.actionButton} title="Share Location" onClick={() => handleGenericAction('Share Location')}><FaShareAlt /></button>
                    <button className={styles.actionButton} title="Send Command" onClick={() => handleGenericAction('Send Command')}><FaPaperPlane /></button>
                    <button className={styles.actionButton} title="View on Map" onClick={() => handleGenericAction('View on Map')}><FaMapMarkerAlt /></button>
                    <button className={styles.actionButton} title="Like / Favorite" onClick={() => handleGenericAction('Like / Favorite')}><FaThumbsUp /></button>
                </div>

                 {/* Location & Geofence Section */}
                <div className={styles.locationSection}>
                    {/* Location Item */}
                    <div className={styles.locationItem}>
                        <FaMapMarkerAlt className={styles.locationIcon} />
                        <div className={styles.locationText}>
                            <span className={styles.locationLabel}>Location</span>
                            <span className={styles.locationCoords}>{currentData.location}</span>
                        </div>
                        <button className={styles.copyButton} onClick={() => copyToClipboard(currentData.location, 'Location')} title="Copy Location">
                            <FaCopy size={12}/>
                        </button>
                    </div>
                     {/* Geofence Item */}
                    <div className={styles.locationItem}>
                        <FaMapPin className={styles.locationIcon} />
                        <div className={styles.locationText}>
                            <span className={styles.locationLabel}>Geofence</span>
                            <span className={styles.locationCoords}>{currentData.geofence || "N/A"}</span>
                        </div>
                         <button
                            className={styles.copyButton}
                            disabled={!currentData.geofence} // Disable if no geofence data
                            onClick={() => currentData.geofence && copyToClipboard(currentData.geofence, 'Geofence')}
                            title={currentData.geofence ? "Copy Geofence" : "No Geofence Data"}>
                                 <FaCopy size={12}/>
                         </button>
                    </div>
                     {/* Small Location Action Buttons */}
                      <div className={styles.locationActions}>
                         <button className={styles.locationActionButton} title="Navigate Here" onClick={() => handleGenericAction('Navigate Here')}><FaRoute /></button>
                         <button className={styles.locationActionButton} title="Set Geofence" onClick={() => handleGenericAction('Set Geofence')}><FaMapPin /></button>
                         <button className={styles.locationActionButton} title="Street View" onClick={() => handleGenericAction('Street View')}><FaEye /></button>
                     </div>
                </div>

                 {/* Today's Activity Section */}
                <div className={styles.activitySection}>
                    <div className={styles.activityHeader}>
                        <FaRegClock className={styles.sectionIcon} /> Today Activity
                        <button className={styles.refreshButton} onClick={() => handleRefresh('Activity')} title="Refresh Activity"><FaUndoAlt /></button>
                    </div>
                    <div className={styles.activityBody}>
                        {/* Chart Area */}
                        <div className={styles.activityChart}>
                            {/* Placeholder for Actual Chart Component */}
                            <div className={styles.chartPlaceholder}>Chart Area</div>
                        </div>
                         {/* Legend */}
                        <div className={styles.activityLegend}>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.running}`}></span> Running <span className={styles.time}>{currentData.runningTime} hrs</span></div>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.idle}`}></span> Idle <span className={styles.time}>{currentData.idleTime} hrs</span></div>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.stop}`}></span> Stop <span className={styles.time}>{currentData.stopTime} hrs</span></div>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.inactive}`}></span> Inactive <span className={styles.time}>{currentData.inactiveTime} hrs</span></div>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.work}`}></span> Work Hour <span className={styles.time}>{currentData.workHour} hrs</span></div>
                        </div>
                    </div>
                     {/* Show Log Button */}
                    <button className={styles.showLogButton} onClick={handleShowLog}>Show Log</button>
                </div>

                {/* Speed Information Section */}
                 <div className={styles.speedSection}>
                     <div className={styles.activityHeader}>
                        <FaTachometerAlt className={styles.sectionIcon} /> Speed
                        <button className={styles.refreshButton} onClick={() => handleRefresh('Speed')} title="Refresh Speed"><FaUndoAlt /></button>
                    </div>
                    <div className={styles.speedDetails}>
                        <div>Average Speed: <span className={styles.speedValue}>{currentData.averageSpeed} km/h</span></div>
                        <div>Maximum Speed: <span className={styles.speedValue}>{currentData.maxSpeed} km/h</span></div>
                        <div>Speed Limit: <span className={styles.speedValue}>{currentData.speedLimit} km/h</span></div>
                    </div>
                </div>

            </div> {/* End panelContent */}
        </div> // End panelContainer
    );
};

export default InfoPanel;                          