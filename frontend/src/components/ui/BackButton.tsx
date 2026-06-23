import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

export interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ label, className = '', onClick, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Permite sobrescribir el comportamiento por defecto si se le pasa un onClick por props
      if (onClick) {
        onClick(e);
      } else {
        router.back();
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={`flex items-center text-base text-gray-600 hover:text-orange-600 
            transition-colors group focus:outline-none focus-visible:ring-2 
            focus-visible:ring-blue-500 rounded px-1 py-1 cursor-pointer ${className}`}
        {...props}
      >
        <FaArrowLeft
          aria-hidden="true"
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />
        {label}
      </button>
    );
  }
);

BackButton.displayName = 'BackButton';