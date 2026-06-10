import React, { useEffect, useState } from 'react';

export interface VerticalBarItem {
  label: string;
  value: number;
  color: string;
}

interface VerticalBarChartProps {
  title: string;
  items: VerticalBarItem[];
  total: number;
}

export const VerticalBarChart = ({ title, items, total }: VerticalBarChartProps) => {
  // Estado para disparar la animación al montar el componente
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Breve retraso para asegurar que el DOM se pintó antes de animar
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full min-h-[320px]">
      <div className="mb-2">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>

      <div className="flex-grow flex items-end justify-around gap-2 pt-6">
        {items.length === 0 || total === 0 ? (
          <div className="text-sm text-gray-500 w-full text-center pb-8">Sin información para mostrar.</div>
        ) : (
          items.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            
            return (
              <div key={`${item.label}-${index}`} className="flex flex-col items-center w-full max-w-[80px]">
                
                {/* Indicadores numéricos arriba de la barra */}
                <div className="flex flex-col items-center mb-2">
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs font-medium text-gray-500">{percentage}%</span>
                </div>

                {/* Contenedor de la barra (Altura fija máxima) */}
                <div className="w-full bg-gray-50 rounded-t-md h-40 relative flex items-end justify-center border border-gray-100 border-b-0">
                  {/* Barra animada */}
                  <div 
                    className="w-full rounded-t-sm transition-all duration-1000 ease-out"
                    style={{ 
                      height: isLoaded ? `${percentage}%` : '0%', 
                      backgroundColor: item.color 
                    }}
                  />
                </div>

                {/* Etiqueta inferior */}
                <div className="mt-3 text-center w-full">
                  <span className="text-xs font-semibold text-gray-700 block truncate px-1" title={item.label}>
                    {item.label}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};