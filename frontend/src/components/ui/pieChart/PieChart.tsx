import { PieChartSvg } from "./PieChartSvg";
import { PieChartLegend } from "./PieChartLegend";

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
}

export const PieChart = ({ slices, title }: PieChartProps) => {
  // Única lógica de negocio a este nivel
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full min-h-[360px]">
      <div className="mb-4 text-center lg:text-left">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>
      
      <div className="flex flex-col flex-col items-center gap-6 items-center">
        {total === 0 ? (
          <div className="text-sm text-gray-500 text-center py-12 flex-grow flex items-center justify-center">
          No hay datos para mostrar.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 flex-grow w-full">
            <PieChartSvg slices={slices} total={total} />
            <PieChartLegend slices={slices} total={total} />
        </div>
        )}
      </div>
    </div>
  );
};