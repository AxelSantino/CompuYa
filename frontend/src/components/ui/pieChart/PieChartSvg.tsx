export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartSvgProps {
  slices: PieSlice[];
  total: number;
}

export const PieChartSvg = ({ slices, total }: PieChartSvgProps) => {
  let startAngle = -90;

  const getPath = (value: number) => {
    if (total === 0 || value === 0) return '';

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
    <div className="w-full flex justify-center">
      <svg width="160" height="160" viewBox="0 0 100 100" className="overflow-visible">
        {slices.map((slice, index) => (
          <path key={`${slice.label}-${index}`} d={getPath(slice.value)} fill={slice.color} />
        ))}
        <circle cx="50" cy="50" r="18" fill="#fff" />
        <text x="50" y="54" textAnchor="middle" fill="#111" fontSize="10" fontWeight="700">
          {total}
        </text>
      </svg>
    </div>
  );
};