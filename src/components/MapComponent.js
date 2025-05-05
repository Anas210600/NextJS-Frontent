// src/components/MapComponent.js
'use client'; // Essential: Ensures this runs only on the client

import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet'; // Import necessary components/hooks
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet'; // Import Leaflet library itself

// --- Leaflet Default Icon Fix for Webpack/Next.js ---
// This prevents issues where default marker icons might not load correctly.
// Include this even if you only use custom icons for good measure.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// --- End Icon Fix ---


// --- Define Custom Icons ---
// Ensure these image paths correctly point to files in your `public/icons/` directory
const carIcon = L.icon({
    iconUrl: '/icons/car.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38], // Bottom center
    popupAnchor: [0, -38]
});
const bikeIcon = L.icon({
    iconUrl: '/icons/bike.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30], // Bottom center
    popupAnchor: [0, -30]
});
const truckIcon = L.icon({
    iconUrl: '/icons/truck.png',
    iconSize: [45, 45],
    iconAnchor: [22, 45], // Bottom center
    popupAnchor: [0, -45]
});
// --- End Custom Icons ---

// --- Animated Marker Component ---
// Handles the animation logic for a single vehicle marker
const AnimatedVehicleMarker = ({ map, path, icon, durationPerSegment = 2000 }) => {
    const markerRef = useRef(null); // Reference to the Leaflet marker instance
    const animationFrameId = useRef(null); // Stores the ID from requestAnimationFrame
    const currentSegmentIndex = useRef(0); // Index of the current path segment start
    const segmentStartTime = useRef(performance.now()); // High-resolution timestamp for animation start

    // The animation function using requestAnimationFrame for smoothness
    const animateMarker = useCallback((timestamp) => {
        // Ensure marker and path are valid before proceeding
        if (!markerRef.current || !path || path.length < 2) {
            cancelAnimationFrame(animationFrameId.current); // Stop animation if invalid
            return;
        }

        // Calculate time elapsed in the current segment and progress (0 to 1)
        const elapsedTime = timestamp - segmentStartTime.current;
        let progress = Math.min(elapsedTime / durationPerSegment, 1); // Clamp progress between 0 and 1

        // Determine the start and end points of the current path segment
        const startIndex = currentSegmentIndex.current;
        const endIndex = (startIndex + 1) % path.length; // Loop back to the start index if at the end

        const startLatLng = L.latLng(path[startIndex]);
        const endLatLng = L.latLng(path[endIndex]);

        // Linear interpolation to find the marker's current position
        const interpolatedLat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
        const interpolatedLng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;

        // Update the marker's position on the map
        markerRef.current.setLatLng([interpolatedLat, interpolatedLng]);

        // Check if the animation for the current segment is ongoing
        if (progress < 1) {
            // Request the next frame
            animationFrameId.current = requestAnimationFrame(animateMarker);
        } else {
            // Segment finished, move to the next segment
            currentSegmentIndex.current = endIndex; // Update the starting index for the next segment
            segmentStartTime.current = timestamp; // Reset the start time for the new segment
            // Immediately request the next frame to start the new segment without delay
            animationFrameId.current = requestAnimationFrame(animateMarker);
        }
    }, [map, path, icon, durationPerSegment]); // Dependencies for the animation callback

    // Effect hook to set up and tear down the marker and animation
    useEffect(() => {
        // Don't run if map or path is invalid
        if (!map || !path || path.length < 2) return;

        // Create the Leaflet marker only if it doesn't exist yet
        if (!markerRef.current) {
            console.log(`Creating marker with icon: ${icon.options.iconUrl}`);
            markerRef.current = L.marker(path[0], { icon: icon }).addTo(map);
        } else {
            markerRef.current.setLatLng(path[0]); // Reset position if path changes
        }

        // Initialize animation state
        currentSegmentIndex.current = 0;
        segmentStartTime.current = performance.now();

        // Start the animation loop
        cancelAnimationFrame(animationFrameId.current); // Cancel any previous frame request
        animationFrameId.current = requestAnimationFrame(animateMarker);

        // Cleanup function: Runs when the component unmounts or dependencies change
        return () => {
            // Stop the animation frame loop
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            // Remove the marker from the map if it exists
            if (markerRef.current && map.hasLayer(markerRef.current)) {
                 map.removeLayer(markerRef.current);
            }
            // Clear the reference
            markerRef.current = null;
        };
    }, [map, path, icon, durationPerSegment, animateMarker]); // Effect dependencies

    return null; // This component manages Leaflet objects directly, doesn't render React DOM
};
// --- End Animated Marker Component ---


// --- Main Map Component Definition ---
const MapComponent = ({ whenReady, showVehicles, vehiclePaths }) => {
    // Default map center coordinates
    const position = [24.8607, 67.0011];

    // --- Inner Component: VehicleLayer ---
    // This component exists to easily access the map instance using the useMap hook
    // and render markers conditionally based on props passed to MapComponent.
    const VehicleLayer = () => {
        const map = useMap(); // Get the Leaflet map instance from the parent MapContainer context

        // Effect to pass the map instance up to the parent (Home component)
        useEffect(() => {
            if (map && whenReady) {
                console.log("VehicleLayer: Map instance available, calling whenReady.");
                whenReady(map); // Call the callback prop with the map instance
            }
        // Only run when the map instance itself changes (or whenReady function changes)
        }, [map, whenReady]);

        // Conditionally render nothing if vehicles shouldn't be shown
        if (!showVehicles || !vehiclePaths) {
            return null;
        }

        // Render the animated markers for each vehicle type if data exists
        return (
            <>
                {vehiclePaths.car && vehiclePaths.car.length > 1 && (
                    <AnimatedVehicleMarker map={map} path={vehiclePaths.car} icon={carIcon} durationPerSegment={3000} />
                )}
                {vehiclePaths.bike && vehiclePaths.bike.length > 1 && (
                    <AnimatedVehicleMarker map={map} path={vehiclePaths.bike} icon={bikeIcon} durationPerSegment={1500} />
                )}
                 {vehiclePaths.truck && vehiclePaths.truck.length > 1 && (
                    <AnimatedVehicleMarker map={map} path={vehiclePaths.truck} icon={truckIcon} durationPerSegment={4000} />
                )}
            </>
        );
    };
    // --- End VehicleLayer Component ---

    // --- Render the MapContainer ---
    return (
        <MapContainer
            center={position} // Initial map center
            zoom={13}          // Initial zoom level
            scrollWheelZoom={true} // Allow zooming with scroll wheel
            style={{ height: '100%', width: '100%' }} // ** Crucial: Ensure container has dimensions **
        >
            {/* Base Tile Layer (e.g., OpenStreetMap) */}
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Standard OSM tile URL
            />

            {/* Render the VehicleLayer component, which handles conditional markers/animation */}
            <VehicleLayer />

        </MapContainer>
    );
};

export default MapComponent; // Export the main component

