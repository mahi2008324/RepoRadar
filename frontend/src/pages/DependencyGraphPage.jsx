import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Layers, Building2, Sparkles } from 'lucide-react';
import { DependencyGraph } from '../components/graph/DependencyGraph';
import CodeCity3D from '../components/CodeCity3D';
import { repositoryService } from '../services/repositoryService';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

export function DependencyGraphPage() {
  const { repo } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'

  const initialSelect = searchParams.get('select');

  useEffect(() => {
    if (!repo) return;

    const fetchGraph = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await repositoryService.getGraph(repo.id);
        if (res.success) {
          setGraphData({
            nodes: res.nodes || [],
            edges: res.edges || []
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load graph data.');
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [repo]);

  if (loading) {
    return <Skeleton className="w-full h-[650px] rounded-xl" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="w-full h-full flex flex-col space-y-3">
      {/* View Switcher: 2D Force Graph vs 3D Code City */}
      <div className="flex items-center justify-between gap-4 p-2.5 bg-radar-card border border-radar-border rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-radar-surface rounded-lg border border-radar-border/80">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-radar-textSubtle hover:text-radar-text hover:bg-radar-cardHover'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Flow Graph</span>
            </button>

            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-radar-textSubtle hover:text-cyan-300 hover:bg-radar-cardHover'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Code City</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 uppercase tracking-wider ml-1">
                New
              </span>
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-radar-textSubtle hidden sm:flex items-center gap-3">
          <span>{graphData.nodes?.length || 0} File Nodes</span>
          <span>•</span>
          <span className="text-cyan-400">{graphData.edges?.length || 0} Internal Connections</span>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="w-full flex-1 min-h-[580px]">
        {viewMode === '2d' ? (
          <DependencyGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            initialSelectedId={initialSelect}
          />
        ) : (
          <CodeCity3D repository={repo} />
        )}
      </div>
    </div>
  );
}
export default DependencyGraphPage;
