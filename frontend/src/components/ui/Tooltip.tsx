import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  className?: string;
}

export const Tooltip = ({ text, children, className = '' }: TooltipProps) => {
  return (
    <div className={`relative group flex items-center justify-center cursor-help ${className}`}>
      {children}
      
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-md shadow-lg p-2.5 text-center break-words relative">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};