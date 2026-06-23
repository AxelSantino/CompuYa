import { Column } from '../../users/components/DataTable';
import { Usuario } from '@/types/usuario';
import Link from 'next/link';
import '@/i18n/i18n';
// La importación de useTranslation se mantiene por si el archivo crece
import { useTranslation } from 'react-i18next';

export const getStatusBadgeClasses = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

export const getClientColumns = (t: any): Column<Usuario>[] => [
  // Mantenemos ID, CUIT y Email estáticos según tu indicación
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
      // Reutilización inteligente del namespace de empleados
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
    header: t('clientsPage.acciones'), 
    accessor: (row) => {
      // Extraemos la razón social para darle contexto al lector de pantalla
      const empresaContexto = row.perfil_empresa?.razon_social || t('clientsPage.cliente_generico', 'cliente');

      return (
        <Link 
          href={`/dashboard/clients/${row.id}`}
          // a11y: Etiqueta dinámica con contexto para lectores de pantalla
          aria-label={t('clientsPage.aria_ver_detalle', { empresa: empresaContexto })}
          // a11y: Contraste mejorado a orange-600 y anillo de foco agregado
          className="text-orange-600 hover:text-orange-900 font-bold transition-colors cursor-pointer rounded-sm px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {t('clientsPage.ver_detalle')}
        </Link>
      );
    }
  }
];