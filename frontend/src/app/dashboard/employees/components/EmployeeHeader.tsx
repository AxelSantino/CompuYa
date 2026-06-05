import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export const EmployeeHeader = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
            <div>
                <h2 className="text-2xl font-bold mb-1">Gestión de Empleados</h2>
                <p className="text-gray-600">
                    Administración de personal, asignación de roles y control de accesos.
                </p>
            </div>
            <Button
                variant="primary"
                className="w-full md:w-auto"
                onClick={() => router.push('/dashboard/employees/new')}
            >
                + Nuevo Empleado
            </Button>
        </div>
    );
};