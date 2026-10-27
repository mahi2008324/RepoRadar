import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  X,
  Volume2,
  VolumeX,
  Code,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  Cpu,
  FileCode,
  Terminal,
  ExternalLink
} from 'lucide-react';
import {
  discoverCircuitScenarios,
  playCircuitPulseSound
} from '../utils/flowTracer';

export default function NeonCircuitTracerModal({ isOpen, onClose, repository }) {
  const navigate = useNavigate();

  const scenarios = useMemo(() => {
    return discoverCircuitScenarios(repository);
  }, [repository]);

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [activeHopIndex, setActiveHopIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('payload'); // payload, headers, telemetry

  const currentScenario = scenarios[selectedScenarioIndex] || scenarios[0];
  const hops = currentScenario?.hops || [];
  const currentHop = hops[activeHopIndex] || hops[0];

  // Auto-step timer when playing
  useEffect(() => {
    let timer;
    if (isPlaying && hops.length > 0) {
      const delay = (1600 / playbackSpeed);
      timer = setTimeout(() => {
        if (activeHopIndex < hops.length - 1) {
          const nextIndex = activeHopIndex + 1;
          setActiveHopIndex(nextIndex);
          if (soundEnabled) {
            playCircuitPulseSound(440 + nextIndex * 80, 0.09);
          }
        } else {
          // Finished route
          setIsPlaying(false);
          if (soundEnabled) {
            playCircuitPulseSound(880, 0.15);
          }
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeHopIndex, hops.length, playbackSpeed, soundEnabled]);

  // Reset when scenario changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveHopIndex(0);
      setIsPlaying(true);
      if (soundEnabled) {
        playCircuitPulseSound(520, 0.12);
      }
    } else {
      setIsPlaying(false);
    }
  }, [isOpen, selectedScenarioIndex]);

  if (!isOpen || !repository || !currentScenario) return null;

  const handlePlayPause = () => {
    if (activeHopIndex >= hops.length - 1 && !isPlaying) {
      setActiveHopIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    if (activeHopIndex < hops.length - 1) {
      const nextIndex = activeHopIndex + 1;
      setActiveHopIndex(nextIndex);
      setIsPlaying(false);
      if (soundEnabled) playCircuitPulseSound(440 + nextIndex * 80, 0.08);
    }
  };

  const handleStepBack = () => {
    if (activeHopIndex > 0) {
      const prevIndex = activeHopIndex - 1;
      setActiveHopIndex(prevIndex);
      setIsPlaying(false);
      if (soundEnabled) playCircuitPulseSound(400 + prevIndex * 60, 0.08);
    }
  };

  const handleRestart = () => {
    setActiveHopIndex(0);
    setIsPlaying(true);
    if (soundEnabled) playCircuitPulseSound(520, 0.1);
  };

  const handleInspectInExplorer = (filePath) => {
    onClose();
    navigate(`/repositories/${repository.id}/explorer?file=${encodeURIComponent(filePath)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-32 bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-cyan-500/20 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Neon Circuit: Live Request & Data-Flow Tracer</span>
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 font-semibold tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Live AST Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated real-time packet propagation through the repository's concrete dependency topology.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scenario dropdown selector */}
            <select
              value={selectedScenarioIndex}
              onChange={(e) => setSelectedScenarioIndex(Number(e.target.value))}
              className="bg-slate-900 border border-cyan-500/30 text-cyan-200 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-cyan-400 font-medium cursor-pointer shadow-sm"
            >
              {scenarios.map((sc, idx) => (
                <option key={sc.id} value={idx}>
                  {sc.title} ({sc.totalHops} hops)
                </option>
              ))}
            </select>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Electric SFX' : 'Enable Electric SFX'}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                soundEnabled
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Motherboard Circuit Board View */}
        <div className="p-5 bg-gradient-to-b from-[#090d16] via-[#0b101c] to-[#070a13] border-b border-cyan-500/20 relative overflow-x-auto">
          {/* Subtle PCB Grid lines background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Pipeline Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
            <span className="font-mono text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>{currentScenario.description}</span>
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>Hop: <strong className="text-white">{activeHopIndex + 1} / {hops.length}</strong></span>
              <span>Cumulative Latency: <strong className="text-cyan-300">{currentHop?.cumulativeLatencyMs || 0} ms</strong></span>
            </div>
          </div>

          {/* Circuit Chips Track */}
          <div className="relative flex items-center justify-between gap-4 min-w-[720px] py-6 px-4">
            {/* SVG Electrical Connecting Line */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded z-0 overflow-hidden">
              {/* Glowing active progress bar */}
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${(activeHopIndex / Math.max(hops.length - 1, 1)) * 100}%`
                }}
              />
            </div>

            {/* Circuit Nodes */}
            {hops.map((hop, index) => {
              const isCurrent = index === activeHopIndex;
              const isCompleted = index < activeHopIndex;
              const isPending = index > activeHopIndex;

              return (
                <div
                  key={hop.nodeId}
                  onClick={() => {
                    setActiveHopIndex(index);
                    setIsPlaying(false);
                    if (soundEnabled) playCircuitPulseSound(440 + index * 80, 0.08);
                  }}
                  className={`relative z-10 flex flex-col items-center cursor-pointer group transition-transform duration-200 ${
                    isCurrent ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{ width: `${100 / hops.length}%` }}
                >
                  {/* Microchip Chassis Box */}
                  <div
                    className={`relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] ring-4 ring-cyan-500/20'
                        : isCompleted
                          ? 'bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)] text-emerald-300'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-500'
                    }`}
                  >
                    {/* Chip pins left/right */}
                    <div className="absolute -left-1 top-2 w-1 h-1.5 bg-slate-700 rounded-sm" />
                    <div className="absolute -left-1 bottom-2 w-1 h-1.5 bg-slate-700 rounded-sm" />
                    <div className="absolute -right-1 top-2 w-1 h-1.5 bg-slate-700 rounded-sm" />
                    <div className="absolute -right-1 bottom-2 w-1 h-1.5 bg-slate-700 rounded-sm" />

                    {/* Step badge */}
                    <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {index + 1}
                    </span>

                    {/* Icon */}
                    <Cpu className={`w-5 h-5 mt-0.5 ${
                      isCurrent
                        ? 'text-cyan-300 animate-bounce'
                        : isCompleted
                          ? 'text-emerald-400'
                          : 'text-slate-600'
                    }`} />

                    {/* Glowing beacon for active node */}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                      </span>
                    )}
                  </div>

                  {/* Microchip Labels */}
                  <div className="mt-3 text-center max-w-[130px]">
                    <span className={`block text-xs font-mono font-semibold truncate ${
                      isCurrent ? 'text-cyan-300' : isCompleted ? 'text-white' : 'text-slate-400'
                    }`}>
                      {hop.fileName}
                    </span>
                    <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded border font-mono ${hop.layer.badge}`}>
                      {hop.layer.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lower Split Pane: Active Hop Telemetry & JSON Packet Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 overflow-y-auto flex-1 bg-slate-950/70 text-xs">
          {/* Left Column: Active Step Execution Breakdown */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Hop #{activeHopIndex + 1}: Execution Dynamics</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  +{currentHop?.telemetry.latencyMs} ms
                </span>
              </div>

              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{currentHop?.path}</span>
              </h4>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                {currentHop?.action}
              </p>

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Gate Check: <strong>{currentHop?.telemetry.securityCheck}</strong></span>
                </div>

                <button
                  onClick={() => handleInspectInExplorer(currentHop.path)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium transition-colors flex items-center gap-1.5"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Inspect Code</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Packet Size</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{currentHop?.telemetry.packetSizeKb} KB</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Hop Latency</span>
                <span className="text-xs font-bold text-cyan-400 mt-0.5 block">+{currentHop?.telemetry.latencyMs} ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Runtime</span>
                <span className="text-xs font-bold text-indigo-400 mt-0.5 block">{currentHop?.cumulativeLatencyMs} ms</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live JSON Packet Inspector */}
          <div className="flex flex-col rounded-xl bg-[#060910] border border-slate-800 overflow-hidden">
            {/* Inspector Tab Bar */}
            <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-slate-300 font-semibold text-[11px]">
                  Simulated In-Flight Data Packet
                </span>
              </div>

              <div className="flex items-center gap-1">
                {['payload', 'headers'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors uppercase ${
                      activeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Code / JSON Viewer */}
            <div className="p-3 font-mono text-[11px] overflow-auto flex-1 text-cyan-200/90 bg-[#060910] max-h-56">
              <pre className="leading-relaxed">
                {activeTab === 'payload'
                  ? JSON.stringify(currentHop?.telemetry.payloadState, null, 2)
                  : JSON.stringify(currentHop?.telemetry.headers, null, 2)}
              </pre>
            </div>

            <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Status: <strong className="text-emerald-400">PROPAGATING_OK</strong></span>
              <span>Layer: {currentHop?.layer.name}</span>
            </div>
          </div>
        </div>

        {/* Playback Control Bar Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Main Controls: Play/Pause, Step, Restart */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              title="Restart Circuit Flow"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleStepBack}
              disabled={activeHopIndex === 0}
              title="Previous Step"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors disabled:opacity-40"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{activeHopIndex >= hops.length - 1 ? 'Replay Circuit' : 'Play Flow'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleStepForward}
              disabled={activeHopIndex === hops.length - 1}
              title="Next Step"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Speed:</span>
            {[0.5, 1, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Done / Close */}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
