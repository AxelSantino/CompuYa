'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { FaDownload, FaInfoCircle } from 'react-icons/fa';

import { useNotifications } from './hooks/useNotifications';
import { NotificationsTabs } from './components/NotificationTabs';
import { TemplateCard } from './components/TemplateCard';
import { EditTemplateModal } from './components/EditTemplateModal';

import { DataTable, Column } from '@/app/dashboard/users/components/DataTable';
import { HistorialNotificacion, PlantillaCorreo } from '@/types/notificacion';

import { NotificationFilter, FilterOption } from './components/NotificationFilter';

import { ErrorDetailModal } from './components/ErrorDetailModal';

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

  const [filterResult, setFilterResult] = useState<FilterOption>('Todos');

  
  const handleEditClick = (template: PlantillaCorreo) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTemplate(null), 200);
  };


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
      header: 'Asunto',
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
              <button 
                onClick={() => setErrorModal({ isOpen: true, message: row.motivo_error || 'Error desconocido' })}
                className="text-red-500 transition-transform hover:scale-110 focus:outline-none"
                title="Hacer clic para ver el detalle del error"
              >
                <FaInfoCircle size={16} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  const filteredHistory = history.filter(notif => {
    if (filterResult === 'Todos') return true;
    return notif.resultado.toLowerCase() === filterResult.toLowerCase();
  });

  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Historial de notificaciones enviadas</h3>
                <Button variant="primary" onClick={loadHistory} disabled={isLoadingHistory} className="shadow-md">
                  Cargar Historial Completo
                </Button>
              </div>
            ) : (
              <div>
              <NotificationFilter 
                filterResult={filterResult}
                onFilterChange={setFilterResult}
                totalCount={filteredHistory.length}
              />
              <DataTable
                columns={historyColumns}
                data={filteredHistory}
                keyExtractor={(row) => row.id}
                emptyMessage={
                  filterResult !== 'Todos' 
                    ? `No se encontraron notificaciones con estado "${filterResult}".` 
                    : "No se encontraron notificaciones enviadas."
                }
              />
              </div>
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

        <ErrorDetailModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
          errorMessage={errorModal.message}
        />

      </div>
    </DashboardLayout>
  );
}