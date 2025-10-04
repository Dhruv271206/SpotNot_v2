import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Checkpoint } from "@/types/route";

interface RouteMapProps {
  routeGeometry?: [number, number][];
  startPoint?: [number, number];
  endPoint?: [number, number];
  checkpoints?: Checkpoint[];
  onMapClick?: (lat: number, lng: number) => void;
}

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ routeGeometry, startPoint, endPoint, checkpoints, onMapClick }: RouteMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([20, 0], 2);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler
    if (onMapClick) {
      map.on("click", (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add start marker
    if (startPoint) {
      const startIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: hsl(193 82% 31%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <span style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold;">S</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      const marker = L.marker(startPoint, { icon: startIcon }).addTo(map);
      markersRef.current.push(marker);
    }

    // Add end marker
    if (endPoint) {
      const endIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: hsl(16 90% 58%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <span style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold;">E</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      const marker = L.marker(endPoint, { icon: endIcon }).addTo(map);
      markersRef.current.push(marker);
    }

    // Add checkpoint markers
    if (checkpoints && checkpoints.length > 0) {
      checkpoints.forEach((checkpoint, index) => {
        const checkpointIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background: hsl(142 76% 36%); width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <span style="transform: rotate(45deg); color: white; font-size: 12px; font-weight: bold;">${index + 1}</span>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        const marker = L.marker(checkpoint.coordinates, { icon: checkpointIcon })
          .bindPopup(`<b>${checkpoint.name}</b>${checkpoint.notes ? `<br/>${checkpoint.notes}` : ""}`)
          .addTo(map);
        markersRef.current.push(marker);
      });
    }

    // Draw route
    if (routeGeometry && routeGeometry.length > 0) {
      routeLayerRef.current = L.polyline(routeGeometry, {
        color: "hsl(193 82% 31%)",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Fit map to route bounds
      const allPoints = [
        ...(startPoint ? [startPoint] : []),
        ...(endPoint ? [endPoint] : []),
        ...(checkpoints?.map((cp) => cp.coordinates) || []),
      ];
      
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (startPoint || endPoint) {
      // If no route but have points, center on them
      const points = [
        ...(startPoint ? [startPoint] : []),
        ...(endPoint ? [endPoint] : []),
      ];
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [routeGeometry, startPoint, endPoint, checkpoints]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg shadow-lg border border-border"
      style={{ minHeight: "500px" }}
    />
  );
};

export default RouteMap;
