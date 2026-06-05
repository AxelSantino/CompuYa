import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
}

export const Sidebar = ({ user, userName, pathname, filteredNavItems, handleLogout }: SidebarProps) => {
  return (
    <aside className="w-64 flex flex-col bg-[#1a1a1a] text-white p-4 shrink-0 shadow-xl z-10">
      <div className="flex items-center mb-10 px-2">
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
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
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
          <div className="w-5 h-5 bg-gray-700 rounded mr-3 group-hover:bg-red-400/30 transition-colors"></div>
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};