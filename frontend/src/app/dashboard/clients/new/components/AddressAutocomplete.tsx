import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { useUSIG } from '../hooks/useUSIG';
import { DireccionNormalizada } from '@/services/usigService';

interface AddressAutocompleteProps {
  onAddressSelect: (direccion: DireccionNormalizada) => void;
  disabled?: boolean;
  initialValue?: string;
}

export const AddressAutocomplete = ({ onAddressSelect, disabled = false, initialValue = '' }: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);
  
  // Referencia para detectar clics fuera del componente
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    options,
    isLoadingUSIG,
    errorUSIG,
    searchAddress,
    selectOption
  } = useUSIG();

  
  // Efecto para cerrar el dropdown si el usuario hace clic en otro lado de la pantalla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsDropdownOpen(true);
    searchAddress(value);
  };

  const handleOptionClick = async (option: DireccionNormalizada) => {
    // Se llama a la función de seleccionar opciones
    const finalOption = await selectOption(option);

    if (finalOption) {
      // Si es la opcion final, se actualiza el texto con la direccion normalizada
      setInputValue(finalOption.direccion);
      setIsDropdownOpen(false);
      
      // Le pasamos el objeto con las coordenadas al objeto padre
      onAddressSelect(finalOption);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Dirección Fiscal <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Ej: Av. Callao y Corrientes, CABA"
          disabled={disabled || (isLoadingUSIG && inputValue.length === 0)}
          className="w-full"
          required
        />
        
        {/* Spinner de carga visual mientras el Hook hace la petición */}
        {isLoadingUSIG && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></span>
          </div>
        )}
      </div>

      {/* Manejo de Errores de USIG */}
      {errorUSIG && (
        <p className="text-xs text-red-500 mt-1">{errorUSIG}</p>
      )}

      {/* Menú Desplegable con posicionamiento absoluto para flotar sobre otros campos */}
      {isDropdownOpen && options.length > 0 && (
        <ul className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              {option.direccion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};