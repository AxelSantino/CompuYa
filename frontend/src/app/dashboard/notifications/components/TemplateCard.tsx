import { PlantillaCorreo } from '@/types/notificacion';
import { Button } from '@/components/ui/Button';
import { FaEdit } from 'react-icons/fa';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface TemplateCardProps {
  template: PlantillaCorreo;
  onEdit: (template: PlantillaCorreo) => void;
}

export const TemplateCard = ({ template, onEdit }: TemplateCardProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          {/* a11y: Texto invisible para dar contexto al lector de pantalla */}
          <span className="sr-only">{t('notificationsPage.aria_disparador', 'Disparador:')}</span>
          {template.estado_disparador}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${template.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {template.activa ? t('notificationsPage.temp_activa') : t('notificationsPage.temp_inactiva')}
        </span>
      </div>
      
      <div className="flex-grow">
        {/* a11y: Corregido de h3 a p para no romper la jerarquía semántica, y contraste mejorado */}
        <p className="text-sm font-semibold text-gray-600 mb-1">{t('notificationsPage.asunto')}:</p>
        <p className="text-gray-900 font-medium mb-4">{template.asunto}</p>
        
        {/* a11y: Corregido de h3 a p para no romper la jerarquía semántica, y contraste mejorado */}
        <p className="text-sm font-semibold text-gray-600 mb-1">{t('notificationsPage.cuerpo_mens')}:</p>
        <p className="text-gray-700 text-sm italic bg-gray-50 p-3 rounded-md border border-gray-100 line-clamp-3">
          "{template.cuerpo}"
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => onEdit(template)}
        >
          {/* a11y: Icono decorativo silenciado */}
          <FaEdit aria-hidden="true" /> {t('notificationsPage.editar_plant')}
        </Button>
      </div>
    </div>
  );
};