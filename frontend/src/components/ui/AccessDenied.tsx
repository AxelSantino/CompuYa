import { useRouter } from 'next/navigation';
import { Button } from './Button';

interface AccessDeniedProps {
  mensaje?: string;
}

export const AccessDenied = ({ 
  mensaje = "No tienes los permisos necesarios para visualizar esta pantalla." 
}: AccessDeniedProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100 max-w-md">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🛑
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600 mb-8">
          {mensaje}
        </p>
        <Button variant="secondary" onClick={() => router.push('/dashboard')}>
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};