import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data.',
  onRetry = null,
  retryText = 'Try Again'
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-950/20 border border-red-500/30 rounded-xl text-center max-w-lg mx-auto">
      <div className="p-3 bg-red-900/30 rounded-full text-red-400 mb-3 border border-red-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-red-200 mb-1">{title}</h3>
      <p className="text-sm text-red-300/80 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
}
