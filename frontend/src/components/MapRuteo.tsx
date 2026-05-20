'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Corregir problema de iconos de Leaflet en Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface MapRuteoProps {
  origen: { lat: number; lng: number; nombre: string };
  destino: { lat: number; lng: number; nombre: string };
}

export default function MapRuteo({ origen, destino }: MapRuteoProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    fixLeafletIcons();

    // Inicializar el mapa si no existe
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([origen.lat, origen.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Limpiar control de ruteo anterior si existe
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Configurar el nuevo ruteo
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(origen.lat, origen.lng),
        L.latLng(destino.lat, destino.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      // Personalizar el marcador para que se vea mejor
      createMarker: (i, waypoint, n) => {
        const icon = L.icon({
          iconUrl: i === 0 ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        return L.marker(waypoint.latLng, {
          icon: icon,
          draggable: false
        }).bindPopup(i === 0 ? `Origen: ${origen.nombre}` : `Destino: ${destino.nombre}`);
      }
    }).addTo(map);

    // Limpieza al desmontar
    return () => {
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [origen, destino]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-sm mt-4">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
