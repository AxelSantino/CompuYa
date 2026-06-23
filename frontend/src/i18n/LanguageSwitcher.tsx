'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGlobe, BiChevronDown } from 'react-icons/bi';
import ReactCountryFlag from 'react-country-flag';

const LANGUAGES = [
  { code: 'es', label: 'Español AR', countryCode: 'AR' },
  { code: 'en', label: 'English UK', countryCode: 'GB' },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Referencias para manejar el foco dinámicamente
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLang = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  // Cierra el menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mueve el foco a la opción seleccionada apenas se abre el menú
  useEffect(() => {
    if (isOpen) {
      // Un pequeño timeout permite que React renderice el menú en el DOM antes de buscar las opciones
      setTimeout(() => {
        const options = Array.from(dropdownRef.current?.querySelectorAll('[role="option"]') || []) as HTMLElement[];
        const selected = options.find(opt => opt.getAttribute('aria-selected') === 'true') || options[0];
        selected?.focus();
      }, 10);
    }
  }, [isOpen]);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    // Al seleccionar una opción, devolvemos el foco al botón principal
    buttonRef.current?.focus();
  };

  // Controlador maestro de navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); // Evita el scroll de la página de fondo

      const options = Array.from(dropdownRef.current?.querySelectorAll('[role="option"]') || []) as HTMLElement[];
      if (!options.length) return;

      const currentIndex = options.indexOf(document.activeElement as HTMLElement);
      let nextIndex = 0;

      if (e.key === 'ArrowDown') {
        // Baja a la siguiente opción, o vuelve a la primera si está en el final
        nextIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
      } else if (e.key === 'ArrowUp') {
        // Sube a la anterior, o va a la última si está en el principio
        nextIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
      }

      options[nextIndex]?.focus();
    }
  };

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onKeyDown={handleKeyDown} // Atrapamos las teclas en el contenedor principal
    >
      
      <button
        ref={buttonRef} // Vinculamos la referencia
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
        aria-label={t('languageSwitcher.seleccionar_idioma', 'Seleccionar idioma')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-listbox"
      >
        <div aria-hidden="true" className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
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
          aria-hidden="true"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul 
            id="language-listbox"
            role="listbox"
            className="py-1"
          >
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              
              return (
                <li key={lang.code} role="none">
                  <button
                    onClick={() => handleLanguageChange(lang.code)}
                    role="option"
                    aria-selected={isActive}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors cursor-pointer focus:outline-none focus-visible:bg-orange-50 focus-visible:text-orange-700
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