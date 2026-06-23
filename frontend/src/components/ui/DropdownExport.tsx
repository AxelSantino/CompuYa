import React, { useState, useRef, useEffect } from 'react';
import { FaDownload, FaFileArchive, FaFileCsv, FaChevronDown } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface DropdownExportProps {
  isExporting: boolean;
  onExportZip: () => void;
}

export const DropdownExport = ({ isExporting, onExportZip }: DropdownExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  // Efecto para cerrar el menú si el usuario hace clic en cualquier otro lado de la pantalla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    // a11y: Permitir cerrar el menú desplegable con la tecla Escape
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    // Event listener si el menú está abierto por cuestiones de rendimiento
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Cerrar el menú automáticamente al elegir una opción
  const handleOptionClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Botón Principal */}
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        // a11y: Atributos que indican al lector de pantalla que este botón controla un menú
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 min-w-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {isExporting ? (
          // a11y: Spinner silenciado
          <span aria-hidden="true" className="animate-spin inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full"></span>
        ) : (
          // a11y: Ícono silenciado
          <FaDownload aria-hidden="true" />
        )}
        {isExporting ? t('metricsPage.export_procesando') : t('metricsPage.export_exportar_datos')}
        <FaChevronDown 
          aria-hidden="true" 
          // Contraste mejorado a gray-500
          className={`text-xs text-gray-500 transition-transform duration-200 ml-1 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Menú Flotante */}
      {isOpen && (
        <div 
          // a11y: Roles que identifican la caja flotante como un menú
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
        >
          
          <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-50">
            {/* Contraste mejorado a gray-600 */}
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('metricsPage.export_opciones_descarga')}</span>
          </div>

          <div className="py-1 p-1">
            {/* Opción 1: Exportar todo en ZIP */}
            <button
              // a11y: Rol que identifica este botón como un elemento interactivo del menú
              role="menuitem"
              onClick={() => handleOptionClick(onExportZip)}
              className="flex w-full items-start gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {/* a11y: Ícono silenciado */}
              <FaFileArchive aria-hidden="true" className="text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" size={16} />
              <div className="flex flex-col">
                <span className="font-semibold">{t('metricsPage.export_paquete_completo')}</span>
                {/* Contraste mejorado a gray-600 */}
                <span className="text-xs text-gray-600 mt-0.5 leading-tight">{t('metricsPage.export_incluye_todo')}</span>
              </div>
            </button>

          </div>
        </div>
      )}
    </div>
  );
};