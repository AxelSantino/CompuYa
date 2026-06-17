import { Column } from '../../users/components/DataTable';
import { Usuario } from '@/types/usuario';
import Link from 'next/link';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export const getStatusBadgeClasses = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};
export const getClientColumns = (t: any): Column<Usuario>[] => [
  { header: 'ID', accessor: 'id' },
  { 
    header: t('clientsPage.razon_social'), 
    accessor: (row) => row.perfil_empresa?.razon_social || '-'
  },
  { 
    header: 'CUIT', 
    accessor: (row) => row.perfil_empresa?.cuit || '-'
  },
  { header: 'Email', accessor: 'email' },
  { 
    header: t('clientsPage.direccion'), 
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
    header: t('clientsPage.fecha_alta'), 
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
    header: t('clientsPage.acciones'), 
    accessor: (row) => (
      <Link 
        href={`/dashboard/clients/${row.id}`}
        className="text-orange-600 hover:text-orange-800 font-bold transition-colors cursor-pointer"
      >
        {t('clientsPage.ver_detalle')}
      </Link>
    )
  }
];