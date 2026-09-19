import React from 'react';

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  className?: string;
}> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
};
