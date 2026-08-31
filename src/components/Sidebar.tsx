import React from 'react';
import {
  BarChart3,
  Briefcase,
  Send,
  FileText,
  Activity,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
} from 'lucide-react';
import { UserProfile, SubscriptionStatus } from '../types/index.ts';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  applicationsCount: number;
  profile: UserProfile | null;
  subscription: SubscriptionStatus | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  applicationsCount,
  profile,
  subscription,
}) => {
  const completeness = profile?.completenessScore ?? 100;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Command',
      icon: BarChart3,
      badge: 'Live',
      badgeClass: 'bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono',
    },
    {
      id: 'jobs',
      label: 'Find Jobs',
      icon: Briefcase,
      badge: 'Search',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: Send,
      badge: applicationsCount > 0 ? `${applicationsCount}` : undefined,
      badgeClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono',
    },
    {
      id: 'chat',
      label: 'AI Strategist',
      icon: Sparkles,
      badge: 'Thinking',
      badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono',
    },
    {
      id: 'profile',
      label: 'Resume & Profile',
      icon: FileText,
      badge: `${completeness}%`,
      badgeClass: completeness === 100 ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono',
    },
    {
      id: 'workflows',
      label: 'AI Workflows',
      icon: Activity,
      badge: 'Inngest',
      badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono',
    },
    {
      id: 'billing',
      label: 'Plan & Quota',
      icon: CreditCard,
      badge: `${subscription?.tier?.toUpperCase() || 'PRO'}`,
      badgeClass: 'bg-white/5 text-gray-300 border border-white/10 font-mono',
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#1a1a24] bg-[#0a0a0f] transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      id="dashboard-sidebar"
    >
      {/* Sidebar Top Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-[#1a1a24]">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Agent Systems Online
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white cursor-pointer ml-auto transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1 p-3" id="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.15)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Power / Quota Summary (When not collapsed) */}
      {!isCollapsed && (
        <div className="p-4 mt-auto border-t border-[#1a1a24]">
          <div className="bg-[#11111a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold font-mono">Profile Power</span>
              <span className="text-xs text-teal-400 font-bold font-mono">{completeness}%</span>
            </div>
            <div className="w-full bg-[#1a1a24] h-1.5 rounded-full mb-3 overflow-hidden">
              <div
                className="bg-teal-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-1 border-t border-[#1a1a24]">
              <span>Daily Quota</span>
              <span className="text-white font-semibold">
                {subscription?.applicationsUsedToday ?? 2} / {subscription?.dailyLimit ?? 25}
              </span>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};
