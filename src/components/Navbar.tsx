import React from 'react';
import { Bot, Sparkles, Briefcase, FileText, Send, CreditCard, Activity, LogIn, LogOut, CheckCircle2, Zap, BarChart3 } from 'lucide-react';
import { UserProfile, SubscriptionStatus } from '../types/index.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  profile: UserProfile | null;
  subscription: SubscriptionStatus | null;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  onLogout: () => void;
  isDashboard: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  subscription,
  onOpenAuth,
  onOpenOnboarding,
  onLogout,
  isDashboard,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a1a24] bg-[#0a0a0f]/95 backdrop-blur-md" id="main-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]">
              <Zap className="h-5 w-5 fill-black text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold tracking-tight text-white text-lg">
                Job Buddy
                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-teal-400 border border-teal-500/20">
                  AI AGENT
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">AUTONOMOUS CONTROL CENTER</p>
            </div>
          </button>

          {/* Navigation Links for Dashboard */}
          {isDashboard && (
            <nav className="hidden md:flex items-center gap-1.5 ml-4" id="desktop-nav">
              <button
                id="nav-dashboard-btn"
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Executive Report
              </button>

              <button
                id="nav-jobs-btn"
                onClick={() => onSelectTab('jobs')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'jobs'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Find Jobs
              </button>

              <button
                id="nav-applications-btn"
                onClick={() => onSelectTab('applications')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'applications'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Send className="h-4 w-4" />
                Applications
              </button>

              <button
                id="nav-chat-btn"
                onClick={() => onSelectTab('chat')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'chat'
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                AI Strategist
              </button>

              <button
                id="nav-profile-btn"
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                Resume & Profile
              </button>

              <button
                id="nav-workflows-btn"
                onClick={() => onSelectTab('workflows')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'workflows'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Activity className="h-4 w-4" />
                Workflows (Inngest)
              </button>

              <button
                id="nav-billing-btn"
                onClick={() => onSelectTab('billing')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  currentTab === 'billing'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Plans & Quota
              </button>
            </nav>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          <button
            id="header-auth-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-lg border border-[#1a1a24] bg-[#0d0d15] px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-teal-500/40 hover:text-white transition cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">{profile ? 'Switch User' : 'Sign In'}</span>
          </button>

          {profile?.onboardingCompleted ? (
            <>
              {/* Plan Tier Pill */}
              <div
                id="plan-tier-badge"
                onClick={() => onSelectTab('billing')}
                className="hidden sm:flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/20 cursor-pointer"
              >
                <span className="uppercase font-mono tracking-wider text-[11px] font-bold">{subscription?.tier || 'Pro'} Tier</span>
                <span className="text-[#2d2d4d]">|</span>
                <span className="text-gray-300 font-mono text-[11px]">{subscription?.applicationsRemaining ?? 23} left</span>
              </div>

              {/* User Profile Badge */}
              <button
                id="user-profile-menu-btn"
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2 rounded-lg border border-[#1a1a24] bg-[#0d0d15] py-1 pl-1.5 pr-2.5 transition hover:border-[#2d2d4d] hover:bg-[#11111a] cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-teal-500 to-indigo-500 text-xs font-bold text-black uppercase shadow-xs">
                  {profile.fullName ? profile.fullName.charAt(0) : 'U'}
                </div>
                <span className="max-w-[80px] truncate text-xs font-semibold text-white sm:max-w-[120px]">
                  {profile.fullName}
                </span>
              </button>
            </>
          ) : (
            <button
              id="header-onboarding-cta"
              onClick={onOpenOnboarding}
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] transition hover:brightness-110 cursor-pointer uppercase tracking-wider"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upload Resume
            </button>
          )}

          {isDashboard ? (
            <button
              id="header-landing-btn"
              onClick={() => onSelectTab('landing')}
              className="rounded-lg border border-[#1a1a24] bg-[#0d0d15] p-2 text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer transition"
              title="View Marketing Site"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              id="header-dashboard-cta"
              onClick={() => onSelectTab('jobs')}
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] transition hover:brightness-110 cursor-pointer uppercase tracking-wider"
            >
              Control Center
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
