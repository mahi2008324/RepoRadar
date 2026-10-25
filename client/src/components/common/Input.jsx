import React from 'react';

export function Input({
  label = null,
  error = null,
  leftIcon = null,
  rightIcon = null,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-radar-textMuted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-radar-textSubtle">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-radar-surface border ${
            error ? 'border-red-500/80 focus:ring-red-500/50' : 'border-radar-border focus:border-indigo-500 focus:ring-indigo-500/30'
          } rounded-lg text-radar-text placeholder-radar-textSubtle text-sm px-3.5 py-2.5 transition-all duration-200 outline-none focus:ring-2 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-radar-textSubtle">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
}
