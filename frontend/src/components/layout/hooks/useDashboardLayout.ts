import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { BiCube } from "react-icons/bi";
import { FaRoute, FaUsers } from "react-icons/fa";

const NAV_ITEMS = [
  { name: 'Gestión de envíos', href: '/dashboard', icon: BiCube, roles: ['admin', 'supervisor', 'operador', 'visor'] },
  { name: 'Control Logístico', href: '/dashboard/routes', icon: FaRoute, roles: ['admin', 'supervisor', 'repartidor'] },
  { name: 'Gestión de usuarios', href: '/dashboard/users', icon: FaUsers, roles: ['admin']}
];

export const useDashboardLayout = () => {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const filteredNavItems = NAV_ITEMS.filter(item => 
        !item.roles || (user && item.roles.includes(user.rol))
    );

    const getUserName = () => {
        if (!user) return 'Usuario';
        if (user.tipo === 'empleado' && user.perfil_empleado) {
            return user.perfil_empleado.nombre || 'Empleado';
        }
        if (user.tipo === 'empresa' && user.perfil_empresa) {
            return user.perfil_empresa.razon_social || 'Empresa';
        }
        return user.email.split('@')[0];
    };

    return {
        user,
        isLoading,
        pathname,
        userName: getUserName(),
        filteredNavItems,
        handleLogout
    };
};