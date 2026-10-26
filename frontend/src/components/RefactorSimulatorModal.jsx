import React, { useState, useMemo } from 'react';
import {
  Scissors,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileCode,
  Download,
  Copy,
  Check,
  X,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { simulateRefactoring, generateRefactoringPlanMarkdown } from '../utils/refactorSimulator';

export default function RefactorSimulatorModal({ isOpen, onClose, repository }) {
  const [cutEdgeKeys, setCutEdgeKeys] = useState(new Set());
  const [copied, setCopied] = useState(false);

  // Extract critical candidates for decoupling (edges involved in cycles or high coupling)
  const candidateEdges = useMemo(() => {
    if (!repository || !Array.isArray(repository.edges)) return [];

    const nodes = repository.nodes || [];
    const nodeLabelMap = new Map();
    nodes.forEach(n => nodeLabelMap.set(n.id, (n.path || n.label || n.id).split('/').pop()));

    // Get edges in cycles if cycles exist
    const cycles = repository.cycles || [];
    const cycleEdgeKeySet = new Set();
    cycles.forEach(c => {
      for (let i = 0; i < c.length - 1; i++) {
        cycleEdgeKeySet.add(`${c[i]}|${c[i + 1]}`);
      }
      if (c.length > 1) {
        cycleEdgeKeySet.add(`${c[c.length - 1]}|${c[0]}`);
      }
    });

    return repository.edges
      .map(e => {
        const key = `${e.source}|${e.target}`;
        return {
          key,
          source: e.source,
          target: e.target,
          sourceLabel: nodeLabelMap.get(e.source) || e.source,
          targetLabel: nodeLabelMap.get(e.target) || e.target,
          isInCycle: cycleEdgeKeySet.has(key)
        };
      })
      .sort((a, b) => (b.isInCycle ? 1 : 0) - (a.isInCycle ? 1 : 0))
      .slice(0, 30); // Top candidates
  }, [repository]);

  const simulation = useMemo(() => {
    return simulateRefactoring(repository, cutEdgeKeys);
  }, [repository, cutEdgeKeys]);

  if (!isOpen || !repository || !simulation) return null;

  const toggleCut = (key) => {
    setCutEdgeKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleReset = () => {
    setCutEdgeKeys(new Set());
  };

  const cutEdgesList = candidateEdges.filter(e => cutEdgeKeys.has(e.key));

  const handleDownloadPlan = () => {
    const md = generateRefactoringPlanMarkdown(repository, cutEdgesList, simulation);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repository.name}-refactoring-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyPlan = () => {
    const md = generateRefactoringPlanMarkdown(repository, cutEdgesList, simulation);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-radar-card border border-radar-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-radar-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-radar-text">
                  "What-If" Architecture Refactoring Simulator
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-semibold">
                  Sandbox Active
                </span>
              </div>
              <p className="text-xs text-radar-textSubtle">
                Simulate cutting imports and breaking cycles in real-time before writing a single line of code.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-radar-textSubtle hover:text-radar-text hover:bg-radar-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Simulation Scoreboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-radar-surface/50 border-b border-radar-border/60">
          {/* Health Score Differential */}
          <div className="p-3.5 rounded-xl bg-radar-card border border-radar-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
                Simulated Health
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-bold font-mono ${simulation.simulatedHealth.color}`}>
                  {simulation.simulatedHealth.score}
                </span>
                <span className="text-xs text-radar-textSubtle font-mono">
                  (Grade {simulation.simulatedHealth.grade})
                </span>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
              simulation.scoreDelta > 0
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-radar-surface text-radar-textSubtle border-radar-border'
            }`}>
              {simulation.scoreDelta > 0 ? `+${simulation.scoreDelta}` : '0'} pts
            </div>
          </div>

          {/* Cycles Eliminated */}
          <div className="p-3.5 rounded-xl bg-radar-card border border-radar-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
                Cycles Eliminated
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-bold font-mono ${simulation.cyclesEliminated > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {simulation.cyclesEliminated}
                </span>
                <span className="text-xs text-radar-textSubtle font-mono">
                  loops broken
                </span>
              </div>
            </div>
            <span className="text-xs text-radar-textSubtle font-mono">
              {simulation.remainingCyclesCount} remaining
            </span>
          </div>

          {/* Cuts Active */}
          <div className="p-3.5 rounded-xl bg-radar-card border border-radar-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
                Simulated Edge Cuts
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  {simulation.cutEdgeCount}
                </span>
                <span className="text-xs text-radar-textSubtle font-mono">
                  edges decoupled
                </span>
              </div>
            </div>
            {simulation.cutEdgeCount > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-mono transition-colors"
                title="Reset all simulated cuts"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Candidate Edges List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-radar-text">
              Decoupling Candidates ({candidateEdges.length} priority edges):
            </span>
            <span className="text-[11px] text-radar-textSubtle">
              Toggle scissors to simulate cutting an import
            </span>
          </div>

          <div className="space-y-2">
            {candidateEdges.map(edge => {
              const isCut = cutEdgeKeys.has(edge.key);

              return (
                <div
                  key={edge.key}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isCut
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-inner'
                      : edge.isInCycle
                      ? 'bg-radar-surface/90 border-amber-500/40 hover:border-amber-500/70'
                      : 'bg-radar-surface/60 border-radar-border hover:border-radar-border/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleCut(edge.key)}
                      className={`p-2 rounded-lg border transition-all shrink-0 ${
                        isCut
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                          : 'bg-radar-card text-radar-textSubtle border-radar-border hover:text-rose-400 hover:border-rose-500/40'
                      }`}
                      title={isCut ? 'Restore import connection' : 'Simulate cutting this import'}
                    >
                      <Scissors className="w-4 h-4" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
                        <span className={`font-semibold truncate max-w-[200px] ${isCut ? 'line-through text-radar-textSubtle' : 'text-radar-text'}`}>
                          {edge.sourceLabel}
                        </span>
                        <ArrowRight className="w-3 h-3 text-radar-textSubtle shrink-0" />
                        <span className={`truncate max-w-[200px] ${isCut ? 'line-through text-rose-400/60' : 'text-indigo-300'}`}>
                          {edge.targetLabel}
                        </span>
                        {edge.isInCycle && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 ml-1">
                            Cycle Edge
                          </span>
                        )}
                        {isCut && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 ml-1 font-bold">
                            SIMULATED CUT
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-radar-textSubtle font-mono truncate mt-0.5">
                        {edge.source} ➔ {edge.target}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-radar-border bg-radar-surface/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-radar-textSubtle">
            {simulation.cutEdgeCount > 0
              ? `${simulation.cutEdgeCount} simulated cut(s) active`
              : 'Select any edge above to preview health score improvement'}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {simulation.cutEdgeCount > 0 && (
              <>
                <button
                  onClick={handleCopyPlan}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-radar-border hover:bg-radar-card text-radar-text transition-colors flex-1 sm:flex-initial"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Plan!' : 'Copy Plan'}</span>
                </button>

                <button
                  onClick={handleDownloadPlan}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors flex-1 sm:flex-initial"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Action Plan (.md)</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-radar-card hover:bg-radar-cardHover border border-radar-border text-xs text-radar-text transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
