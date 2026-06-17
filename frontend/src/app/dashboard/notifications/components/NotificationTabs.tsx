import { TabType } from '../hooks/useNotifications';
import { FaEnvelopeOpenText, FaHistory } from 'react-icons/fa';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface NotificationsTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const NotificationsTabs = ({ activeTab, setActiveTab }: NotificationsTabsProps) => {
  const {t} = useTranslation();
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab('templates')}
        className={`flex items-center gap-2 py-4 px-6 font-medium text-sm transition-colors border-b-2 ${
          activeTab === 'templates'
            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <FaEnvelopeOpenText /> {t('notificationsPage.plantillas_correo')}
      </button>
      <button
        onClick={() => setActiveTab('history')}
        className={`flex items-center gap-2 py-4 px-6 font-medium text-sm transition-colors border-b-2 ${
          activeTab === 'history'
            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <FaHistory /> {t('notificationsPage.hist_notis_env')}
      </button>
    </div>
  );
};