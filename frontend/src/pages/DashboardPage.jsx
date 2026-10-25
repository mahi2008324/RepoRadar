import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FolderGit2,
  FileCode2,
  GitFork,
  CheckCircle2,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  RotateCw,
  ArrowRight,
  GitBranch,
  Star,
  Activity,
  Calendar,
  Layers,
  GitCompare,
  Sparkles
} from 'lucide-react';
import { repositoryService } from '../services/repositoryService';
import { useAuth } from '../context/AuthContext';
import { calculateHealthScore } from '../utils/healthCalculator';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { togglePin, isPinned, pinnedRepos } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pinned'

  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState({
    repositoriesCount: 0,
    sourceFilesAnalyzed: 0,
    dependenciesDiscovered: 0,
    completedAnalyses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Analyze Modal State - auto-open if redirected with pending URL
  const [isModalOpen, setIsModalOpen] = useState(Boolean(location.state?.pendingRepoUrl));
  const [newUrl, setNewUrl] = useState(location.state?.pendingRepoUrl || '');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await repositoryService.list(query);
      if (res.success) {
        setRepos(res.repositories || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(searchQuery);
  }, [searchQuery]);

  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      setModalError('Please enter a GitHub repository URL.');
      return;
    }
    try {
      setModalLoading(true);
      setModalError(null);
      const res = await repositoryService.analyze(newUrl.trim());
      if (res.success && res.id) {
        setIsModalOpen(false);
        setNewUrl('');
        navigate(`/repositories/${res.id}`);
      } else {
        setModalError(res.message || 'Analysis failed.');
      }
    } catch (err) {
      setModalError(err.message || 'Error executing repository analysis.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await repositoryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadData(searchQuery);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReanalyze = async (id, e) => {
    e.stopPropagation();
    try {
      await repositoryService.reanalyze(id);
      await loadData(searchQuery);
    } catch (err) {
      alert(`Reanalysis failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-radar-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-radar-text tracking-tight">
              Repository Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-radar-textMuted mt-1">
              Workspace of repositories analyzed and persisted by RepoRadar.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              leftIcon={<GitCompare className="w-4 h-4 text-indigo-400" />}
              onClick={() => navigate('/compare')}
            >
              Compare Codebases
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Analyze Repository
            </Button>
          </div>
        </div>

        {/* Real Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-radar-textMuted">Repositories</span>
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-radar-text">{stats.repositoriesCount}</p>
            <p className="text-[11px] text-radar-textSubtle mt-1">Persisted in database</p>
          </div>

          <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-radar-textMuted">Files Analyzed</span>
              <FileCode2 className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-400">{stats.sourceFilesAnalyzed}</p>
            <p className="text-[11px] text-radar-textSubtle mt-1">AST Parsed Source Files</p>
          </div>

          <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-radar-textMuted">Dependencies</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-purple-400">{stats.dependenciesDiscovered}</p>
            <p className="text-[11px] text-radar-textSubtle mt-1">Internal Directed Edges</p>
          </div>

          <div className="p-4 bg-radar-card border border-radar-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-radar-textMuted">Completed Runs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">{stats.completedAnalyses}</p>
            <p className="text-[11px] text-radar-textSubtle mt-1">Successful Pipelines</p>
          </div>
        </div>

        {/* Filter, Tabs, and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Catalog Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-radar-card border border-radar-border rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-radar-textMuted hover:text-radar-text hover:bg-radar-surface/60'
              }`}
            >
              All Repositories ({repos.length})
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pinned'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-radar-textMuted hover:text-amber-300 hover:bg-radar-surface/60'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Pinned ({repos.filter(r => isPinned(r.id)).length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
            <input
              type="text"
              placeholder="Search by owner, repository, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-radar-surface border border-radar-border rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Repositories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadData(searchQuery)} />
        ) : repos.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No matching repositories' : 'No repositories analyzed yet'}
            description={
              searchQuery
                ? 'No repositories match your search filter. Try another keyword or clear the search.'
                : 'Get started by submitting any public GitHub repository to generate its interactive codebase map.'
            }
            actionText="Analyze a Repository"
            onAction={() => setIsModalOpen(true)}
          />
        ) : repos.filter(r => activeTab === 'all' || isPinned(r.id)).length === 0 ? (
          <div className="p-8 text-center bg-radar-card border border-radar-border rounded-2xl max-w-md mx-auto my-6">
            <Star className="w-8 h-8 text-amber-400/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-radar-text">No Pinned Repositories</h3>
            <p className="text-xs text-radar-textMuted mt-1 mb-4">
              Click the star icon on any repository card to pin your favorite projects here.
            </p>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('all')}>
              Show All Repositories
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {repos
              .filter(r => {
                const matchesQuery =
                  !searchQuery ||
                  r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.primaryLanguage?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesTab = activeTab === 'all' || isPinned(r.id);
                return matchesQuery && matchesTab;
              })
              .map((repo) => {
                const health = calculateHealthScore(repo);
                const pinned = isPinned(repo.id);

                return (
                  <div
                    key={repo.id}
                    onClick={() => navigate(`/repositories/${repo.id}`)}
                    className="p-5 bg-radar-card hover:bg-radar-cardHover border border-radar-border hover:border-indigo-500/50 rounded-2xl shadow-card-dark transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-radar-textSubtle font-mono truncate">
                            {repo.owner}
                          </p>
                          <h3 className="text-base font-semibold text-radar-text truncate group-hover:text-indigo-300 transition-colors">
                            {repo.name}
                          </h3>
                        </div>

                        {/* Top Actions: Pin + Language */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => togglePin(repo.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              pinned
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm'
                                : 'bg-radar-surface/80 border-radar-border/80 text-radar-textSubtle hover:text-amber-400 hover:border-amber-500/30'
                            }`}
                            title={pinned ? 'Unpin repository' : 'Pin to favorites'}
                          >
                            <Star className={`w-3.5 h-3.5 ${pinned ? 'fill-amber-400' : ''}`} />
                          </button>

                          {repo.primaryLanguage && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                              {repo.primaryLanguage}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-radar-textMuted line-clamp-2 mb-4 leading-relaxed">
                        {repo.description || 'No description provided.'}
                      </p>

                      {/* Health Grade & Quality Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border ${health.bgColor} ${health.color} ${health.borderColor}`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Grade {health.grade} ({health.score}/100)</span>
                        </span>
                        <span className="text-[10px] font-mono text-radar-textSubtle">
                          {health.density} edges/file
                        </span>
                      </div>

                      {/* Metrics Badges */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 bg-radar-surface/80 rounded-xl border border-radar-border/60 text-xs font-mono mb-4">
                        <div>
                          <span className="text-[10px] text-radar-textSubtle block">Source Files</span>
                          <span className="text-slate-200 font-semibold">
                            {repo.summary?.analyzedFilesCount || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-radar-textSubtle block">Dependencies</span>
                          <span className="text-cyan-400 font-semibold">
                            {repo.summary?.internalEdgesCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                {/* Footer and Actions */}
                <div className="pt-3 border-t border-radar-border/60 flex items-center justify-between text-xs text-radar-textSubtle">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-radar-textSubtle" />
                    {new Date(repo.analyzedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleReanalyze(repo.id, e)}
                      title="Reanalyze repository"
                      className="p-1.5 text-radar-textSubtle hover:text-indigo-400 rounded hover:bg-radar-surface transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(repo);
                      }}
                      title="Delete analysis record"
                      className="p-1.5 text-radar-textSubtle hover:text-red-400 rounded hover:bg-radar-surface transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* New Analysis Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalError(null);
        }}
        title="Analyze GitHub Repository"
        confirmText="Start Analysis"
        confirmVariant="primary"
        onConfirm={handleCreateAnalysis}
        isConfirmLoading={modalLoading}
      >
        <div className="space-y-4">
          <p className="text-xs text-radar-textMuted">
            Enter any public GitHub repository URL to trigger recursive AST import analysis and dependency mapping.
          </p>

          <input
            type="text"
            placeholder="https://github.com/owner/repository"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value);
              setModalError(null);
            }}
            className="w-full bg-radar-surface border border-radar-border rounded-lg px-3.5 py-2.5 text-xs text-radar-text outline-none focus:border-indigo-500 font-mono"
            autoFocus
          />

          {modalError && (
            <p className="text-xs text-red-400 font-medium">{modalError}</p>
          )}

          <div className="pt-2 text-[11px] text-radar-textSubtle">
            Tip: You can also analyze subpaths or branch trees (e.g. <code>https://github.com/owner/repo/tree/main</code>).
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Repository Analysis"
        confirmText="Delete Record"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        isConfirmLoading={isDeleting}
      >
        <p className="text-xs text-radar-textMuted leading-relaxed">
          Are you sure you want to delete the analysis record for{' '}
          <strong className="text-slate-100">{deleteTarget?.fullPath}</strong>? This removes RepoRadar's stored analysis, graph nodes, and cached metrics. The original GitHub repository will not be affected.
        </p>
      </Modal>
    </div>
  );
}
