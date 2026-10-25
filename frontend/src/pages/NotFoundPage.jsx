import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-700/40 text-indigo-400 mb-6 shadow-glow-primary">
        <Radar className="w-12 h-12" />
      </div>

      <h1 className="text-4xl font-extrabold text-radar-text font-mono mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-300 mb-3">Page Coordinates Not Found</h2>
      <p className="text-xs text-radar-textMuted max-w-sm mb-8 leading-relaxed">
        The requested path does not map to any active route or repository record in RepoRadar.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
