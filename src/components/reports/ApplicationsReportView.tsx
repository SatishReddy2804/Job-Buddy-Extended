import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Layers,
  Cpu,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { ApplicationsReport, ApplicationStatus } from '../../types/index.ts';

interface ApplicationsReportViewProps {
  report: ApplicationsReport;
  onRetryApplication?: (appId: string) => void;
}

export const ApplicationsReportView: React.FC<ApplicationsReportViewProps> = ({
  report,
  onRetryApplication,
}) => {
  const {
    scores,
    telemetrySummary,
    recentSubmissionsAudit,
    platformReliabilityRankings,
    bottleneckDiagnosis,
  } = report;

  const statusBadge: Record<ApplicationStatus, { text: string; style: string }> = {
    queued: { text: 'Queued', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    detecting_fields: { text: 'DOM Inspect', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    in_progress: { text: 'Submitting', style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    missing_info: { text: 'Prompt Needed', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    submitted: { text: 'Confirmed', style: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    failed: { text: 'Interrupted', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };

  return (
    <div className="space-y-6" id="applications-realtime-report">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#09151c] via-[#080e14] to-[#07070b] p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Autonomous Application Pipeline & Submission Audit
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Live DOM event stream telemetry, form autofill accuracy metrics, and ATS bot reliability diagnostics.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-gray-500">Events Logged</div>
            <div className="text-xs font-mono text-cyan-400">
              {telemetrySummary.totalEventsLogged} telemetry frames
            </div>
          </div>
        </div>
      </div>

      {/* 4 Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Pipeline Health</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-cyan-400">
              {scores.pipelineHealthScore}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${scores.pipelineHealthScore}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-cyan-400/80 font-mono">
            Zero fatal state blocks
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Submission Success</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-teal-400">
              {scores.submissionSuccessRate}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${scores.submissionSuccessRate}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-teal-400/80 font-mono">
            Successful dispatches
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Field Detection Accuracy</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-indigo-400">
              {scores.fieldDetectionAccuracy}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${scores.fieldDetectionAccuracy}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-indigo-400/80 font-mono">
            {telemetrySummary.autoFilledFieldsCount} fields auto-filled
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Average Dispatch Time</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-amber-400">
              {telemetrySummary.averageDurationSeconds}s
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (15 / telemetrySummary.averageDurationSeconds) * 80)}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-amber-400/80 font-mono">
            Per job application
          </span>
        </div>
      </div>

      {/* Live Submission Audit Stream & Platform Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Submissions Audit Table */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0b0b12] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Realtime Application Telemetry Stream
            </h4>
            <span className="text-[10px] font-mono text-gray-500">
              {recentSubmissionsAudit.length} active sessions
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {recentSubmissionsAudit.map((item) => {
              const badge = statusBadge[item.status] || { text: item.status, style: 'bg-white/5 text-gray-400' };
              return (
                <div
                  key={item.appId}
                  className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.company}</span>
                      <span className="text-gray-400">— {item.role}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {item.lastEventMessage}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      {item.platform}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${badge.style}`}
                    >
                      {badge.text}
                    </span>
                    {item.status === 'failed' && onRetryApplication && (
                      <button
                        onClick={() => onRetryApplication(item.appId)}
                        className="p-1 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                        title="Retry Application"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Reliability & Bottlenecks */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              ATS Dispatch Speed Rankings
            </h4>
            <div className="space-y-2">
              {platformReliabilityRankings.map((plat) => (
                <div
                  key={plat.platform}
                  className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="capitalize font-semibold text-gray-300">{plat.platform}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-amber-400">{plat.avgTimeSec}s</span>
                    <span className="text-[11px] font-mono text-teal-400 font-bold">
                      {plat.successRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              Bottleneck Telemetry
            </h4>
            <div className="space-y-1.5">
              {bottleneckDiagnosis.map((item, idx) => (
                <p key={idx} className="text-[11px] text-gray-400 leading-relaxed">
                  • {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
