import React from 'react';

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    const classes = `flex h-10 w-full rounded-md border border-gray-900 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className || ''}`;

    return (
      <select className={classes} ref={ref} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export { Select };
