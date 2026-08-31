import React, { useState, useEffect } from 'react';
import {
  Activity,
  Terminal,
  Filter,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
  ExternalLink,
  Code,
  ChevronDown,
  ChevronUp,
  MonitorPlay,
  RotateCcw,
  Zap,
  Building,
  Layers,
} from 'lucide-react';
import { ApplicationEvent, JobApplication } from '../types/index.ts';

interface ExtendedApplicationEvent extends ApplicationEvent {
  jobTitle?: string;
  company?: string;
  platform?: string;
}

interface ActivityLogsProps {
  applications: JobApplication[];
  onOpenLiveBrowser: (application: JobApplication) => void;
  onOpenMissingInfo: (application: JobApplication) => void;
  onRetryApplication: (applicationId: string) => void;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({
  applications,
  onOpenLiveBrowser,
  onOpenMissingInfo,
  onRetryApplication,
}) => {
  const [events, setEvents] = useState<ExtendedApplicationEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAppId, setSelectedAppId] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Fetch events from application_events API endpoint
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = selectedAppId === 'all'
        ? '/api/applications/events'
        : `/api/applications/${selectedAppId}/events`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.events)) {
          setEvents(data.events);
          return;
        }
      }

      // Fallback to in-memory applications state
      aggregateEventsFromApps();
    } catch {
      aggregateEventsFromApps();
    } finally {
      setLoading(false);
    }
  };

  const aggregateEventsFromApps = () => {
    const aggregated: ExtendedApplicationEvent[] = [];
    applications.forEach((app) => {
      if (selectedAppId === 'all' || app.id === selectedAppId) {
        app.events?.forEach((evt) => {
          aggregated.push({
            ...evt,
            jobTitle: app.job?.title,
            company: app.job?.company,
            platform: app.job?.platform,
          });
        });
      }
    });

    aggregated.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    setEvents(aggregated);
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedAppId]);

  // Toggle expanding JSON details
  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Event type metadata
  const getEventBadge = (type: ApplicationEvent['eventType']) => {
    switch (type) {
      case 'session_start':
        return {
          label: 'Session Start',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: Bot,
        };
      case 'dom_inspect':
        return {
          label: 'DOM Inspect',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: Terminal,
        };
      case 'field_filled':
        return {
          label: 'Field Filled',
          bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
          icon: CheckCircle2,
        };
      case 'missing_info_detected':
        return {
          label: 'Missing Info',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: HelpCircle,
        };
      case 'form_submitted':
        return {
          label: 'Form Submitted',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: Zap,
        };
      case 'error':
        return {
          label: 'Agent Error',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: AlertCircle,
        };
      case 'retry':
        return {
          label: 'Session Retry',
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: RotateCcw,
        };
      default:
        return {
          label: type,
          bg: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
          icon: Activity,
        };
    }
  };

  // Filter events
  const filteredEvents = events.filter((evt) => {
    if (selectedEventType !== 'all' && evt.eventType !== selectedEventType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = evt.message?.toLowerCase().includes(q);
      const matchJob = evt.jobTitle?.toLowerCase().includes(q);
      const matchCompany = evt.company?.toLowerCase().includes(q);
      const matchType = evt.eventType?.toLowerCase().includes(q);
      return matchMsg || matchJob || matchCompany || matchType;
    }
    return true;
  });

  // Calculate metrics
  const totalEvents = events.length;
  const fieldsFilledCount = events.filter((e) => e.eventType === 'field_filled').length;
  const domInspectCount = events.filter((e) => e.eventType === 'dom_inspect').length;
  const submissionsCount = events.filter((e) => e.eventType === 'form_submitted').length;
  const errorCount = events.filter((e) => e.eventType === 'error').length;

  return (
    <div className="space-y-6" id="activity-logs-view">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-[#1a1a24] bg-[#0a0a0f] p-4 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Total Actions</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-white">{totalEvents}</p>
        </div>

        <div className="rounded-xl border border-[#1a1a24] bg-[#0a0a0f] p-4 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Fields Injected</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-teal-400">{fieldsFilledCount}</p>
        </div>

        <div className="rounded-xl border border-[#1a1a24] bg-[#0a0a0f] p-4 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">DOM Traversals</span>
            <Terminal className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-purple-400">{domInspectCount}</p>
        </div>

        <div className="rounded-xl border border-[#1a1a24] bg-[#0a0a0f] p-4 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">ATS Receipts</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-emerald-400">{submissionsCount}</p>
        </div>

        <div className="rounded-xl border border-[#1a1a24] bg-[#0a0a0f] p-4 text-left shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Session Errors</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-rose-400">{errorCount}</p>
        </div>
      </div>

      {/* Control Bar: Filter by Application, Event Type, and Search */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-teal-400" />
              <span>Historical Application Events & Agent Audit Log</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Granular execution steps recorded from the Browserbase headless chromium pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-3 py-1.5 text-xs text-gray-400 hover:text-white cursor-pointer transition"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            <button
              onClick={fetchEvents}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
          {/* Target Application Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-500 mb-1">Target Application</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Applications ({applications.length})</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.job?.company} — {app.job?.title} ({app.status})
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-500 mb-1">Agent Action Type</label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Event Types</option>
              <option value="session_start">Session Start (Browserbase Boot)</option>
              <option value="dom_inspect">DOM Inspect & Form Parsing</option>
              <option value="field_filled">Field Injected & Resume Upload</option>
              <option value="missing_info_detected">Missing Information Alert</option>
              <option value="form_submitted">Form Submitted (HTTP 200)</option>
              <option value="error">Agent Error / Timeout</option>
              <option value="retry">Session Retry</option>
            </select>
          </div>

          {/* Search Query Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword, selector, or message..."
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events List Stream */}
      <div className="space-y-3" id="application-events-stream">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1a1a24] bg-[#0a0a0f] p-10 text-center">
            <Terminal className="mx-auto h-8 w-8 text-gray-600" />
            <h3 className="mt-3 text-sm font-bold text-white">No matching activity events found</h3>
            <p className="mt-1 text-xs text-gray-500">
              {searchQuery || selectedEventType !== 'all' || selectedAppId !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Trigger automated applications from the Jobs Board to see real-time Browserbase execution logs.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const badge = getEventBadge(evt.eventType);
            const Icon = badge.icon;
            const isExpanded = expandedEventIds[evt.id];
            const relatedApp = applications.find((a) => a.id === evt.applicationId);

            return (
              <div
                key={evt.id}
                id={`activity-event-${evt.id}`}
                className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-4 transition hover:border-[#2d2d4d] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${badge.bg}`}>
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </span>

                    {evt.company && (
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-gray-300 border border-white/10 flex items-center gap-1">
                        <Building className="h-3 w-3 text-gray-500" />
                        {evt.company}
                      </span>
                    )}

                    {evt.jobTitle && (
                      <span className="text-xs font-semibold text-white">
                        {evt.jobTitle}
                      </span>
                    )}

                    {evt.platform && (
                      <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-indigo-400 border border-indigo-500/20">
                        {evt.platform}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className="text-gray-700">•</span>
                    <span>{new Date(evt.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Event Message Description */}
                <div className="text-xs text-gray-200 leading-relaxed font-sans bg-[#0d0d15] p-3 rounded-xl border border-white/5 flex items-start justify-between gap-3">
                  <p className="flex-1">{evt.message}</p>

                  {/* Contextual Action Button */}
                  {relatedApp && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenLiveBrowser(relatedApp)}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 text-[11px] font-semibold text-teal-400 hover:bg-teal-500/20 transition cursor-pointer"
                        title="Open Live Browserbase Session"
                      >
                        <MonitorPlay className="h-3 w-3" />
                        <span>Live Session</span>
                      </button>

                      {evt.eventType === 'missing_info_detected' && relatedApp.status === 'missing_info' && (
                        <button
                          onClick={() => onOpenMissingInfo(relatedApp)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>Answer</span>
                        </button>
                      )}

                      {evt.eventType === 'error' && relatedApp.status === 'failed' && (
                        <button
                          onClick={() => onRetryApplication(relatedApp.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Expandable JSON Details */}
                {evt.details && Object.keys(evt.details).length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleExpand(evt.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-gray-500 hover:text-teal-400 transition cursor-pointer"
                    >
                      <Code className="h-3 w-3" />
                      <span>{isExpanded ? 'Hide Payload Details' : 'Inspect Payload & DOM Selectors'}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {isExpanded && (
                      <pre className="mt-2 rounded-xl bg-[#050508] p-3 text-[11px] font-mono text-cyan-300/90 border border-white/10 overflow-x-auto">
                        {JSON.stringify(evt.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
