import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { analyzeSecuritySupplyChain } from '../utils/securityScanner';

export default function SecurityRadarModal({ isOpen, onClose, repository }) {
  const navigate = useNavigate();
  const [expandedPkg, setExpandedPkg] = useState(null);

  const securityReport = React.useMemo(() => {
    return analyzeSecuritySupplyChain(repository);
  }, [repository]);

  if (!isOpen) return null;

  const { totalVulnerabilities, totalPackagesAnalyzed, exposedFilesCount, overallRisk, packageAudits } = securityReport;

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-radar-card border border-radar-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-radar-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${totalVulnerabilities > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              {totalVulnerabilities > 0 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-radar-text">
                  Supply Chain Security & CVE Blast Radius
                </h3>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getRiskBadge(overallRisk)}`}>
                  {overallRisk} RISK
                </span>
              </div>
              <p className="text-xs text-radar-textSubtle">
                Detects third-party package CVE vulnerabilities and maps their impact across your internal files.
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
        <div className="grid grid-cols-3 gap-3 p-5 bg-radar-surface/50 border-b border-radar-border/60 text-xs">
          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Vulnerabilities
            </span>
            <span className={`text-xl font-bold font-mono ${totalVulnerabilities > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {totalVulnerabilities}
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">Known Advisories</span>
          </div>

          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Exposed Files
            </span>
            <span className={`text-xl font-bold font-mono ${exposedFilesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {exposedFilesCount}
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">In Blast Radius</span>
          </div>

          <div className="p-3 rounded-xl bg-radar-card border border-radar-border">
            <span className="text-[10px] text-radar-textSubtle uppercase tracking-wider block font-semibold">
              Packages Audited
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {totalPackagesAnalyzed}
            </span>
            <span className="text-[10px] text-radar-textSubtle block mt-0.5">Scanned Dependencies</span>
          </div>
        </div>

        {/* Package Audit List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {packageAudits.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm text-radar-text font-semibold">No external packages detected</p>
              <p className="text-xs text-radar-textMuted mt-1">This repository relies entirely on standard built-in modules.</p>
            </div>
          ) : (
            packageAudits.map((item) => {
              const isExpanded = expandedPkg === item.packageName;

              return (
                <div
                  key={item.packageName}
                  className={`rounded-xl border transition-all ${
                    item.isVulnerable
                      ? 'bg-red-950/15 border-red-900/40 hover:border-red-600/50'
                      : 'bg-radar-surface/80 border-radar-border/80 hover:border-radar-border'
                  }`}
                >
                  {/* Collapsed Card Header */}
                  <div
                    onClick={() => setExpandedPkg(isExpanded ? null : item.packageName)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${item.isVulnerable ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.isVulnerable ? <Flame className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-radar-text font-mono truncate">
                            {item.packageName}
                          </h4>
                          {item.isVulnerable ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/50">
                              {item.advisory.cve} • CVSS {item.cvss}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              Passes Audit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-radar-textSubtle mt-0.5">
                          Imported by <span className="text-radar-text font-medium">{item.consumerCount} internal file(s)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.isVulnerable && (
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] text-radar-textSubtle">Blast Radius</span>
                          <span className="text-xs font-mono font-bold text-red-400">
                            {item.blastScore}% Exposure
                          </span>
                        </div>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-radar-textSubtle" /> : <ChevronDown className="w-4 h-4 text-radar-textSubtle" />}
                    </div>
                  </div>

                  {/* Expanded Advisory & Blast Radius Details */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-radar-border/40 space-y-3 mt-2 text-xs">
                      {item.isVulnerable && item.advisory && (
                        <div className="space-y-2 mt-3">
                          <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-200">
                            <span className="font-semibold block text-[11px] uppercase tracking-wider mb-1">
                              Threat Vector & Advisory Details:
                            </span>
                            <p className="text-red-200/90 leading-relaxed text-xs">
                              {item.advisory.description}
                            </p>
                            <p className="text-red-300 font-mono text-[11px] mt-2">
                              Attack Surface: {item.advisory.attackVector}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-radar-card border border-radar-border flex items-center justify-between text-xs">
                            <span className="text-radar-textSubtle">Recommended Remediation:</span>
                            <span className="text-emerald-400 font-mono font-semibold">
                              {item.recommendation}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Consumer Files in Blast Radius */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-radar-textSubtle uppercase tracking-wider block">
                          Internal Files Exposed to this Package ({item.consumerFiles.length}):
                        </span>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                          {item.consumerFiles.map((filePath) => (
                            <div
                              key={filePath}
                              onClick={() => {
                                onClose();
                                navigate(`/repositories/${repository.id}/explorer?file=${encodeURIComponent(filePath)}`);
                              }}
                              className="p-2 rounded-lg bg-radar-card hover:bg-radar-cardHover border border-radar-border/60 hover:border-indigo-500/40 flex items-center justify-between cursor-pointer group text-xs font-mono transition-all"
                            >
                              <span className="text-radar-text group-hover:text-indigo-300 truncate">
                                {filePath}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-radar-textSubtle group-hover:text-indigo-400 shrink-0">
                                <span>Inspect File</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-radar-border bg-radar-surface/50 flex items-center justify-between text-xs text-radar-textSubtle">
          <span>Continuous Open-Source Supply Chain Radar</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-radar-card hover:bg-radar-cardHover border border-radar-border text-xs text-radar-text transition-colors"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
}
