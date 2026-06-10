import { PieSlice } from "./PieChartSvg";

interface PieChartLegendProps {
  slices: PieSlice[];
  total: number;
}

export const PieChartLegend = ({ slices, total }: PieChartLegendProps) => {
  return (
    <div className="w-full lg:w-1/2 grid gap-3">
      {slices.map((slice) => (
        <div key={slice.label} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-sm text-gray-700">{slice.label}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {slice.value} ({total > 0 ? Math.round((slice.value / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  );
};