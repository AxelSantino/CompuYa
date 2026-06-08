'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { FaDownload, FaInfoCircle } from 'react-icons/fa';

// Importamos lo construido en las Fases 2 y 3
import { useNotifications } from './hooks/useNotifications';
import { NotificationsTabs } from './components/NotificationTabs';
import { TemplateCard } from './components/TemplateCard';
import { EditTemplateModal } from './components/EditTemplateModal';

// Importamos tus herramientas reutilizables
import { DataTable, Column } from '@/app/dashboard/users/components/DataTable';
import { HistorialNotificacion, PlantillaCorreo } from '@/types/notificacion';

export default function NotificationsPage() {
  const {
    activeTab,
    setActiveTab,
    templates,
    history,
    isLoadingTemplates,
    isLoadingHistory,
    isUpdating,
    historyLoaded,
    loadHistory,
    handleUpdateTemplate
  } = useNotifications();

  // Estados locales para controlar el Modal de edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaCorreo | null>(null);

  const handleEditClick = (template: PlantillaCorreo) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTemplate(null), 200); // Limpiamos después de la animación de cierre
  };

  // Definimos la estructura de la tabla utilizando tu componente DataTable
  const historyColumns: Column<HistorialNotificacion>[] = [
    {
      header: 'Fecha de Envío',
      accessor: (row) => new Date(row.fecha_envio).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    },
    {
      header: 'Destinatario',
      accessor: 'destinatario_email',
      className: 'font-semibold text-gray-900'
    },
    {
      header: 'Asunto / Disparador',
      accessor: 'asunto_enviado'
    },
    {
      header: 'Canal',
      accessor: (row) => <span className="capitalize">{row.canal}</span>
    },
    {
      header: 'Resultado',
      accessor: (row) => {
        const isSuccess = row.resultado.toLowerCase() === 'exito';
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {row.resultado}
            </span>
            {!isSuccess && row.motivo_error && (
              <div title={row.motivo_error} className="text-red-500 cursor-help transition-transform hover:scale-110">
                <FaInfoCircle size={16} />
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 relative min-h-screen">
        
        <LoadingOverlay isLoading={isLoadingTemplates} text="Cargando configuración de notificaciones..." />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestor de Notificaciones</h1>
          <p className="text-gray-600 mt-1">Administra las plantillas de correo automatizadas y revisa el historial de envíos.</p>
        </div>

        <NotificationsTabs activeTab={activeTab} setActiveTab={setActiveTab} />


        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {templates.length === 0 && !isLoadingTemplates ? (
              <div className="col-span-full flex justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No hay plantillas de correo configuradas en el sistema.</p>
              </div>
            ) : (
              templates.map(template => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onEdit={handleEditClick} 
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300 relative min-h-[400px]">
            <LoadingOverlay isLoading={isLoadingHistory} text="Descargando registros desde la base de datos..." />
            
            {!historyLoaded ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full absolute inset-0">
                <div className="bg-blue-50 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-sm">
                  <FaDownload size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Historial de Envíos Masivos</h3>
                <p className="text-gray-500 max-w-md mb-8">
                  El historial puede contener miles de registros. Para optimizar el rendimiento del sistema, la carga se realiza a petición.
                </p>
                <Button variant="primary" onClick={loadHistory} disabled={isLoadingHistory} className="shadow-md">
                  Cargar Historial Completo
                </Button>
              </div>
            ) : (
              <DataTable
                columns={historyColumns}
                data={history}
                keyExtractor={(row) => row.id}
                emptyMessage="No se encontraron notificaciones enviadas."
              />
            )}
          </div>
        )}

        <EditTemplateModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleUpdateTemplate}
          isUpdating={isUpdating}
          template={selectedTemplate}
        />

      </div>
    </DashboardLayout>
  );
}