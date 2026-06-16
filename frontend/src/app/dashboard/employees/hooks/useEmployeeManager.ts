import { useState, useEffect, useMemo } from 'react';
import userService from '@/services/userService';
import { Usuario } from '@/types/usuario';
import { useAuth } from '@/contexts/AuthContext';
import { usePagination } from '@/hooks/usePagination';

export const useEmployeeManager = () => {
    const [employees, setEmployees] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchEmployees = async () => {
            try {
                // Obtenemos todos los empleados del sistema
                const employeesData = await userService.getEmployees();
                
                // -- ORDENAR EMPLEADOS POR FECHA DESCENDENTE -- 
                employeesData.sort((a, b) => b.fecha.localeCompare(a.fecha));
                
                if (isMounted) {
                    setEmployees(employeesData);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Error al cargar la lista de empleados. Intente nuevamente.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchEmployees();

        return () => {
            isMounted = false;
        };
    }, []);

    // Aplicamos los filtros de búsqueda y rol
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const searchLower = searchTerm.toLowerCase();
            
            // Construimos el nombre completo de forma segura
            const nombre = emp.perfil_empleado?.nombre || '';
            const apellido = emp.perfil_empleado?.apellido || '';
            const nombreCompleto = `${nombre} ${apellido}`.toLowerCase();
            
            // Verificamos si la búsqueda coincide con el nombre o el email
            const matchesSearch = 
                nombreCompleto.includes(searchLower) || 
                emp.email.toLowerCase().includes(searchLower);
                
            // Verificamos coincidencia de rol
            const matchesRole = roleFilter === '' || emp.rol === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [employees, searchTerm, roleFilter]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        currentPageData: paginatedEmployees,
    } = usePagination(filteredEmployees, 15);

    const { user } = useAuth();

    return {
        user,
        searchTerm,
        setSearchTerm,
        roleFilter,
        setRoleFilter,
        isLoading,
        error,
        filteredEmployees,
        paginatedEmployees,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages
    };
};