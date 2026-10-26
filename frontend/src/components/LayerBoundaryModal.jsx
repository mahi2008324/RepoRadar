import React from 'react';
import {
  Layers,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { auditLayerBoundaries } from '../utils/boundaryEnforcer';

export default function LayerBoundaryModal({ isOpen, onClose, repository }) {
  if (!isOpen || !repository) return null;

  const audit = auditLayerBoundaries(repository);
  const { score, totalViolations, violations, layerDistribution } = audit;

  const getScoreColor = (sc) => {
    if (sc >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (sc >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-radar-card border border-radar-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-radar-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-radar-text">
                  Clean Architecture Layer Boundary Enforcer
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${getScoreColor(score)}`}>
                  {score}% Compliance
                </span>
              </div>
              <p className="text-xs text-radar-textSubtle">
                Enforces strict separation of concerns between models, services, controllers, and UI.
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-radar-surface/50 border-b border-radar-border/60 text-xs">
          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Compliance Score
            </span>
            <span className={`text-xl font-bold font-mono ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
              {score} / 100
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">Architectural Health</span>
          </div>

          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Boundary Leaks
            </span>
            <span className={`text-xl font-bold font-mono ${totalViolations === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalViolations}
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">Rule Violations</span>
          </div>

          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Domain Models
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {layerDistribution.PERSISTENCE || 0}
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">Persistence Files</span>
          </div>

          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Controllers & Logic
            </span>
            <span className="text-xl font-bold font-mono text-indigo-400">
              {(layerDistribution.CONTROLLERS || 0) + (layerDistribution.SERVICES || 0)}
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">Application Handlers</span>
          </div>
        </div>

        {/* Violations List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {totalViolations === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-75" />
              <h4 className="text-sm font-bold text-radar-text">Pristine Layer Separation</h4>
              <p className="text-xs text-radar-textMuted max-w-md mx-auto">
                No architectural layer violations detected! Your models, services, controllers, and UI components adhere strictly to Clean Architecture boundaries.
              </p>
            </div>
          ) : (
            violations.map((v, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-radar-surface/80 border border-radar-border/80 hover:border-radar-border space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      v.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : v.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}>
                      {v.severity}
                    </span>
                    <h4 className="text-xs font-bold text-radar-text">{v.ruleName}</h4>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-radar-bg border border-radar-border/60 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 text-[10px] border border-indigo-800/40 shrink-0">
                      {v.sourceLayer}
                    </span>
                    <span className="text-radar-text truncate">{v.sourceFile}</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />

                  <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                    <span className="text-rose-300 truncate">{v.targetFile}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[10px] border border-rose-800/40 shrink-0">
                      {v.targetLayer}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-radar-textMuted leading-relaxed">
                  {v.description}
                </p>

                <div className="p-2 rounded bg-radar-card border border-radar-border/60 text-[11px] text-emerald-300 flex items-start gap-1.5">
                  <span className="font-semibold text-emerald-400 shrink-0">Remediation:</span>
                  <span>{v.remediation}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-radar-border bg-radar-surface/50 flex items-center justify-between text-xs text-radar-textSubtle">
          <span>Continuous Clean Architecture Policy</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-radar-card hover:bg-radar-cardHover border border-radar-border text-xs text-radar-text transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
