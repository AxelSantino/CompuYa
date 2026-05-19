import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Checkbox = React.memo(React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => (
    <label className="flex items-center space-x-2 cursor-pointer group">
      <input 
        type="checkbox" 
        className={`rounded text-orange-600 focus:ring-orange-500 w-4 h-4 transition-colors ${className || ''}`} 
        ref={ref}
        {...props} 
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    </label>
  )
));

Checkbox.displayName = 'Checkbox';

export { Checkbox };
