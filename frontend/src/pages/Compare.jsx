import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileCode2,
  FolderGit2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RotateCw,
  Sparkles,
  Network
} from 'lucide-react';
import { repositoryService } from '../services/repositoryService';
import { calculateHealthScore } from '../utils/healthCalculator';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export function Compare() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [repoAId, setRepoAId] = useState(searchParams.get('a') || '');
  const [repoBId, setRepoBId] = useState(searchParams.get('b') || '');

  const [repoA, setRepoA] = useState(null);
  const [repoB, setRepoB] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await repositoryService.list();
        if (res.success && res.repositories) {
          setRepos(res.repositories);
          // Auto-select first two if not in URL params
          if (!searchParams.get('a') && res.repositories.length > 0) {
            setRepoAId(res.repositories[0].id);
          }
          if (!searchParams.get('b') && res.repositories.length > 1) {
            setRepoBId(res.repositories[1].id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load repository catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  useEffect(() => {
    const fetchComparisons = async () => {
      if (!repoAId && !repoBId) return;
      try {
        setDetailsLoading(true);
        const promises = [];
        if (repoAId) promises.push(repositoryService.getById(repoAId));
        else promises.push(Promise.resolve(null));

        if (repoBId) promises.push(repositoryService.getById(repoBId));
        else promises.push(Promise.resolve(null));

        const [resA, resB] = await Promise.all(promises);
        if (resA?.success) setRepoA(resA.repository);
        if (resB?.success) setRepoB(resB.repository);

        setSearchParams({ a: repoAId, b: repoBId });
      } catch {
        // Fallback to list objects
        setRepoA(repos.find(r => r.id === repoAId) || null);
        setRepoB(repos.find(r => r.id === repoBId) || null);
      } finally {
        setDetailsLoading(false);
      }
    };

    if (repos.length > 0) {
      fetchComparisons();
    }
  }, [repoAId, repoBId, repos.length]);

  const healthA = repoA ? calculateHealthScore(repoA) : null;
  const healthB = repoB ? calculateHealthScore(repoB) : null;

  // Compute common and unique external packages
  const packagesA = new Set(repoA?.externalPackages || []);
  const packagesB = new Set(repoB?.externalPackages || []);
  const commonPackages = [...packagesA].filter(pkg => packagesB.has(pkg));
  const uniqueToA = [...packagesA].filter(pkg => !packagesB.has(pkg));
  const uniqueToB = [...packagesB].filter(pkg => !packagesA.has(pkg));

  return (
    <div className="min-h-screen bg-radar-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-radar-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <GitCompare className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-radar-text tracking-tight">
                Architectural Codebase Comparison
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-radar-textMuted">
              Side-by-side structural coupling, AST graph density, and technical debt comparison.
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Selection Dropdowns Bar */}
        {loading ? (
          <CardSkeleton />
        ) : repos.length < 2 ? (
          <EmptyState
            title="At least 2 analyzed repositories needed"
            description="You need at least two analyzed repositories in your database to generate a comparative architecture study."
            actionText="Analyze Another Repository"
            onAction={() => navigate('/dashboard')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-radar-card border border-radar-border rounded-2xl shadow-card-dark">
              {/* Select Repo A */}
              <div>
                <label className="block text-xs font-semibold text-radar-textMuted uppercase tracking-wider mb-2">
                  Repository A (Base Codebase)
                </label>
                <select
                  value={repoAId}
                  onChange={(e) => setRepoAId(e.target.value)}
                  className="w-full bg-radar-surface border border-radar-border rounded-xl px-3.5 py-2.5 text-sm text-radar-text outline-none focus:border-indigo-500 font-mono"
                >
                  {repos.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.owner}/{r.name} ({r.primaryLanguage || 'JS'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Repo B */}
              <div>
                <label className="block text-xs font-semibold text-radar-textMuted uppercase tracking-wider mb-2">
                  Repository B (Comparison Target)
                </label>
                <select
                  value={repoBId}
                  onChange={(e) => setRepoBId(e.target.value)}
                  className="w-full bg-radar-surface border border-radar-border rounded-xl px-3.5 py-2.5 text-sm text-radar-text outline-none focus:border-cyan-500 font-mono"
                >
                  {repos.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.owner}/{r.name} ({r.primaryLanguage || 'JS'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Overview Cards */}
            {repoA && repoB && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Side-by-Side Health Score Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Repo A Health */}
                  <div className={`p-6 rounded-2xl border ${healthA.borderColor} ${healthA.bgColor} flex flex-col justify-between shadow-card-dark`}>
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs text-radar-textSubtle font-mono">{repoA.owner}</p>
                          <h2 className="text-xl font-bold text-radar-text">{repoA.name}</h2>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-black font-mono ${healthA.color}`}>
                            {healthA.grade}
                          </span>
                          <span className="text-[11px] text-radar-textSubtle block font-mono">
                            {healthA.score} / 100 Health
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {healthA.insights.slice(0, 2).map((ins, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{ins.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-radar-border/40 flex items-center justify-between text-xs">
                      <span className="text-radar-textSubtle font-mono">Density: {healthA.density} edges/file</span>
                      <Link to={`/repositories/${repoA.id}`} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                        View Graph <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Repo B Health */}
                  <div className={`p-6 rounded-2xl border ${healthB.borderColor} ${healthB.bgColor} flex flex-col justify-between shadow-card-dark`}>
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs text-radar-textSubtle font-mono">{repoB.owner}</p>
                          <h2 className="text-xl font-bold text-radar-text">{repoB.name}</h2>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-black font-mono ${healthB.color}`}>
                            {healthB.grade}
                          </span>
                          <span className="text-[11px] text-radar-textSubtle block font-mono">
                            {healthB.score} / 100 Health
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {healthB.insights.slice(0, 2).map((ins, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{ins.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-radar-border/40 flex items-center justify-between text-xs">
                      <span className="text-radar-textSubtle font-mono">Density: {healthB.density} edges/file</span>
                      <Link to={`/repositories/${repoB.id}`} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
                        View Graph <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Comparative Metrics Table */}
                <div className="bg-radar-card border border-radar-border rounded-2xl p-6 shadow-card-dark">
                  <h3 className="text-base font-semibold text-radar-text mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Side-by-Side Metric Battle</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-radar-border text-radar-textMuted uppercase font-semibold text-[10px] tracking-wider">
                          <th className="py-3 px-4">Metric</th>
                          <th className="py-3 px-4 text-indigo-300">{repoA.owner}/{repoA.name}</th>
                          <th className="py-3 px-4 text-cyan-300">{repoB.owner}/{repoB.name}</th>
                          <th className="py-3 px-4 text-right">Advantage / Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-radar-border/40 font-mono">
                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text font-medium">Architectural Grade</td>
                          <td className="py-3.5 px-4 font-bold text-sm text-indigo-300">{healthA.grade} ({healthA.score}/100)</td>
                          <td className="py-3.5 px-4 font-bold text-sm text-cyan-300">{healthB.grade} ({healthB.score}/100)</td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            {healthA.score > healthB.score ? (
                              <span className="text-emerald-400 font-medium">Repo A (+{healthA.score - healthB.score})</span>
                            ) : healthB.score > healthA.score ? (
                              <span className="text-cyan-400 font-medium">Repo B (+{healthB.score - healthA.score})</span>
                            ) : (
                              <span className="text-slate-400">Tied</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text">Analyzed Source Files</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoA.summary?.analyzedFilesCount || 0}</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoB.summary?.analyzedFilesCount || 0}</td>
                          <td className="py-3.5 px-4 text-right font-sans text-radar-textSubtle">
                            {Math.abs((repoA.summary?.analyzedFilesCount || 0) - (repoB.summary?.analyzedFilesCount || 0))} file delta
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text">Internal Dependency Edges</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoA.summary?.internalEdgesCount || 0}</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoB.summary?.internalEdgesCount || 0}</td>
                          <td className="py-3.5 px-4 text-right font-sans text-radar-textSubtle">AST Import Statements</td>
                        </tr>

                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text">Coupling Density</td>
                          <td className="py-3.5 px-4 text-radar-text">{healthA.density} edges/file</td>
                          <td className="py-3.5 px-4 text-radar-text">{healthB.density} edges/file</td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            {parseFloat(healthA.density) < parseFloat(healthB.density) ? (
                              <span className="text-emerald-400">Repo A more decoupled</span>
                            ) : parseFloat(healthB.density) < parseFloat(healthA.density) ? (
                              <span className="text-cyan-400">Repo B more decoupled</span>
                            ) : (
                              <span className="text-slate-400">Identical</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text">Circular Dependency Loops</td>
                          <td className="py-3.5 px-4 font-bold text-radar-text">
                            {repoA.summary?.cycleCount === 0 ? (
                              <span className="text-emerald-400">0 (Clean DAG)</span>
                            ) : (
                              <span className="text-red-400">{repoA.summary?.cycleCount} loop(s)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-radar-text">
                            {repoB.summary?.cycleCount === 0 ? (
                              <span className="text-emerald-400">0 (Clean DAG)</span>
                            ) : (
                              <span className="text-red-400">{repoB.summary?.cycleCount} loop(s)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            {repoA.summary?.cycleCount < repoB.summary?.cycleCount ? (
                              <span className="text-emerald-400">Repo A has fewer cycles</span>
                            ) : repoB.summary?.cycleCount < repoA.summary?.cycleCount ? (
                              <span className="text-cyan-400">Repo B has fewer cycles</span>
                            ) : (
                              <span className="text-emerald-400">Both Clean</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text">External NPM Packages</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoA.externalPackages?.length || 0} packages</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoB.externalPackages?.length || 0} packages</td>
                          <td className="py-3.5 px-4 text-right font-sans text-radar-textSubtle">
                            {commonPackages.length} common dependency
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3.5 px-4 font-sans text-radar-text">Subdirectory Structure</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoA.directorySummary?.length || 0} folders</td>
                          <td className="py-3.5 px-4 text-radar-text">{repoB.directorySummary?.length || 0} folders</td>
                          <td className="py-3.5 px-4 text-right font-sans text-radar-textSubtle">Module modularization</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Package Overlap Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Unique to A */}
                  <div className="p-5 bg-radar-card border border-radar-border rounded-2xl">
                    <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                      Unique to {repoA.name} ({uniqueToA.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {uniqueToA.length > 0 ? (
                        uniqueToA.map(pkg => (
                          <span key={pkg} className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-[11px] font-mono text-indigo-200">
                            {pkg}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-radar-textSubtle italic">No unique packages</span>
                      )}
                    </div>
                  </div>

                  {/* Shared Packages */}
                  <div className="p-5 bg-radar-card border border-radar-border rounded-2xl">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                      Shared Dependencies ({commonPackages.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {commonPackages.length > 0 ? (
                        commonPackages.map(pkg => (
                          <span key={pkg} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-200">
                            {pkg}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-radar-textSubtle italic">No common packages</span>
                      )}
                    </div>
                  </div>

                  {/* Unique to B */}
                  <div className="p-5 bg-radar-card border border-radar-border rounded-2xl">
                    <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                      Unique to {repoB.name} ({uniqueToB.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {uniqueToB.length > 0 ? (
                        uniqueToB.map(pkg => (
                          <span key={pkg} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-[11px] font-mono text-cyan-200">
                            {pkg}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-radar-textSubtle italic">No unique packages</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Compare;
