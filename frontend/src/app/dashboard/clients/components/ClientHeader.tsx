import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export const ClientHeader = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
            <div>
                <h2 className="text-2xl font-bold mb-1">Gestión de Clientes</h2>
                <p className="text-gray-600">
                    Administración, alta y seguimiento de clientes (destinatarios).
                </p>
            </div>
            <Button
                variant="primary"
                className="w-full md:w-auto"
                onClick={() => router.push('/dashboard/clients/new')}
            >
                + Nuevo Cliente
            </Button>
        </div>
    );
};