import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';



export const DashboardHeader = ({ user }: { user: any }) => {
    const router = useRouter();
    const{t}=useTranslation();
    let title = ''
    let subtitle = ''

    if ( user.rol === 'cliente') {
        title = "Mi dashboard de envíos"
        subtitle = "Listado y seguimiento de todos tus envíos"
    } else {
        title = t('dashboard_header.gestion_de_envios')
        subtitle = t('dashboard_header.listado_y_administracion')
    }


    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
            <div>
                <h2 className="text-2xl font-bold mb-1">{title}</h2>
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
        </div>
    );
};