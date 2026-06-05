import { useState, useEffect, useMemo } from 'react';
import userService from '@/services/userService';
import { Usuario } from '@/types/usuario';
import { useAuth } from '@/contexts/AuthContext';

export const useClientManager = () => {
    const [clients, setClients] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('');

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
                    setError('Error al cargar la lista de clients. Intente nuevamente.');
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
            
            // Búsqueda por Razón Social o CUIT
            const matchesSearch = razonSocial.includes(searchLower) || cuit.includes(searchLower);
                
            // Verificamos coincidencia de rol
            const clientProvince = client.perfil_empresa?.provincia?.toLowerCase() || '';
            const matchesProvince = provinceFilter === '' || clientProvince === provinceFilter.toLowerCase();

            return matchesSearch && matchesProvince;
        });
    }, [clients, searchTerm, provinceFilter]);

    const { user } = useAuth();

    return {
        user,
        searchTerm,
        setSearchTerm,
        provinceFilter,
        setProvinceFilter,
        isLoading,
        error,
        filteredClients
    };
};