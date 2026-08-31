import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Play,
  Cpu,
  Layers,
  Terminal,
  Clock,
  Star,
} from 'lucide-react';
import { ATSPlatform } from '../types/index.ts';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onGoToDashboard,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeDemoStep, setActiveDemoStep] = useState<number>(2);

  const demoSteps = [
    {
      title: '1. Parse & Vectorize',
      desc: 'Gemini 3.7 parses your resume into structured skills, experience, and custom ATS vectors.',
      icon: Sparkles,
      tag: 'GEMINI 3.7',
    },
    {
      title: '2. Live ATS Discovery',
      desc: 'Brave Search API crawls open roles on Greenhouse, Lever, Workable, and Wellfound.',
      icon: Search,
      tag: 'BRAVE SEARCH',
    },
    {
      title: '3. Cloud Browser Agent',
      desc: 'Browserbase launches a Chromium sandbox to fill inputs, select dropdowns, and attach PDFs.',
      icon: Bot,
      tag: 'BROWSERBASE',
    },
    {
      title: '4. Instant Confirmation',
      desc: 'Intercepts custom screening questions, submits, and logs the ATS confirmation receipt.',
      icon: CheckCircle2,
      tag: 'INNGEST',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e6] font-sans">
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28" id="hero-section">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-teal-500/15 via-indigo-500/15 to-purple-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-mono font-semibold text-teal-400 mb-6 shadow-[0_0_15px_rgba(45,212,191,0.15)]">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
              <span>AUTONOMOUS ATS APPLICATION ENGINE</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Land interviews on autopilot with{' '}
              <span className="bg-gradient-to-r from-teal-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent">
                Job Buddy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Stop wasting 40 hours a week on repetitive ATS portals. Job Buddy searches live web postings, calculates deep match scores, and automates full application submissions using cloud browsers.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-start-btn"
                onClick={onStartOnboarding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-teal-500 px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_25px_rgba(45,212,191,0.35)] transition hover:brightness-110 cursor-pointer uppercase tracking-wider"
              >
                <Sparkles className="h-4 w-4" />
                Upload Resume & Start Free
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                id="hero-demo-dashboard-btn"
                onClick={onGoToDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#1a1a24] bg-[#0a0a0f] px-6 py-3.5 text-sm font-semibold text-gray-300 shadow-sm transition hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <Zap className="h-4 w-4 text-teal-400" />
                Control Center Live Demo
              </button>
            </div>

            {/* Micro stats banner */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>Zero fake submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>Greenhouse, Lever & Workable native</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>Smart Missing-Info Interceptor</span>
              </div>
            </div>

          </div>

          {/* ==================== INTERACTIVE AGENT DEMO CARD ==================== */}
          <div className="mt-16 rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-4 shadow-2xl sm:p-6 lg:p-8" id="interactive-demo-card">
            <div className="flex flex-col lg:flex-row items-stretch gap-8">
              
              {/* Left: Process Steps Selector */}
              <div className="w-full lg:w-5/12 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">Agent Pipeline Steps</h3>
                  <span className="flex items-center gap-1.5 text-xs text-teal-400 font-mono font-semibold">
                    <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6]" />
                    Agents Online
                  </span>
                </div>

                {demoSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeDemoStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDemoStep(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                        isActive
                          ? 'border-teal-500/40 bg-teal-500/10 shadow-[0_0_15px_rgba(45,212,191,0.1)]'
                          : 'border-[#1a1a24] bg-[#0d0d15] hover:bg-[#11111a]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          isActive ? 'bg-teal-500 text-black shadow-[0_0_10px_rgba(45,212,191,0.4)]' : 'bg-white/5 text-gray-400 border border-[#1a1a24]'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm flex items-center justify-between">
                            {step.title}
                            <span className="text-[9px] font-mono text-gray-500 uppercase">{step.tag}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Live Terminal & Visualizer */}
              <div className="w-full lg:w-7/12 rounded-xl bg-[#050507] border border-[#1a1a24] p-5 font-mono text-xs text-[#e0e0e6] shadow-inner flex flex-col justify-between">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-[#1a1a24] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-500/80" />
                    <span className="text-[11px] text-gray-400 ml-2 font-mono">
                      Browserbase Cloud Sandbox (1920x1080 Headless Chromium)
                    </span>
                  </div>
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-500/30">
                    GEMINI 3.7 + BRAVE
                  </span>
                </div>

                {/* Terminal Body */}
                <div className="space-y-2.5 min-h-[220px]">
                  {activeDemoStep === 0 && (
                    <div className="space-y-1.5 text-gray-300">
                      <p className="text-teal-400">➜ [Gemini 3.7] Ingesting candidate resume: Satish_Reddy_Resume.pdf</p>
                      <p className="text-indigo-300">[Schema Parser] Extracted 12 core skills: TypeScript, React 19, Next.js, Node.js, PostgreSQL</p>
                      <p className="text-gray-400">[Schema Parser] Extracted 2 Work Experience entries & 1 Education record</p>
                      <p className="text-teal-300">[Profile Engine] Calculated completeness: 100% (All high-impact fields populated)</p>
                      <p className="text-gray-500">... Ready for real-time ATS match scoring.</p>
                    </div>
                  )}

                  {activeDemoStep === 1 && (
                    <div className="space-y-1.5 text-gray-300">
                      <p className="text-teal-400">➜ [Brave Search API] Querying: "Senior Frontend Engineer" site:boards.greenhouse.io</p>
                      <p className="text-indigo-300">[Match Engine] Discovered active opening: Supabase (Senior Frontend Engineer - React/TS)</p>
                      <p className="text-amber-400">[Gemini 3.7 Scorer] Semantic overlap: 98% (High seniority & stack synergy)</p>
                      <p className="text-gray-400">[Match Reason] Matches 6/6 required skills (React, TypeScript, Next.js, PostgreSQL)</p>
                      <p className="text-teal-400">... Queuing autonomous Browserbase form-filler.</p>
                    </div>
                  )}

                  {activeDemoStep === 2 && (
                    <div className="space-y-1.5 text-gray-300">
                      <p className="text-teal-400">➜ [Browserbase] Initialized headless session: bb_sess_934812</p>
                      <p className="text-indigo-300">[DOM Inspector] Navigated to boards.greenhouse.io/supabase/jobs/4891024003</p>
                      <p className="text-gray-400">[Action] Injected candidate Name, Email, LinkedIn URL, Portfolio URL</p>
                      <p className="text-gray-400">[Action] Attached parsed resume PDF binary payload</p>
                      <p className="text-amber-400">[Interceptor] Identified required custom question: "Work authorization status"</p>
                      <p className="text-teal-300">[Action] Auto-selected "Authorized without restrictions" from verified profile.</p>
                    </div>
                  )}

                  {activeDemoStep === 3 && (
                    <div className="space-y-1.5 text-gray-300">
                      <p className="text-teal-400">➜ [Browserbase] Clicked [data-qa="btn-submit-application"]</p>
                      <p className="text-emerald-400">[HTTP 200] Application Received by Supabase Talent Portal</p>
                      <p className="text-indigo-300">[Confirmation ID] #GH-918231 recorded in PostgreSQL</p>
                      <p className="text-teal-300">[Inngest Dispatcher] Triggered audit log and dispatched next queue item</p>
                      <div className="font-sans mt-3 text-xs bg-[#0a0a0f] p-2.5 rounded-lg border border-teal-500/20 text-teal-300">
                        🎉 Application completed in 4.2s without manual typing.
                      </div>
                    </div>
                  )}
                </div>

                {/* Terminal Footer */}
                <div className="border-t border-[#1a1a24] pt-3 mt-4 flex items-center justify-between text-gray-500 text-[11px]">
                  <span>System Latency: ~120ms</span>
                  <button
                    onClick={() => setActiveDemoStep((prev) => (prev + 1) % demoSteps.length)}
                    className="text-teal-400 hover:text-teal-300 transition flex items-center gap-1 font-sans cursor-pointer"
                  >
                    Next Step <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==================== PLATFORM SUPPORT BADGES ==================== */}
      <section className="border-y border-[#1a1a24] bg-[#0a0a0f] py-10" id="ats-compatibility-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono font-semibold uppercase tracking-widest text-gray-500 mb-6">
            Autonomous Form Automation Compatible With All Major Applicant Tracking Systems
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 items-center justify-items-center opacity-80 hover:opacity-100 transition">
            
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono text-xs">GH</span>
              Greenhouse
            </div>

            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-xs">LV</span>
              Lever ATS
            </div>

            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-xs">WK</span>
              Workable
            </div>

            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-xs">WF</span>
              Wellfound / AngelList
            </div>

          </div>
        </div>
      </section>

      {/* ==================== PRICING MATRIX ==================== */}
      <section className="py-20 md:py-28" id="pricing-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Transparent, Value-Driven Plans
            </h2>
            <p className="mt-4 text-gray-400 text-sm">
              Apply to 10x more high-fit roles with less effort. Upgrade or cancel anytime.
            </p>

            {/* Toggle Monthly / Annual */}
            <div className="mt-8 inline-flex items-center rounded-xl border border-[#1a1a24] bg-[#0a0a0f] p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-teal-500 text-black shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-teal-500 text-black shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual Billing <span className="font-bold ml-1">(Save 20%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            {/* Free Plan */}
            <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-8 shadow-sm transition hover:border-[#2d2d4d] flex flex-col justify-between" id="plan-card-free">
              <div>
                <h3 className="text-base font-bold text-white">Free Starter</h3>
                <p className="mt-2 text-xs text-gray-500">For testing the AI agent and exploring discovered roles.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>3 AI automated applications / day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Real-time Brave Search job matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Gemini 3.7 resume parsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Standard Browserbase form filling</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartOnboarding}
                className="mt-8 w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] py-3 text-xs font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan (Most Popular) */}
            <div className="relative rounded-2xl border-2 border-teal-500 bg-[#0a0a0f] p-8 shadow-[0_0_30px_rgba(45,212,191,0.15)] flex flex-col justify-between" id="plan-card-pro">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider text-black shadow-md">
                Control Tier
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pro Candidate</h3>
                <p className="mt-2 text-xs text-gray-500">For serious active seekers targeting top roles.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingCycle === 'monthly' ? '$29' : '$23'}
                  </span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span className="font-semibold text-white">25 AI applications / day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Priority Browserbase headless sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Live session DOM inspection & traces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Missing-Info interactive prompt modal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Scheduled Inngest background crawls</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartOnboarding}
                className="mt-8 w-full rounded-xl bg-teal-500 py-3 text-xs font-bold text-black shadow-[0_0_20px_rgba(45,212,191,0.3)] transition hover:brightness-110 cursor-pointer uppercase tracking-wider"
              >
                Upgrade to Pro (Instant Access)
              </button>
            </div>

            {/* Unlimited Plan */}
            <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-8 shadow-sm transition hover:border-[#2d2d4d] flex flex-col justify-between" id="plan-card-unlimited">
              <div>
                <h3 className="text-base font-bold text-white">Unlimited Autopilot</h3>
                <p className="mt-2 text-xs text-gray-500">For maximum velocity with automated batch submission.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingCycle === 'monthly' ? '$79' : '$63'}
                  </span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-white">Unlimited applications / day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Dedicated headless browser instances</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Custom screening auto-answers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Direct recruiter email extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>24/7 priority Inngest queue</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartOnboarding}
                className="mt-8 w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-3 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20 cursor-pointer"
              >
                Go Unlimited
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-[#1a1a24] bg-[#0a0a0f] py-12" id="footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-black font-bold text-xs shadow-[0_0_10px_rgba(45,212,191,0.3)]">
              JB
            </div>
            <span className="text-sm font-bold text-white">Job Buddy Platform</span>
            <span className="text-xs text-gray-500 font-mono">© {new Date().getFullYear()} All systems operational.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <button onClick={onGoToDashboard} className="hover:text-white cursor-pointer">
              Control Center
            </button>
            <button onClick={onStartOnboarding} className="hover:text-white cursor-pointer">
              Upload Resume
            </button>
            <a href="#pricing-section" className="hover:text-white">
              Pricing Matrix
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
