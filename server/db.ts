import { UserProfile, ResumeDocument, JobPosting, JobApplication, ApplicationEvent, PlanTier } from '../src/types/index.ts';

// Default initial user profile
let currentProfile: UserProfile = {
  id: 'usr_default_01',
  email: 'satishreddy2845@gmail.com',
  fullName: 'Satish Reddy',
  phone: '+1 (415) 890-4321',
  location: 'San Francisco, CA',
  headline: 'Senior Full Stack & AI Solutions Engineer',
  summary: 'Staff/Senior Full Stack Engineer with extensive experience developing high-scale Next.js, React, and TypeScript applications, distributed Node.js services, and autonomous AI agents.',
  githubUrl: 'https://github.com/satishreddy-dev',
  linkedinUrl: 'https://linkedin.com/in/satishreddy-dev',
  portfolioUrl: 'https://satishreddy.dev',
  skills: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Tailwind CSS',
    'Supabase',
    'Gemini AI',
    'Docker',
    'GraphQL',
    'REST APIs',
    'Vitest',
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'Veloce AI Systems',
      role: 'Staff Full Stack Engineer',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      description: 'Architected scalable Next.js platforms and distributed AI agent workflows. Optimized database queries and cut client bundle sizes by 38%.',
      technologies: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    },
    {
      id: 'exp_2',
      company: 'Apex Cloud Platforms',
      role: 'Senior Software Engineer',
      startDate: '2019',
      endDate: '2022',
      current: false,
      description: 'Engineered microservices and real-time WebSocket communication pipelines. Built custom design system components with 100% test coverage.',
      technologies: ['TypeScript', 'GraphQL', 'Next.js', 'Redis', 'Docker'],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      fieldOfStudy: 'Distributed Systems & Software Engineering',
      graduationYear: '2019',
    },
  ],
  preferredRoles: [
    'Staff Software Engineer',
    'Senior Full Stack Engineer',
    'Lead Frontend Engineer',
  ],
  targetSalaryMin: 185000,
  workAuthorization: 'Yes, fully authorized without restrictions',
  onboardingCompleted: true,
  completenessScore: 100,
  missingFields: [],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  updatedAt: new Date().toISOString(),
};

