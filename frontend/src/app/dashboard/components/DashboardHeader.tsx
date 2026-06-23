import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface User {
  rol: string;
}

interface DashboardHeaderProps {
  user: User;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    const router = useRouter();
    const{t}=useTranslation();


    const isClient = user.rol === 'cliente';

    const title = isClient 
        ? t('dashboard_header.mi_dashboard_cliente', 'Mi Dashboard') 
        : t('dashboard_header.gestion_de_envios', 'Gestión de Envíos');
        
    const subtitle = isClient 
        ? t('dashboard_header.listado_seguimiento', 'Seguimiento de mis envíos') 
        : t('dashboard_header.listado_y_administracion', 'Listado y administración general');

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-orange-700">
                    {title}
                </h1>
                <p className="text-gray-600">
                    {subtitle}
                </p>
            </div>
            {user && user.rol !== 'cliente' && (
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="primary"
                        className="w-full md:w-auto"
                        onClick={() => router.push('/dashboard/new')}
                    >
                        + {t('dashboard_header.nuevo_envio')}
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-full md:w-auto whitespace-nowrap"
                        onClick={() => router.push('/dashboard/import_csv')}
                    >
                        {t('dashboard_header.importacion_por_csv')}
                    </Button>
                </div>
            )}
        </header>
    );
};