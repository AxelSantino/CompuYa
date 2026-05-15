import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const classes = `flex h-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`;

    return (
      <select className={classes} ref={ref} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export { Select };
