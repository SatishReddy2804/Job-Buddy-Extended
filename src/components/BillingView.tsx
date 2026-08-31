import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SubscriptionStatus, PlanTier } from '../types/index.ts';

interface BillingViewProps {
  subscription: SubscriptionStatus | null;
  onUpgrade: (tier: PlanTier) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  subscription,
  onUpgrade,
}) => {
  const [upgradingTier, setUpgradingTier] = useState<PlanTier | null>(null);

  const currentTier = subscription?.tier || 'pro';
  const usedToday = subscription?.applicationsUsedToday ?? 2;
  const limit = subscription?.dailyLimit ?? 25;
  const remaining = subscription?.applicationsRemaining ?? 23;
  const usagePercentage = Math.min(100, Math.round((usedToday / limit) * 100));

  const handleTierClick = (tier: PlanTier) => {
    setUpgradingTier(tier);
    onUpgrade(tier);
    setTimeout(() => {
      setUpgradingTier(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="billing-view">
      
      {/* Top Banner: Current Quota */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white">
                Subscription & Daily AI Quota
              </h1>
              <span className="rounded bg-indigo-500/10 px-2.5 py-0.5 text-xs font-mono font-bold uppercase text-indigo-400 border border-indigo-500/20">
                {currentTier.toUpperCase()} TIER ACTIVE
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your autonomous application quota resets automatically every 24 hours at 00:00 UTC.
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-white font-mono">
              {remaining}
            </span>
            <span className="text-xs text-gray-500 block font-mono">apps remaining today</span>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Today's Usage: {usedToday} of {limit}</span>
            <span className="text-teal-400 font-bold">{usagePercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a24]">
            <div
              className="h-full bg-teal-500 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Free Starter */}
        <div className={`rounded-2xl border bg-[#0a0a0f] p-6 shadow-xs flex flex-col justify-between ${
          currentTier === 'free' ? 'border-2 border-teal-500 shadow-[0_0_20px_rgba(45,212,191,0.15)]' : 'border-[#1a1a24]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Free Starter</h3>
              {currentTier === 'free' && (
                <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-400 border border-teal-500/20">Current</span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white font-mono">$0</span>
              <span className="text-xs text-gray-500">/ mo</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>3 AI applications / day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Brave Search ATS discovery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Gemini 3.7 resume parsing</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleTierClick('free')}
            disabled={currentTier === 'free'}
            className="mt-6 w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            {currentTier === 'free' ? 'Active Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`relative rounded-2xl border bg-[#0a0a0f] p-6 shadow-md flex flex-col justify-between ${
          currentTier === 'pro' ? 'border-2 border-teal-500 shadow-[0_0_25px_rgba(45,212,191,0.2)]' : 'border-indigo-500/30'
        }`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider text-black">
            Recommended
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Pro Candidate</h3>
              {currentTier === 'pro' && (
                <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-400 border border-teal-500/20">Current</span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white font-mono">$29</span>
              <span className="text-xs text-gray-500">/ mo</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span className="font-semibold text-white">25 AI applications / day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Priority Browserbase execution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Live session DOM inspector</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Missing info prompt interceptor</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleTierClick('pro')}
            disabled={currentTier === 'pro'}
            className="mt-6 w-full rounded-xl bg-teal-500 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
          >
            {currentTier === 'pro' ? 'Active Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Unlimited Plan */}
        <div className={`rounded-2xl border bg-[#0a0a0f] p-6 shadow-xs flex flex-col justify-between ${
          currentTier === 'unlimited' ? 'border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[#1a1a24]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Unlimited Autopilot</h3>
              {currentTier === 'unlimited' && (
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-400 border border-indigo-500/20">Current</span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white font-mono">$79</span>
              <span className="text-xs text-gray-500">/ mo</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-white">Unlimited applications / day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Dedicated browser instances</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Auto-answer screening questions</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleTierClick('unlimited')}
            disabled={currentTier === 'unlimited'}
            className="mt-6 w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            {currentTier === 'unlimited' ? 'Active Plan' : 'Upgrade to Unlimited'}
          </button>
        </div>

      </div>

      {/* Stripe Customer Portal Link Card */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-teal-400" />
          <div>
            <h4 className="text-sm font-bold text-white">
              Manage Payment Methods & Invoices
            </h4>
            <p className="text-xs text-gray-500">
              Update billing details, download PDF receipts, or manage subscription cancelation.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Stripe Customer Portal will open in live environment.')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition"
        >
          <span>Stripe Portal</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
};
