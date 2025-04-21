// src/components/Sidebar.js
import React from 'react';
import styles from './Sidebar.module.css';
import {
  FaRoute, // Example Logo Icon
  FaTimes,
  FaTachometerAlt,
  FaCrosshairs, // Or FaMapMarkerAlt
  FaFileAlt,
  FaChartPie, // Or FaChartBar
  FaCog,
  FaQuestionCircle, // Or FaLifeRing
} from 'react-icons/fa';

// Define your navigation items structure
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { id: 'liveTracking', label: 'Live Tracking', icon: FaCrosshairs },
  { id: 'reports', label: 'Reports', icon: FaFileAlt },
  { id: 'charts', label: 'Charts', icon: FaChartPie },
  { id: 'setting', label: 'Setting', icon: FaCog },
];

const Sidebar = ({ isOpen, toggleSidebar, activeItem, setActiveItem }) => {
  // If the sidebar isn't open, don't render anything (or render a collapsed version if desired)
  // This approach completely removes it from the DOM when closed.
  // Alternatively, use CSS transforms to slide it off-screen (implemented below via className)
  // if (!isOpen) {
  //   return null;
  // }

  const handleNavClick = (id) => {
    setActiveItem(id);
    // Add navigation logic here if needed (e.g., router.push('/' + id))
    // If clicking should also close the sidebar on small screens, call toggleSidebar() here
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <FaRoute size={30} className={styles.logoIcon} />
          <span className={styles.title}>Tracking Solution</span>
        </div>
        <button onClick={toggleSidebar} className={styles.closeButton}>
          <FaTimes size={20} />
        </button>
      </div>

      <nav className={styles.navList}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.navItem} ${activeItem === item.id ? styles.active : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon size={20} className={styles.navIcon} />
            <span className={styles.navText}>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
         <div
            className={`${styles.navItem} ${activeItem === 'support' ? styles.active : ''}`}
            onClick={() => handleNavClick('support')}
          >
            <FaQuestionCircle size={20} className={styles.navIcon} />
            <span className={styles.navText}>Support</span>
          </div>
      </div>
    </div>
  );
};

export default Sidebar;