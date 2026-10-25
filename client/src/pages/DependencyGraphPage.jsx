import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { DependencyGraph } from '../components/graph/DependencyGraph';
import { repositoryService } from '../services/repositoryService';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

export function DependencyGraphPage() {
  const { repo } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="w-full h-full">
      <DependencyGraph
        nodes={graphData.nodes}
        edges={graphData.edges}
        initialSelectedId={initialSelect}
      />
    </div>
  );
}
