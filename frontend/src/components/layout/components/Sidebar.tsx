import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BiLogOut, BiMenu } from 'react-icons/bi';
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
  isCollapsed: boolean;
}

export const Sidebar = ({ user, userName, pathname, filteredNavItems, handleLogout, isCollapsed }: SidebarProps) => {

  const {t}=useTranslation();

  return (
    <aside className={`flex flex-col bg-[#1a1a1a] text-white shrink-0 shadow-xl z-10 transition-all duration-300 ease-in-out relative
      ${isCollapsed ? 'w-20 py-4 px-2' : 'w-64 p-4'}`}
    >
      
      {/* CABECERA: Solo Logo y Título (Sin botón) */}
      <div className="flex items-center justify-center mb-10">
        <Image 
          src="/LogoCompuYaBlanco.svg" 
          alt="Logo CompuYa" 
          width={isCollapsed ? 48 : 72} 
          height={isCollapsed ? 48 : 72} 
          className="object-contain drop-shadow-lg transition-all duration-300" 
        />
        
        {!isCollapsed && (
          <h1 className="text-2xl font-bold tracking-tight mt-2 ml-3 whitespace-nowrap">  
            <span className="text-orange-500">Compu</span>
            <span className="text-white">Ya</span>
          </h1>
        )}
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
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg transition-all duration-200 group min-h-[60px]
                    ${isCollapsed ? 'justify-center p-3' : 'p-3'}
                    ${isActive 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                    }`}
                >
                  <item.icon 
                    className={`w-6 h-6 flex-shrink-0 transition-all duration-300
                      ${isCollapsed ? 'mr-0' : 'mr-3'}
                      ${isActive ? 'text-white drop-shadow-md' : 'text-gray-400 group-hover:text-gray-100'}`} 
                  />

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center
                    ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}
                  >
                    <span className="block w-[160px] min-w-[160px] font-medium text-base leading-tight whitespace-normal">
                      {item.name}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER: Perfil y Logout */}
      <div className={`mt-auto border-t border-gray-800 pt-6 ${isCollapsed ? 'px-0' : 'px-2'}`}>
        {user && (
          <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className={`w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full flex items-center justify-center font-bold border border-gray-700 shrink-0
              ${!isCollapsed ? 'mr-3' : ''}`}
            >
              {userName[0].toUpperCase()}
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="font-semibold truncate leading-none mb-1">{userName}</p>
                <p className="text-xs text-gray-300 capitalize font-medium">{user.rol}</p>
              </div>
            )}
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={`flex items-center rounded-lg hover:bg-red-900/20 hover:text-red-300 text-gray-300 transition-all duration-300 w-full group cursor-pointer
            ${isCollapsed ? 'justify-center p-3' : 'p-3 text-left'}`}
        >
          {/* Margen del icono animado suavemente */}
          <BiLogOut className={`w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-red-400 transition-all duration-300
            ${isCollapsed ? 'mr-0' : 'mr-3'}`} 
          />
          
          {/* Animaicion de max widht */}
          <span 
            className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
              ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}
          >
            {t('sidebarPage.cerrar_sesion')}
          </span>
        </button>
      </div>
      
    </aside>
  );
};