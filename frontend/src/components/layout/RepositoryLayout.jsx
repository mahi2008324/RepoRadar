import React, { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  FileCode2,
  GitFork,
  Activity,
  ArrowLeft,
  RotateCw,
  ExternalLink,
  Star,
  GitBranch,
  ShieldAlert,
  ChevronRight,
  Layers
} from 'lucide-react';
import { repositoryService } from '../../services/repositoryService';
import { Button } from '../common/Button';
import { Skeleton } from '../common/Skeleton';
import { ErrorState } from '../common/ErrorState';

export function RepositoryLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeMessage, setReanalyzeMessage] = useState(null);

  const fetchRepo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await repositoryService.getDetails(id);
      if (res.success && res.repository) {
        setRepo(res.repository);
      } else {
        setError('Repository record not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepo();
  }, [id]);

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      setReanalyzeMessage('Re-fetching files and calculating dependency graph...');
      const res = await repositoryService.reanalyze(id);
      if (res.success) {
        await fetchRepo();
        setReanalyzeMessage('Repository updated successfully!');
        setTimeout(() => setReanalyzeMessage(null), 3000);
      }
    } catch (err) {
      alert(`Reanalysis failed: ${err.message}`);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const navItems = [
    { label: 'Overview', path: `/repositories/${id}`, icon: LayoutGrid, end: true },
    { label: 'Code Explorer', path: `/repositories/${id}/explorer`, icon: FileCode2 },
    { label: 'Dependency Graph', path: `/repositories/${id}/graph`, icon: Layers },
    { label: 'Dependency Analysis', path: `/repositories/${id}/analysis`, icon: Activity },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 md:col-span-3 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorState
          title="Repository not found"
          message={error || 'We could not locate this repository analysis in the database.'}
          onRetry={() => navigate('/dashboard')}
          retryText="Return to Dashboard"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-radar-bg">
      {/* Top Header Bar */}
      <div className="border-b border-radar-border bg-radar-surface/40 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb & Repo info */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-1.5 text-radar-textMuted hover:text-white rounded-lg hover:bg-radar-surface border border-radar-border transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 text-sm text-radar-textMuted">
              <Link to="/dashboard" className="hover:text-radar-text transition-colors">
                Repositories
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-radar-textSubtle" />
              <span className="text-radar-text font-semibold flex items-center gap-2">
                <span className="text-radar-textMuted font-normal">{repo.owner}/</span>
                {repo.name}
              </span>
            </div>

            {/* Badges */}
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <GitBranch className="w-3 h-3 text-indigo-400" />
                {repo.defaultBranch || 'main'}
              </span>

              {repo.primaryLanguage && (
                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-800/50">
                  {repo.primaryLanguage}
                </span>
              )}

              {repo.stars > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-300 border border-amber-800/40">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {repo.stars.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {reanalyzeMessage && (
              <span className="text-xs text-indigo-400 animate-pulse font-medium">
                {reanalyzeMessage}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-indigo-400' : ''}`} />}
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              Reanalyze
            </Button>

            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-radar-surface hover:bg-radar-surfaceHover text-radar-text border border-radar-border transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-radar-textSubtle" />
            </a>
          </div>
        </div>
      </div>

      {/* Main layout with sidebar and content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Persistent Repository Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="flex md:flex-col gap-1.5 bg-radar-surface/40 p-2 rounded-xl border border-radar-border sticky top-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-glow-primary border border-indigo-500/40'
                        : 'text-radar-textMuted hover:text-radar-text hover:bg-radar-surface'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet context={{ repo, refreshRepo: fetchRepo }} />
        </main>
      </div>
    </div>
  );
}
