import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Layers,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Code2,
  HardDrive,
  Info
} from 'lucide-react';
import { Button } from '../common/Button';

export function FileDetailsPanel({
  selectedFile,
  onNavigateToFile
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-radar-card border border-radar-border rounded-xl text-center text-radar-textMuted text-xs">
        <Info className="w-8 h-8 text-radar-textSubtle mb-2" />
        <p>Select a file to inspect its dependency relationships and AST metadata.</p>
      </div>
    );
  }

  const imports = selectedFile.imports || [];
  const importedBy = selectedFile.importedBy || [];
  const externalImports = selectedFile.externalImports || [];

  const handleOpenInGraph = () => {
    navigate(`/repositories/${id}/graph?select=${encodeURIComponent(selectedFile.path)}`);
  };

  return (
    <div className="h-full flex flex-col bg-radar-card border border-radar-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-radar-border bg-radar-surface flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-radar-text">
          File Inspector
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenInGraph}
          leftIcon={<Layers className="w-3.5 h-3.5" />}
        >
          View in Graph
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-radar-surface rounded-lg border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle block mb-1">Lines of Code</span>
            <span className="text-sm font-semibold font-mono text-radar-text">
              {selectedFile.lines || '—'}
            </span>
          </div>
          <div className="p-2.5 bg-radar-surface rounded-lg border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle block mb-1">File Size</span>
            <span className="text-sm font-semibold font-mono text-radar-text">
              {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '—'}
            </span>
          </div>
          <div className="p-2.5 bg-radar-surface rounded-lg border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle block mb-1">Imports (Outgoing)</span>
            <span className="text-sm font-semibold font-mono text-indigo-400">
              {imports.length} internal
            </span>
          </div>
          <div className="p-2.5 bg-radar-surface rounded-lg border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle block mb-1">Imported By (Incoming)</span>
            <span className="text-sm font-semibold font-mono text-cyan-400">
              {importedBy.length} files
            </span>
          </div>
        </div>

        {/* Outgoing Imports List */}
        <div>
          <div className="flex items-center gap-1.5 font-medium text-radar-text mb-2">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Files Imported By This File ({imports.length})</span>
          </div>
          {imports.length === 0 ? (
            <p className="text-radar-textSubtle text-[11px] italic pl-5">
              No internal repository imports detected in this file.
            </p>
          ) : (
            <div className="space-y-1.5 pl-2 border-l border-indigo-500/30">
              {imports.map((imp, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToFile(imp.target)}
                  className="w-full text-left p-1.5 rounded hover:bg-radar-surface group flex items-center justify-between text-[11px] text-radar-textMuted hover:text-radar-text transition-colors"
                >
                  <span className="font-mono truncate">{imp.target}</span>
                  <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1 rounded shrink-0">
                    {imp.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Dependents List */}
        <div>
          <div className="flex items-center gap-1.5 font-medium text-radar-text mb-2">
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Files That Import This File ({importedBy.length})</span>
          </div>
          {importedBy.length === 0 ? (
            <p className="text-radar-textSubtle text-[11px] italic pl-5">
              No other files in this repository import this file.
            </p>
          ) : (
            <div className="space-y-1.5 pl-2 border-l border-cyan-500/30">
              {importedBy.map((dependentPath, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToFile(dependentPath)}
                  className="w-full text-left p-1.5 rounded hover:bg-radar-surface group flex items-center justify-between text-[11px] text-radar-textMuted hover:text-radar-text transition-colors"
                >
                  <span className="font-mono truncate">{dependentPath}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* External Packages Used */}
        {externalImports.length > 0 && (
          <div>
            <span className="text-[11px] font-medium text-radar-textSubtle uppercase tracking-wider block mb-2">
              External Packages ({externalImports.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {externalImports.map((pkg, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {pkg.packageName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
