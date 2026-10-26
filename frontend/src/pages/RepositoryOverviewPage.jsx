import React, { useState } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Download,
  Star,
  GitCompare,
  FileText,
  Code2,
  Compass,
  ShieldAlert,
  Scissors,
  Code
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { calculateHealthScore } from '../utils/healthCalculator';
import { downloadMarkdownAudit, downloadJsonGraph } from '../utils/auditExporter';
import { useAuth } from '../context/AuthContext';
import OnboardingTourModal from '../components/OnboardingTourModal';
import SecurityRadarModal from '../components/SecurityRadarModal';
import EmbedReadmeModal from '../components/EmbedReadmeModal';
import LayerBoundaryModal from '../components/LayerBoundaryModal';
import RefactorSimulatorModal from '../components/RefactorSimulatorModal';

export function RepositoryOverviewPage() {
  const { repo, refreshRepo } = useOutletContext();
  const navigate = useNavigate();
  const { togglePin, isPinned } = useAuth();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSecurityRadarOpen, setIsSecurityRadarOpen] = useState(false);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [isLayerModalOpen, setIsLayerModalOpen] = useState(false);
  const [isRefactorModalOpen, setIsRefactorModalOpen] = useState(false);

  if (!repo) return null;

  const summary = repo.summary || {};
  const languages = repo.languages || [];
  const directorySummary = repo.directorySummary || [];
  const parseErrors = repo.parseErrors || [];
  const cyclesCount = repo.summary?.cycleCount || repo.cycles?.length || 0;
  const health = calculateHealthScore(repo);
  const pinned = isPinned(repo.id);

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
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-radar-text font-mono">
                {repo.owner} / {repo.name}
              </h2>
              {/* Star / Pin Button */}
              <button
                type="button"
                onClick={() => togglePin(repo.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  pinned
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm'
                    : 'bg-radar-surface border-radar-border text-radar-textSubtle hover:text-amber-400 hover:border-amber-500/30'
                }`}
                title={pinned ? 'Unpin repository' : 'Pin to favorites'}
              >
                <Star className={`w-4 h-4 ${pinned ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-radar-textMuted max-w-2xl leading-relaxed">
              {repo.description || 'No description provided by repository owner.'}
            </p>
          </div>

          {/* Quick jump & Export actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export Audit Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
              >
                Export Audit
              </Button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-radar-card border border-radar-border rounded-xl shadow-card-dark p-1.5 text-xs z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      downloadMarkdownAudit(repo);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-radar-text hover:text-white hover:bg-radar-surface rounded-lg transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Markdown Report (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      downloadJsonGraph(repo);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-radar-text hover:text-white hover:bg-radar-surface rounded-lg transition-colors text-left"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Raw Graph JSON (.json)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Developer Experience: Onboarding Tour */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />}
              onClick={() => setIsTourOpen(true)}
            >
              Onboarding Tour
            </Button>

            {/* Cybersecurity: Supply Chain Radar */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
              onClick={() => setIsSecurityRadarOpen(true)}
            >
              Security Radar
            </Button>

            {/* Feature 1: What-If Refactor Simulator */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Scissors className="w-4 h-4 text-rose-400" />}
              onClick={() => setIsRefactorModalOpen(true)}
            >
              Refactor Sandbox
            </Button>

            {/* Feature 5: Architectural Layer Boundary Enforcer */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-4 h-4 text-violet-400" />}
              onClick={() => setIsLayerModalOpen(true)}
            >
              Layer Rules
            </Button>

            {/* Feature 3: Mermaid.js & README Badges */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Code className="w-4 h-4 text-emerald-400" />}
              onClick={() => setIsReadmeModalOpen(true)}
            >
              Embed in README
            </Button>

            {/* Compare with another repo */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<GitCompare className="w-4 h-4 text-indigo-400" />}
              onClick={() => navigate(`/compare?a=${repo.id}`)}
            >
              Compare
            </Button>

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

      {/* Feature 1: Architectural Health Score & Technical Debt Meter */}
      <div className={`p-6 bg-radar-card border ${health.borderColor} rounded-2xl shadow-card-dark relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Health Grade Stamp */}
            <div className={`w-20 h-20 rounded-2xl ${health.bgColor} border ${health.borderColor} flex flex-col items-center justify-center shrink-0 shadow-inner`}>
              <span className={`text-3xl font-black font-mono ${health.color}`}>
                {health.grade}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-radar-textSubtle mt-0.5">
                Grade
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className={`w-5 h-5 ${health.color}`} />
                <h3 className="text-lg font-bold text-radar-text">
                  Architectural Health Score: <span className={health.color}>{health.score} / 100</span>
                </h3>
              </div>
              <p className="text-xs text-radar-textMuted max-w-xl">
                Evaluated from AST cycle loops, internal dependency coupling ratio ({health.density} edges/file), module modularity, and syntax integrity.
              </p>
            </div>
          </div>

          {/* Sub-Metric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto text-xs font-mono">
            <div className="p-2.5 bg-radar-surface/60 rounded-xl border border-radar-border/40">
              <span className="text-[10px] text-radar-textSubtle block">Acyclic Score</span>
              <span className={`font-bold ${health.cyclicityScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {health.cyclicityScore}%
              </span>
            </div>
            <div className="p-2.5 bg-radar-surface/60 rounded-xl border border-radar-border/40">
              <span className="text-[10px] text-radar-textSubtle block">Coupling Ratio</span>
              <span className="font-bold text-cyan-400">{health.density}x</span>
            </div>
            <div className="p-2.5 bg-radar-surface/60 rounded-xl border border-radar-border/40 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-radar-textSubtle block">Cleanliness</span>
              <span className="font-bold text-purple-400">{health.cleanlinessScore}%</span>
            </div>
          </div>
        </div>

        {/* Health Key Insights */}
        <div className="mt-4 pt-4 border-t border-radar-border/40 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {health.insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-300">
              <span className={insight.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'}>
                {insight.type === 'positive' ? '✓' : '⚠️'}
              </span>
              <span>{insight.text}</span>
            </div>
          ))}
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

      {/* Developer Experience: Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        repository={repo}
      />

      {/* Cybersecurity: Supply Chain & CVE Blast Radius Modal */}
      <SecurityRadarModal
        isOpen={isSecurityRadarOpen}
        onClose={() => setIsSecurityRadarOpen(false)}
        repository={repo}
      />

      {/* Feature 3: Mermaid.js & GitHub README Badges Modal */}
      <EmbedReadmeModal
        isOpen={isReadmeModalOpen}
        onClose={() => setIsReadmeModalOpen(false)}
        repository={repo}
      />

      {/* Feature 5: Clean Architecture Layer Boundary Enforcer Modal */}
      <LayerBoundaryModal
        isOpen={isLayerModalOpen}
        onClose={() => setIsLayerModalOpen(false)}
        repository={repo}
      />

      {/* Feature 1: What-If Architecture Refactoring Simulator Modal */}
      <RefactorSimulatorModal
        isOpen={isRefactorModalOpen}
        onClose={() => setIsRefactorModalOpen(false)}
        repository={repo}
      />
    </div>
  );
}
