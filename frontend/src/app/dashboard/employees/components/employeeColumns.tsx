import { Column } from '../../users/components/DataTable';
import { Usuario } from '@/types/usuario';
import Link from 'next/link';

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

export const getEmployeeColumns = (): Column<Usuario>[] => [
  { header: 'ID', accessor: 'id' },
  { 
    header: 'Nombre Completo', 
    accessor: (row) => {
      const nombre = row.perfil_empleado?.nombre || '-';
      const apellido = row.perfil_empleado?.apellido || '';
      return <span>{`${nombre} ${apellido}`.trim()}</span>;
    }
  },
  { header: 'Email', accessor: 'email' },
  { 
    header: 'Rol', 
    accessor: (row) => (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getRoleBadgeClasses(row.rol)}`}>
        {row.rol}
      </span>
    )
  },
  { 
    header: 'Fecha Alta', 
    accessor: (row) => {
      if (!row.fecha) return '-';
      const [year, month, day] = row.fecha.split('T')[0].split('-');

      return `${day}/${month}/${year}`;
    }
  },
  {
    header: 'Estado',
    accessor: (row) => {
      const isActive = row.activo ?? false; 
      
      return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(isActive)}`}>
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      );
    }
  },
  { 
    header: 'Acciones', 
    accessor: (row) => (
      <Link 
        href={`/dashboard/employees/${row.id}`}
        className="text-orange-600 hover:text-orange-800 font-bold transition-colors cursor-pointer"
      >
        Ver detalle
      </Link>
    )
  }
];