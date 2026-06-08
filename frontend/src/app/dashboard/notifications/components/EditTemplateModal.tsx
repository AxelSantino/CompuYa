import React, { useState, useEffect } from 'react';
import { PlantillaCorreo } from '@/types/notificacion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: PlantillaCorreo) => Promise<boolean>;
  isUpdating: boolean;
  template: PlantillaCorreo | null;
}

export const EditTemplateModal = ({ isOpen, onClose, onSave, isUpdating, template }: EditTemplateModalProps) => {
  const [formData, setFormData] = useState<PlantillaCorreo | null>(null);

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-blue-800">
            Editar Plantilla: <span className="uppercase text-blue-600">{formData.estado_disparador}</span>
          </h3>
          <button onClick={onClose} disabled={isUpdating} className="text-blue-400 hover:text-blue-700 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Asunto del Correo</label>
              <Input
                type="text"
                required
                disabled={isUpdating}
                value={formData.asunto}
                onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cuerpo del Mensaje</label>
              <textarea
                required
                rows={5}
                disabled={isUpdating}
                value={formData.cuerpo}
                onChange={(e) => setFormData({ ...formData, cuerpo: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-md flex gap-3 mt-2">
              <FaInfoCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <strong>Variables dinámicas disponibles:</strong> Podés usar <code>{'{descripcion_producto}'}</code> y <code>{'{estado_texto}'}</code>. El sistema las reemplazará automáticamente con los datos reales del envío.
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-100">
              <input 
                type="checkbox" 
                id="activa"
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                disabled={isUpdating}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="activa" className="text-sm font-medium text-gray-700 cursor-pointer">
                Plantilla Activa (Enviar automáticamente cuando ocurra el evento)
              </label>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isUpdating}>
              {isUpdating ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};