import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export const EmployeeHeader = () => {
    const {t} = useTranslation();
    const router = useRouter();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
            <div>
                <h1 className="text-2xl font-bold mb-1">{t('employeesPage.titulo')}</h1>
                <p className="text-gray-600">
                    {t('employeesPage.subtitulo')}
                </p>
            </div>
            <Button
                variant="primary"
                className="w-full md:w-auto"
                onClick={() => router.push('/dashboard/employees/new')}
            >
                {/* a11y: Ocultamos el '+' del lector de pantalla para evitar que lea "Más nuevo empleado" */}
                <span aria-hidden="true" className="mr-1">+</span>
                {t('employeesPage.nuevo_empleado')}
            </Button>
        </div>
    );
};