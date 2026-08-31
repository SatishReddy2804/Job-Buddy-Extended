import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bot,
  Sparkles,
  ExternalLink,
  MapPin,
  Building,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
} from 'lucide-react';
import { JobPosting, ATSPlatform, UserProfile, JobApplication } from '../types/index.ts';
import { JobSearchReportView } from './reports/JobSearchReportView.tsx';
import { generateJobSearchReport } from '../lib/reports.ts';

interface JobsBoardProps {
  jobs: JobPosting[];
  loading: boolean;
  onSearch: (query: string, platform?: ATSPlatform, remoteOnly?: boolean) => void;
  onApplyAI: (job: JobPosting) => void;
  applications: JobApplication[];
  profile: UserProfile | null;
  onOpenOnboarding: () => void;
}

export const JobsBoard: React.FC<JobsBoardProps> = ({
  jobs,
  loading,
  onSearch,
  onApplyAI,
  applications,
  profile,
  onOpenOnboarding,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<ATSPlatform | 'all'>('all');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [minMatchScore, setMinMatchScore] = useState<number>(60);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);

  const report = generateJobSearchReport(profile, jobs);

  const platforms: { id: ATSPlatform | 'all'; label: string }[] = [
    { id: 'all', label: 'All ATS Platforms' },
    { id: 'greenhouse', label: 'Greenhouse' },
    { id: 'lever', label: 'Lever' },
    { id: 'workable', label: 'Workable' },
    { id: 'wellfound', label: 'Wellfound' },
    { id: 'direct', label: 'Direct ATS' },
  ];

  const scorePresets = [
    { label: 'All (40%+)', value: 40 },
    { label: '60%+', value: 60 },
    { label: '75%+', value: 75 },
    { label: '85%+', value: 85 },
    { label: '90%+ Top Fit', value: 90 },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(
      searchQuery,
      selectedPlatform === 'all' ? undefined : selectedPlatform,
      remoteOnly
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setRemoteOnly(false);
    setMinMatchScore(40);
    onSearch('', undefined, false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedPlatform !== 'all' ||
    remoteOnly ||
    minMatchScore > 40;

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  // Dynamic local filter refinement based on active controls
  const filteredJobs = jobs.filter((job) => {
    // 1. Min match score filter
    if (minMatchScore && (job.matchScore || 0) < minMatchScore) return false;

    // 2. Remote only filter
    if (remoteOnly && job.remoteType !== 'remote') return false;

    // 3. Platform filter
    if (selectedPlatform !== 'all' && job.platform !== selectedPlatform) return false;

    // 4. Dynamic keyword query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchSkills = job.requiredSkills?.some((s) => s.toLowerCase().includes(q));
      const matchDesc = job.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchSkills && !matchDesc) return false;
    }

    return true;
  });

  const handleApplyClick = (job: JobPosting) => {
    if (!profile?.onboardingCompleted) {
      onOpenOnboarding();
      return;
    }
    setApplyingJobId(job.id);
    onApplyAI(job);
    setTimeout(() => {
      setApplyingJobId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6" id="jobs-board">
      
      {/* Top Header & Search Banner */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white">
                Live Job Discovery & Match Engine
              </h1>
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-400 border border-teal-500/20">
                BRAVE LIVE INDEX
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active openings matched against candidate profile vectors with 1-click Browserbase auto-apply.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReport(!showReport)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer transition border ${
                showReport
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'border-white/10 bg-[#0d0d15] text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>{showReport ? 'Hide Market Report' : 'Realtime Market Report'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {report.scores.averageMatchScore}% Fit
              </span>
            </button>

            <button
              onClick={() => onSearch(searchQuery, selectedPlatform === 'all' ? undefined : selectedPlatform, remoteOnly)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              <span>Refresh Crawl</span>
            </button>
          </div>
        </div>

        {/* Live Score Quick Summary Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Avg Match Fit:</span>
            <span className="font-mono font-bold text-indigo-400">{report.scores.averageMatchScore}%</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">High Synergy Roles:</span>
            <span className="font-mono font-bold text-teal-400">{report.scores.highMatchCount}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">In-Demand Overlap:</span>
            <span className="font-mono font-bold text-cyan-400">{report.scores.topSkillOverlapPercent}%</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Comp Index:</span>
            <span className="font-mono font-bold text-emerald-400">{report.scores.salaryCompetitivenessIndex}/100</span>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              id="job-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, stack (e.g. React 19, TypeScript, Staff Engineer)..."
              className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            id="job-search-submit-btn"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 cursor-pointer uppercase tracking-wider"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Jobs</span>
          </button>
        </form>

        {/* Filters and ATS Pills */}
        <div className="mt-4 space-y-3 pt-4 border-t border-[#1a1a24]">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Platform Pills */}
            <div className="flex flex-wrap items-center gap-1.5" id="platform-filter-chips">
              <span className="text-[11px] font-mono uppercase text-gray-500 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Platform:</span>
              </span>
              {platforms.map((p) => {
                const count = p.id === 'all' ? jobs.length : jobs.filter((j) => j.platform === p.id).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      onSearch(searchQuery, p.id === 'all' ? undefined : p.id, remoteOnly);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                      selectedPlatform === p.id
                        ? 'bg-teal-500 text-black font-semibold shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                        : 'bg-[#0d0d15] text-gray-400 border border-[#1a1a24] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                      selectedPlatform === p.id ? 'bg-black/20 text-black font-bold' : 'bg-white/5 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Remote Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const next = !remoteOnly;
                  setRemoteOnly(next);
                  onSearch(searchQuery, selectedPlatform === 'all' ? undefined : selectedPlatform, next);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer transition border ${
                  remoteOnly
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_10px_rgba(45,212,191,0.2)]'
                    : 'bg-[#0d0d15] text-gray-400 border-[#1a1a24] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${remoteOnly ? 'bg-teal-400 animate-pulse' : 'bg-gray-600'}`} />
                <span>Remote Only</span>
              </button>
            </div>
          </div>

          {/* Score Slider & Score Presets */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase text-gray-500 mr-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                <span>Min Match:</span>
              </span>
              {scorePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setMinMatchScore(preset.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono transition cursor-pointer ${
                    minMatchScore === preset.value
                      ? 'bg-indigo-500 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                      : 'bg-[#0d0d15] text-gray-400 border border-[#1a1a24] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              <span className="text-gray-500 font-mono text-[11px]">Threshold:</span>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="h-1.5 w-24 cursor-pointer accent-indigo-500"
              />
              <span className="font-mono font-bold text-indigo-400 text-xs w-8 text-right">{minMatchScore}%</span>
            </div>
          </div>

          {/* Active Filter Tags & Reset */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-500">Active Filters:</span>
              {selectedPlatform !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-[11px] font-mono text-teal-400 border border-teal-500/20">
                  Platform: {selectedPlatform.toUpperCase()}
                </span>
              )}
              {remoteOnly && (
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-[11px] font-mono text-teal-400 border border-teal-500/20">
                  Remote Only
                </span>
              )}
              {minMatchScore > 40 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono text-indigo-400 border border-indigo-500/20">
                  Score ≥ {minMatchScore}%
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-mono text-gray-300 border border-white/10">
                  Query: "{searchQuery}"
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-teal-400 hover:underline cursor-pointer ml-auto font-mono"
              >
                Clear all filters
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Realtime Job Search & Market Opportunity Report View */}
      {showReport && (
        <JobSearchReportView report={report} onApplyAI={onApplyAI} allJobs={jobs} />
      )}

      {/* Results Count Banner */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono font-semibold text-gray-400">
          Showing <span className="text-teal-400 font-bold">{filteredJobs.length}</span> of {jobs.length} discovered opening{jobs.length === 1 ? '' : 's'}
        </span>
        <span className="text-[11px] text-gray-500 font-mono">
          Ranked by Gemini 3.7 semantic relevance
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6">
              <div className="h-4 w-1/3 rounded bg-[#1a1a24] mb-3" />
              <div className="h-3 w-1/4 rounded bg-[#1a1a24] mb-4" />
              <div className="h-3 w-full rounded bg-[#0d0d15] mb-2" />
              <div className="h-3 w-2/3 rounded bg-[#0d0d15]" />
            </div>
          ))}
        </div>
      )}

      {/* Jobs List */}
      {!loading && (
        <div className="space-y-4" id="jobs-list-container">
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1a1a24] bg-[#0a0a0f] p-12 text-center">
              <Bot className="mx-auto h-10 w-10 text-gray-600" />
              <h3 className="mt-3 text-sm font-bold text-white">No jobs matched criteria</h3>
              <p className="mt-1 text-xs text-gray-500">Try lowering the minimum match filter or clearing the search keyword.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              const isExpanded = expandedJobId === job.id;
              const matchScore = job.matchScore || 85;

              return (
                <div
                  key={job.id}
                  id={`job-card-${job.id}`}
                  className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-5 sm:p-6 shadow-xs transition hover:border-[#2d2d4d]"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    
                    {/* Job Details */}
                    <div className="space-y-2 flex-1">
                      
                      {/* Platform & Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                          {job.platform} ATS
                        </span>

                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                          job.remoteType === 'remote'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {job.remoteType}
                        </span>

                        {/* Match Score Gauge */}
                        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                          matchScore >= 90
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.2)]'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          <Sparkles className="h-3 w-3 text-teal-400" />
                          <span>{matchScore}% Match</span>
                        </div>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white hover:text-teal-400 transition">
                          {job.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1 font-semibold text-gray-300">
                            <Building className="h-3.5 w-3.5 text-gray-500" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            {job.location}
                          </span>
                          {job.salaryRange && (
                            <span className="flex items-center gap-1 font-mono font-medium text-teal-400">
                              <DollarSign className="h-3.5 w-3.5" />
                              {job.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Required Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requiredSkills.map((skill, sIdx) => {
                          const hasSkill = profile?.skills?.some(
                            (ps) => ps.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span
                              key={sIdx}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                                hasSkill
                                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                                  : 'bg-[#0d0d15] text-gray-400 border border-[#1a1a24]'
                              }`}
                            >
                              {hasSkill && <Check className="inline h-2.5 w-2.5 mr-0.5 text-teal-400" />}
                              {skill}
                            </span>
                          );
                        })}
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2.5 shrink-0 pt-2 md:pt-0">
                      
                      {isApplied ? (
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        <button
                          id={`apply-ai-btn-${job.id}`}
                          onClick={() => handleApplyClick(job)}
                          disabled={applyingJobId === job.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 transition disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                        >
                          <Zap className="h-4 w-4 fill-black" />
                          <span>{applyingJobId === job.id ? 'Queueing Agent...' : 'Apply with AI Agent'}</span>
                        </button>
                      )}

                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white p-1 transition"
                        title="Open direct ATS posting in new tab"
                      >
                        <span>Direct ATS link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>

                    </div>

                  </div>

                  {/* Gemini Rationale Accordion */}
                  <div className="mt-4 pt-3 border-t border-[#1a1a24]">
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="flex items-center justify-between w-full text-left text-xs font-medium text-gray-400 hover:text-white cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-teal-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        Gemini 3.7 Match Analysis & Description
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 rounded-xl bg-[#0d0d15] border border-[#1a1a24] p-3.5 space-y-2.5 text-xs">
                        {job.matchReason && (
                          <div className="rounded-lg bg-teal-500/10 p-2.5 border border-teal-500/20 text-teal-200">
                            <span className="font-bold block mb-0.5">AI Match Rationale:</span>
                            {job.matchReason}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-300 block mb-1">Job Description Excerpt:</span>
                          <p className="text-gray-400 leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
