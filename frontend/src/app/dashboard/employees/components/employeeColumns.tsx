import { Column } from '../../users/components/DataTable';
import { Usuario } from '@/types/usuario';
import Link from 'next/link';
import '@/i18n/i18n';
// Nota: La importación de useTranslation aquí no se usa directamente porque recibes `t` por parámetros,
// pero es correcto mantenerla si la usas en el futuro.

export const getRoleBadgeClasses = (rol: string) => {
  switch (rol.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'supervisor':
      return 'bg-emerald-100 text-emerald-800';
    case 'operador':
      return 'bg-blue-100 text-blue-800';
    case 'repartidor':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusBadgeClasses = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

export const getEmployeeColumns = (t: any): Column<Usuario>[] => [
  // i18n: Pasado por el traductor
  { header: 'ID', accessor: 'id' },
  { 
    header: t('employeesPage.nombre_completo'), 
    accessor: (row) => {
      const nombre = row.perfil_empleado?.nombre || '-';
      const apellido = row.perfil_empleado?.apellido || '';
      return <span>{`${nombre} ${apellido}`.trim()}</span>;
    }
  },
  // i18n: Pasado por el traductor
  { header: 'Email', accessor: 'email' },
  { 
    header: t('employeesPage.rol'), 
    accessor: (row) => (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(row.rol)}`}>
        {t(`employeesPage.roles.${row.rol.toLowerCase()}`)}
      </span>
    )
  },
  { 
    header: t('employeesPage.fecha_alta'), 
    accessor: (row) => {
      if (!row.fecha) return '-';
      const [year, month, day] = row.fecha.split('T')[0].split('-');

      return `${day}/${month}/${year}`;
    }
  },
  {
    header: t('employeesPage.estado'),
    accessor: (row) => {
      const isActive = row.activo ?? false; 
      
      return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(isActive)}`}>
          {isActive ? t('employeesPage.status.activo') : t('employeesPage.status.inactivo')}
        </span>
      );
    }
  },
  { 
    header: t('employeesPage.acciones'), 
    accessor: (row) => {
      // Obtenemos el nombre para darle contexto al lector de pantalla
      const nombreContexto = row.perfil_empleado?.nombre || t('employeesPage.empleado_generico', 'empleado');
      
      return (
        <Link 
          href={`/dashboard/employees/${row.id}`}
          // a11y: Etiqueta dinámica con contexto para lectores de pantalla
          aria-label={t('employeesPage.aria_ver_detalle', { nombre: nombreContexto })}
          // a11y: Contraste subido a orange-700 y anillo de foco por teclado agregado
          className="text-orange-700 hover:text-orange-900 font-bold transition-colors cursor-pointer rounded-sm px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {t('employeesPage.ver_detalle')}
        </Link>
      );
    }
  }
];