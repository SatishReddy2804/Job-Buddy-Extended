import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Bot,
  Terminal,
  ChevronRight,
  Sparkles,
  HelpCircle,
  X,
  Play,
  Zap,
  Activity,
  MonitorPlay,
  ListFilter,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobApplication, ApplicationStatus, ApplicationEvent } from '../types/index.ts';
import { formatDate } from '../lib/utils.ts';
import { ApplicationsReportView } from './reports/ApplicationsReportView.tsx';
import { generateApplicationsReport } from '../lib/reports.ts';
import { ActivityLogs } from './ActivityLogs.tsx';
import { LiveBrowserModal } from './LiveBrowserModal.tsx';

interface ApplicationsPipelineProps {
  applications: JobApplication[];
  onOpenMissingInfo: (application: JobApplication) => void;
  onRetryApplication: (applicationId: string) => void;
}

export const ApplicationsPipeline: React.FC<ApplicationsPipelineProps> = ({
  applications,
  onOpenMissingInfo,
  onRetryApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'activity_logs' | 'report'>('pipeline');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [inspectingApp, setInspectingApp] = useState<JobApplication | null>(null);
  const [liveBrowserApp, setLiveBrowserApp] = useState<JobApplication | null>(null);

  const report = generateApplicationsReport(applications);

  const statusTabs: { id: ApplicationStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Applications', count: applications.length },
    { id: 'in_progress', label: 'In Progress', count: applications.filter((a) => a.status === 'in_progress' || a.status === 'detecting_fields' || a.status === 'queued').length },
    { id: 'missing_info', label: 'Missing Info', count: applications.filter((a) => a.status === 'missing_info').length },
    { id: 'submitted', label: 'Submitted', count: applications.filter((a) => a.status === 'submitted').length },
    { id: 'failed', label: 'Failed / Retries', count: applications.filter((a) => a.status === 'failed').length },
  ];

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_progress') {
      return app.status === 'in_progress' || app.status === 'detecting_fields' || app.status === 'queued';
    }
    return app.status === statusFilter;
  });

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            SUBMITTED TO ATS
          </span>
        );
      case 'missing_info':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-mono font-bold text-amber-400 border border-amber-500/30 animate-pulse">
            <HelpCircle className="h-3.5 w-3.5" />
            ACTION REQUIRED
          </span>
        );
      case 'in_progress':
      case 'detecting_fields':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-400 border border-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.2)]">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
            BROWSERBASE ACTIVE
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-mono font-bold text-gray-300 border border-white/10">
            <Clock className="h-3.5 w-3.5" />
            INNGEST QUEUE
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3.5 w-3.5" />
            FAILED / TIMEOUT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="applications-pipeline">
      
      {/* Top Header Banner & Sub-View Switcher */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full shadow-[0_0_8px_#14b8a6]" />
              Application Tracker & Autonomous Agent Center
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Live audit logs, Browserbase chromium sessions, and submission telemetry for open candidate applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Selector Tabs */}
            <div className="flex rounded-xl bg-[#0d0d15] border border-white/10 p-1 text-xs">
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeTab === 'pipeline'
                    ? 'bg-teal-500 text-black font-semibold shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>Pipeline ({applications.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('activity_logs')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeTab === 'activity_logs'
                    ? 'bg-teal-500 text-black font-semibold shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Activity Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Realtime Report</span>
              </button>
            </div>

            <button
              onClick={triggerConfetti}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/20 px-3.5 py-2 text-xs font-semibold text-teal-400 hover:bg-teal-500/20 cursor-pointer transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Celebrate Submissions</span>
            </button>
          </div>
        </div>

        {/* Live Applications Score Quick Summary Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Pipeline Health:</span>
            <span className="font-mono font-bold text-cyan-400">{report.scores.pipelineHealthScore}/100</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Submission Rate:</span>
            <span className="font-mono font-bold text-teal-400">{report.scores.submissionSuccessRate}%</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Field Accuracy:</span>
            <span className="font-mono font-bold text-indigo-400">{report.scores.fieldDetectionAccuracy}%</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Avg Latency:</span>
            <span className="font-mono font-bold text-amber-400">{report.telemetrySummary.averageDurationSeconds}s</span>
          </div>
        </div>

        {/* Pipeline Filter Tabs (Only shown in pipeline view) */}
        {activeTab === 'pipeline' && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-[#1a1a24] pt-4" id="application-status-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-teal-500 text-black font-semibold shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                    : 'bg-[#0d0d15] text-gray-400 border border-[#1a1a24] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                  statusFilter === tab.id
                    ? 'bg-black/20 text-black font-bold'
                    : 'bg-white/5 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ==================== VIEW 1: ACTIVITY LOGS TAB ==================== */}
      {activeTab === 'activity_logs' && (
        <ActivityLogs
          applications={applications}
          onOpenLiveBrowser={(app) => setLiveBrowserApp(app)}
          onOpenMissingInfo={onOpenMissingInfo}
          onRetryApplication={onRetryApplication}
        />
      )}

      {/* ==================== VIEW 2: REALTIME REPORT TAB ==================== */}
      {activeTab === 'report' && (
        <ApplicationsReportView report={report} onRetryApplication={onRetryApplication} />
      )}

      {/* ==================== VIEW 3: MAIN PIPELINE APPLICATIONS LIST ==================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4" id="applications-list">
          {filteredApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1a1a24] bg-[#0a0a0f] p-12 text-center">
              <Send className="mx-auto h-10 w-10 text-gray-600" />
              <h3 className="mt-3 text-sm font-bold text-white">No applications in this category</h3>
              <p className="mt-1 text-xs text-gray-500">Go to the Find Jobs tab to dispatch the AI application agent to open roles.</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div
                key={app.id}
                id={`application-item-${app.id}`}
                className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-5 shadow-xs transition hover:border-[#2d2d4d]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(app.status)}
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                        {app.job.platform} ATS
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">
                        Applied: {formatDate(app.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-white">
                        {app.job.title}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.job.company} • {app.job.location}
                      </p>
                    </div>

                    {app.errorMessage && (
                      <div className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-400 border border-rose-500/20">
                        <span className="font-bold">Error: </span> {app.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    
                    {/* Live Browser Modal Button */}
                    <button
                      onClick={() => setLiveBrowserApp(app)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-400 hover:bg-teal-500/20 cursor-pointer shadow-[0_0_10px_rgba(45,212,191,0.15)] transition"
                      title="Watch AI agent in real-time"
                    >
                      <MonitorPlay className="h-3.5 w-3.5" />
                      <span>Watch Live Browser</span>
                    </button>

                    {/* Missing info button */}
                    {app.status === 'missing_info' && (
                      <button
                        id={`provide-info-btn-${app.id}`}
                        onClick={() => onOpenMissingInfo(app)}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 cursor-pointer animate-pulse uppercase tracking-wider"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span>Answer Questions</span>
                      </button>
                    )}

                    {/* Retry button */}
                    {app.status === 'failed' && (
                      <button
                        onClick={() => onRetryApplication(app.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Retry Submission</span>
                      </button>
                    )}

                    {/* Inspect Browserbase log button */}
                    <button
                      onClick={() => setInspectingApp(app)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-3.5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition"
                    >
                      <Terminal className="h-3.5 w-3.5 text-teal-400" />
                      <span>View Cloud Trace</span>
                    </button>

                    <a
                      href={app.job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-[#1a1a24] text-gray-500 hover:text-white hover:bg-white/5 transition"
                      title="Open ATS link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== LIVE BROWSER MODAL ==================== */}
      {liveBrowserApp && (
        <LiveBrowserModal
          application={liveBrowserApp}
          onClose={() => setLiveBrowserApp(null)}
          onOpenMissingInfo={onOpenMissingInfo}
          onRetryApplication={onRetryApplication}
        />
      )}

      {/* ==================== BROWSERBASE REPLAY & TRACE DRAWER ==================== */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-xs p-4 sm:p-6" id="trace-modal">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 text-[#e0e0e6] shadow-2xl h-[90vh] flex flex-col justify-between overflow-hidden">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-[#1a1a24] pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-black font-bold">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Browserbase Session Inspector</h3>
                    <p className="text-[11px] font-mono text-gray-500">ID: {inspectingApp.browserbaseSessionId || 'bb_sess_live'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const appToOpen = inspectingApp;
                      setInspectingApp(null);
                      setLiveBrowserApp(appToOpen);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 text-xs font-semibold text-teal-400 hover:bg-teal-500/20 transition cursor-pointer"
                  >
                    <MonitorPlay className="h-3.5 w-3.5" />
                    <span>Open Live Browser</span>
                  </button>

                  <button
                    onClick={() => setInspectingApp(null)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white cursor-pointer transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Target info */}
              <div className="rounded-xl bg-[#0d0d15] border border-[#1a1a24] p-3 text-xs mb-4">
                <div className="font-semibold text-white">{inspectingApp.job.title}</div>
                <div className="text-gray-400 mt-0.5">{inspectingApp.job.company} • {inspectingApp.job.platform.toUpperCase()}</div>
              </div>
            </div>

            {/* Event Logs Timeline */}
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold mb-2">
                Execution Steps & DOM Injections ({inspectingApp.events.length} events)
              </div>

              {inspectingApp.events.length === 0 ? (
                <div className="text-gray-600 italic p-4 text-center">
                  Session initialized. Awaiting next DOM traversal event...
                </div>
              ) : (
                inspectingApp.events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-[#0d0d15] p-3 border border-[#1a1a24] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-teal-400 uppercase">{evt.eventType}</span>
                      <span className="text-gray-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-300 font-sans text-xs">{evt.message}</p>
                    {evt.details && (
                      <pre className="text-[10px] text-gray-400 bg-[#050507] p-2 rounded overflow-x-auto border border-[#1a1a24]">
                        {JSON.stringify(evt.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-[#1a1a24] pt-4 mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-teal-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>STATUS: {inspectingApp.status.toUpperCase()}</span>
              </div>

              <button
                onClick={() => setInspectingApp(null)}
                className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

