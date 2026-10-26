import React, { useState } from 'react';
import {
  Code,
  Shield,
  Copy,
  Check,
  X,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { generateMermaidDiagram, generateReadmeBadges } from '../utils/mermaidGenerator';
import { calculateHealthScore } from '../utils/healthCalculator';

export default function EmbedReadmeModal({ isOpen, onClose, repository }) {
  const [activeTab, setActiveTab] = useState('mermaid'); // 'mermaid' | 'badges'
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !repository) return null;

  const health = calculateHealthScore(repository);
  const mermaidSyntax = generateMermaidDiagram(repository);
  const { badges, fullMarkdownBundle } = generateReadmeBadges(repository, health);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-radar-card border border-radar-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-radar-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-radar-text">
                  Embed in GitHub README
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                  Markdown Ready
                </span>
              </div>
              <p className="text-xs text-radar-textSubtle">
                Copy native Mermaid.js architecture diagrams and live health badges into your repository.
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-radar-border/40 bg-radar-surface/40">
          <button
            onClick={() => setActiveTab('mermaid')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'mermaid'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-radar-textSubtle hover:text-radar-text'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Mermaid.js Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'badges'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-radar-textSubtle hover:text-radar-text'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Shields.io Badges</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'mermaid' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-indigo-200 space-y-1">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-indigo-300">
                  Native GitHub Markdown Support:
                </span>
                <p className="text-indigo-200/90 text-xs leading-relaxed">
                  GitHub automatically compiles and renders Mermaid blocks natively into interactive diagrams inside any <code className="text-indigo-300 font-mono">README.md</code>!
                </p>
              </div>

              <div className="relative rounded-xl bg-radar-bg border border-radar-border/80 overflow-hidden">
                <div className="flex items-center justify-between p-2.5 px-4 bg-radar-surface/80 border-b border-radar-border/60">
                  <span className="text-[11px] font-mono text-radar-textSubtle">
                    Mermaid Architecture Definition
                  </span>
                  <button
                    onClick={() => handleCopy(mermaidSyntax, 'mermaid')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-all"
                  >
                    {copiedKey === 'mermaid' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'mermaid' ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
                  {mermaidSyntax}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-radar-text">
                  Live Preview & Markdown Badges:
                </span>
                <button
                  onClick={() => handleCopy(fullMarkdownBundle, 'all-badges')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-all"
                >
                  {copiedKey === 'all-badges' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'all-badges' ? 'Copied Bundle!' : 'Copy All Badges'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-radar-surface/80 border border-radar-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-radar-textSubtle uppercase tracking-wider">
                        {badge.title}
                      </span>
                      <button
                        onClick={() => handleCopy(badge.markdown, `badge-${idx}`)}
                        className="flex items-center gap-1 text-[11px] text-radar-textSubtle hover:text-indigo-400 transition-colors"
                      >
                        {copiedKey === `badge-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `badge-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Badge Visual Preview */}
                    <div className="py-1">
                      <img
                        src={badge.previewUrl}
                        alt={badge.title}
                        className="h-7 rounded"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-2 rounded bg-radar-bg border border-radar-border/60 font-mono text-[10px] text-slate-400 break-all select-all">
                      {badge.markdown}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-radar-border bg-radar-surface/50 flex items-center justify-between text-xs text-radar-textSubtle">
          <span>Ready to paste directly into your GitHub repository</span>
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
