import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

export interface BarItem {
  name: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarItem[];
  title: string;
  subtitle: string;
}

export const BarChart = ({ data, title, subtitle }: BarChartProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full min-h-[360px]">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <h3 className="text-base text-gray-900">{subtitle}</h3>
      </div>

      <div className="w-full flex-grow min-h-[260px]">
        <ResponsiveContainer width="100%" height={260}>
          {/* 1. Declaramos el layout como vertical */}
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            {/* Las guías ahora son verticales para facilitar la lectura del largo de la barra */}
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f3f4f6" />
            
            {/* 2. El Eje X ahora es el que maneja los NÚMEROS */}
            <XAxis 
              type="number" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            
            {/* 3. El Eje Y ahora maneja las CATEGORÍAS (los nombres) */}
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={110} // Reservamos espacio para que textos como "Total Entregas" no se corten
            />
            
            <Tooltip
              formatter={(value: any) => [`${value} envíos`, 'Cantidad']}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
              }}
              cursor={{ fill: '#f9fafb' }}
            />
            
            {/* 4. Ajustamos el radio de la barra: Arriba-Der, Abajo-Der redondeados */}
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]} 
              barSize={45} // Hace las barras más gruesas
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};