import { Column } from '../../users/components/DataTable';
import { Usuario } from '@/types/usuario';

export const getClientColumns = (): Column<Usuario>[] => [
  { header: 'ID', accessor: 'id' },
  { 
    header: 'Razón social', 
    accessor: (row) => row.perfil_empresa?.razon_social || '-'
  },
  { 
    header: 'CUIT', 
    accessor: (row) => row.perfil_empresa?.cuit || '-'
  },
  { header: 'Email', accessor: 'email' },
  { 
    header: 'Dirección', 
    accessor: (row) => {
      const direccion = row.perfil_empresa?.direccion_normalizada || '-';
      return (
        <div className="whitespace-normal break-words min-w-[200px] md:min-w-[300px]" title={direccion}>
          {direccion}
        </div>
      );
    }
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