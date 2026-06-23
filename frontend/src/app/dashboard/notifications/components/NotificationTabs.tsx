import { TabType } from '../hooks/useNotifications';
import { FaEnvelopeOpenText, FaHistory } from 'react-icons/fa';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface NotificationsTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const NotificationsTabs = ({ activeTab, setActiveTab }: NotificationsTabsProps) => {
  const { t } = useTranslation();
  
  return (
    <div 
      // a11y: Rol de lista de pestañas y su etiqueta
      role="tablist" 
      aria-label={t('notificationsPage.aria_tabs_navegacion', 'Navegación de notificaciones')}
      className="flex border-b border-gray-200 mb-6"
    >
      <button
        // a11y: Rol de pestaña y estado de selección dinámico
        role="tab"
        aria-selected={activeTab === 'templates'}
        onClick={() => setActiveTab('templates')}
        // a11y: Se agrega focus-visible para navegación por teclado
        className={`flex items-center gap-2 py-4 px-6 font-medium text-sm transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-md ${
          activeTab === 'templates'
            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        {/* a11y: Silenciamos el icono decorativo */}
        <FaEnvelopeOpenText aria-hidden="true" /> {t('notificationsPage.plantillas_correo')}
      </button>
      <button
        // a11y: Rol de pestaña y estado de selección dinámico
        role="tab"
        aria-selected={activeTab === 'history'}
        onClick={() => setActiveTab('history')}
        // a11y: Se agrega focus-visible para navegación por teclado
        className={`flex items-center gap-2 py-4 px-6 font-medium text-sm transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-md ${
          activeTab === 'history'
            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        {/* a11y: Silenciamos el icono decorativo */}
        <FaHistory aria-hidden="true" /> {t('notificationsPage.hist_notis_env')}
      </button>
    </div>
  );
};