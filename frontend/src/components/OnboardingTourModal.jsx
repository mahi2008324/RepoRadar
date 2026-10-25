import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  X,
  FileCode,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { generateOnboardingTour } from '../utils/tourGenerator';

export default function OnboardingTourModal({ isOpen, onClose, repository }) {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = React.useMemo(() => {
    return generateOnboardingTour(repository);
  }, [repository]);

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isPlaying && isOpen && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, steps.length]);

  if (!isOpen || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-radar-card border border-radar-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Top Progress Bar */}
        <div className="w-full bg-radar-surface h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-5 pb-3 border-b border-radar-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-radar-text">
                  Architecture Onboarding Tour
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-radar-textSubtle">
                Guided visual walkthrough of <span className="text-indigo-300 font-mono">{repository?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                isPlaying
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-radar-surface text-radar-textSubtle border-radar-border hover:text-radar-text'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Auto-Play Walkthrough'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isPlaying ? 'Playing' : 'Auto-Tour'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-radar-textSubtle hover:text-radar-text hover:bg-radar-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Navigation Pills */}
        <div className="px-5 pt-3 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-radar-border/40">
          {steps.map((st, idx) => (
            <button
              key={st.stepNumber}
              onClick={() => {
                setCurrentStepIndex(idx);
                setIsPlaying(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                currentStepIndex === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-radar-surface/60 text-radar-textSubtle hover:text-radar-text border border-radar-border/40'
              }`}
            >
              <span className="text-[10px] opacity-75">{st.stepNumber}.</span>
              <span>{st.shortName}</span>
            </button>
          ))}
        </div>

        {/* Main Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Step Header */}
          <div className="p-4 rounded-xl bg-radar-surface/80 border border-radar-border space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${currentStep.badgeColor}`}>
                Layer {currentStep.stepNumber}: {currentStep.shortName}
              </span>
              <span className="text-xs text-radar-textSubtle flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {currentStep.files.length} key modules
              </span>
            </div>
            <h4 className="text-base font-bold text-radar-text">{currentStep.title}</h4>
            <p className="text-xs text-radar-textMuted leading-relaxed">{currentStep.description}</p>
          </div>

          {/* Architecture Secret Tip */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-indigo-300 block text-[11px] uppercase tracking-wider">
                Architectural Insight:
              </span>
              <p className="text-indigo-200/90 leading-relaxed text-[11px]">
                {currentStep.architectureTip}
              </p>
            </div>
          </div>

          {/* Key Files Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-radar-textSubtle uppercase tracking-wider block">
              Core Modules in this Tier:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentStep.files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => {
                    onClose();
                    navigate(`/repositories/${repository.id}/explorer?file=${encodeURIComponent(file.path)}`);
                  }}
                  className="p-3 rounded-xl bg-radar-surface border border-radar-border/80 hover:border-indigo-500/50 hover:bg-radar-cardHover transition-all cursor-pointer group flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-xs font-semibold text-radar-text truncate group-hover:text-indigo-300 font-mono">
                        {file.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-radar-textSubtle font-mono truncate">
                      {file.directory}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-radar-card text-radar-textSubtle border border-radar-border">
                      {file.inDegree} in
                    </span>
                    <ArrowRight className="w-3 h-3 text-radar-textSubtle group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-radar-border bg-radar-surface/50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
              setIsPlaying(false);
            }}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-radar-border text-xs text-radar-text hover:bg-radar-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-5 bg-indigo-500' : 'bg-radar-border'
                }`}
              />
            ))}
          </div>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={() => {
                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                setIsPlaying(false);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-sm transition-colors"
            >
              <span>Next Layer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finish Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
