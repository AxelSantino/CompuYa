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
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {total === 0 ? (
          <div className="w-full text-center py-4 text-sm text-gray-500">
            No hay datos para mostrar.
          </div>
        ) : (
          <>
            <PieChartSvg slices={slices} total={total} />
            <PieChartLegend slices={slices} total={total} />
          </>
        )}
      </div>
    </div>
  );
};