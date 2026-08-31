import React, { useState } from 'react';
import { HelpCircle, X, ArrowRight, ShieldCheck, CheckCircle2, Bot } from 'lucide-react';
import { JobApplication } from '../types/index.ts';

interface MissingInfoModalProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (applicationId: string, answers: Record<string, string>) => void;
  onSubmitAnswers?: (applicationId: string, answers: Record<string, string>) => void;
}

export const MissingInfoModal: React.FC<MissingInfoModalProps> = ({
  application,
  isOpen,
  onClose,
  onSubmit,
  onSubmitAnswers,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !application) return null;

  const handleInputChange = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (onSubmit) onSubmit(application.id, answers);
    if (onSubmitAnswers) onSubmitAnswers(application.id, answers);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 800);
  };

  const missingFields = application.missingFields || [
    'Work Authorization / Visa Status',
    'Earliest Possible Start Date',
    'Target Base Salary Expectation',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" id="missing-info-modal">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 text-[#e0e0e6] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white cursor-pointer transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Action Required: Screening Questions
            </h2>
            <p className="text-xs text-gray-400">
              {application.job.company} • {application.job.platform.toUpperCase()} ATS
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Browserbase encountered custom required fields on the ATS application form that were not in your profile. Provide answers below to resume automated submission.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {missingFields.map((field, idx) => (
            <div key={idx} className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">
                {field} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={answers[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={`Enter ${field.toLowerCase()}...`}
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-2.5 text-xs text-white placeholder:text-gray-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a1a24]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
            >
              Skip / Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
            >
              <span>{submitting ? 'Injecting Answers...' : 'Submit & Resume Application'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
