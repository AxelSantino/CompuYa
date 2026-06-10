import React, { useEffect, useState } from 'react';

export interface HorizontalBarItem {
  label: string;
  value: number;
  color: string;
}

interface HorizontalBarChartProps {
  title: string;
  items: HorizontalBarItem[];
  total: number;
}

export const HorizontalBarChart = ({ title, items, total }: HorizontalBarChartProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 w-full">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h4 className="text-xl font-bold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">Información detallada de los motivos de cancelación de los envíos.</p>
      </div>

      <div className="flex flex-col gap-8">
        {items.length === 0 || total === 0 ? (
          <div className="text-sm text-gray-500 text-center py-12">Sin información para mostrar.</div>
        ) : (
          items.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            
            return (
              <div key={`${item.label}-${index}`} className="group">
                {/* Header of the bar: Label and Value */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-gray-900">{item.value}</span>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* The "Wide" Bar Container */}
                <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden shadow-inner border border-gray-200">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{ 
                      width: isLoaded ? `${percentage}%` : '0%', 
                      backgroundColor: item.color 
                    }}
                  >
                    {/* Visual shine effect to make the bar look "thicker" and professional */}
                    <div className="absolute inset-0 bg-white opacity-10 h-1/2 w-full"></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};