import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;   // Clase de Tailwind para el fondo del ícono (ej. 'bg-blue-50')
  textColor: string; // Clase de Tailwind para el color del ícono (ej. 'text-blue-600')
}

export const MetricCard = ({ title, value, icon, bgColor, textColor }: MetricCardProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-5 transition-transform duration-200">
      {/* Contenedor del ícono con colores dinámicos */}
      <div className={`p-4 rounded-full flex-shrink-0 ${bgColor} ${textColor}`}>
        {icon}
      </div>
      
      {/* Contenedor de la información */}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          {title}
        </span>
        <span className="text-3xl font-bold text-gray-900">
          {value}
        </span>
      </div>
    </div>
  );
};