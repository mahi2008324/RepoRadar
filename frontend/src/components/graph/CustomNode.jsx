import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCode, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const CustomNode = memo(({ data, selected }) => {
  const isHighlighted = data.isHighlighted;
  const isDirectDependent = data.isDirectDependent;
  const isDirectDependency = data.isDirectDependency;

  let borderColor = 'border-radar-border';
  let bgColor = 'bg-radar-card';
  let glowStyle = '';

  if (selected) {
    borderColor = 'border-indigo-500';
    bgColor = 'bg-indigo-950/70';
    glowStyle = 'ring-2 ring-indigo-500 shadow-glow-primary';
  } else if (isDirectDependency) {
    // Files this node imports
    borderColor = 'border-cyan-500/80';
    bgColor = 'bg-cyan-950/50';
    glowStyle = 'ring-1 ring-cyan-500/60';
  } else if (isDirectDependent) {
    // Files that import this node
    borderColor = 'border-purple-500/80';
    bgColor = 'bg-purple-950/50';
    glowStyle = 'ring-1 ring-purple-500/60';
  } else if (isHighlighted) {
    borderColor = 'border-slate-400';
    bgColor = 'bg-slate-800';
  }

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl border ${borderColor} ${bgColor} ${glowStyle} transition-all duration-200 min-w-[170px] max-w-[240px] shadow-card-dark select-none cursor-pointer`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-indigo-400 !border-2 !border-radar-card"
      />

      <div className="flex items-start gap-2">
        <div className="p-1 rounded bg-slate-800/80 text-indigo-400 shrink-0 mt-0.5">
          <FileCode className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-radar-text truncate font-mono">
            {data.label}
          </p>
          <p className="text-[10px] text-radar-textSubtle truncate font-mono" title={data.path}>
            {data.path}
          </p>
        </div>
      </div>

      {/* Degree metrics */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-radar-border/60 text-[10px] text-radar-textMuted font-mono">
        <span className="flex items-center gap-0.5" title={`${data.inDegree || 0} incoming files import this`}>
          <ArrowDownRight className="w-3 h-3 text-cyan-400" />
          <span>{data.inDegree || 0} in</span>
        </span>
        <span className="flex items-center gap-0.5" title={`Imports ${data.outDegree || 0} internal files`}>
          <ArrowUpRight className="w-3 h-3 text-indigo-400" />
          <span>{data.outDegree || 0} out</span>
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-cyan-400 !border-2 !border-radar-card"
      />
    </div>
  );
});
