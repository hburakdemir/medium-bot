import { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-2xl 
          bg-white dark:bg-gray-900 
          border border-gray-200 dark:border-gray-800
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200 
          placeholder:text-gray-400
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
