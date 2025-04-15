import React from 'react';

const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-500',
  outline: 'border border-zinc-600 text-zinc-300 hover:bg-zinc-700',
  ghost: 'bg-transparent hover:bg-zinc-700'
};

const sizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-10 px-8'
};

const Button = React.forwardRef(({ 
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props 
}, ref) => {
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
