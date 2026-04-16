import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25',
  secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        rounded-2xl font-medium transition-all duration-200 
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Yükleniyor...</span>
        </span>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
