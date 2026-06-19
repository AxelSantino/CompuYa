'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGlobe, BiChevronDown } from 'react-icons/bi';
import ReactCountryFlag from 'react-country-flag';

// 1. DICCIONARIO CENTRALIZADO (Escalabilidad pura)
// Si necesitas agregar un idioma nuevo, solo lo sumas a este array. El componente hace el resto.
const LANGUAGES = [
  { code: 'es', label: 'Español AR', countryCode: 'AR' },
  { code: 'en', label: 'English UK', countryCode: 'GB' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Identifica el idioma actualmente activo
  const currentLang = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  // Cierra el menú si el usuario hace clic en cualquier otro lado de la pantalla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* =========================================
          Botton principal
          ========================================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer"
        aria-label="Seleccionar idioma"
      >

        {/* En celulares muestra solo la bandera, en PC muestra el nombre completo */}
        <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
          <ReactCountryFlag 
            countryCode={currentLang.countryCode} 
            svg 
            style={{ width: '1.5em', height: '1.5em', objectFit: 'cover' }} 
            title={currentLang.label} 
          />
        </div>
        
        <span className="font-medium text-sm hidden sm:block whitespace-nowrap">
          {currentLang.label}
        </span>
        
        <BiChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0
            ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* =========================================
          MENÚ DESPLEGABLE
          ========================================= */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1">
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              
              return (
                <li key={lang.code}>
                  <button
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors cursor-pointer
                      ${isActive 
                        ? 'bg-orange-50 text-orange-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="text-xs leading-none">{lang.code.toLocaleUpperCase()}</span>
                    <span>{lang.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
    </div>
  );
}