import React from 'react';
import { Search, Filter, RotateCcw, Maximize2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../common/Button';

export function GraphControls({
  searchQuery,
  onSearchChange,
  directories = [],
  selectedDir,
  onDirChange,
  hideDisconnected,
  onToggleHideDisconnected,
  onResetSelection,
  onFitView,
  hasSelection
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-radar-surface/90 backdrop-blur-md border border-radar-border rounded-xl">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative w-56 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
          <input
            type="text"
            placeholder="Search file node..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-radar-card border border-radar-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500"
          />
        </div>

        {/* Directory filter */}
        {directories.length > 0 && (
          <div className="relative">
            <select
              value={selectedDir}
              onChange={(e) => onDirChange(e.target.value)}
              className="bg-radar-card border border-radar-border rounded-lg px-3 py-1.5 text-xs text-radar-text outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Directories</option>
              {directories.map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hide Disconnected Toggle */}
        <button
          onClick={onToggleHideDisconnected}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            hideDisconnected
              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60'
              : 'bg-radar-card text-radar-textMuted border-radar-border hover:text-radar-text'
          }`}
          title="Toggle visibility of files with zero imports and dependents"
        >
          {hideDisconnected ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">
            {hideDisconnected ? 'Hiding Isolated' : 'Show All'}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {hasSelection && (
          <Button variant="ghost" size="sm" onClick={onResetSelection}>
            Reset Selection
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onFitView}
          leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
        >
          Fit View
        </Button>
      </div>
    </div>
  );
}
