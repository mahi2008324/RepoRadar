import React from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
  FileCode2,
  Layers,
  Activity,
  FolderTree,
  AlertTriangle,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  GitFork,
  PackageCheck,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/common/Button';

export function RepositoryOverviewPage() {
  const { repo, refreshRepo } = useOutletContext();
  const navigate = useNavigate();

  if (!repo) return null;

  const summary = repo.summary || {};
  const languages = repo.languages || [];
  const directorySummary = repo.directorySummary || [];
  const parseErrors = repo.parseErrors || [];
  const cyclesCount = repo.cyclesCount || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="p-6 bg-radar-card border border-radar-border rounded-2xl shadow-card-dark relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                Repository Architecture Overview
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                Analysis Complete
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-radar-text font-mono">
              {repo.owner} / {repo.name}
            </h2>
            <p className="text-xs sm:text-sm text-radar-textMuted max-w-2xl leading-relaxed">
              {repo.description || 'No description provided by repository owner.'}
            </p>
          </div>

          {/* Quick jump actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Layers className="w-4 h-4" />}
              onClick={() => navigate(`/repositories/${repo.id}/graph`)}
            >
              Explore Graph
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileCode2 className="w-4 h-4" />}
              onClick={() => navigate(`/repositories/${repo.id}/explorer`)}
            >
              Code Explorer
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Activity className="w-4 h-4" />}
              onClick={() => navigate(`/repositories/${repo.id}/analysis`)}
            >
              Deep Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
          <span className="text-xs text-radar-textMuted block mb-1">Supported Source Files</span>
          <p className="text-2xl font-bold font-mono text-radar-text">
            {summary.analyzedFilesCount || 0}
          </p>
          <span className="text-[11px] text-radar-textSubtle">
            of {summary.totalRepoFiles || 0} total files
          </span>
        </div>

        <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
          <span className="text-xs text-radar-textMuted block mb-1">Internal Dependencies</span>
          <p className="text-2xl font-bold font-mono text-cyan-400">
            {summary.internalEdgesCount || 0}
          </p>
          <span className="text-[11px] text-radar-textSubtle">
            AST import relationships
          </span>
        </div>

        <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
          <span className="text-xs text-radar-textMuted block mb-1">Directed Cycles</span>
          <p className={`text-2xl font-bold font-mono ${cyclesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {cyclesCount}
          </p>
          <span className="text-[11px] text-radar-textSubtle">
            {cyclesCount > 0 ? 'Circular dependencies found' : 'Zero cycles detected (DAG)'}
          </span>
        </div>

        <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
          <span className="text-xs text-radar-textMuted block mb-1">External Packages</span>
          <p className="text-2xl font-bold font-mono text-purple-400">
            {summary.externalPackagesCount || 0}
          </p>
          <span className="text-[11px] text-radar-textSubtle">
            npm dependencies
          </span>
        </div>
      </div>

      {/* Two Column Layout: Language Breakdown + Directory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Breakdown */}
        <div className="p-5 bg-radar-card border border-radar-border rounded-xl">
          <h3 className="text-sm font-semibold text-radar-text mb-3 flex items-center justify-between">
            <span>Detected Programming Languages</span>
            <span className="text-xs text-radar-textSubtle font-mono">{languages.length} types</span>
          </h3>

          <div className="space-y-3">
            {languages.slice(0, 5).map((lang) => (
              <div key={lang.name}>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">{lang.name}</span>
                  <span className="text-radar-textMuted">{lang.count} files ({lang.percentage}%)</span>
                </div>
                <div className="w-full bg-radar-surface h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.max(lang.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Directory Summary */}
        <div className="p-5 bg-radar-card border border-radar-border rounded-xl">
          <h3 className="text-sm font-semibold text-radar-text mb-3 flex items-center justify-between">
            <span>Directory-Level Architecture</span>
            <FolderTree className="w-4 h-4 text-indigo-400" />
          </h3>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {directorySummary.slice(0, 6).map((dir, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-radar-surface/60 border border-radar-border text-xs"
              >
                <div className="font-mono text-slate-300 truncate max-w-[200px]">
                  {dir.directory}/
                </div>
                <div className="flex items-center gap-3 text-radar-textMuted font-mono text-[11px]">
                  <span>{dir.fileCount} files</span>
                  <span className="text-cyan-400">{dir.internalDependencies} links</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings & Parse Notes if any */}
      {parseErrors.length > 0 && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Analysis Notices ({parseErrors.length})</span>
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            {parseErrors.length} file(s) contained non-standard syntax or build artifacts that could not be parsed into AST. These files were recorded and skipped safely without impacting the rest of the graph.
          </p>
        </div>
      )}
    </div>
  );
}
