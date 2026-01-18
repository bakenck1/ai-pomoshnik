/**
 * Large, accessible button for elderly users.
 * Minimum 48px height, high contrast, clear feedback.
 */

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'normal' | 'large' | 'xlarge';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const BigButton = forwardRef<HTMLButtonElement, BigButtonProps>(
  ({ className, variant = 'primary', size = 'large', icon, loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg',
      secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800',
      success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg',
      danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg',
    };

    const sizes = {
      normal: 'min-h-[48px] px-6 py-3 text-lg',
      large: 'min-h-[56px] px-8 py-4 text-xl',
      xlarge: 'min-h-[64px] px-10 py-5 text-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-2xl font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-blue-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-3',
          'select-none touch-manipulation',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

BigButton.displayName = 'BigButton';
