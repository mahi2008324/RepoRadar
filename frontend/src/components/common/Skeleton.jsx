import React from 'react';

export function Skeleton({ className = '', height = null, width = null }) {
  const style = {};
  if (height) style.height = height;
  if (width) style.width = width;

  return (
    <div
      style={style}
      className={`animate-pulse bg-radar-surface/80 rounded-md border border-radar-border/40 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-radar-card border border-radar-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-3 gap-3 pt-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
