import React, { useState } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { InngestWorkflowRun, InngestStepEvent } from '../types/index.ts';

interface InngestViewProps {
  workflows?: InngestWorkflowRun[];
  steps?: InngestStepEvent[];
  onTriggerDiscovery?: () => void;
  onTriggerSync?: () => void;
}

export const InngestView: React.FC<InngestViewProps> = ({
  workflows = [],
  steps = [],
  onTriggerDiscovery,
  onTriggerSync,
}) => {
  const [triggering, setTriggering] = useState<boolean>(false);

  const handleManualTrigger = () => {
    setTriggering(true);
    if (onTriggerDiscovery) onTriggerDiscovery();
    if (onTriggerSync) onTriggerSync();
    setTimeout(() => {
      setTriggering(false);
    }, 1500);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'running':
        return <Activity className="h-4 w-4 text-teal-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Fallback demo steps if empty
  const displaySteps: InngestStepEvent[] = steps.length > 0 ? steps : [
    {
      stepId: 'step_1',
      stepName: 'extract-candidate-profile',
      status: 'completed',
      durationMs: 34,
      details: 'Profile vectors and ATS skills loaded from Postgres',
    },
    {
      stepId: 'step_2',
      stepName: 'launch-browserbase-sandbox',
      status: 'completed',
      durationMs: 420,
      details: 'Headless Chromium session provisioned via Browserbase API',
    },
    {
      stepId: 'step_3',
      stepName: 'navigate-and-dom-inject',
      status: 'completed',
      durationMs: 890,
      details: 'Injected candidate details, attached resume PDF',
    },
    {
      stepId: 'step_4',
      stepName: 'verify-submission-receipt',
      status: 'completed',
      durationMs: 180,
      details: 'Application submitted successfully with ATS confirmation ID',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="inngest-view">
      
      {/* Top Banner */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white">
                Inngest Event Workflows & Background Schedulers
              </h1>
              <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-400 border border-purple-500/20">
                CRON WORKERS RUNNING
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Event-driven background orchestration for Brave job crawls, rate limiting, and failure recovery.
            </p>
          </div>

          <button
            onClick={handleManualTrigger}
            disabled={triggering}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition self-start"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>{triggering ? 'Dispatching...' : 'Trigger Event: job.apply'}</span>
          </button>
        </div>
      </div>

      {/* Live Inngest Function Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Function 1: job.apply orchestration */}
        <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#1a1a24] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white font-mono">
                fn: job-application-orchestrator
              </h2>
            </div>
            <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-400 border border-teal-500/20">
              ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            {displaySteps.map((step, idx) => (
              <div
                key={step.stepId || idx}
                className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3.5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStepIcon(step.status)}</div>
                  <div>
                    <div className="font-semibold text-white font-mono">{step.stepName}</div>
                    <div className="text-gray-500 text-[11px] font-mono">{step.details || 'Step executed cleanly.'}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-gray-500 shrink-0">
                  {step.durationMs ? `${step.durationMs}ms` : '42ms'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Function 2: Cron Discovery Job */}
        <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#1a1a24] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white font-mono">
                cron: ats-live-crawler
              </h2>
            </div>
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-400 border border-indigo-500/20">
              EVERY 15 MIN
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Greenhouse Crawler Worker</span>
                <span className="text-emerald-400 font-mono text-[10px]">SYNCED (142 roles)</span>
              </div>
              <p className="text-gray-500 text-[11px]">Next schedule: in 8 minutes (Brave Search target: boards.greenhouse.io)</p>
            </div>

            <div className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Lever ATS Crawler Worker</span>
                <span className="text-emerald-400 font-mono text-[10px]">SYNCED (98 roles)</span>
              </div>
              <p className="text-gray-500 text-[11px]">Next schedule: in 8 minutes (Brave Search target: jobs.lever.co)</p>
            </div>

            <div className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Workable Crawler Worker</span>
                <span className="text-emerald-400 font-mono text-[10px]">SYNCED (64 roles)</span>
              </div>
              <p className="text-gray-500 text-[11px]">Next schedule: in 8 minutes (Brave Search target: apply.workable.com)</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
