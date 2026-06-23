import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio, EnvioStatus } from '@/types/envio';
import { usePagination } from '@/hooks/usePagination';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export const useShipmentList = () => {
    const router = useRouter();
    const { user } = useAuth();

    // Estados de datos y filtros
    const [shipments, setShipments] = useState<Envio[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EnvioStatus | ''>('');

    // Estados de UI
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const{t}=useTranslation();

    // 1. Control de Acceso (Redirección de seguridad)
    useEffect(() => {
        if (user && user.rol === 'repartidor') {
            router.replace('/dashboard/routes');
        }
    }, [user, router]);

    // 2. Carga de Datos
    useEffect(() => {
        let isMounted = true;

        const fetchShipments = async () => {
            // Solo buscamos datos si el usuario existe y tiene permisos para ver esta tabla
            if (user && user.rol !== 'repartidor') {
                try {
                    const data = await shipmentService.getShipments();
                    if (isMounted) {
                        
                        // -- ORDENAR ENVIOS POR FECHA DESCENDENTE -- 
                        data.sort((a, b) => b.fecha_creacion.localeCompare(a.fecha_creacion));

                        setShipments(data);
                    }
                } catch {
                    if (isMounted) {
                        setError(t('shipmentTable.error_al_cargar_envios'));
                    }
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            } else if (!user) {
                // Sigue cargando mientras se resuelve el AuthContext
            } else {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchShipments();

        return () => {
            isMounted = false; // Previene memory leaks si el componente se desmonta
        };
    }, [user]);


    // 3. Reglas de Negocio (Filtrado en memoria)
    const filteredShipments = useMemo(() => {
        return shipments.filter((shipment) => {
            const matchesSearch = shipment.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === '' || shipment.estado === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [shipments, searchTerm, statusFilter]);


    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        currentPageData: paginatedShipments,
    } = usePagination(filteredShipments, 15);

    return {
        user,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isLoading,
        error,
        filteredShipments,
        paginatedShipments,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
    };
};