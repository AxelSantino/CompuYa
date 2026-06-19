import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BiLogOut, BiX } from 'react-icons/bi';

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
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ user, userName, pathname, filteredNavItems, handleLogout, isOpen, onClose }: SidebarProps) => {
  return (
    <aside className={`fixed inset-y-0 left-0 w-64 flex flex-col bg-[#1a1a1a] text-white p-4 shrink-0 shadow-xl z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center">
          <div className="mr-3 flex items-center justify-center">
            <Image 
              src="/LogoCompuYaBlanco.svg" 
              alt="Logo CompuYa" 
              width={72} 
              height={72} 
              className="object-contain drop-shadow-lg" 
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">  
            <span className="text-orange-500">Compu</span>
            <span className="text-white">Ya</span>
          </h1>
        </div>

        <button 
          onClick={onClose}
          className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
          aria-label="Cerrar menú"
        >
          <BiX size={28} />
        </button>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  onClick={onClose} // Cerrar sidebar al hacer clic en un enlace en móvil
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                  }`}
                >
                  <item.icon 
                    className={`w-5 h-5 mr-3 flex-shrink-0 transition-all duration-200 ${
                      isActive ? 'text-white drop-shadow-md' : 'text-gray-400 group-hover:text-gray-100'
                    }`} 
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-gray-800 pt-6">
        {user && (
          <div className="flex items-center p-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full mr-3 flex items-center justify-center font-bold border border-gray-700">
              {userName[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate leading-none mb-1">{userName}</p>
              <p className="text-xs text-gray-300 capitalize font-medium">{user.rol}</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout} 
          className="flex items-center p-3 rounded-lg hover:bg-red-900/20 hover:text-red-300 text-gray-300 transition-all duration-200 w-full text-left group"
        >
          <BiLogOut className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-red-400 transition-colors" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};