import React, { useRef } from 'react';
import { FaCloudUploadAlt, FaFileCsv, FaTrash } from 'react-icons/fa';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

/*
    Este componente maneja la interacción de arrastrar y soltar. Si ya hay un archivo seleccionado, 
    cambia su diseño para mostrar el archivo y permite eliminarlo.
*/
interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export const FileDropzone = ({ onFileSelect, selectedFile, disabled = false }: FileDropzoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {t} = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se abra el explorador de archivos al borrar
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Enviamos un archivo "falso" que será manejado por el padre, o idealmente manejamos el clear desde el orquestador
    // Para simplificar, le pasaremos esta responsabilidad al Orquestador en la Épica 4
  };

  if (selectedFile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-between shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <FaFileCsv aria-hidden="true" size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{selectedFile.name}</p>
            <p className="text-xs text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onKeyDown={(e) => {
        // Simulamos el click cuando el usuario presiona Enter o Espacio
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent
        ${disabled ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : 'bg-white border-orange-300 hover:bg-orange-50 hover:border-orange-500'}`}
    >
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />
      <FaCloudUploadAlt aria-hidden="true" size={48} className="mx-auto text-orange-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('importCsvPage.click_para_subir_archivo')}</h3>
      <p className="text-sm text-gray-600">{t('importCsvPage.o_arrastra_y_suelta_archivo')}</p>
    </div>
  );
};