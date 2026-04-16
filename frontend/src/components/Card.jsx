export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-900 
        rounded-3xl 
        shadow-sm 
        border border-gray-100 dark:border-gray-800
        ${hover ? 'hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 pt-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 pb-5 ${className}`}>
      {children}
    </div>
  );
}
