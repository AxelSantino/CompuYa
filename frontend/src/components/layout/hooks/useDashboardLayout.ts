import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { BiCube } from "react-icons/bi";
import { FaRoute, FaUsers, FaHandshake, FaChartBar } from "react-icons/fa";
import { MdNotifications } from 'react-icons/md';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
    { key: 'gestion_de_envios', href: '/dashboard', icon: BiCube, roles: ['supervisor', 'operador', 'visor'] },
    { key: 'mis_envios', href: '/dashboard', icon: BiCube, roles: ['cliente'] },
    { key: 'control_logistico', href: '/dashboard/routes', icon: FaRoute, roles: ['supervisor', 'repartidor'] },
    { key: 'metricas', href: '/dashboard/metrics', icon: FaChartBar, roles: ['admin'] },
    { key: 'empleados', href: '/dashboard/employees', icon: FaUsers, roles: ['admin']},
    { key: 'clientes', href: '/dashboard/clients', icon: FaHandshake, roles: ['admin']},
    { key: 'notificaciones', href: '/dashboard/notifications', icon: MdNotifications, roles: ['admin']},
];

export const useDashboardLayout = () => {
    const {t} = useTranslation();
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const filteredNavItems = NAV_ITEMS
        .filter(item => !item.roles || (user && item.roles.includes(user.rol)))
        .map(item => ({
            ...item,
            name: t(`dashboard_layout.${item.key}`)
        }));

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