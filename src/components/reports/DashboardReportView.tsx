import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { DashboardReport, ApplicationStatus } from '../../types/index.ts';

interface DashboardReportViewProps {
  report: DashboardReport;
  onNavigateToTab?: (tab: string) => void;
}

export const DashboardReportView: React.FC<DashboardReportViewProps> = ({
  report,
  onNavigateToTab,
}) => {
  const { scores, pipelineBreakdown, platformPerformance, velocityTrend, strategicActionPlan, executiveSummary } =
    report;

  const statusColors: Record<ApplicationStatus, string> = {
    queued: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    detecting_fields: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    in_progress: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    missing_info: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    submitted: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6" id="dashboard-realtime-report">
      {/* Header Banner */}
      <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-[#0d1618] via-[#091014] to-[#07070b] p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Executive Market Readiness & Velocity Report
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Autonomous application telemetry, pipeline conversion probabilities, and ATS readiness index.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-gray-500">Last Synced</div>
            <div className="text-xs font-mono text-teal-400">
              {new Date(report.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-300 bg-black/40 border border-white/5 rounded-xl p-3 leading-relaxed">
          {executiveSummary}
        </p>
      </div>

      {/* 4 Core Realtime Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Score 1 */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">Market Readiness</span>
            <Target className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-teal-400">
              {scores.marketReadinessIndex}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${scores.marketReadinessIndex}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-teal-400/80 font-mono">
            {scores.marketReadinessIndex >= 85 ? 'Optimal Candidate Tier' : 'Good Candidate Fit'}
          </span>
        </div>

        {/* Score 2 */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">ATS Penetration</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-cyan-400">
              {scores.atsPenetrationRate}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${scores.atsPenetrationRate}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-cyan-400/80 font-mono">
            Automated Screen Pass Rate
          </span>
        </div>

        {/* Score 3 */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">Interview Probability</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">
              {scores.interviewProbability}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${scores.interviewProbability}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-emerald-400/80 font-mono">
            Based on active submissions
          </span>
        </div>

        {/* Score 4 */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">Pipeline Velocity</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-amber-400">
              {scores.pipelineVelocityScore}
            </span>
            <span className="text-xs text-gray-500 font-mono">pts</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${scores.pipelineVelocityScore}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-amber-400/80 font-mono">
            {scores.searchVelocityScore} total jobs dispatched
          </span>
        </div>
      </div>

      {/* Grid: Pipeline Distribution & Platform Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Distribution */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-400" />
              Pipeline Distribution Status
            </h4>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('applications')}
                className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
              >
                View Pipeline <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(pipelineBreakdown).map(([status, count]) => (
              <div
                key={status}
                className={`rounded-xl border p-3 ${statusColors[status as ApplicationStatus] || 'bg-white/5 border-white/10'}`}
              >
                <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                  {status.replace('_', ' ')}
                </div>
                <div className="text-xl font-bold font-mono mt-1">{count}</div>
              </div>
            ))}
          </div>

          {/* Velocity Trend mini bar chart */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="text-[11px] font-semibold text-gray-400 mb-2">7-Day Submission Velocity</div>
            <div className="flex items-end gap-2 h-14 pt-2">
              {velocityTrend.map((v) => (
                <div key={v.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-teal-500/40 rounded-t hover:bg-teal-400 transition-all"
                    style={{ height: `${Math.min(100, Math.max(15, v.count * 18))}%` }}
                    title={`${v.count} submissions on ${v.day}`}
                  />
                  <span className="text-[9px] font-mono text-gray-500">{v.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Conversion Matrix */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              ATS Platform Efficiency Matrix
            </h4>
            <span className="text-[10px] font-mono text-gray-500">Autonomous Reliability</span>
          </div>

          <div className="space-y-3">
            {platformPerformance.map((plat) => (
              <div
                key={plat.platform}
                className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="capitalize font-semibold text-gray-200">{plat.platform}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                    {plat.total} apps
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-teal-400 rounded-full"
                      style={{ width: `${plat.successRate}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-teal-400 text-xs w-12 text-right">
                    {plat.successRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Action Plan */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              Strategic Action Plan
            </div>
            <div className="space-y-1.5">
              {strategicActionPlan.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
