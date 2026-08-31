export type RemoteType = 'remote' | 'hybrid' | 'onsite';
export type ATSPlatform = 'greenhouse' | 'lever' | 'workable' | 'wellfound' | 'direct';
export type ApplicationStatus = 'queued' | 'detecting_fields' | 'in_progress' | 'missing_info' | 'submitted' | 'failed';
export type PlanTier = 'free' | 'pro' | 'unlimited';

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  preferredRoles: string[];
  targetSalaryMin?: number;
  workAuthorization?: string;
  onboardingCompleted: boolean;
  completenessScore: number;
  missingFields: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  parseStatus: 'pending' | 'parsing' | 'completed' | 'failed';
  parsedData?: Partial<UserProfile>;
  rawText?: string;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  remoteType: RemoteType;
  platform: ATSPlatform;
  applyUrl: string;
  salaryRange?: string;
  description: string;
  requiredSkills: string[];
  source: string;
  postedAt: string;
  matchScore?: number;
  matchReason?: string;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  userId: string;
  eventType: 'session_start' | 'dom_inspect' | 'field_filled' | 'missing_info_detected' | 'form_submitted' | 'error' | 'retry';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface MissingFieldPrompt {
  fieldKey: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'number';
  description?: string;
  options?: string[];
  required: boolean;
  value?: any;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  job: JobPosting;
  status: ApplicationStatus;
  matchScore: number;
  missingFields: MissingFieldPrompt[];
  submittedAt?: string;
  errorMessage?: string;
  browserbaseSessionId?: string;
  events: ApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  tier: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  dailyLimit: number;
  applicationsUsedToday: number;
  applicationsRemaining: number;
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
}

export interface InngestStepEvent {
  stepId: string;
  stepName: string;
  status: 'completed' | 'running' | 'failed' | 'queued';
  durationMs?: number;
  details?: string;
}

export interface InngestWorkflowRun {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  startedAt: string;
  completedAt?: string;
  details: string;
  eventCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  thought?: string;
  modelUsed?: string;
  timestamp: string;
}

export type ChatRole = 'career_strategist' | 'interview_coach' | 'resume_architect' | 'salary_negotiator';
export type ModelTier = 'pro_thinking' | 'flash_general' | 'flash_lite';

// ==================== Realtime Score & Report Types for Each Module ====================

// 1. Dashboard Module Scores & Report
export interface DashboardScores {
  marketReadinessIndex: number; // 0-100
  atsPenetrationRate: number; // %
  interviewProbability: number; // %
  pipelineVelocityScore: number; // 0-100
  searchVelocityScore: number; // apps/day
}

export interface DashboardReport {
  id: string;
  moduleType: 'dashboard';
  scores: DashboardScores;
  pipelineBreakdown: Record<ApplicationStatus, number>;
  platformPerformance: Array<{
    platform: ATSPlatform;
    total: number;
    submitted: number;
    successRate: number;
  }>;
  velocityTrend: Array<{ day: string; count: number }>;
  executiveSummary: string;
  strategicActionPlan: string[];
  lastUpdated: string;
}

// 2. Job Search Module Scores & Report
export interface JobSearchScores {
  averageMatchScore: number; // 0-100
  highMatchCount: number; // count >= 80%
  topSkillOverlapPercent: number; // %
  salaryCompetitivenessIndex: number; // 0-100
}

export interface JobDetailReport {
  jobId: string;
  title: string;
  company: string;
  matchScore: number;
  keywordSynergyScore: number;
  salaryCompetitivenessScore: number;
  hiringVelocity: 'Urgent' | 'High' | 'Standard' | 'Passive';
  matchedSkills: string[];
  missingSkills: string[];
  atsKeywordChecklist: Array<{ keyword: string; present: boolean; importance: 'critical' | 'preferred' }>;
  salaryBenchmark: { percentile25: number; median: number; percentile75: number; currency: string };
  tailoredPitchBullet: string;
  instantStrategy: string;
}

export interface JobSearchReport {
  id: string;
  moduleType: 'jobsearch';
  scores: JobSearchScores;
  marketInsights: {
    totalJobsFound: number;
    remoteRatio: number;
    topInDemandSkills: Array<{ skill: string; demandCount: number; candidateHas: boolean }>;
    platformDistribution: Record<ATSPlatform, number>;
  };
  jobDeepAudits: Record<string, JobDetailReport>;
  lastUpdated: string;
}

// 3. Resume Module Scores & Report
export interface ResumeScores {
  atsComplianceScore: number; // 0-100
  impactQuantificationScore: number; // 0-100 (Google XYZ metric score)
  keywordDensityScore: number; // 0-100
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
}

export interface ExperienceAudit {
  experienceId: string;
  company: string;
  role: string;
  score: number;
  bulletCritiques: Array<{
    original: string;
    improved: string;
    metricsDetected: boolean;
    formula: string;
  }>;
}

export interface ResumeReport {
  id: string;
  moduleType: 'resume';
  scores: ResumeScores;
  experienceAudits: ExperienceAudit[];
  topMissingHardSkills: string[];
  actionVerbsStrength: {
    strongVerbsCount: number;
    weakVerbsCount: number;
    ratio: number;
  };
  atsFormattingChecks: Array<{
    check: string;
    passed: boolean;
    tip: string;
  }>;
  executiveSummary: string;
  recommendedBulletRewrites: string[];
  lastUpdated: string;
}

// 4. Applications Pipeline Module Scores & Report
export interface ApplicationsScores {
  pipelineHealthScore: number; // 0-100
  submissionSuccessRate: number; // %
  fieldDetectionAccuracy: number; // %
  automationReliabilityScore: number; // 0-100
}

export interface ApplicationTelemetryItem {
  appId: string;
  company: string;
  role: string;
  platform: ATSPlatform;
  status: ApplicationStatus;
  eventsCount: number;
  durationSeconds: number;
  missingFieldsEncountered: number;
  lastEventMessage: string;
}

export interface ApplicationsReport {
  id: string;
  moduleType: 'applications';
  scores: ApplicationsScores;
  telemetrySummary: {
    totalEventsLogged: number;
    autoFilledFieldsCount: number;
    missingInfoPausedCount: number;
    autoRetriedCount: number;
    averageDurationSeconds: number;
  };
  recentSubmissionsAudit: ApplicationTelemetryItem[];
  platformReliabilityRankings: Array<{
    platform: ATSPlatform;
    successRate: number;
    avgTimeSec: number;
  }>;
  bottleneckDiagnosis: string[];
  lastUpdated: string;
}


