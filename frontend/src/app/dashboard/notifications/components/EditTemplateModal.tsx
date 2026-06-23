import React, { useState, useEffect, useRef } from 'react';
import { PlantillaCorreo } from '@/types/notificacion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
// Importamos el hook de focus trap
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: PlantillaCorreo) => Promise<boolean>;
  isUpdating: boolean;
  template: PlantillaCorreo | null;
}

export const EditTemplateModal = ({ isOpen, onClose, onSave, isUpdating, template }: EditTemplateModalProps) => {
  const [formData, setFormData] = useState<PlantillaCorreo | null>(null);
  const { t } = useTranslation();
  
  // Referencia para el contenedor principal del modal
  const modalRef = useRef<HTMLDivElement>(null);

  // a11y: Atrapamos el foco para que el tabulador no se escape
  useFocusTrap({ 
    isOpen, 
    onClose, 
    modalRef, 
    isProcessing: isUpdating 
  });

  useEffect(() => {
    if (isOpen && template) {
      setFormData(template);
    }
  }, [isOpen, template]);

  if (!isOpen || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        ref={modalRef}
        // a11y: Semántica obligatoria para ventanas emergentes
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200"
      >
        
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
          {/* a11y: Vinculación del título con aria-labelledby */}
          <h3 id="modal-title" className="text-lg font-bold text-blue-800">
            {t('notificationsPage.editar_plant')}: <span className="uppercase text-blue-600">{formData.estado_disparador}</span>
          </h3>
          <button 
            onClick={onClose} 
            disabled={isUpdating} 
            // a11y: Etiqueta para lectores, mejora de contraste a blue-500 y focus-visible para tabulador
            aria-label={t('notificationsPage.aria_cerrar_modal', 'Cerrar modal')}
            className="text-blue-500 hover:text-blue-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          >
            {/* a11y: Icono silenciado */}
            <FaTimes aria-hidden="true" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              {/* a11y: Vinculación del label e input mediante htmlFor */}
              <label htmlFor="asunto" className="block text-sm font-bold text-gray-700 mb-1">
                {t('notificationsPage.asunt_correo')}
              </label>
              <Input
                id="asunto"
                type="text"
                required
                disabled={isUpdating}
                value={formData.asunto}
                onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
              />
            </div>

            <div>
              {/* a11y: Vinculación del label e input mediante htmlFor */}
              <label htmlFor="cuerpo" className="block text-sm font-bold text-gray-700 mb-1">
                {t('notificationsPage.cuerpo_mens')}
              </label>
              <textarea
                id="cuerpo"
                required
                rows={5}
                disabled={isUpdating}
                value={formData.cuerpo}
                onChange={(e) => setFormData({ ...formData, cuerpo: e.target.value })}
                // a11y: Cambio de focus:ring a focus-visible:ring para seguir tu estándar
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
              />
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-md flex gap-3 mt-2">
              {/* a11y: Icono decorativo silenciado */}
              <FaInfoCircle aria-hidden="true" className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <strong>{t('notificationsPage.variables_din')}:</strong> {t('notificationsPage.podes_usar')} <code>{'{descripcion_producto}'}</code> y <code>{'{estado_texto}'}</code> {t('notificationsPage.el_sistema_las_reemplazara')}. 
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-100">
              <input 
                type="checkbox" 
                id="activa"
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                disabled={isUpdating}
                // a11y: Añadido focus-visible para navegación por teclado
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
              <label htmlFor="activa" className="text-sm font-medium text-gray-700 cursor-pointer">
                {t('notificationsPage.plant_activa')}
              </label>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={onClose} 
              disabled={isUpdating}
              // a11y: Autofocus para que sea la opción por defecto y prevenir guardados accidentales
              autoFocus
            >
              {t('notificationsPage.boton_cancelar')}
            </Button>
            <Button variant="primary" type="submit" disabled={isUpdating}>
              {isUpdating ? t('notificationsPage.guardando') : t('notificationsPage.guardar_plantilla')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};