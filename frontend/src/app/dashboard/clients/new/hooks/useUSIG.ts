import { useState, useCallback, useRef } from 'react';
import usigService, { DireccionNormalizada } from '@/services/usigService';

export const useUSIG = () => {
  const [options, setOptions] = useState<DireccionNormalizada[]>([]);
  const [isLoadingUSIG, setIsLoadingUSIG] = useState(false);
  const [errorUSIG, setErrorUSIG] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Búsqueda mientras el usuario escribe
  const searchAddress = useCallback((text: string) => {
    if (text.trim().length < 4) {
      setOptions([]);
      return;
    }

    setIsLoadingUSIG(true);
    setErrorUSIG(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await usigService.searchOptions(text);
        setOptions(results);
      } catch (err) {
        console.error('Error en USIG:', err);
        setErrorUSIG('No se pudo conectar con el servicio de direcciones.');
        setOptions([]);
      } finally {
        setIsLoadingUSIG(false);
      }
    }, 500);
  }, []);

  // Función para manejar el clic en una opción
  const selectOption = async (option: DireccionNormalizada): Promise<DireccionNormalizada | null> => {
    // Si ya trae coordenadas de fábrica (como tu primer ejemplo de JSON), la devolvemos directo
    if (option.coordenadas?.x && option.coordenadas?.y) {
      setOptions([]); // Limpiamos la lista visual
      return option;
    }

    // Si no trae coordenadas (ej: esquinas o falta de localidad), hacemos la segunda consulta
    setIsLoadingUSIG(true);
    setErrorUSIG(null);
    try {
      const optionWithCoordinates = await usigService.getExactCoords(option.direccion);
      
      if (optionWithCoordinates) {
        setOptions([]); // Limpiamos la lista visual
        return optionWithCoordinates;
      } else {
        setErrorUSIG('No se pudieron obtener las coordenadas exactas de esta ubicación.');
        return null;
      }
    } catch (err) {
      setErrorUSIG('Error al procesar la dirección exacta.');
      return null;
    } finally {
      setIsLoadingUSIG(false);
    }
  };

  const cleanSearch = () => {
    setOptions([]);
    setErrorUSIG(null);
  };

  return {
    options,
    isLoadingUSIG,
    errorUSIG,
    searchAddress,
    selectOption,
    cleanSearch
  };
};