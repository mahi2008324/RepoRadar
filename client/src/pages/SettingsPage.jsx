import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Layers,
  HelpCircle,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/common/Button';

export function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // Local preferences persisted in localStorage
  const [maxGraphNodes, setMaxGraphNodes] = useState(() => {
    return localStorage.getItem('reporadar_max_nodes') || '150';
  });

  const [animateEdges, setAnimateEdges] = useState(() => {
    return localStorage.getItem('reporadar_animate_edges') !== 'false';
  });

  const fetchHealth = async () => {
    try {
      setHealthLoading(true);
      const res = await api.get('/health');
      setHealth(res);
    } catch (err) {
      setHealth({ status: 'error', message: err.message });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('reporadar_max_nodes', maxGraphNodes);
    localStorage.setItem('reporadar_animate_edges', String(animateEdges));
    alert('Preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-radar-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-radar-text flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Settings & System Information</span>
          </h1>
          <p className="text-xs text-radar-textMuted mt-1">
            Application preferences, API health status, and supported parser specifications.
          </p>
        </div>

        {/* Backend & Database Health */}
        <section className="p-5 bg-radar-card border border-radar-border rounded-xl shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-radar-text flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Backend & Database Status</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchHealth}
              isLoading={healthLoading}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>

          {healthLoading ? (
            <p className="text-xs text-radar-textMuted font-mono">Checking system health...</p>
          ) : health?.status === 'ok' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-radar-surface rounded-lg border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">API Service</span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Operational
                </span>
              </div>

              <div className="p-3 bg-radar-surface rounded-lg border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">Database Mode</span>
                <span className="text-slate-200 font-semibold">
                  {health.database?.mode || 'Connected'}
                </span>
              </div>

              <div className="p-3 bg-radar-surface rounded-lg border border-radar-border">
                <span className="text-[10px] text-radar-textSubtle block mb-1">Server Uptime</span>
                <span className="text-cyan-400 font-semibold">
                  {Math.round(health.uptime)} seconds
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono">
              Backend connection error: {health?.message || 'Could not reach /api/health'}
            </div>
          )}
        </section>

        {/* Graph Preferences */}
        <section className="p-5 bg-radar-card border border-radar-border rounded-xl shadow-card-dark">
          <h3 className="text-sm font-semibold text-radar-text flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Graph Rendering Preferences</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-radar-textMuted mb-1 font-medium">
                Maximum Graph Nodes Rendered
              </label>
              <select
                value={maxGraphNodes}
                onChange={(e) => setMaxGraphNodes(e.target.value)}
                className="bg-radar-surface border border-radar-border rounded-lg px-3 py-2 text-xs text-radar-text outline-none focus:border-indigo-500 font-mono cursor-pointer"
              >
                <option value="50">50 Nodes (Fastest performance)</option>
                <option value="100">100 Nodes (Balanced)</option>
                <option value="150">150 Nodes (Default - Comprehensive)</option>
                <option value="250">250 Nodes (Large graphs)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="animate_edges"
                checked={animateEdges}
                onChange={(e) => setAnimateEdges(e.target.checked)}
                className="rounded border-radar-border text-indigo-600 focus:ring-indigo-500 bg-radar-surface cursor-pointer"
              />
              <label htmlFor="animate_edges" className="text-radar-text select-none cursor-pointer">
                Animate active directional dependency arrows on node selection
              </label>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        </section>

        {/* Supported Languages & Engine Limitations */}
        <section className="p-5 bg-radar-card border border-radar-border rounded-xl shadow-card-dark text-xs space-y-3">
          <h3 className="text-sm font-semibold text-radar-text flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Analysis Engine & Scope Limitations</span>
          </h3>

          <p className="text-radar-textMuted leading-relaxed">
            RepoRadar primarily parses <strong>JavaScript (ESM, CJS, JSX)</strong> and <strong>TypeScript (TS, TSX)</strong> files using the Babel compiler AST API.
          </p>

          <div className="p-3 bg-radar-surface rounded-lg border border-radar-border space-y-1.5 text-radar-textSubtle leading-relaxed">
            <p>
              • <strong>Internal vs External:</strong> Internal relative paths (e.g. <code>./Header</code>, <code>../utils</code>) are resolved to actual files. Third-party packages (e.g. <code>react</code>, <code>express</code>) are recognized as external and listed separately without internal graph edges.
            </p>
            <p>
              • <strong>Path Aliases:</strong> Common aliases (<code>@/...</code>, <code>~/...</code>) mapping to <code>src/</code> or root are supported. Highly dynamic runtime expressions or custom webpack loaders cannot be evaluated without code execution.
            </p>
            <p>
              • <strong>Security:</strong> All repository code is parsed purely as static data without executing any untrusted code.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
