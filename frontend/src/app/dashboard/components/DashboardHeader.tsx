import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export const DashboardHeader = ({ user }: { user: any }) => {
    const router = useRouter();

    let title = ''
    let subtitle = ''

    if ( user.rol === 'cliente') {
        title = "Mi dashboard de envíos"
        subtitle = "Listado y seguimiento de todos tus envíos"
    } else {
        title = "Gestión de envíos"
        subtitle = "Listado y administración de los envíos de productos informáticos registrados en el sistema."
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
                <Button
                    variant="primary"
                    className="w-full md:w-auto"
                    onClick={() => router.push('/dashboard/new')}
                >
                    + Nuevo Envío
                </Button>
            )}
        </div>
    );
};