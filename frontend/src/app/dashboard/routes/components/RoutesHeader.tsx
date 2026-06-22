import React from 'react';
import { FaRoute, FaSync } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
// 1. Importamos tu botón
import { Button } from '@/components/ui/Button'; 

interface RoutesHeaderProps {
  showAssignButton: boolean;
  pendingCount: number;
  isProcessing: boolean;
  onAssignAll: () => void;
}

export const RoutesHeader: React.FC<RoutesHeaderProps> = ({ 
  showAssignButton, 
  pendingCount, 
  isProcessing, 
  onAssignAll 
}) => {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FaRoute aria-hidden="true" className="text-blue-600" /> {t('routesPage.centro_de_control')}
        </h1>
        <p className="text-gray-600 mt-1">{t('routesPage.gestion_de_asignaciones')}</p>
      </div>
      
      {showAssignButton && pendingCount > 0 && (
        // 2. Usamos tu componente. Le pasamos clases extra para mantener el tamaño grande (px-6 py-3) original
        <Button 
          variant="primary"
          onClick={onAssignAll}
          disabled={isProcessing}
          aria-busy={isProcessing}
          className="px-6 py-3 rounded-xl font-bold gap-2 shadow-lg shadow-blue-200"
        >
          <FaSync aria-hidden="true" className={isProcessing ? "animate-spin" : ""} /> 
          {t('routesPage.asignar_todo', { count: pendingCount })}
        </Button>
      )}
    </header>
  );
};