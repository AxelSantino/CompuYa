import { PieChartLegend } from "./PieChartLegend";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  slices: PieSlice[];
  title: string;
  subtitle: string;
}

export const PieChart = ({ slices, title, subtitle }: PieChartProps) => {
  // Única lógica de negocio a este nivel
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full min-h-[360px]">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {/* Contraste y jerarquía mejorados (de 900 a 600) */}
        <h3 className="text-base text-gray-600">{subtitle}</h3>
      </div>
      
      {/* ================================================================
        a11y: PATRÓN DE DATOS OCULTOS (Screen Reader Only)
        Los usuarios con vista ven el gráfico interactivo.
        Los usuarios ciegos "leen" esta tabla estructurada.
        ================================================================
      */}
      <div className="sr-only">
        <table aria-label={`Datos de ${title}`}>
          <thead>
            <tr>
              <th scope="col">{t('metricsPage.categoria', 'Categoría')}</th>
              <th scope="col">{t('metricsPage.cantidad')}</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice, index) => (
              <tr key={`sr-row-${index}`}>
                <td>{slice.label}</td>
                <td>{slice.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center gap-6">
        {total === 0 ? (
          // Contraste mejorado a gray-600
          <div className="text-sm text-gray-600 text-center py-12 flex-grow flex items-center justify-center">
            {t('metricsPage.no_hay_datos_mostrar')}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 flex-grow w-full">
            {/* a11y: Silenciamos visualmente el contenedor del gráfico interactivo */}
            <div aria-hidden="true" className="w-[240px] h-[240px] relative flex items-center justify-center">
            
              <RechartsPieChart width={240} height={240}>
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
                {/* Tooltip flotante */}
                <Tooltip 
                  formatter={(value: any) => [`${value} ${t('metricsPage.envios')}`, t('metricsPage.cantidad')]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                />
              </RechartsPieChart>
            
            </div>
            <PieChartLegend slices={slices} total={total} />
          </div>
        )}
      </div>
    </div>
  );
};