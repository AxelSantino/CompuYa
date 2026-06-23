import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

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
  const chartData = data.map(item => ({
    ...item,
    fill: item.color 
  }));

  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full min-h-[360px]">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {/* Contraste mejorado a gray-600 para jerarquía visual */}
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
              <th scope="col">{t('metricsPage.cantidad', 'Cantidad')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={`sr-row-${index}`}>
                <td>{item.name}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* a11y: Silenciamos visualmente el contenedor del gráfico interactivo */}
      <div aria-hidden="true" className="w-full flex-grow min-h-[260px]">
        <ResponsiveContainer width="100%" height={260}>
          {/* 1. Declaramos el layout como vertical */}
          <RechartsBarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            {/* Las guías ahora son verticales para facilitar la lectura del largo de la barra */}
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f3f4f6" />
            
            {/* 2. El Eje X ahora es el que maneja los NÚMEROS */}
            <XAxis 
              type="number" 
              // Contraste mejorado de #9ca3af (gray-400) a #6b7280 (gray-500)
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            
            {/* 3. El Eje Y ahora maneja las CATEGORÍAS (los nombres) */}
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={110} // Reservamos espacio para que textos como "Total Entregas" no se corten
            />
            
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
                    <span className="font-regular text-gray-900">
                      <span style={{ color: payload[0].payload.color }} className="mr-1 text-sm leading-none">{payload[0].value} {t('metricsPage.envios')}</span>
                    </span>
                  </div>
                );
              }}
            />
            
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]} 
              barSize={45}
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