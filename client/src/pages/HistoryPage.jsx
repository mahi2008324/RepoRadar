import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  ExternalLink,
  Trash2,
  RotateCw,
  FolderGit2,
  Calendar,
  Layers,
  FileCode2
} from 'lucide-react';
import { repositoryService } from '../services/repositoryService';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function HistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await repositoryService.list(query);
      if (res.success) {
        setHistory(res.repositories || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(search);
  }, [search]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await repositoryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchHistory(search);
    } catch (err) {
      alert(`Deletion error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReanalyze = async (id) => {
    try {
      await repositoryService.reanalyze(id);
      await fetchHistory(search);
    } catch (err) {
      alert(`Reanalysis error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-radar-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-radar-text flex items-center gap-2.5">
              <History className="w-6 h-6 text-indigo-400" />
              <span>Analysis History</span>
            </h1>
            <p className="text-xs text-radar-textMuted mt-1">
              Audit log of previously analyzed repositories persisted in the database.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-radar-surface border border-radar-border rounded-lg pl-9 pr-4 py-2 text-xs text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchHistory(search)} />
        ) : history.length === 0 ? (
          <EmptyState
            icon={<History className="w-12 h-12 text-indigo-400" />}
            title="No history found"
            description="No repository analyses match your current filters. Analyze a repository to record its history."
            actionText="Go to Dashboard"
            onAction={() => navigate('/dashboard')}
          />
        ) : (
          <div className="bg-radar-card border border-radar-border rounded-xl shadow-card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-radar-surface border-b border-radar-border text-radar-textSubtle font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Repository</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Source Files</th>
                    <th className="py-3 px-4">Dependencies</th>
                    <th className="py-3 px-4">Analyzed Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-radar-border">
                  {history.map((repo) => (
                    <tr
                      key={repo.id}
                      className="hover:bg-radar-surface/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/repositories/${repo.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-radar-text">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{repo.owner} / {repo.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                          {repo.primaryLanguage || 'JavaScript'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {repo.summary?.analyzedFilesCount || 0}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cyan-400">
                        {repo.summary?.internalEdgesCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-radar-textMuted font-mono text-[11px]">
                        {new Date(repo.analyzedAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReanalyze(repo.id)}
                            title="Reanalyze"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-red-400"
                            onClick={() => setDeleteTarget(repo)}
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete History Entry"
        confirmText="Confirm Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        isConfirmLoading={isDeleting}
      >
        <p className="text-xs text-radar-textMuted leading-relaxed">
          Are you sure you want to delete the saved analysis for{' '}
          <strong className="text-slate-100">{deleteTarget?.fullPath}</strong>?
        </p>
      </Modal>
    </div>
  );
}
