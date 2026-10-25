import React, { useState } from 'react';
import { Copy, Check, FileCode, AlertCircle, Loader2 } from 'lucide-react';

export function SourceViewer({
  filePath,
  content,
  language = 'JavaScript',
  isLoading = false,
  error = null
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!filePath) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-radar-card border border-radar-border rounded-xl text-center">
        <FileCode className="w-12 h-12 text-radar-textSubtle mb-3" />
        <h4 className="text-sm font-medium text-radar-text mb-1">No file selected</h4>
        <p className="text-xs text-radar-textMuted max-w-xs">
          Select any file from the explorer tree on the left to inspect its source code and import relationships.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-radar-card border border-radar-border rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
        <p className="text-xs text-radar-textMuted">Loading source for {filePath}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-radar-card border border-radar-border rounded-xl text-center">
        <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
        <p className="text-sm font-medium text-radar-text mb-1">Source Unavailable</p>
        <p className="text-xs text-radar-textMuted max-w-sm mb-2">{error}</p>
        <p className="text-[11px] text-radar-textSubtle">
          This file might be a binary, external asset, or exceeded the source analysis size threshold.
        </p>
      </div>
    );
  }

  const lines = (content || '').split('\n');

  return (
    <div className="h-full flex flex-col bg-radar-card border border-radar-border rounded-xl overflow-hidden">
      {/* File Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-radar-surface border-b border-radar-border">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-mono font-medium text-radar-text truncate">
            {filePath}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 shrink-0">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-radar-surfaceHover hover:bg-slate-800 text-radar-textMuted hover:text-white border border-radar-border transition-colors shrink-0"
          title="Copy source code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="flex-1 overflow-auto bg-[#0d111b] font-mono text-xs select-text">
        <div className="flex min-w-full">
          {/* Line Numbers Gutter */}
          <div className="py-3 px-3 text-right bg-[#090d15] text-slate-600 select-none border-r border-radar-border/40 shrink-0 sticky left-0 z-10">
            {lines.map((_, i) => (
              <div key={i} className="leading-5 h-5 font-mono text-[11px]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code text content */}
          <div className="py-3 px-4 flex-1 text-slate-200 overflow-x-auto whitespace-pre font-mono leading-5 text-[12px]">
            {lines.map((line, i) => (
              <div key={i} className="h-5 hover:bg-slate-800/40 px-1 -mx-1 rounded-sm">
                {line || ' '}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
