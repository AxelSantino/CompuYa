'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { FaInfoCircle } from 'react-icons/fa';
import { AiOutlineHistory } from 'react-icons/ai'

import { useNotifications } from './hooks/useNotifications';
import { NotificationsTabs } from './components/NotificationTabs';
import { TemplateCard } from './components/TemplateCard';
import { EditTemplateModal } from './components/EditTemplateModal';

import { DataTable, Column } from '@/app/dashboard/users/components/DataTable';
import { HistorialNotificacion, PlantillaCorreo } from '@/types/notificacion';

import { NotificationFilter, FilterOption } from './components/NotificationFilter';

import { ErrorDetailModal } from './components/ErrorDetailModal';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

import withAuth from '@/components/auth/withAuth';

function NotificationsPage() {
  const {t} = useTranslation();
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
      header: t('notificationsPage.fecha_envio'),
      accessor: (row) => new Date(row.fecha_envio).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    },
    {
      header: t('notificationsPage.dest'),
      accessor: 'destinatario_email',
      className: 'font-semibold text-gray-900'
    },
    {
      header: t('notificationsPage.asunto'),
      accessor: 'asunto_enviado'
    },
    {
      header: t('notificationsPage.canal'),
      accessor: (row) => <span className="capitalize">{row.canal}</span>
    },
    {
      header: t('notificationsPage.result'),
      accessor: (row) => {
        const isSuccess = row.resultado.toLowerCase() === 'exitoso';
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
        
        <LoadingOverlay isLoading={isLoadingTemplates} text={t('notificationsPage.cargando_config')} />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('notificationsPage.titulo')}</h1>
          <p className="text-gray-600 mt-1">{t('notificationsPage.subtitulo')}</p>
        </div>

        <NotificationsTabs activeTab={activeTab} setActiveTab={setActiveTab} />


        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {templates.length === 0 && !isLoadingTemplates ? (
              <div className="col-span-full flex justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">{t('notificationsPage.no_hay_plantillas')}</p>
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
            <LoadingOverlay isLoading={isLoadingHistory} text={t('notificationsPage.descargando_registros')} />
            
            {!historyLoaded ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full absolute inset-0">
                <div className="bg-blue-50 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-sm">
                  <AiOutlineHistory size={35} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('notificationsPage.hist_notis')}</h3>
                <Button variant="primary" onClick={loadHistory} disabled={isLoadingHistory} className="shadow-md">
                  {t('notificationsPage.cargar_hist_comp')}
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
                  filterResult !== t('notificationsPage.todos')
                    ? "t('notificationsPage.no_notis_estado') ${filterResult}" 
                    : t('notificationsPage.no_notis_enviadas')
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

export default withAuth(NotificationsPage, ['admin']);