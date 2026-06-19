'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { useAuth } from '@/contexts/AuthContext';

import { useEmployeeForm } from './hooks/useEmployeeForm';
import { AccountCredentialsSection } from '../../users/components/AccountCredentialsSection';
import { EmployeeDetailsSection } from './components/EmployeeDetailsSection';
import { SuccessFeedback } from '@/components/ui/SuccessFeedback';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function NewEmployeePage() {
  const {t} = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  
  const { 
    formData, 
    handleChange, 
    handleSubmit, 
    isLoading, 
    error,
    createdEmployee
  } = useEmployeeForm();

  // 2. Control de seguridad (Solo Admin puede registrar empleados)
  if (!user || user.rol !== 'admin') {
    return (
      <DashboardLayout>
        <AccessDenied mensaje={t('newEmployeesPage.no_tienes_permisos')} />
      </DashboardLayout>
    );
  }


  if (createdEmployee) {
    return (
      <DashboardLayout>
        <SuccessFeedback 
          title= {t('newEmployeesPage.registro_exitoso')}
          message={
            <p>
              {t('newEmployeesPage.el_empleado')} <span className="font-bold text-gray-900">{formData.nombre} {formData.apellido}</span> {t('newEmployeesPage.ha_sido_creado')} <span className="font-bold text-orange-600">#{createdEmployee.id}</span>.
            </p>
          }
          buttonText={t('newEmployeesPage.volver_nomina_emp')}
          onButtonClick={() => router.push('/dashboard/employees')}
        />
      </DashboardLayout>
    );
  }

  // 3. Renderizado de la vista principal
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        
        {/* Navegación y Encabezado */}
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
        >
          <span className="mr-1 group-hover:-translate-x-1 transition-transform inline-block">←</span> 
          {t('newEmployeesPage.volver_nomina')}
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {t('newEmployeesPage.registrar_emp')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('newEmployeesPage.crea_nueva_cuenta')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <AccountCredentialsSection 
            formData={formData} 
            handleChange={handleChange} 
            isLoading={isLoading} 
          />
          
          <EmployeeDetailsSection 
            formData={formData} 
            handleChange={handleChange} 
            isLoading={isLoading} 
          />
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => router.push('/dashboard/employees')} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {t('newEmployeesPage.boton_cancelar')}
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto shadow-md"
            >
              {isLoading ? t('newEmployeesPage.registrando') : t('newEmployeesPage.registrar_empleado')}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-400 pb-8 mt-4">
            {t('newEmployeesPage.campos_obligatorios')}
          </p>
          
        </form>
      </div>
    </DashboardLayout>
  );
}