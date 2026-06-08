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

    useEffect(() => {
        let isMounted = true;

        const fetchClients = async () => {
            try {
                // Obtenemos todos los usuarios del sistema
                const allUsers = await userService.getUsers();
                
                if (isMounted) {
                    // Filtramos puramente a nivel frontend (Deuda técnica documentada)
                    const onlyClients = allUsers.filter(user => user.tipo === 'empresa');
                    setClients(onlyClients);
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
            
            return razonSocial.includes(searchLower) || cuit.includes(searchLower);
        });
    }, [clients, searchTerm]);

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
        totalPages
    };
};