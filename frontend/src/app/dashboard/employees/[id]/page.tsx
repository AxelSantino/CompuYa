'use client';

import React, { use } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
// 1. Importamos BackButton
import { BackButton } from '@/components/ui/BackButton';
import { FaUserTie, FaEnvelope, FaIdBadge, FaCalendarAlt, FaUserSlash, FaUserCheck } from 'react-icons/fa';
import { useEmployeeProfile } from './hooks/useEmployeeProfile'
import { getRoleBadgeClasses } from '../components/employeeColumns';
import { ConfirmActionModal } from '@/app/dashboard/users/components/ConfirmActionModal';
import withAuth from '@/components/auth/withAuth';
import { useTranslation } from 'react-i18next';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100">
    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
      {/* a11y: Ocultamos el icono para lectores de pantalla */}
      <span aria-hidden="true" className="text-gray-400">{icon}</span> {label}
    </h4>
    <p className="text-sm font-medium text-gray-900 ml-6">{value}</p>
  </div>
);

function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { t } = useTranslation();
  const {
    router, employee, isLoading, error, isEditing, setIsEditing,
    isSaving, formData, handleChange, handleCancelEdit, handleSave, 
    isChangingStatus, isStatusModalOpen, pendingStatus, handleRequestStatusChange, handleCloseStatusModal, handleConfirmStatusChange
  } = useEmployeeProfile(resolvedParams.id);

  if (error) {
    return (
      <DashboardLayout>
        {/* a11y: Rol de alerta y contraste a red-600 */}
        <div role="alert" className="p-6 text-center text-red-600 font-medium">
          {error}
          <div className="mt-4">
            <Button variant="secondary" onClick={() => router.push('/dashboard/employees')}>
              {/* i18n: Pasado por el traductor */}
              {t('employeeDetail.volver_listado', 'Volver al listado')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const iniciales = employee ? `${employee.perfil_empleado?.nombre?.charAt(0) || ''}${employee.perfil_empleado?.apellido?.charAt(0) || ''}`.toUpperCase() : '👤';

  const isEmployeeActive = employee?.activo ?? true;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 relative min-h-screen">
        {/* i18n: Pasado por el traductor */}
        <LoadingOverlay isLoading={isLoading} text={t('employeeDetail.cargando_perfil', 'Cargando perfil del empleado...')} />

        {/* 2. a11y & DRY: Implementación de BackButton */}
        <BackButton 
          label={t('employeeDetail.volver')} 
          className="mb-6"
        />

        {employee && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              <div className="p-6 md:p-10">
                
                {/* CABECERA Y BOTONES DE ACCIÓN */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-500 shadow-sm shrink-0 relative">
                      {iniciales}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-3">
                        {employee.perfil_empleado?.nombre} {employee.perfil_empleado?.apellido}
                      </h1>
                      <span className={`text-sm font-medium ${isEmployeeActive ? 'text-green-600' : 'text-red-600'}`}>
                        {isEmployeeActive ? t('employeeDetail.cuenta_activa') : t('employeeDetail.cuenta_inactiva')}
                      </span>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <div className="flex gap-3">
                      <Button 
                        variant={isEmployeeActive ? 'danger' : 'success'}
                        onClick={() => handleRequestStatusChange(!isEmployeeActive)}
                        className="flex items-center gap-2"
                      >
                        {/* a11y: Silenciamos los iconos decorativos */}
                        <span aria-hidden="true">
                          {isEmployeeActive ? <FaUserSlash /> : <FaUserCheck />}
                        </span>
                        {isEmployeeActive ? t('employeeDetail.btn_desactivar') : t('employeeDetail.btn_activar')}
                      </Button>              
                      <Button variant="secondary" onClick={() => setIsEditing(true)}>
                        {t('employeeDetail.btn_editar')}
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <div>
                        {/* a11y: Vinculamos label e input */}
                        <label htmlFor="nombre" className="block text-sm font-bold text-gray-700 mb-1">{t('employeeDetail.form.nombre')}</label>
                        <Input id="nombre" name="nombre" required value={formData.nombre} onChange={handleChange} disabled={isSaving} />
                      </div>
                      <div>
                        {/* a11y: Vinculamos label e input */}
                        <label htmlFor="apellido" className="block text-sm font-bold text-gray-700 mb-1">{t('employeeDetail.form.apellido')}</label>
                        <Input id="apellido" name="apellido" required value={formData.apellido} onChange={handleChange} disabled={isSaving} />
                      </div>
                      <div>
                        {/* a11y: Vinculamos label e input */}
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">{t('employeeDetail.form.email')}</label>
                        <Input id="email" name="email" type="email" value={employee.email} disabled={true} className="bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" />
                        {/* a11y: Contraste mejorado a gray-500 */}
                        <p className="text-xs text-gray-500 mt-1">{t('employeeDetail.form.email_bloqueado')}</p>
                      </div>
                      <div>
                        {/* a11y: Vinculamos label y select */}
                        <label htmlFor="rol" className="block text-sm font-bold text-gray-700 mb-1">{t('employeeDetail.form.rol')}</label>
                        <Select id="rol" name="rol" value={formData.rol} onChange={handleChange} disabled={isSaving}>
                          <option value="operador">{t('employeesPage.roles.operador')}</option>
                          <option value="repartidor">{t('employeesPage.roles.repartidor')}</option>
                          <option value="supervisor">{t('employeesPage.roles.supervisor')}</option>
                          <option value="admin">{t('employeesPage.roles.admin')}</option>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="secondary" type="button" onClick={handleCancelEdit} disabled={isSaving}>{t('employeeDetail.form.btn_cancelar')}</Button>
                      <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? t('employeeDetail.form.guardando') : t('employeeDetail.form.btn_guardar')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <DetailItem icon={<FaUserTie />} label={t('employeeDetail.details.nombre_completo')} value={`${employee.perfil_empleado?.nombre} ${employee.perfil_empleado?.apellido}`.trim()} />
                    <DetailItem icon={<FaIdBadge />} label={t('employeeDetail.details.rol_asignado')} 
                    value={<span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize  ${getRoleBadgeClasses(employee.rol)}`}>
                        {t(`employeesPage.roles.${employee.rol.toLowerCase()}`)}</span>} />
                    <DetailItem icon={<FaEnvelope />} label={t('employeeDetail.details.email')} value={employee.email} />
                    <DetailItem icon={<FaCalendarAlt />} label={t('employeeDetail.details.fecha_registro')} value={new Date(employee.fecha || '').toLocaleDateString('es-AR')} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmActionModal
          isOpen={isStatusModalOpen}
          isLoading={isChangingStatus}
          variant={pendingStatus ? 'success' : 'danger'}
          // a11y: Silenciamos los iconos decorativos
          icon={pendingStatus ? <FaUserCheck aria-hidden="true" /> : <FaUserSlash aria-hidden="true" />}
          title={pendingStatus ? t('employeeDetail.modal.activar_title') : t('employeeDetail.modal.desactivar_title')}
          message={
            pendingStatus
              ? t('employeeDetail.modal.activar_msg')
              : t('employeeDetail.modal.desactivar_msg')
          }
          confirmText={pendingStatus ? t('employeeDetail.modal.confirm_activar') : t('employeeDetail.modal.confirm_desactivar')}
          cancelText={t('employeeDetail.modal.cancelar')}
          onClose={handleCloseStatusModal}
          onConfirm={handleConfirmStatusChange}
        />
      </div>
    </DashboardLayout>
  );
}

export default withAuth(EmployeeDetailPage, ['admin']);