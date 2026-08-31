import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ChevronRight,
  Send,
  Zap,
  Target,
} from 'lucide-react';
import { JobSearchReport, JobDetailReport, JobPosting } from '../../types/index.ts';

interface JobSearchReportViewProps {
  report: JobSearchReport;
  onApplyAI?: (job: JobPosting) => void;
  allJobs?: JobPosting[];
}

export const JobSearchReportView: React.FC<JobSearchReportViewProps> = ({
  report,
  onApplyAI,
  allJobs = [],
}) => {
  const { scores, marketInsights, jobDeepAudits } = report;
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    Object.keys(jobDeepAudits)[0] || null
  );

  const selectedAudit: JobDetailReport | undefined = selectedJobId
    ? jobDeepAudits[selectedJobId]
    : undefined;

  const currentJobPosting = allJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6" id="jobsearch-realtime-report">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#0e0f1d] via-[#0b0c16] to-[#07070b] p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Opportunity Fit & Market Landscape Report
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time keyword synergy scores, ATS keyword gap analysis, and market compensation benchmarks.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-gray-500">Live Insights</div>
            <div className="text-xs font-mono text-indigo-400">
              {marketInsights.totalJobsFound} opportunities mapped
            </div>
          </div>
        </div>
      </div>

      {/* 4 Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Average Match Fit</span>
            <Target className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-indigo-400">
              {scores.averageMatchScore}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${scores.averageMatchScore}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-gray-500 font-mono">
            Across {marketInsights.totalJobsFound} listings
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>High Synergy Roles</span>
            <Sparkles className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-teal-400">
              {scores.highMatchCount}
            </span>
            <span className="text-xs text-gray-500 font-mono">roles</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{
                width: `${Math.min(100, (scores.highMatchCount / Math.max(1, marketInsights.totalJobsFound)) * 100)}%`,
              }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-teal-400/80 font-mono">
            ≥80% alignment score
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Skill Overlap Index</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-cyan-400">
              {scores.topSkillOverlapPercent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${scores.topSkillOverlapPercent}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-cyan-400/80 font-mono">
            Top demand coverage
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Market Comp Index</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">
              {scores.salaryCompetitivenessIndex}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${scores.salaryCompetitivenessIndex}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-emerald-400/80 font-mono">
            90th percentile target
          </span>
        </div>
      </div>

      {/* In-Demand Skills & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* In-Demand Skills Cloud */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Top In-Demand Hard Skills in Current Market
          </h4>
          <p className="text-xs text-gray-400 mb-4">
            Green indicates skills verified in your candidate profile; gray indicates high-frequency market requirements.
          </p>

          <div className="flex flex-wrap gap-2">
            {marketInsights.topInDemandSkills.map((item) => (
              <div
                key={item.skill}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  item.candidateHas
                    ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                    : 'bg-white/5 text-gray-400 border-white/10'
                }`}
              >
                {item.candidateHas ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                )}
                <span>{item.skill}</span>
                <span className="text-[10px] font-mono opacity-60 ml-1">({item.demandCount})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            Opportunity Platform Distribution
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(marketInsights.platformDistribution).map(([plat, count]) => (
              <div
                key={plat}
                className="rounded-xl border border-white/5 bg-black/40 p-3 flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono uppercase text-gray-400 capitalize">{plat}</span>
                <div className="text-xl font-bold font-mono text-white mt-1">{count}</div>
                <span className="text-[9px] text-indigo-400/80 font-mono mt-1">Autonomous ATS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Job Deep-Audit Section */}
      <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-indigo-400" />
          Job-Specific Fit Diagnostic & Tailored Strategy
        </h4>

        {/* Job selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/5">
          {(Object.values(jobDeepAudits) as JobDetailReport[]).map((audit) => (
            <button
              key={audit.jobId}
              onClick={() => setSelectedJobId(audit.jobId)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer border flex items-center gap-2 ${
                selectedJobId === audit.jobId
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg'
                  : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'
              }`}
            >
              <span>{audit.company}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  audit.matchScore >= 85
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {audit.matchScore}%
              </span>
            </button>
          ))}
        </div>

        {/* Selected Audit Details */}
        {selectedAudit && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 border border-white/5 p-4 rounded-xl">
              <div>
                <h5 className="text-sm font-bold text-white">{selectedAudit.title}</h5>
                <p className="text-xs text-gray-400 mt-0.5">{selectedAudit.company}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-gray-500">Hiring Velocity</div>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {selectedAudit.hiringVelocity}
                  </span>
                </div>
                {onApplyAI && currentJobPosting && (
                  <button
                    onClick={() => onApplyAI(currentJobPosting)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:brightness-110 cursor-pointer shadow-md transition"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Apply With AI
                  </button>
                )}
              </div>
            </div>

            {/* Keyword Checklist & Tailored Pitch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ATS Keyword Checklist */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                <h6 className="text-xs font-semibold text-gray-300 mb-2.5 flex items-center justify-between">
                  <span>ATS Keyword Match Checklist</span>
                  <span className="text-[10px] font-mono text-indigo-400">
                    Synergy: {selectedAudit.keywordSynergyScore}%
                  </span>
                </h6>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedAudit.atsKeywordChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-1.5 rounded bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-2">
                        {item.present ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className={item.present ? 'text-gray-200' : 'text-gray-400'}>
                          {item.keyword}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          item.importance === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {item.importance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored Pitch Bullet & Benchmark */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <h6 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                    AI-Synthesized Tailored Pitch Bullet
                  </h6>
                  <p className="text-xs text-teal-200/90 bg-teal-500/5 border border-teal-500/20 p-3 rounded-lg leading-relaxed font-mono">
                    "{selectedAudit.tailoredPitchBullet}"
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block font-mono">
                      Market Compensation Benchmark
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ${(selectedAudit.salaryBenchmark.percentile25 / 1000).toFixed(0)}k - $
                      {(selectedAudit.salaryBenchmark.percentile75 / 1000).toFixed(0)}k USD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">
                    Median: ${(selectedAudit.salaryBenchmark.median / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
