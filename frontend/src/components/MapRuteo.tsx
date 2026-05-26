'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Corregir problema de iconos de Leaflet en Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface LeafletWaypoint {
  latLng: L.LatLng;
}

interface RoutingControl extends L.Control {
  setWaypoints(waypoints: L.LatLng[]): this;
}

interface MapRuteoProps {
  origen: { lat: number; lng: number; nombre: string };
  destino: { lat: number; lng: number; nombre: string };
}

export default function MapRuteo({ origen, destino }: MapRuteoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<RoutingControl | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    fixLeafletIcons();

    // Crear el mapa
    const map = L.map(containerRef.current).setView([origen.lat, origen.lng], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Intentar configurar el ruteo
    let routingControl: RoutingControl | null = null;
    
    try {
      const routingControlFactory = (L.Routing as unknown as { control: (options: object) => RoutingControl })?.control;
      if (routingControlFactory) {
        routingControl = routingControlFactory({
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
          createMarker: (i: number, waypoint: LeafletWaypoint) => {
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
        routingControlRef.current = routingControl;
      }
    } catch {
      console.error("Error al inicializar el ruteo");
    }

    // Limpieza al desmontar
    return () => {
      // 1. Primero limpiar el ruteo de forma segura
      if (routingControl) {
        try {
          // Limpiar los puntos ayuda a que leaflet-routing-machine no intente
          // actualizar capas mientras se destruye
          if (routingControl.setWaypoints) {
            routingControl.setWaypoints([]);
          }
          if (map) {
            map.removeControl(routingControl);
          }
        } catch {
          // Ignorar errores en la remoción del control
        }
      }

      // 2. Luego destruir el mapa
      if (map) {
        try {
          map.remove();
        } catch {
          // Ignorar errores en la destrucción del mapa
        }
      }
      
      mapRef.current = null;
      routingControlRef.current = null;
    };
  }, [origen.lat, origen.lng, destino.lat, destino.lng, origen.nombre, destino.nombre]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-sm mt-4 relative z-0">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
