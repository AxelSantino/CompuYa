import React from 'react';

export interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  percentage?: number;
}

export const MetricCard = ({
  label,
  value,
  icon,
  bgColor,
  textColor,
  percentage
}: MetricCardProps) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border-l-4 border-gray-200 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor} mb-1`}>{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {percentage !== undefined && (
              <span className={`text-sm font-semibold ${textColor}`}>
                ({percentage}%)
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">{icon}</div>
      </div>
    </div>
  );
};