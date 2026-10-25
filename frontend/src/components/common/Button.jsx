import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-radar-bg disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary focus:ring-indigo-500 border border-indigo-500/30',
    secondary: 'bg-radar-surface hover:bg-radar-surfaceHover text-radar-text border border-radar-border focus:ring-slate-500',
    cyan: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan focus:ring-cyan-500 border border-cyan-500/30',
    danger: 'bg-red-600/90 hover:bg-red-600 text-white focus:ring-red-500 border border-red-500/30',
    ghost: 'bg-transparent hover:bg-radar-surface text-radar-textMuted hover:text-radar-text focus:ring-slate-500',
    outline: 'bg-transparent hover:bg-radar-surface text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/60'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
