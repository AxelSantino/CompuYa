export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  slices: PieSlice[];
  title: string;
}

export const PieChart = ({ slices, title }: PieChartProps) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let startAngle = -90;

  const getPath = (value: number) => {
    if (total === 0 || value === 0) {
      return '';
    }

    const angle = (value / total) * 360;
    const endAngle = startAngle + angle;
    const radius = 40;
    const center = 50;
    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;
    const x1 = center + radius * Math.cos(startRadians);
    const y1 = center + radius * Math.sin(startRadians);
    const x2 = center + radius * Math.cos(endRadians);
    const y2 = center + radius * Math.sin(endRadians);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M ${center} ${center} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    startAngle = endAngle;
    return path;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="w-full lg:w-1/2 flex justify-center">
          {total === 0 ? (
            <div className="text-sm text-gray-500">No hay datos para mostrar.</div>
          ) : (
            <svg width="160" height="160" viewBox="0 0 100 100">
              {slices.map((slice, index) => {
                const path = getPath(slice.value);
                return (
                  <path key={`${slice.label}-${index}`} d={path} fill={slice.color} />
                );
              })}
              <circle cx="50" cy="50" r="18" fill="#fff" />
              <text x="50" y="54" textAnchor="middle" fill="#111" fontSize="10" fontWeight="700">
                {total}
              </text>
            </svg>
          )}
        </div>
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
      </div>
    </div>
  );
};