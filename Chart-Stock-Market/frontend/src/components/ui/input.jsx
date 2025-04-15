import React from 'react';

const baseStyles = `
  flex h-10 w-full rounded-md border bg-zinc-800 px-3 py-2 text-sm text-white
  border-zinc-700 placeholder:text-zinc-400
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-800
  disabled:cursor-not-allowed disabled:opacity-50
  transition-colors
`;

const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  const inputStyles = type === 'date' ? 
    'text-zinc-200 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : '';
    
  return (
    <input
      type={type}
      className={`${baseStyles} ${inputStyles} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