let resumes: ResumeDocument[] = [
  {
    id: 'res_01',
    userId: currentProfile.id,
    fileName: 'Satish_Reddy_Staff_Engineer_Resume.pdf',
    fileSize: 142850,
    mimeType: 'application/pdf',
    parseStatus: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

let userApplications: JobApplication[] = [
  {
    id: 'app_01',
    userId: currentProfile.id,
    jobId: 'job_gh_01',
    job: {
      id: 'job_gh_01',
      title: 'Senior Frontend Engineer (React & TypeScript)',
      company: 'Supabase',
      location: 'Remote (Worldwide)',
      remoteType: 'remote',
      platform: 'greenhouse',
      applyUrl: 'https://boards.greenhouse.io/supabase/jobs/4891024003',
      salaryRange: '$160,000 - $210,000 + Token/Equity',
      description: 'Build responsive, developer-first cloud database management dashboards using React 19, TypeScript, Next.js, and WebSockets.',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs', 'PostgreSQL'],
      source: 'Greenhouse ATS',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    status: 'submitted',
    matchScore: 98,
    missingFields: [],
    submittedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    browserbaseSessionId: 'bb_sess_934812_supa',
    events: [
      {
        id: 'evt_101',
        applicationId: 'app_01',
        userId: currentProfile.id,
        eventType: 'session_start',
        message: 'Connected to Browserbase Headless Chromium Cluster',
        timestamp: new Date(Date.now() - 1000 * 60 * 92).toISOString(),
      },
      {
        id: 'evt_102',
        applicationId: 'app_01',
        userId: currentProfile.id,
        eventType: 'dom_inspect',
        message: 'Parsed Greenhouse ATS form fields and uploaded candidate resume',
        timestamp: new Date(Date.now() - 1000 * 60 * 91).toISOString(),
      },
      {
        id: 'evt_103',
        applicationId: 'app_01',
        userId: currentProfile.id,
        eventType: 'form_submitted',
        message: 'Successfully submitted application! Confirmation #GH-918231',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'app_02',
    userId: currentProfile.id,
    jobId: 'job_work_03',
    job: {
      id: 'job_work_03',
      title: 'Senior Software Engineer, Platform Infrastructure',
      company: 'Browserbase Inc.',
      location: 'Remote (US & Canada)',
      remoteType: 'remote',
      platform: 'workable',
      applyUrl: 'https://apply.workable.com/browserbase/j/93AF921E90/',
      salaryRange: '$175,000 - $225,000 + Options',
      description: 'Scale headless Chromium cluster orchestration, session replay streaming, and high-concurrency browser automation sandboxes.',
      requiredSkills: ['Node.js', 'TypeScript', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'PostgreSQL'],
      source: 'Workable ATS',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    status: 'in_progress',
    matchScore: 92,
    missingFields: [],
    browserbaseSessionId: 'bb_sess_821941_bb',
    events: [
      {
        id: 'evt_201',
        applicationId: 'app_02',
        userId: currentProfile.id,
        eventType: 'session_start',
        message: 'Initiating Browserbase headless browser automation',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 'evt_202',
        applicationId: 'app_02',
        userId: currentProfile.id,
        eventType: 'field_filled',
        message: 'Injected candidate contact information and resume file',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];

let userPlan: PlanTier = 'pro';
let applicationsCountToday = 2;

// Profile completeness calculator
export function calculateCompleteness(profile: UserProfile): { score: number; missing: string[] } {
  const missing: string[] = [];
  let score = 0;

  if (profile.fullName) score += 10; else missing.push('Full Name');
  if (profile.email) score += 10; else missing.push('Email Address');
  if (profile.phone) score += 10; else missing.push('Phone Number');
  if (profile.headline) score += 10; else missing.push('Professional Headline');
  if (profile.summary) score += 10; else missing.push('Summary Overview');
  if (profile.githubUrl) score += 10; else missing.push('GitHub Profile URL');
  if (profile.linkedinUrl) score += 10; else missing.push('LinkedIn Profile URL');
  if (profile.skills && profile.skills.length >= 3) score += 10; else missing.push('At least 3 Skills');
  if (profile.experience && profile.experience.length > 0) score += 10; else missing.push('Work Experience');
  if (profile.targetSalaryMin) score += 10; else missing.push('Target Salary Expectation');

  return { score, missing };
}

let savedJobsMap = new Map<string, JobPosting>();

// Database helper methods
export const db = {
  getSavedJobs: (): JobPosting[] => {
    return Array.from(savedJobsMap.values()).sort(
      (a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime()
    );
  },

  saveJob: (job: JobPosting): JobPosting => {
    const savedJob: JobPosting = {
      ...job,
      saved: true,
      savedAt: new Date().toISOString(),
    };
    savedJobsMap.set(job.id, savedJob);
    return savedJob;
  },

  unsaveJob: (jobId: string): boolean => {
    return savedJobsMap.delete(jobId);
  },

  isJobSaved: (jobId: string): boolean => {
    return savedJobsMap.has(jobId);
  },

  getProfile: (): UserProfile => {
    const { score, missing } = calculateCompleteness(currentProfile);
    currentProfile.completenessScore = score;
    currentProfile.missingFields = missing;
    return currentProfile;
  },

  updateProfile: (updates: Partial<UserProfile>): UserProfile => {
    currentProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const { score, missing } = calculateCompleteness(currentProfile);
    currentProfile.completenessScore = score;
    currentProfile.missingFields = missing;
    return currentProfile;
  },

  getResumes: (): ResumeDocument[] => resumes,

  addResume: (resume: ResumeDocument): ResumeDocument => {
    resumes.unshift(resume);
    return resume;
  },

  getApplications: (): JobApplication[] => userApplications,

  getApplicationById: (id: string): JobApplication | undefined => {
    return userApplications.find(a => a.id === id);
  },

  addApplication: (app: JobApplication): JobApplication => {
    // Avoid duplicate applications
    const existingIndex = userApplications.findIndex(a => a.jobId === app.jobId);
    if (existingIndex >= 0) {
      userApplications[existingIndex] = {
        ...userApplications[existingIndex],
        status: app.status,
        updatedAt: new Date().toISOString(),
      };
      return userApplications[existingIndex];
    }
    userApplications.unshift(app);
    applicationsCountToday++;
    return app;
  },

  updateApplication: (id: string, updates: Partial<JobApplication>): JobApplication | undefined => {
    const index = userApplications.findIndex(a => a.id === id);
    if (index >= 0) {
      userApplications[index] = {
        ...userApplications[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return userApplications[index];
    }
    return undefined;
  },

  addApplicationEvent: (eventId: string, applicationId: string, event: ApplicationEvent) => {
    const app = userApplications.find(a => a.id === applicationId);
    if (app) {
      app.events.push(event);
      app.updatedAt = new Date().toISOString();
    }
  },

  getApplicationEvents: (applicationId: string): ApplicationEvent[] => {
    const app = userApplications.find(a => a.id === applicationId);
    return app ? [...app.events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];
  },

  getAllApplicationEvents: (): Array<ApplicationEvent & { jobTitle?: string; company?: string; platform?: string }> => {
    const allEvents: Array<ApplicationEvent & { jobTitle?: string; company?: string; platform?: string }> = [];
    userApplications.forEach(app => {
      app.events.forEach(evt => {
        allEvents.push({
          ...evt,
          jobTitle: app.job?.title,
          company: app.job?.company,
          platform: app.job?.platform,
        });
      });
    });
    return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getUserPlan: (): PlanTier => userPlan,
  setUserPlan: (plan: PlanTier) => { userPlan = plan; },
  getApplicationsCountToday: (): number => applicationsCountToday,
};
