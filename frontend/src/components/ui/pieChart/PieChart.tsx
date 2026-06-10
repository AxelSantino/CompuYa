import { PieChartSvg } from "./PieChartSvg";
import { PieChartLegend } from "./PieChartLegend";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  slices: PieSlice[];
  title: string;
}

interface PieChartProps {
  slices: PieSlice[];
  title: string;
  subtitle: string;
}

export const PieChart = ({ slices, title, subtitle }: PieChartProps) => {
  // Única lógica de negocio a este nivel
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full min-h-[360px]">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <h3 className="text-base text-gray-900">{subtitle}</h3>
      </div>
      
      <div className="flex flex-col flex-col items-center gap-6 items-center">
        {total === 0 ? (
          <div className="text-sm text-gray-500 text-center py-12 flex-grow flex items-center justify-center">
          No hay datos para mostrar.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 flex-grow w-full">
            <div className="w-[240px] h-[240px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50} // Radio interno para el hueco de la dona
                  outerRadius={105} // Radio externo agrandado para ocupar más espacio
                  paddingAngle={3}  // Separación estética sutil entre porciones
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {slices.map((slice, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={slice.color} 
                      className="focus:outline-none hover:opacity-85 transition-opacity duration-200" 
                    />
                  ))}
                </Pie>
                {/* Tooltip flotante nativo configurado en español */}
                <Tooltip 
                  formatter={(value: any) => [`${value} envíos`, 'Cantidad']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
            <PieChartLegend slices={slices} total={total} />
        </div>
        )}
      </div>
    </div>
  );
};