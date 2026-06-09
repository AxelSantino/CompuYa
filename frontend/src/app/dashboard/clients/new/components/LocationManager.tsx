'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AddressAutocomplete } from './AddressAutocomplete';
import { DireccionNormalizada } from '@/services/usigService';
import { Input } from '@/components/ui/Input';

// Esto apaga el Server-Side Rendering (SSR) estrictamente para el mapa,
// evitando el colapso por la falta del objeto 'window' de Leaflet.
const DynamicMapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
      <span className="text-gray-400 font-medium animate-pulse">Cargando visor...</span>
    </div>
  )
});

interface LocationManagerProps {
  onLocationComplete?: (location: DireccionNormalizada) => void;
  codPostal: string
  onCodPostalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

export const LocationManager = ({ 
  onLocationComplete,
  codPostal,
  onCodPostalChange,
  isLoading = false,

}: LocationManagerProps) => {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <AddressAutocomplete 
              onAddressSelect={handleAddressSelect} 
              disabled={isLoading} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="cod_postal"
              value={codPostal}
              onChange={onCodPostalChange}
              placeholder="Ej. 1615"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 2. El Mapa Dinámico o Estado Vacío */}
        {selectedLocation && selectedLocation.coordenadas ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Verificación en Mapa
            </p>
            {/* El padre dicta la altura y los bordes */}
            <div className="h-[450px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner">
              <DynamicMapViewer 
                latitud={parseFloat(selectedLocation.coordenadas.y)} 
                longitud={parseFloat(selectedLocation.coordenadas.x)}
                direccionNormalizada={selectedLocation.direccion}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-[150px] md:h-[450px] bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-all">
            {/* ... texto vacío ... */}
          </div>
        )}
      </div>
    </div>
  );
};