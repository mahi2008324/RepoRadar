import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-radar-card/90 backdrop-blur-md border border-radar-border rounded-xl p-3 text-xs shadow-card-dark max-w-xs select-none">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="font-semibold text-radar-text flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Graph Legend</span>
        </span>
        <button className="text-radar-textSubtle hover:text-radar-text">
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-2.5 pt-2 border-t border-radar-border/60 space-y-2 text-[11px] text-radar-textMuted">
          {/* Edge Meaning */}
          <div className="p-2 bg-radar-surface/80 rounded border border-radar-border/40 font-mono">
            <span className="text-indigo-400 font-semibold">A ➔ B</span> means{' '}
            <span className="text-slate-200">File A imports File B</span>.
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
              <span>Selected Active Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
              <span>Direct Dependency (Imported by selected)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0" />
              <span>Direct Dependent (Imports selected)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600 shrink-0" />
              <span>Unselected File Node</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
