import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BiLogOut, BiX } from 'react-icons/bi';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  user: any; 
  userName: string;
  pathname: string;
  filteredNavItems: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
  }>;
  handleLogout: () => void;
  isOpen: boolean;      // Mobile drawer open state
  onClose: () => void;  // Mobile drawer close callback
  isCollapsed: boolean; // Desktop collapsed state
}

export const Sidebar = ({ 
  user, 
  userName, 
  pathname, 
  filteredNavItems, 
  handleLogout, 
  isOpen, 
  onClose, 
  isCollapsed 
}: SidebarProps) => {
  const { t } = useTranslation();

  return (
    <aside className={`fixed inset-y-0 left-0 flex flex-col bg-[#1a1a1a] text-white shrink-0 shadow-xl z-50 transition-all duration-300 ease-in-out
      md:static md:translate-x-0 md:z-10
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isCollapsed ? 'md:w-20 md:py-4 md:px-2 w-64 p-4' : 'w-64 p-4'}
    `}>
      
      {/* CABECERA: Logo y Título, con botón de cerrar para móvil */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center">
          <div className={`${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'} flex items-center justify-center`}>
            <Image 
              src="/LogoCompuYaBlanco.svg" 
              alt="Logo CompuYa" 
              width={isCollapsed ? 48 : 72} 
              height={isCollapsed ? 48 : 72} 
              className="object-contain drop-shadow-lg transition-all duration-300" 
            />
          </div>
          {(!isCollapsed || isOpen) && (
            <h1 className="text-2xl font-bold tracking-tight mt-2 whitespace-nowrap">  
              <span className="text-orange-500">Compu</span>
              <span className="text-white">Ya</span>
            </h1>
          )}
        </div>

        {/* Botón de cerrar solo visible en móvil */}
        <button 
          onClick={onClose}
          className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
          aria-label="Cerrar menú"
        >
          <BiX size={28} />
        </button>
      </div>
      
      {/* NAVEGACIÓN */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  onClick={onClose} // Cerrar sidebar al hacer clic en un enlace en móvil
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg transition-all duration-200 group min-h-[60px]
                    ${isCollapsed ? 'md:justify-center p-3' : 'p-3'}
                    ${isActive 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                    }`}
                >
                  <item.icon 
                    className={`w-6 h-6 flex-shrink-0 transition-all duration-300
                      ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}
                      ${isActive ? 'text-white drop-shadow-md' : 'text-gray-400 group-hover:text-gray-100'}`} 
                  />

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center
                    ${isCollapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[160px] opacity-100'}`}
                  >
                    <span className="block w-[160px] min-w-[160px] font-medium text-base leading-tight whitespace-normal">
                      {isCollapsed ? <span className="md:hidden">{item.name}</span> : item.name}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER: Perfil y Logout */}
      <div className={`mt-auto border-t border-gray-800 pt-6 ${isCollapsed ? 'md:px-0 px-2' : 'px-2'}`}>
        {user && (
          <div className={`flex items-center mb-4 ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className={`w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full flex items-center justify-center font-bold border border-gray-700 shrink-0
              ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`}
            >
              {userName[0].toUpperCase()}
            </div>
            
            {/* Si está colapsado, ocultar nombre y rol en desktop */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out
              ${isCollapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[200px] opacity-100'}`}
            >
              <p className="font-semibold truncate leading-none mb-1">{userName}</p>
              <p className="text-xs text-gray-300 capitalize font-medium">{user.rol}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={`flex items-center rounded-lg hover:bg-red-900/20 hover:text-red-300 text-gray-300 transition-all duration-300 w-full group cursor-pointer
            ${isCollapsed ? 'md:justify-center p-3' : 'p-3 text-left'}`}
        >
          {/* Margen del icono animado suavemente */}
          <BiLogOut className={`w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-red-400 transition-all duration-300
            ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} 
          />
          
          {/* Animación de max-width */}
          <span 
            className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
              ${isCollapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[200px] opacity-100'}`}
          >
            {t('sidebarPage.cerrar_sesion')}
          </span>
        </button>
      </div>
      
    </aside>
  );
};