import { PlantillaCorreo } from '@/types/notificacion';
import { Button } from '@/components/ui/Button';
import { FaEdit, FaBolt } from 'react-icons/fa';

interface TemplateCardProps {
  template: PlantillaCorreo;
  onEdit: (template: PlantillaCorreo) => void;
}

export const TemplateCard = ({ template, onEdit }: TemplateCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <FaBolt className="text-blue-500" />
          {template.estado_disparador}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${template.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {template.activa ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      
      <div className="flex-grow">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Asunto:</h3>
        <p className="text-gray-900 font-medium mb-4">{template.asunto}</p>
        
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Cuerpo del mensaje:</h3>
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
          <FaEdit /> Editar Plantilla
        </Button>
      </div>
    </div>
  );
};