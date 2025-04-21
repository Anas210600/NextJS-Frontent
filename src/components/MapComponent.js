// src/components/MapComponent.js
'use client';

import React, { useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Custom Icons (Keep as before) ---
const carIcon = L.icon({ iconUrl: '/icons/car.png', iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] });
const bikeIcon = L.icon({ iconUrl: '/icons/bike.png', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] });
const truckIcon = L.icon({ iconUrl: '/icons/truck.png', iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -45] });
// --- End Custom Icons ---

// --- Smoother Marker Animation Component ---
const AnimatedVehicleMarker = ({ map, path, icon, durationPerSegment = 2000 }) => { // duration in ms
    const markerRef = useRef(null);
    const animationFrameId = useRef(null);
    const currentSegmentIndex = useRef(0);
    const segmentStartTime = useRef(performance.now()); // Use high-resolution time

    const animateMarker = useCallback((timestamp) => {
        if (!markerRef.current || !path || path.length < 2) return;
    
        const elapsedTime = timestamp - segmentStartTime.current;
        let progress = Math.min(elapsedTime / durationPerSegment, 1);
    
        const startIndex = currentSegmentIndex.current;
        const endIndex = (startIndex + 1) % path.length;
    
        const startLatLng = L.latLng(path[startIndex]);
        const endLatLng = L.latLng(path[endIndex]);
    
        const interpolatedLat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
        const interpolatedLng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;
    
        markerRef.current.setLatLng([interpolatedLat, interpolatedLng]);
    
        if (progress < 1) {
            animationFrameId.current = requestAnimationFrame(animateMarker);
        } else {
            currentSegmentIndex.current = endIndex;
            segmentStartTime.current = timestamp;
    
            animationFrameId.current = requestAnimationFrame(animateMarker); // Always loop
        }
    }, [path, durationPerSegment]);
    // Dependencies for useCallback

    // Effect to setup and cleanup
    useEffect(() => {
        if (!map || !path || path.length < 2) return;
    
        if (!markerRef.current) {
            markerRef.current = L.marker(path[0], { icon }).addTo(map);
        } else {
            markerRef.current.setLatLng(path[0]);
        }
    
        currentSegmentIndex.current = 0;
        segmentStartTime.current = performance.now();
    
        animationFrameId.current = requestAnimationFrame(animateMarker);
    
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (markerRef.current && map.hasLayer(markerRef.current)) {
                map.removeLayer(markerRef.current);
            }
            markerRef.current = null;
        };
    }, [map, path, icon, animateMarker]);
     // Add animateMarker to dependencies

    return null; // Component doesn't render direct DOM
};
// --- End Smoother Animation Component ---


// --- Main Map Component (Structure remains similar) ---
const MapComponent = ({ whenReady, showVehicles, vehiclePaths }) => {
    const position = [24.8607, 67.0011];
    // const mapInstanceRef = useRef(null); // Keep if needed for other features, but not strictly for whenReady now

    // Inner component to easily access map instance via useMap hook
    const VehicleLayer = () => {
        const map = useMap();

        useEffect(() => {
            // Store map instance if needed externally (e.g., for zoom)
            if (map && whenReady) {
                 whenReady(map);
            }
        }, [map]); // Run only when map instance changes

        // Log props received by VehicleLayer
        console.log("VehicleLayer rendering. showVehicles:", showVehicles, "vehiclePaths:", !!vehiclePaths);

        if (!showVehicles || !vehiclePaths) {
            console.log("VehicleLayer: Not rendering vehicles.");
            return null; // Don't render vehicles if not requested
        }

        console.log("VehicleLayer: Rendering vehicles...");
        return (
            <>
                {/* Render an animated marker for each vehicle path */}
                {vehiclePaths.car && vehiclePaths.car.length > 1 && (
                    <AnimatedVehicleMarker map={map} path={vehiclePaths.car} icon={carIcon} durationPerSegment={3000} /> // 3 seconds per segment
                )}
                {vehiclePaths.bike && vehiclePaths.bike.length > 1 && (
                    <AnimatedVehicleMarker map={map} path={vehiclePaths.bike} icon={bikeIcon} durationPerSegment={1500} /> // 1.5 seconds per segment
                )}
                 {vehiclePaths.truck && vehiclePaths.truck.length > 1 && (
                    <AnimatedVehicleMarker map={map} path={vehiclePaths.truck} icon={truckIcon} durationPerSegment={4000} /> // 4 seconds per segment
                )}
            </>
        );
    };


    return (
        <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <VehicleLayer />
        </MapContainer>
    );
};

export default MapComponent;

// Optional Helper for Rotation (needs leaflet-rotatedmarker or similar)
// function calculateBearing(lat1, lon1, lat2, lon2) {
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   lat1 = lat1 * Math.PI / 180;
//   lat2 = lat2 * Math.PI / 180;
//   const y = Math.sin(dLon) * Math.cos(lat2);
//   const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
//   let brng = Math.atan2(y, x) * 180 / Math.PI;
//   brng = (brng + 360) % 360; // Normalize to 0-360
//   return brng;
// }