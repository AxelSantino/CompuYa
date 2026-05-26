'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// --- Helper Functions ---
const fixLeafletIcons = () => {
  if (L.Icon.Default.prototype.options.iconUrl?.includes('marker-icon.png')) return;
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

const createWaypointMarker = (i: number, waypoint: any, puntos: Waypoint[]) => {
  const punto = puntos[i];
  const isFirst = i === 0;
  
  const icon = L.icon({
    iconUrl: isFirst 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' 
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  return L.marker(waypoint.latLng, {
    icon: icon,
    draggable: false
  }).bindPopup(`<b>${isFirst ? 'INICIO: ' : `PARADA ${i}: `}</b> ${punto.nombre}`);
};

// --- Component ---
interface Waypoint {
  lat: number;
  lng: number;
  nombre: string;
  isSucursal?: boolean;
}

interface MapHojaRutaProps {
  puntos: Waypoint[];
}

export default function MapHojaRuta({ puntos }: MapHojaRutaProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);

  // 1. Initialize map only once
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      fixLeafletIcons();
      const map = L.map(mapContainerRef.current).setView([-34.6037, -58.3816], 12); // Default view
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapRef.current = map;
    }
  }, []);

  // 2. Update route when 'puntos' prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (puntos.length < 2) {
      // If there are not enough points, remove existing route control
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    const waypoints = puntos.map(p => L.latLng(p.lat, p.lng));

    if (routingControlRef.current) {
      // If control exists, just update waypoints
      routingControlRef.current.setWaypoints(waypoints);
    } else {
      // Otherwise, create a new routing control
      const routingControl = (L.Routing as any).control({
        waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        show: false, // Hide the default ugly itinerary
        lineOptions: {
          styles: [{ color: '#10b981', weight: 6, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: (i: number, wp: any) => createWaypointMarker(i, wp, puntos),
      }).addTo(map);
      routingControlRef.current = routingControl;
    }
    
    // Adjust map view to fit the new route
    map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50] });

  }, [puntos]);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border-2 border-green-100 shadow-lg relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
