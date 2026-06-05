'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AddressAutocomplete } from './AddressAutocomplete';
import { DireccionNormalizada } from '@/services/usigService';

// Esto apaga el Server-Side Rendering (SSR) estrictamente para el mapa,
// evitando el colapso por la falta del objeto 'window' de Leaflet.
const DynamicMapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
      <span className="text-gray-400 font-medium animate-pulse">Cargando visor de mapas...</span>
    </div>
  )
});

interface LocationManagerProps {
  onLocationComplete?: (location: DireccionNormalizada) => void;
}

export const LocationManager = ({ onLocationComplete }: LocationManagerProps) => {
  // Estado local para saber si ya hay una ubicacion lista para dibujar
  const [selectedLocation, setSelectedLocation] = useState<DireccionNormalizada | null>(null);

  const handleAddressSelect = (direccion: DireccionNormalizada) => {
    setSelectedLocation(direccion);

    if (onLocationComplete) {
      onLocationComplete(direccion);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3"></span>
        Ubicación Geográfica
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Ingrese la dirección del cliente/destinatario y seleccione la opción mas adecuada.
      </p>

      <div className="space-y-6">
        {/* 1. El Buscador (Input + Hook USIG) */}
        <AddressAutocomplete onAddressSelect={handleAddressSelect} />

        {/* 2. El Mapa Dinámico o Estado Vacío */}
        {selectedLocation && selectedLocation.coordenadas ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Verificación en Mapa
            </p>
            <DynamicMapViewer 
              // USIG devuelve strings ("-34.123"), Leaflet necesita números (-34.123)
              latitud={parseFloat(selectedLocation.coordenadas.y)} 
              longitud={parseFloat(selectedLocation.coordenadas.x)}
              direccionNormalizada={selectedLocation.direccion}
            />
          </div>
        ) : (
          <div className="w-full h-[150px] md:h-[300px] bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-all">
            <p className="text-sm text-center px-4">
              El mapa aparecerá una vez que <br className="hidden md:block" />
              se seleccione una dirección válida.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};