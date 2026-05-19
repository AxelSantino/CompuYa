import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const VARIANT_CLASSES = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
  secondary:
    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
};

const Button = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95 px-4 py-2';

    const classes = `${baseClasses} ${VARIANT_CLASSES[variant]} ${className || ''}`;

    return <button className={classes} ref={ref} {...props} />;
  }
));

Button.displayName = 'Button';

export { Button };
