import { Column } from '../../users/components/DataTable';
import { Usuario } from '@/types/usuario';

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
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
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
    header: 'Acciones', 
    accessor: (row) => (
      <button 
        onClick={() => console.log('Ver detalle de', row.id)}
        className="text-orange-600 hover:text-orange-800 font-bold transition-colors cursor-pointer"
      >
        Ver detalle
      </button>
    )
  }
];