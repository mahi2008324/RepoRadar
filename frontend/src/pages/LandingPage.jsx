import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  ArrowRight,
  GitBranch,
  Layers,
  FileCode2,
  Activity,
  ShieldAlert,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { repositoryService } from '../services/repositoryService';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loginAsGuest } = useAuth();

  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    'Validating repository URL...',
    'Fetching repository tree from GitHub API...',
    'Filtering source files (JS/JSX/TS/TSX)...',
    'Extracting AST import relationships...',
    'Constructing directed dependency graph...',
    'Calculating graph metrics and cycle detection...',
    'Persisting analysis to database...'
  ];

  const exampleRepos = [
    { label: 'expressjs/express', url: 'https://github.com/expressjs/express' },
    { label: 'reduxjs/redux', url: 'https://github.com/reduxjs/redux' },
    { label: 'facebook/react', url: 'https://github.com/facebook/react' }
  ];

  const validateUrl = (input) => {
    if (!input || !input.trim()) {
      return 'Please enter a GitHub repository URL.';
    }
    const trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return 'URL must start with https://';
    }
    if (!trimmed.toLowerCase().includes('github.com')) {
      return 'Only public github.com repositories are currently supported.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Require sign-in before triggering analysis
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/dashboard' },
          pendingRepoUrl: url.trim(),
          message: 'Please sign in or create an account to analyze GitHub repositories.'
        }
      });
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setCurrentStage(0);

      // Genuine progress animation timer while backend performs analysis
      const stageInterval = setInterval(() => {
        setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 1200);

      const res = await repositoryService.analyze(url.trim());
      clearInterval(stageInterval);

      if (res.success && res.id) {
        navigate(`/repositories/${res.id}`);
      } else {
        setError(res.message || 'Analysis did not complete successfully.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during repository analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-radar-bg text-radar-text overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-900/20 via-cyan-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-8 shadow-glow-primary animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation AST Codebase Cartography</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="block text-slate-100">Understand Any Codebase</span>
          <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent mt-1">
            in Minutes, Not Days.
          </span>
        </h1>

        {/* Supporting description */}
        <p className="text-base sm:text-lg text-radar-textMuted max-w-2xl mx-auto mb-10 leading-relaxed">
          RepoRadar parses real JavaScript and TypeScript source trees, extracts AST import relationships, detects directed cycles, and generates an interactive architectural map of any public GitHub repository.
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-radar-surface/90 border border-radar-border focus-within:border-indigo-500 rounded-2xl shadow-card-dark transition-all">
            <div className="flex items-center gap-2.5 px-3 w-full">
              <Radar className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                placeholder="https://github.com/owner/repository"
                className="w-full bg-transparent text-sm text-radar-text placeholder-radar-textSubtle outline-none font-mono py-2"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full sm:w-auto shrink-0 !py-3 !px-6"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Repository
            </Button>
          </div>

          {/* Validation error */}
          {error && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Analysis Progress View */}
        {loading && (
          <div className="max-w-xl mx-auto mt-6 p-5 bg-radar-card border border-indigo-500/40 rounded-xl shadow-glow-primary text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                Analyzing Repository Pipeline
              </span>
              <span className="text-xs font-mono text-radar-textMuted">
                Stage {currentStage + 1} of {stages.length}
              </span>
            </div>

            <div className="w-full bg-radar-surface h-1.5 rounded-full overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const isDone = idx < currentStage;
                const isCurrent = idx === currentStage;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs font-mono transition-opacity ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-cyan-300 font-medium'
                        : 'text-slate-600 opacity-40'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-cyan-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span>{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Example Repositories & Instant Demo */}
        {!loading && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 text-xs text-radar-textMuted">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-radar-textSubtle">Try an example:</span>
              {exampleRepos.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setUrl(example.url)}
                  className="px-2.5 py-1 rounded-md bg-radar-surface hover:bg-slate-800 text-slate-300 hover:text-white border border-radar-border font-mono transition-colors"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <span className="hidden sm:inline text-radar-border">|</span>

            <button
              type="button"
              onClick={async () => {
                try {
                  if (!isAuthenticated) {
                    await loginAsGuest();
                  }
                  navigate('/dashboard');
                } catch {
                  navigate('/dashboard');
                }
              }}
              className="px-3 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Test Drive Demo (Instant Access)</span>
            </button>
          </div>
        )}
      </section>

      {/* Interactive Interface Preview */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
        <div className="p-2 sm:p-4 bg-radar-card/80 border border-radar-border rounded-2xl shadow-card-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-radar-border bg-radar-surface/60 rounded-t-xl mb-4 text-xs text-radar-textMuted font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-400">reporadar-preview // architecture-graph</span>
            </div>
            <div className="text-[11px] text-indigo-400">Live Directed AST Graph</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#0c101a] rounded-xl border border-radar-border/40 min-h-[280px]">
            <div className="p-4 bg-radar-card rounded-xl border border-radar-border flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-indigo-400 font-semibold block mb-1">
                  1. Root Consumer
                </span>
                <p className="text-sm font-mono text-slate-200">src/App.jsx</p>
                <p className="text-xs text-slate-400 mt-1">Imports Router, Header, and StateContext.</p>
              </div>
              <div className="pt-4 border-t border-radar-border text-[11px] text-cyan-400 font-mono">
                ↓ 3 outgoing dependencies
              </div>
            </div>

            <div className="p-4 bg-radar-card rounded-xl border border-indigo-500/50 shadow-glow-primary flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-cyan-400 font-semibold block mb-1">
                  2. Core Component
                </span>
                <p className="text-sm font-mono text-slate-200">src/components/Header.jsx</p>
                <p className="text-xs text-slate-400 mt-1">Imports Button, Nav, and AuthHook.</p>
              </div>
              <div className="pt-4 border-t border-radar-border text-[11px] text-indigo-400 font-mono">
                ↑ 1 incoming dependent | ↓ 2 outgoing
              </div>
            </div>

            <div className="p-4 bg-radar-card rounded-xl border border-radar-border flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-purple-400 font-semibold block mb-1">
                  3. Leaf Utility
                </span>
                <p className="text-sm font-mono text-slate-200">src/utils/math.js</p>
                <p className="text-xs text-slate-400 mt-1">Zero outgoing internal imports. Most imported.</p>
              </div>
              <div className="pt-4 border-t border-radar-border text-[11px] text-emerald-400 font-mono">
                ↑ 8 incoming dependents (Leaf)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-radar-border/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-radar-text mb-4">
            Engineered for Developer Productivity
          </h2>
          <p className="text-sm text-radar-textMuted">
            Everything you need to inspect, understand, and safely modify complex repositories without getting lost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-radar-card border border-radar-border rounded-xl">
            <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-lg w-fit border border-indigo-800/40 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-radar-text mb-2">Interactive Dependency Graphs</h3>
            <p className="text-xs text-radar-textMuted leading-relaxed">
              Explore directed React Flow maps generated from actual AST import statements. Zoom, pan, and filter nodes seamlessly.
            </p>
          </div>

          <div className="p-6 bg-radar-card border border-radar-border rounded-xl">
            <div className="p-3 bg-cyan-950/60 text-cyan-400 rounded-lg w-fit border border-cyan-800/40 mb-4">
              <FileCode2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-radar-text mb-2">Multi-Panel Code Explorer</h3>
            <p className="text-xs text-radar-textMuted leading-relaxed">
              Inspect folder trees, syntax-highlighted source code, line counts, and exact import/export declarations in real time.
            </p>
          </div>

          <div className="p-6 bg-radar-card border border-radar-border rounded-xl">
            <div className="p-3 bg-purple-950/60 text-purple-400 rounded-lg w-fit border border-purple-800/40 mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-radar-text mb-2">Blast Radius Impact</h3>
            <p className="text-xs text-radar-textMuted leading-relaxed">
              Select any file to immediately compute transitive dependents and see what might break before you refactor.
            </p>
          </div>

          <div className="p-6 bg-radar-card border border-radar-border rounded-xl">
            <div className="p-3 bg-red-950/60 text-red-400 rounded-lg w-fit border border-red-800/40 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-radar-text mb-2">Cycle & Anomaly Detection</h3>
            <p className="text-xs text-radar-textMuted leading-relaxed">
              Automated depth-first search uncovers circular dependencies, disconnected files, and unresolvable path aliases.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Walkthrough */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-radar-border/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-radar-text mb-2">How RepoRadar Works</h2>
          <p className="text-xs text-radar-textMuted">Three automated steps to total codebase clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-radar-surface/40 rounded-xl border border-radar-border">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Enter GitHub URL</h4>
            <p className="text-xs text-radar-textMuted">
              Provide any public GitHub repository link. RepoRadar validates and retrieves the repository tree.
            </p>
          </div>

          <div className="text-center p-6 bg-radar-surface/40 rounded-xl border border-radar-border">
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">AST Import Analysis</h4>
            <p className="text-xs text-radar-textMuted">
              Source files are parsed into Babel Abstract Syntax Trees to extract real ESM, CJS, and TypeScript relationships.
            </p>
          </div>

          <div className="text-center p-6 bg-radar-surface/40 rounded-xl border border-radar-border">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Explore the Graph</h4>
            <p className="text-xs text-radar-textMuted">
              Interact with the directed graph, track high-frequency imports, inspect code, and calculate blast radii.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-radar-border bg-radar-surface/20 py-8 px-4 text-center text-xs text-radar-textSubtle">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-radar-text">RepoRadar</span>
            <span>— Turn any GitHub repository into an interactive map.</span>
          </div>
          <div className="flex items-center gap-4 text-radar-textMuted">
            <button onClick={() => navigate('/dashboard')} className="hover:text-radar-text">Dashboard</button>
            <button onClick={() => navigate('/history')} className="hover:text-radar-text">History</button>
            <button onClick={() => navigate('/settings')} className="hover:text-radar-text">Settings</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
