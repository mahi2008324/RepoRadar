import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AlertOctagon,
  Unplug,
  FolderTree,
  Crosshair,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers
} from 'lucide-react';
import { repositoryService } from '../services/repositoryService';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';

export function DependencyAnalysisPage() {
  const { repo } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Impact Analysis state
  const [selectedFileForImpact, setSelectedFileForImpact] = useState('');
  const [impactData, setImpactData] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  useEffect(() => {
    if (!repo) return;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await repositoryService.getAnalysis(repo.id);
        if (res.success && res.analysis) {
          setAnalysis(res.analysis);

          // Check if query parameter requested a target file impact analysis
          const target = searchParams.get('target');
          if (target) {
            setSelectedFileForImpact(target);
            runImpactAnalysis(target);
          } else if (res.analysis.mostImported && res.analysis.mostImported.length > 0) {
            const first = res.analysis.mostImported[0].path;
            setSelectedFileForImpact(first);
            runImpactAnalysis(first);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load analysis metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [repo, searchParams]);

  const runImpactAnalysis = async (filePath) => {
    if (!filePath || !repo) return;
    try {
      setLoadingImpact(true);
      const res = await repositoryService.getImpact(repo.id, filePath);
      if (res.success && res.impact) {
        setImpactData(res.impact);
      }
    } catch (err) {
      console.error('Impact analysis error:', err);
    } finally {
      setLoadingImpact(false);
    }
  };

  const handleImpactSelectChange = (e) => {
    const filePath = e.target.value;
    setSelectedFileForImpact(filePath);
    runImpactAnalysis(filePath);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return <ErrorState message={error || 'Analysis data could not be computed.'} />;
  }

  const mostImported = analysis.mostImported || [];
  const mostDependent = analysis.mostDependent || [];
  const cycles = analysis.cycles || [];
  const disconnected = analysis.disconnectedFiles || [];
  const directorySummary = analysis.directorySummary || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-radar-text flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Codebase Dependency Analytics & Impact</span>
        </h2>
        <p className="text-xs text-radar-textMuted mt-1">
          Deep architectural metrics derived from real AST import relationships.
        </p>
      </div>

      {/* D. Signature Feature: Dependency Impact Analysis (Blast Radius) */}
      <section className="p-6 bg-radar-card border border-indigo-500/40 rounded-2xl shadow-card-dark relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                Dependency Blast Radius & Impact Analysis
              </span>
            </div>
            <p className="text-xs text-radar-textMuted">
              Select any file to calculate which files directly or transitively depend on it.
            </p>
          </div>

          {/* Target File Picker */}
          <div className="w-full md:w-80">
            <select
              value={selectedFileForImpact}
              onChange={handleImpactSelectChange}
              className="w-full bg-radar-surface border border-radar-border rounded-lg px-3 py-2 text-xs text-radar-text font-mono outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="" disabled>Choose a source file to analyze...</option>
              {repo.files?.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.path}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingImpact ? (
          <div className="p-8 text-center text-xs text-radar-textMuted">
            Calculating transitive graph closure...
          </div>
        ) : impactData ? (
          <div className="space-y-6">
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-radar-surface rounded-xl border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">Total Blast Radius</span>
                <p className="text-xl font-bold font-mono text-cyan-400">
                  {impactData.totalAffectedCount} files
                </p>
                <span className="text-[10px] text-radar-textSubtle">Total affected by changes</span>
              </div>

              <div className="p-3 bg-radar-surface rounded-xl border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">Direct Dependents</span>
                <p className="text-xl font-bold font-mono text-purple-400">
                  {impactData.directDependents.length} files
                </p>
                <span className="text-[10px] text-radar-textSubtle">Directly import this file</span>
              </div>

              <div className="p-3 bg-radar-surface rounded-xl border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">Transitive Dependents</span>
                <p className="text-xl font-bold font-mono text-indigo-400">
                  {impactData.transitiveDependents.length} files
                </p>
                <span className="text-[10px] text-radar-textSubtle">Indirect chain dependencies</span>
              </div>

              <div className="p-3 bg-radar-surface rounded-xl border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">Outgoing Dependencies</span>
                <p className="text-xl font-bold font-mono text-slate-300">
                  {impactData.directDependencies.length} files
                </p>
                <span className="text-[10px] text-radar-textSubtle">Imports needed by this file</span>
              </div>
            </div>

            {/* Affected files breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-radar-surface/60 rounded-xl border border-radar-border">
                <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-between">
                  <span>Direct Dependents (Immediate Callers)</span>
                  <span>({impactData.directDependents.length})</span>
                </h4>
                {impactData.directDependents.length === 0 ? (
                  <p className="text-radar-textSubtle text-[11px] italic">No direct incoming imports.</p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {impactData.directDependents.map((f, i) => (
                      <div key={i} className="p-1.5 rounded bg-radar-surface text-slate-300 truncate">
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-radar-surface/60 rounded-xl border border-radar-border">
                <h4 className="font-semibold text-indigo-300 mb-2 flex items-center justify-between">
                  <span>Transitive Dependents (Ripple Effect)</span>
                  <span>({impactData.transitiveDependents.length})</span>
                </h4>
                {impactData.transitiveDependents.length === 0 ? (
                  <p className="text-radar-textSubtle text-[11px] italic">No indirect downstream dependents.</p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {impactData.transitiveDependents.map((f, i) => (
                      <div key={i} className="p-1.5 rounded bg-radar-surface text-slate-300 truncate">
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* C. Circular Dependencies Section */}
      <section className="p-5 bg-radar-card border border-radar-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className={`w-5 h-5 ${cycles.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <h3 className="text-base font-semibold text-radar-text">
              Potential Circular Dependencies ({cycles.length})
            </h3>
          </div>
          <span className="text-xs text-radar-textSubtle font-mono">
            {cycles.length > 0 ? 'Cycle Detected' : 'Acyclic (Clean DAG)'}
          </span>
        </div>

        {cycles.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
            <p>
              Depth-first search confirmed that this repository contains <strong>no circular dependencies</strong>. All import relationships follow a strictly acyclic graph.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-radar-textMuted mb-2">
              The following directed dependency cycles were identified. Circular dependencies can introduce runtime initialization order bugs or bundle bundling issues:
            </p>
            {cycles.map((cycle, idx) => (
              <div key={idx} className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1.5">
                  <span>Cycle #{idx + 1}</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">({cycle.length - 1} hops)</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
                  {cycle.map((node, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-0.5 rounded bg-radar-surface border border-radar-border">
                        {node}
                      </span>
                      {i < cycle.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* A & B: Most-Imported vs Most-Dependent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Most-Imported Files */}
        <section className="p-5 bg-radar-card border border-radar-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-radar-text">
                Most-Imported Files (Highest In-Degree)
              </h3>
            </div>
            <span className="text-[11px] text-radar-textSubtle font-mono">Top Call Targets</span>
          </div>

          <div className="space-y-2">
            {mostImported.length === 0 ? (
              <p className="text-xs text-radar-textMuted italic">No files with internal incoming imports.</p>
            ) : (
              mostImported.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-radar-surface/60 rounded-lg border border-radar-border text-xs font-mono"
                >
                  <div className="truncate mr-3">
                    <span className="text-slate-400 mr-2 text-[10px]">#{idx + 1}</span>
                    <span className="text-slate-200 font-medium">{file.label || file.path}</span>
                    <span className="text-[10px] text-radar-textSubtle block truncate">{file.path}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[11px] font-semibold shrink-0">
                    {file.inDegree} in
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* B. Most-Dependent Files */}
        <section className="p-5 bg-radar-card border border-radar-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-radar-text">
                Most-Dependent Files (Highest Out-Degree)
              </h3>
            </div>
            <span className="text-[11px] text-radar-textSubtle font-mono">Top Consumers</span>
          </div>

          <div className="space-y-2">
            {mostDependent.length === 0 ? (
              <p className="text-xs text-radar-textMuted italic">No files with internal outgoing imports.</p>
            ) : (
              mostDependent.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-radar-surface/60 rounded-lg border border-radar-border text-xs font-mono"
                >
                  <div className="truncate mr-3">
                    <span className="text-slate-400 mr-2 text-[10px]">#{idx + 1}</span>
                    <span className="text-slate-200 font-medium">{file.label || file.path}</span>
                    <span className="text-[10px] text-radar-textSubtle block truncate">{file.path}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[11px] font-semibold shrink-0">
                    {file.outDegree} out
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* E. Disconnected Files */}
      <section className="p-5 bg-radar-card border border-radar-border rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Unplug className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-radar-text">
            Isolated / Disconnected Files ({disconnected.length})
          </h3>
        </div>
        <p className="text-xs text-radar-textMuted mb-3 leading-relaxed">
          These files have zero detected internal incoming or outgoing dependencies. In modern codebases, this is normal for standalone entry points (e.g. <code>vite.config.js</code>, <code>tailwind.config.js</code>), automated tests, setup scripts, or configuration modules.
        </p>

        {disconnected.length === 0 ? (
          <p className="text-xs text-emerald-400 font-mono">All analyzed files are connected in the dependency network.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {disconnected.map((file, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-radar-surface border border-radar-border text-xs font-mono text-slate-300 truncate"
              >
                {file.path}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
