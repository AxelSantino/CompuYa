import { useState, useEffect, useMemo } from 'react';
import userService from '@/services/userService';
import { Usuario } from '@/types/usuario';
import { useAuth } from '@/contexts/AuthContext';
import { usePagination } from '@/hooks/usePagination';

export const useClientManager = () => {
    const [clients, setClients] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        let isMounted = true;

        const fetchClients = async () => {
            try {
                // Obtenemos todos los clientes del sistema
                const clientsData = await userService.getClients();

                // -- ORDENAR CLIENTES POR FECHA DESCENDENTE -- 
                clientsData.sort((a, b) => b.fecha.localeCompare(a.fecha));
                
                if (isMounted) {
                    setClients(clientsData);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Error al cargar la lista de clientes. Intente nuevamente.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchClients();

        return () => {
            isMounted = false;
        };
    }, []);

    // Aplicamos los filtros de búsqueda y rol
    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            const searchLower = searchTerm.toLowerCase();
            
            const razonSocial = client.perfil_empresa?.razon_social?.toLowerCase() || '';
            const cuit = client.perfil_empresa?.cuit || '';
            const matchesSearch = razonSocial.includes(searchLower) || cuit.includes(searchLower);

            let matchesStatus = true;
            if (statusFilter === 'active') {
                matchesStatus = client.activo === true;
            } else if (statusFilter === 'inactive') {
                matchesStatus = client.activo === false;
            }
            
            return matchesSearch && matchesStatus;
        });
    }, [clients, searchTerm, statusFilter]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        currentPageData: paginatedClients,
    } = usePagination(filteredClients, 15);

    const { user } = useAuth();

    return {
        user,
        searchTerm,
        setSearchTerm,
        isLoading,
        error,
        filteredClients,
        paginatedClients,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages, 
        statusFilter, 
        setStatusFilter
    };
};