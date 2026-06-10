import { PieSlice } from "./PieChartSvg";

interface PieChartLegendProps {
  slices: PieSlice[];
  total: number;
}

export const PieChartLegend = ({ slices, total }: PieChartLegendProps) => {
  return (
    <div className="w-full max-w-md grid gap-2.5">
      {slices.map((slice) => (
        <div key={slice.label} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="text-sm font-medium text-gray-700">{slice.label}</span>
          </div>
          <span className="text-sm font-bold text-gray-900 flex-shrink-0">
            {slice.value} ({total > 0 ? Math.round((slice.value / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  );
};