import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Terminal,
  Shield,
  Layers,
  Lock,
  Globe,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  MousePointer,
  RotateCcw,
} from 'lucide-react';
import { JobApplication, ApplicationEvent } from '../types/index.ts';

interface LiveBrowserModalProps {
  application: JobApplication | null;
  onClose: () => void;
  onOpenMissingInfo?: (application: JobApplication) => void;
  onRetryApplication?: (applicationId: string) => void;
}

export const LiveBrowserModal: React.FC<LiveBrowserModalProps> = ({
  application,
  onClose,
  onOpenMissingInfo,
  onRetryApplication,
}) => {
  const [viewMode, setViewMode] = useState<'browser' | 'split' | 'logs'>('split');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [simulatedCursorPos, setSimulatedCursorPos] = useState<{ x: number; y: number }>({ x: 30, y: 35 });
  const [simulatedActiveInput, setSimulatedActiveInput] = useState<string>('Full Name');
  const [fps, setFps] = useState<number>(60);
  const [latency, setLatency] = useState<number>(24);

  if (!application) return null;

  const sessionId = application.browserbaseSessionId || `bb_sess_${application.id.replace('app_', '')}`;
  const browserbaseSessionUrl = `https://www.browserbase.com/sessions/${sessionId}`;
  const targetApplyUrl = application.job?.applyUrl || `https://boards.greenhouse.io/${application.job?.company.toLowerCase()}/jobs/apply`;

  const events = application.events || [];

  // Simulate real-time DOM step ticker & cursor progress when active
  useEffect(() => {
    if (application.status === 'in_progress' || application.status === 'detecting_fields') {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % 6);
        setFps(Math.floor(58 + Math.random() * 4));
        setLatency(Math.floor(22 + Math.random() * 6));

        // Move cursor realistically around the form
        const positions = [
          { x: 28, y: 25, field: 'Full Name' },
          { x: 28, y: 35, field: 'Email Address' },
          { x: 28, y: 45, field: 'Phone Number' },
          { x: 28, y: 55, field: 'LinkedIn URL' },
          { x: 50, y: 68, field: 'Resume File Dropzone' },
          { x: 75, y: 85, field: 'Submit Application Button' },
        ];
        const nextPos = positions[Math.floor(Math.random() * positions.length)];
        setSimulatedCursorPos({ x: nextPos.x, y: nextPos.y });
        setSimulatedActiveInput(nextPos.field);
      }, 2200);

      return () => clearInterval(interval);
    }
  }, [application.status]);

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'submitted':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'missing_info':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'in_progress':
      case 'detecting_fields':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'failed':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      id="live-browser-modal"
    >
      <div
        className={`relative w-full rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] text-[#e0e0e6] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'h-full max-w-full' : 'h-[92vh] max-w-6xl'
        }`}
      >
        {/* ==================== Top Header Bar ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1a1a24] p-4 gap-3 bg-[#0d0d15]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-black font-bold shadow-[0_0_12px_rgba(45,212,191,0.4)]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  Browserbase Live Agent Studio
                </h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${getStatusColor(application.status)}`}>
                  {application.status === 'in_progress' && <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />}
                  {application.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {application.job?.title} • <span className="text-white font-medium">{application.job?.company}</span> ({application.job?.platform.toUpperCase()} ATS)
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex rounded-xl bg-black/40 border border-white/10 p-0.5 text-xs">
              <button
                onClick={() => setViewMode('browser')}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  viewMode === 'browser' ? 'bg-teal-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Browser View
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  viewMode === 'split' ? 'bg-teal-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Split Stream
              </button>
              <button
                onClick={() => setViewMode('logs')}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  viewMode === 'logs' ? 'bg-teal-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                DOM Trace
              </button>
            </div>

            {/* External Session Link */}
            <a
              href={browserbaseSessionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-400 hover:bg-teal-500/20 transition"
              title="Open Browserbase Cloud Console"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Browserbase Session</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2 text-gray-400 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2 text-gray-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ==================== Simulated Chromium Top Bar ==================== */}
        <div className="flex items-center justify-between border-b border-[#1a1a24] bg-[#050508] px-4 py-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>

            <div className="ml-2 flex items-center gap-1 text-gray-500">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 hover:text-white transition cursor-pointer"
                title={isPaused ? 'Resume Agent Automation' : 'Pause Agent Automation'}
              >
                {isPaused ? <Play className="h-3 w-3 text-emerald-400" /> : <Pause className="h-3 w-3 text-amber-400" />}
              </button>
              <button
                onClick={() => {
                  if (onRetryApplication) onRetryApplication(application.id);
                }}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Restart Session"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Chrome URL Address Bar */}
          <div className="mx-4 flex flex-1 max-w-xl items-center rounded-lg bg-[#0d0d15] border border-white/10 px-3 py-1 text-[11px] text-gray-300">
            <Lock className="h-3 w-3 text-emerald-400 mr-1.5 shrink-0" />
            <span className="truncate font-sans text-xs text-gray-300">{targetApplyUrl}</span>
            <span className="ml-auto text-[10px] font-mono text-teal-400 shrink-0 bg-teal-500/10 px-1.5 py-0.2 rounded">
              SSL 256-BIT
            </span>
          </div>

          {/* Telemetry Badges */}
          <div className="hidden md:flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-teal-400" />
              <span>Chromium v126 Headless</span>
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span>{fps} FPS</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>{latency}ms Latency</span>
            </span>
          </div>
        </div>

        {/* ==================== Main Split Content Area ==================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT: Live Browser Canvas */}
          {(viewMode === 'browser' || viewMode === 'split') && (
            <div className={`relative flex-1 bg-[#0c0d14] flex flex-col overflow-y-auto border-r border-[#1a1a24] ${viewMode === 'browser' ? 'w-full' : 'md:w-3/5'}`}>
              
              {/* Live Step Overlay Narration Bar */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-teal-500/20 bg-teal-950/40 backdrop-blur-md px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-teal-400 animate-pulse" />
                  <span className="font-semibold text-teal-300">
                    {application.status === 'submitted'
                      ? '✅ Application Successfully Submitted & Verified'
                      : application.status === 'missing_info'
                      ? '⚠️ Human-in-the-loop Required: Screening Questions Detected'
                      : `🤖 AI Agent Active: Injecting profile data into [data-qa="${simulatedActiveInput}"]...`}
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  Step {currentStepIndex + 1}/6
                </span>
              </div>

              {/* Simulated ATS Application Form View */}
              <div className="p-6 max-w-2xl mx-auto w-full space-y-5 relative">
                
                {/* Simulated Floating AI Cursor */}
                {(application.status === 'in_progress' || application.status === 'detecting_fields') && (
                  <div
                    className="absolute z-30 pointer-events-none transition-all duration-700 ease-out flex items-center gap-1.5"
                    style={{ left: `${simulatedCursorPos.x}%`, top: `${simulatedCursorPos.y}%` }}
                  >
                    <MousePointer className="h-5 w-5 text-teal-400 fill-teal-400 filter drop-shadow-[0_0_8px_#2dd4bf]" />
                    <span className="rounded bg-teal-500 px-1.5 py-0.5 text-[9px] font-bold text-black shadow-lg">
                      AI Autopilot
                    </span>
                  </div>
                )}

                {/* Company & Job Card Header */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <h3 className="text-base font-bold text-white">{application.job?.title}</h3>
                  <p className="text-xs text-gray-400">{application.job?.company} • {application.job?.location}</p>
                </div>

                {/* Simulated Input Fields */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Full Legal Name *</label>
                    <input
                      type="text"
                      readOnly
                      value="Satish Reddy"
                      className="w-full rounded-lg border border-teal-500/40 bg-teal-500/5 px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Email Address *</label>
                      <input
                        type="text"
                        readOnly
                        value="satishreddy2845@gmail.com"
                        className="w-full rounded-lg border border-teal-500/40 bg-teal-500/5 px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Phone Number *</label>
                      <input
                        type="text"
                        readOnly
                        value="+1 (415) 890-4321"
                        className="w-full rounded-lg border border-teal-500/40 bg-teal-500/5 px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">LinkedIn Profile URL</label>
                      <input
                        type="text"
                        readOnly
                        value="https://linkedin.com/in/satishreddy-dev"
                        className="w-full rounded-lg border border-teal-500/40 bg-teal-500/5 px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">GitHub / Portfolio URL</label>
                      <input
                        type="text"
                        readOnly
                        value="https://github.com/satishreddy-dev"
                        className="w-full rounded-lg border border-teal-500/40 bg-teal-500/5 px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Resume Upload Preview */}
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Candidate Resume Attachment *</label>
                    <div className="rounded-xl border border-dashed border-teal-500/40 bg-teal-500/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-teal-400" />
                        <div>
                          <p className="font-mono text-white text-xs font-semibold">Satish_Reddy_Staff_Engineer_Resume.pdf</p>
                          <p className="text-[10px] text-gray-400">142.8 KB • Base64 PDF Payload Uploaded</p>
                        </div>
                      </div>
                      <span className="rounded bg-teal-500/20 text-teal-300 font-mono text-[10px] px-2 py-0.5 font-bold">
                        VERIFIED 100%
                      </span>
                    </div>
                  </div>

                  {/* Missing Info Prompt Action if in missing_info status */}
                  {application.status === 'missing_info' && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <HelpCircle className="h-4 w-4" />
                        <span>Additional ATS Screening Questions Required</span>
                      </div>
                      <p className="text-gray-300 text-xs">
                        The company ATS requires answering custom compliance or start date questions.
                      </p>
                      {onOpenMissingInfo && (
                        <button
                          onClick={() => onOpenMissingInfo(application)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow-lg hover:brightness-110 cursor-pointer"
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span>Provide Missing Info Now</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submit Button Status */}
                  <div className="pt-3">
                    <button
                      disabled
                      className={`w-full rounded-xl py-2.5 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 ${
                        application.status === 'submitted'
                          ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-teal-500/40 text-teal-200'
                      }`}
                    >
                      {application.status === 'submitted' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>APPLICATION SUBMITTED TO {application.job?.platform.toUpperCase()}</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 animate-spin" />
                          <span>AUTO-SUBMITTING VIA BROWSERBASE...</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: Real-time Execution & DOM Trace Stream */}
          {(viewMode === 'logs' || viewMode === 'split') && (
            <div className={`bg-[#07070b] flex flex-col overflow-hidden ${viewMode === 'logs' ? 'w-full' : 'md:w-2/5'}`}>
              
              {/* Trace Stream Header */}
              <div className="flex items-center justify-between border-b border-[#1a1a24] p-3 text-xs bg-[#0a0a0f]">
                <div className="flex items-center gap-2 text-gray-300 font-mono text-[11px] font-semibold">
                  <Terminal className="h-3.5 w-3.5 text-teal-400" />
                  <span>Agent Action Stream ({events.length})</span>
                </div>

                <span className="text-[10px] font-mono text-gray-500">
                  ID: {sessionId.slice(0, 14)}...
                </span>
              </div>

              {/* Event Timeline Cards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {events.length === 0 ? (
                  <div className="text-center text-gray-600 italic p-6">
                    Awaiting Browserbase headless cluster connection...
                  </div>
                ) : (
                  events.map((evt, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#1a1a24] bg-[#0c0c14] p-3 space-y-1.5 transition hover:border-teal-500/30"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-teal-400 uppercase tracking-wider">
                          {evt.eventType}
                        </span>
                        <span className="text-gray-500">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-gray-200 text-xs font-sans leading-relaxed">
                        {evt.message}
                      </p>

                      {evt.details && (
                        <pre className="rounded bg-[#040406] p-2 text-[10px] text-cyan-300/80 border border-white/5 overflow-x-auto">
                          {JSON.stringify(evt.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Quick Actions */}
              <div className="border-t border-[#1a1a24] p-3 bg-[#0a0a0f] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-teal-400 font-mono text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                  <span>BROWSER STREAM READY</span>
                </div>

                {application.status === 'failed' && onRetryApplication && (
                  <button
                    onClick={() => onRetryApplication(application.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry Run</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
