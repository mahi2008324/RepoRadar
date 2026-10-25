import React from 'react';
import { FolderGit2 } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon = <FolderGit2 className="w-12 h-12 text-indigo-400" />,
  title = 'No repositories found',
  description = 'You have not analyzed any repositories yet. Enter a public GitHub repository URL to generate your first codebase map.',
  actionText = 'Analyze a Repository',
  onAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="p-4 bg-radar-surface/80 rounded-2xl border border-radar-border shadow-inner mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-radar-text mb-2">{title}</h3>
      <p className="text-sm text-radar-textMuted leading-relaxed mb-6">
        {description}
      </p>
      {onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
