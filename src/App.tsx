import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { JobsBoard } from './components/JobsBoard.tsx';
import { ApplicationsPipeline } from './components/ApplicationsPipeline.tsx';
import { MissingInfoModal } from './components/MissingInfoModal.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { BillingView } from './components/BillingView.tsx';
import { InngestView } from './components/InngestView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { DashboardReportView } from './components/reports/DashboardReportView.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { auth, syncUserProfileToFirestore } from './lib/firebase.ts';
import { generateDashboardReport, syncReportToFirestore } from './lib/reports.ts';
import {
  UserProfile,
  JobPosting,
  JobApplication,
  SubscriptionStatus,
  InngestWorkflowRun,
  PlanTier,
  ATSPlatform,
} from './types/index.ts';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [workflows, setWorkflows] = useState<InngestWorkflowRun[]>([]);

  // Loading States
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [activeMissingInfoApp, setActiveMissingInfoApp] = useState<JobApplication | null>(null);

  // Fetch initial profile & data
  const fetchData = useCallback(async () => {
    try {
      const [profRes, subRes, appsRes, wfRes] = await Promise.all([
        fetch('/api/profile').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/billing/subscription').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/applications').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/inngest/workflows').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (profRes?.success && profRes.profile) {
        setProfile(profRes.profile);
      }
      if (subRes?.success && subRes.subscription) {
        setSubscription(subRes.subscription);
      }
      if (appsRes?.success && appsRes.applications) {
        setApplications(appsRes.applications);
      }
      if (wfRes?.success && wfRes.workflows) {
        setWorkflows(wfRes.workflows);
      }
    } catch (err) {
      console.warn('Initial data load notice:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  // Search jobs function
  const searchJobs = useCallback(async (query: string = '', platform?: ATSPlatform, remoteOnly?: boolean) => {
    setLoadingJobs(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (platform) params.append('platform', platform);
      if (remoteOnly) params.append('remote', 'true');

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.warn('Jobs search network notice:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    searchJobs();
  }, [fetchData, searchJobs]);

  // Polling loop for active applications (re-fetches when any app is queued or in_progress)
  useEffect(() => {
    let isMounted = true;
    const hasActiveApps = applications.some(
      (a) => a.status === 'in_progress' || a.status === 'detecting_fields' || a.status === 'queued'
    );

    if (!hasActiveApps) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.success && Array.isArray(data.applications)) {
            setApplications(data.applications);
          }
        }
      } catch (err) {
        console.warn('Applications polling notice:', err);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [applications]);

  // Sync realtime dashboard report to Firestore when data changes and user is signed in
  const dashboardReport = generateDashboardReport(profile, jobs, applications);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      syncReportToFirestore(dashboardReport, auth.currentUser.uid).catch((err) =>
        console.warn('Dashboard report firestore sync notice:', err)
      );
    }
  }, [profile, jobs.length, applications.length]);

  // Handler: Apply with AI Agent
  const handleApplyAI = async (job: JobPosting) => {
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();

      if (data.success && data.application) {
        setApplications((prev) => [data.application, ...prev]);
        // Update subscription quota count
        if (subscription) {
          setSubscription({
            ...subscription,
            applicationsUsedToday: subscription.applicationsUsedToday + 1,
            applicationsRemaining: Math.max(0, subscription.applicationsRemaining - 1),
          });
        }
      } else if (data.upgradeRequired) {
        alert(data.error);
        setCurrentTab('billing');
      } else {
        alert(data.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      alert(err.message || 'Error applying to job.');
    }
  };

  // Handler: Answer Missing Info
  const handleSubmitMissingInfo = async (applicationId: string, answers: Record<string, any>) => {
    try {
      await fetch(`/api/applications/${applicationId}/provide-missing-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      // Refresh apps
      const appsRes = await fetch('/api/applications').then((r) => r.json());
      if (appsRes.success) setApplications(appsRes.applications);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Retry Application
  const handleRetryApplication = async (applicationId: string) => {
    try {
      await fetch(`/api/applications/${applicationId}/retry`, { method: 'POST' });
      const appsRes = await fetch('/api/applications').then((r) => r.json());
      if (appsRes.success) setApplications(appsRes.applications);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Update Profile
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Upgrade Plan
  const handleUpgradePlan = async (tier: PlanTier) => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh subscription
        const subRes = await fetch('/api/billing/subscription').then((r) => r.json());
        if (subRes.success) setSubscription(subRes.subscription);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Trigger Inngest
  const handleTriggerDiscovery = async () => {
    try {
      await fetch('/api/inngest/trigger', { method: 'POST' });
      const wfRes = await fetch('/api/inngest/workflows').then((r) => r.json());
      if (wfRes.success) setWorkflows(wfRes.workflows);
      searchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Login
  const handleLogin = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
      searchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const isDashboardView = currentTab !== 'landing';

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e6] flex flex-col font-sans antialiased">
      
      {/* Top Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        subscription={subscription}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onLogout={() => {
          setProfile(null);
          setCurrentTab('landing');
        }}
        isDashboard={isDashboardView}
      />

      {/* Main Body */}
      {currentTab === 'landing' ? (
        <LandingPage
          onStartOnboarding={() => setIsOnboardingOpen(true)}
          onGoToDashboard={() => setCurrentTab('jobs')}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          
          {/* Collapsible Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            applicationsCount={applications.length}
            profile={profile}
            subscription={subscription}
          />

          {/* Main Dashboard Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="dashboard-content">
            <div className="mx-auto max-w-7xl">
              {currentTab === 'dashboard' && (
                <DashboardReportView
                  report={dashboardReport}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'jobs' && (
                <JobsBoard
                  jobs={jobs}
                  loading={loadingJobs}
                  onSearch={searchJobs}
                  onApplyAI={handleApplyAI}
                  applications={applications}
                  profile={profile}
                  onOpenOnboarding={() => setIsOnboardingOpen(true)}
                />
              )}

              {currentTab === 'applications' && (
                <ApplicationsPipeline
                  applications={applications}
                  onOpenMissingInfo={(app) => setActiveMissingInfoApp(app)}
                  onRetryApplication={handleRetryApplication}
                />
              )}

              {currentTab === 'chat' && (
                <ChatView profile={profile} />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onOpenOnboarding={() => setIsOnboardingOpen(true)}
                />
              )}

              {currentTab === 'workflows' && (
                <InngestView
                  workflows={workflows}
                  onTriggerDiscovery={handleTriggerDiscovery}
                />
              )}

              {currentTab === 'billing' && (
                <BillingView
                  subscription={subscription}
                  onUpgrade={handleUpgradePlan}
                />
              )}
            </div>
          </main>

        </div>
      )}

      {/* ==================== GLOBAL MODALS ==================== */}
      
      {/* Mandatory / Interactive Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSuccess={(newProfile) => {
          setProfile(newProfile);
          setIsOnboardingOpen(false);
          setCurrentTab('jobs');
          searchJobs();
        }}
      />

      {/* Missing Information Prompt Modal */}
      <MissingInfoModal
        application={activeMissingInfoApp}
        isOpen={Boolean(activeMissingInfoApp)}
        onClose={() => setActiveMissingInfoApp(null)}
        onSubmit={handleSubmitMissingInfo}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

    </div>
  );
}
export default App;
