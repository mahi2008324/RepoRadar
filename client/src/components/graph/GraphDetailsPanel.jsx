import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  X,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Activity,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Button } from '../common/Button';

export function GraphDetailsPanel({
  node,
  edges = [],
  onClose,
  onSelectNode
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!node) return null;

  // Filter edges for direct relationships
  const directDependencies = edges
    .filter((e) => e.source === node.id)
    .map((e) => e.target);

  const directDependents = edges
    .filter((e) => e.target === node.id)
    .map((e) => e.source);

  return (
    <div className="absolute top-4 right-4 z-20 w-80 max-h-[calc(100%-2rem)] flex flex-col bg-radar-card/95 backdrop-blur-md border border-radar-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-radar-border bg-radar-surface/90 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-mono font-semibold text-radar-text truncate">
            {node.data?.label || node.id}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-radar-textSubtle hover:text-radar-text rounded-md hover:bg-radar-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div>
          <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block mb-1">
            Full File Path
          </span>
          <p className="font-mono text-slate-300 text-[11px] bg-radar-surface p-2 rounded border border-radar-border break-all">
            {node.data?.path || node.id}
          </p>
        </div>

        {/* Degree Counters */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 bg-radar-surface rounded-lg border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle block mb-1">Imports (Out)</span>
            <span className="text-sm font-semibold font-mono text-cyan-400">
              {directDependencies.length} files
            </span>
          </div>
          <div className="p-2.5 bg-radar-surface rounded-lg border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle block mb-1">Imported By (In)</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {directDependents.length} files
            </span>
          </div>
        </div>

        {/* Outgoing Imports */}
        <div>
          <div className="flex items-center gap-1.5 font-medium text-radar-text mb-2">
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Imports ({directDependencies.length})</span>
          </div>
          {directDependencies.length === 0 ? (
            <p className="text-radar-textSubtle text-[11px] italic pl-5">
              Does not import any internal repository files.
            </p>
          ) : (
            <div className="space-y-1 pl-2 border-l border-cyan-500/30 max-h-32 overflow-y-auto">
              {directDependencies.map((targetId) => (
                <button
                  key={targetId}
                  onClick={() => onSelectNode(targetId)}
                  className="w-full text-left p-1 rounded hover:bg-radar-surface font-mono text-[11px] text-radar-textMuted hover:text-white truncate block"
                >
                  {targetId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Dependents */}
        <div>
          <div className="flex items-center gap-1.5 font-medium text-radar-text mb-2">
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
            <span>Imported By ({directDependents.length})</span>
          </div>
          {directDependents.length === 0 ? (
            <p className="text-radar-textSubtle text-[11px] italic pl-5">
              Not imported by any internal files.
            </p>
          ) : (
            <div className="space-y-1 pl-2 border-l border-purple-500/30 max-h-32 overflow-y-auto">
              {directDependents.map((sourceId) => (
                <button
                  key={sourceId}
                  onClick={() => onSelectNode(sourceId)}
                  className="w-full text-left p-1 rounded hover:bg-radar-surface font-mono text-[11px] text-radar-textMuted hover:text-white truncate block"
                >
                  {sourceId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-radar-border flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/repositories/${id}/explorer?file=${encodeURIComponent(node.id)}`)}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Open in Code Explorer
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/repositories/${id}/analysis?target=${encodeURIComponent(node.id)}`)}
            leftIcon={<Activity className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Inspect Blast Radius
          </Button>
        </div>
      </div>
    </div>
  );
}
