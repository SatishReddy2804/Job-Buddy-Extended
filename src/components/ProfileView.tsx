import React, { useState } from 'react';
import {
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Save,
  Link,
  DollarSign,
  FileText,
  Upload,
} from 'lucide-react';
import { UserProfile, WorkExperience, Education } from '../types/index.ts';
import { ResumeReportView } from './reports/ResumeReportView.tsx';
import { generateResumeReport } from '../lib/reports.ts';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenOnboarding: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenOnboarding,
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile || {});
  const [newSkill, setNewSkill] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);

  if (!profile) return null;

  const report = generateResumeReport(profile);
  const completeness = profile.completenessScore ?? 100;
  const missing = profile.missingFields || [];

  // SVG Circular progress math
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim()) {
      const updated = [...(formData.skills || []), newSkill.trim()];
      setFormData((prev) => ({ ...prev, skills: updated }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = (formData.skills || []).filter((s) => s !== skillToRemove);
    setFormData((prev) => ({ ...prev, skills: updated }));
  };

  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp_${Date.now()}`,
      company: 'New Company Inc.',
      role: 'Senior Engineer',
      startDate: '2023',
      endDate: 'Present',
      current: true,
      description: 'Led technical design and implementation of modern applications.',
      technologies: ['React', 'TypeScript', 'Node.js'],
    };
    setFormData((prev) => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])],
    }));
  };

  const handleSave = () => {
    setSaving(true);
    onUpdateProfile(formData);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="profile-view">
      
      {/* Top Banner: Profile Completeness Gauge */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            
            {/* SVG Circular Completeness Gauge */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[#1a1a24]"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-teal-500 transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-extrabold text-white font-mono">
                  {completeness}%
                </span>
                <span className="block text-[9px] font-mono uppercase text-gray-500">Power</span>
              </div>
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                Candidate Profile & Vector Completeness
              </h1>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Higher profile completeness ensures 100% automated form submissions across Greenhouse, Lever, and Workable ATS portals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowReport(!showReport)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition border ${
                showReport
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                  : 'border-white/10 bg-[#0d0d15] text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{showReport ? 'Hide ATS Report' : 'ATS & Resume Report'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                Grade {report.scores.overallGrade}
              </span>
            </button>

            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Re-parse Resume</span>
            </button>

            <button
              id="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 cursor-pointer uppercase tracking-wider transition"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

        </div>

        {/* Live Resume Score Quick Summary Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">ATS Compliance:</span>
            <span className="font-mono font-bold text-teal-400">{report.scores.atsComplianceScore}%</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Impact Score (XYZ):</span>
            <span className="font-mono font-bold text-cyan-400">{report.scores.impactQuantificationScore}/100</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Keyword Density:</span>
            <span className="font-mono font-bold text-indigo-400">{report.scores.keywordDensityScore}/100</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400">Power Verbs:</span>
            <span className="font-mono font-bold text-emerald-400">{report.actionVerbsStrength.ratio}%</span>
          </div>
        </div>

        {/* Missing Fields Pill Alert */}
        {missing.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-300">
            <span className="font-bold">Missing high-impact fields: </span>
            <span>{missing.join(', ')}. Add them below to reach 100% completeness.</span>
          </div>
        )}

        {savedSuccess && (
          <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Profile successfully saved and synchronized with database!</span>
          </div>
        )}
      </div>

      {/* Realtime Resume & ATS Diagnostic Report View */}
      {showReport && (
        <ResumeReportView report={report} onOpenOnboarding={onOpenOnboarding} />
      )}

      {/* Main Profile Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Contact Details */}
        <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-teal-400" />
            Personal & Contact Information
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+1 (415) 555-0199"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">Location / Residence</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="San Francisco, CA (or Remote)"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Online Presence & Links */}
        <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Link className="h-4 w-4 text-teal-400" />
            Social & Portfolio Links
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-300 block mb-1">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl || ''}
                onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedinUrl || ''}
                onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">Portfolio / Website</label>
              <input
                type="url"
                value={formData.portfolioUrl || ''}
                onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">Target Minimum Base Salary ($ USD)</label>
              <input
                type="number"
                value={formData.targetSalaryMin || ''}
                onChange={(e) => handleFieldChange('targetSalaryMin', Number(e.target.value))}
                placeholder="175000"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Section 3: Technical Skills Manager */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-400" />
          Technical Skills & Vectors ({formData.skills?.length || 0})
        </h2>

        {/* Add Skill Input */}
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add new skill (e.g. GraphQL, Kubernetes, Rust)..."
            className="flex-1 rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-xs text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-teal-500 px-5 py-2 text-xs font-bold text-black shadow-[0_0_10px_rgba(45,212,191,0.3)] hover:brightness-110 cursor-pointer uppercase tracking-wider"
          >
            Add Skill
          </button>
        </form>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {formData.skills?.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300 border border-teal-500/20"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-teal-500 hover:text-white cursor-pointer ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Work Experience */}
      <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-teal-400" />
            Work History & Experience
          </h2>
          <button
            onClick={handleAddExperience}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Experience
          </button>
        </div>

        <div className="space-y-4">
          {formData.experience?.map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-semibold text-white">
                <span>{exp.role} at {exp.company}</span>
                <span className="text-gray-500 font-mono">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-gray-400">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
