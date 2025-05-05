// src/components/MapControls.js
import React from 'react';
import styles from './MapControls.module.css'; // Ensure this path is correct and CSS exists

// Import necessary icons from react-icons
import {
  // Icons matching the vertical bar in the target UI image
  FaAngleDoubleLeft,  // For toggling the Info Panel (replace >> icon)
  FaMapMarkerAlt,     // For Locate Me
  FaStar,             // For Favorites
  FaMap,              // For Layers (folded map icon)
  FaTrafficLight,     // For Traffic indicator/toggle
  FaLocationArrow,    // For Navigation or Vehicle toggle ('send' ID)
  FaCrosshairs,       // For Center on GPS
  FaArrowsAltV,       // For Measurement units popup trigger ('measure' ID) - Stretched Vertical Arrow
  FaTag,              // For Labels toggle ('labels' ID)

  // Icons for Zoom Controls
  FaPlus,             // Zoom In
  FaMinus             // Zoom Out
} from 'react-icons/fa'; // Using Font Awesome icons

/**
 * Configuration array for the main vertical control buttons.
 * Each object defines the unique ID, the icon component, and the tooltip label.
 * The order here determines the vertical order of the buttons.
 */
const mainControlsConfig = [
  // ID used in Home.js to toggle the Info Panel
  { id: 'toggleSidebar', icon: FaAngleDoubleLeft, label: 'Toggle Info Panel' },
  { id: 'locate',        icon: FaMapMarkerAlt,    label: 'Locate Me' },
  { id: 'favorites',     icon: FaStar,            label: 'Favorites' },
  { id: 'layers',        icon: FaMap,             label: 'Layers' },
  { id: 'traffic',       icon: FaTrafficLight,    label: 'Traffic' },
  // 'send' ID used in Home.js to toggle vehicle animation display
  { id: 'send',          icon: FaLocationArrow,   label: 'Toggle Vehicles / Navigate' },
  { id: 'gps',           icon: FaCrosshairs,      label: 'Center on GPS' },
  // 'measure' ID used in Home.js to open the units popup
  { id: 'measure',       icon: FaArrowsAltV,   label: 'Measurement Units' },
  { id: 'labels',        icon: FaTag,             label: 'Toggle Labels' },
  // Add or remove icons here based on required functionality
];

/**
 * MapControls Component
 * Renders the vertical control bar and the zoom buttons.
 * Relies on props passed from the parent component (Home.js) to handle actions.
 *
 * @param {function} onControlClick - Callback function triggered when a main control button is clicked. Receives the button's 'id'.
 * @param {function} onZoomIn - Callback function triggered when the Zoom In button is clicked.
 * @param {function} onZoomOut - Callback function triggered when the Zoom Out button is clicked.
 */
const MapControls = ({ onControlClick, onZoomIn, onZoomOut }) => {

  // Generic handler for clicks on the main vertical buttons.
  // It simply calls the 'onControlClick' prop function passed from the parent,
  // sending the specific 'id' of the clicked button.
  const handleMainClick = (id) => {
    if (onControlClick) {
      onControlClick(id); // Delegate the action logic to the parent component
    } else {
      // Log a warning if the necessary prop is missing
      console.warn(`MapControls: 'onControlClick' prop handler is missing. Click for ID '${id}' cannot be processed.`);
    }
  };

  // Specific handler for the Zoom In button.
  // Prefers the dedicated 'onZoomIn' prop if provided.
  const handleZoomInClick = () => {
    if (onZoomIn) {
      onZoomIn();
    } else {
      // Fallback: If onZoomIn isn't passed, try triggering via the generic handler
      // This might be less common for zoom but provides a fallback mechanism.
      console.warn(`MapControls: 'onZoomIn' prop handler is missing. Attempting fallback via onControlClick('zoomIn').`);
      handleMainClick('zoomIn');
    }
  };

  // Specific handler for the Zoom Out button.
  // Prefers the dedicated 'onZoomOut' prop if provided.
  const handleZoomOutClick = () => {
    if (onZoomOut) {
      onZoomOut();
    } else {
       // Fallback: If onZoomOut isn't passed, try triggering via the generic handler
      console.warn(`MapControls: 'onZoomOut' prop handler is missing. Attempting fallback via onControlClick('zoomOut').`);
      handleMainClick('zoomOut');
    }
  };

  // --- JSX Rendering ---
  return (
    <> {/* Use Fragment to return multiple root elements */}

      {/* Container for the Main Vertical Control Buttons (typically on the right) */}
      {/* Styling and positioning are handled by MapControls.module.css */}
      <div className={styles.mainControlsContainer}>
        {/* Map over the configuration array to render each button */}
        {mainControlsConfig.map(control => (
          <button
            key={control.id} // Unique key for React list rendering
            className={styles.mainControlButton} // Apply specific styles
            onClick={() => handleMainClick(control.id)} // Call handler with the button's ID
            title={control.label} // Tooltip for mouse hover
            aria-label={control.label} // Accessibility label
          >
            {/* Render the icon component associated with this control */}
            <control.icon size={18} /> {/* Adjust icon size if needed */}
          </button>
        ))}
      </div>

      {/* Container for the Zoom In/Out Buttons (typically bottom-right) */}
      {/* Styling and positioning are handled by MapControls.module.css */}
      <div className={styles.zoomControlsContainer}>
        {/* Zoom In Button */}
        <button
          className={`${styles.zoomButton} ${styles.zoomButtonIn}`} // Apply base and specific styles
          onClick={handleZoomInClick} // Use dedicated zoom handler
          title="Zoom In"
          aria-label="Zoom In"
        >
          <FaPlus size={16} /> {/* Zoom In icon */}
        </button>
        {/* Zoom Out Button */}
        <button
          className={`${styles.zoomButton} ${styles.zoomButtonOut}`} // Apply base and specific styles
          onClick={handleZoomOutClick} // Use dedicated zoom handler
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <FaMinus size={16} /> {/* Zoom Out icon */}
        </button>
      </div>
    </>
  );
};

// Export the component for use in other parts of the application (e.g., Home page)
export default MapControls;