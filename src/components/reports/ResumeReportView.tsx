import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ResumeReport } from '../../types/index.ts';

interface ResumeReportViewProps {
  report: ResumeReport;
  onOpenOnboarding?: () => void;
}

export const ResumeReportView: React.FC<ResumeReportViewProps> = ({
  report,
  onOpenOnboarding,
}) => {
  const {
    scores,
    experienceAudits,
    topMissingHardSkills,
    actionVerbsStrength,
    atsFormattingChecks,
    executiveSummary,
    recommendedBulletRewrites,
  } = report;

  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(text);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const gradeColors: Record<string, string> = {
    'A+': 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    A: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'B+': 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    B: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    C: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    D: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  };

  return (
    <div className="space-y-6" id="resume-realtime-report">
      {/* Header Banner */}
      <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-[#0d1618] via-[#091014] to-[#07070b] p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Comprehensive ATS & Resume Diagnostic Report
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Line-by-line Google XYZ metric density audit, action verb taxonomy analysis, and ATS format validation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                gradeColors[scores.overallGrade] || 'text-white border-white/10'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Overall Grade: {scores.overallGrade}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-300 bg-black/40 border border-white/5 rounded-xl p-3 leading-relaxed">
          {executiveSummary}
        </p>
      </div>

      {/* 4 Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>ATS Compliance</span>
            <ShieldCheck className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-teal-400">
              {scores.atsComplianceScore}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${scores.atsComplianceScore}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-teal-400/80 font-mono">
            Greenhouse & Lever Ready
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Impact & Metrics (XYZ)</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-cyan-400">
              {scores.impactQuantificationScore}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${scores.impactQuantificationScore}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-cyan-400/80 font-mono">
            Quantified outcome density
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Keyword Density</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-indigo-400">
              {scores.keywordDensityScore}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${scores.keywordDensityScore}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-indigo-400/80 font-mono">
            High-signal taxonomy
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-4">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Action Verbs Ratio</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">
              {actionVerbsStrength.ratio}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${actionVerbsStrength.ratio}%` }}
            />
          </div>
          <span className="mt-2 block text-[10px] text-emerald-400/80 font-mono">
            {actionVerbsStrength.strongVerbsCount} power verbs found
          </span>
        </div>
      </div>

      {/* Grid: ATS Formatting Checklist & Missing Hard Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ATS Formatting Checks */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            ATS Structural & Parsing Verification
          </h4>
          <div className="space-y-2.5">
            {atsFormattingChecks.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs"
              >
                {item.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-gray-200">{item.check}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{item.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Hard Skills & Action Plan */}
        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Recommended High-Demand Hard Skills
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Add verified competencies to your profile to unlock higher automated matching scores:
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {topMissingHardSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono"
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-2.5 text-xs font-bold text-black hover:brightness-110 cursor-pointer shadow-md transition"
            >
              <span>Re-Parse Resume with Gemini 3.7 Flash</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Experience Bullet Critiques & Rewrites */}
      <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-teal-400" />
          Experience Accomplishment Audits & Google XYZ Rewrites
        </h4>

        <div className="space-y-4">
          {experienceAudits.map((exp) => (
            <div key={exp.experienceId} className="rounded-xl border border-white/5 bg-black/40 p-4">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div>
                  <span className="font-bold text-white text-sm">{exp.role}</span>
                  <span className="text-gray-400 text-xs ml-2">@ {exp.company}</span>
                </div>
                <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Audit Score: {exp.score}/100
                </span>
              </div>

              <div className="space-y-3">
                {exp.bulletCritiques.map((critique, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 rounded-lg bg-[#07070d] border border-white/5 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-gray-400">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block mb-0.5">
                          Current Bullet:
                        </span>
                        <span>"{critique.original}"</span>
                      </div>
                      {critique.metricsDetected ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 shrink-0">
                          Metric Detected
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                          Needs Metric
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-start justify-between gap-2 bg-teal-500/5 p-2 rounded">
                      <div>
                        <span className="text-[10px] font-mono text-teal-400 uppercase block mb-0.5 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Recommended Google XYZ Rewrite:
                        </span>
                        <p className="text-teal-200 font-mono text-xs leading-relaxed">
                          "{critique.improved}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(critique.improved)}
                        className="p-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-pointer shrink-0 transition"
                        title="Copy improved bullet"
                      >
                        {copiedBullet === critique.improved ? (
                          <Check className="h-3.5 w-3.5 text-teal-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
