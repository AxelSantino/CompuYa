'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || puntos.length < 2) return;

    fixLeafletIcons();

    // Crear el mapa centrado en el primer punto (Sucursal)
    const map = L.map(containerRef.current).setView([puntos[0].lat, puntos[0].lng], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    let routingControl: any = null;
    
    try {
      if (L.Routing && L.Routing.control) {
        routingControl = L.Routing.control({
          waypoints: puntos.map(p => L.latLng(p.lat, p.lng)),
          routeWhileDragging: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: '#10b981', weight: 6, opacity: 0.8 }], // Verde para ruta optimizada
            extendToWaypoints: true,
            missingRouteTolerance: 10
          },
          createMarker: (i: number, waypoint: any) => {
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
          }
        }).addTo(map);
        routingControlRef.current = routingControl;
      }
    } catch (err) {
      console.error("Error al inicializar el ruteo de hoja de ruta:", err);
    }

    return () => {
      if (routingControl) {
        try {
          if (routingControl.setWaypoints) routingControl.setWaypoints([]);
          if (map) map.removeControl(routingControl);
        } catch (e) {}
      }
      if (map) {
        try { map.remove(); } catch (e) {}
      }
      mapRef.current = null;
      routingControlRef.current = null;
    };
  }, [puntos]);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border-2 border-green-100 shadow-lg relative z-0">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
