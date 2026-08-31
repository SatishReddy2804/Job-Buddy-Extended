import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Bot,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: UserProfile) => void;
  onParseSuccess?: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onParseSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      setError('Please select or drag a resume file (PDF/DOCX/TXT).');
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume with Gemini AI.');
      }

      setParsedData(data.profile);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during AI parsing.');
    } finally {
      setParsing(false);
    }
  };

  const handleCompleteOnboarding = () => {
    if (parsedData) {
      if (onSuccess) onSuccess(parsedData);
      if (onParseSuccess) onParseSuccess(parsedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" id="onboarding-modal">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 text-[#e0e0e6] shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white cursor-pointer transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]">
            <Sparkles className="h-5 w-5 fill-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Candidate Resume Ingestion Gate
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              POWERED BY GEMINI 3.7 MULTI-MODAL SCHEMA EXTRACTOR
            </p>
          </div>
        </div>

        {/* Content Body */}
        {!parsedData ? (
          <div className="space-y-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              Job Buddy enforces a structured candidate profile before unlocking job applications. Upload your resume to extract skills, experience, and custom ATS vectors.
            </p>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                dragActive
                  ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_20px_rgba(45,212,191,0.2)]'
                  : 'border-[#1a1a24] bg-[#0d0d15] hover:border-teal-500/40 hover:bg-[#11111a]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-teal-400 mb-3 border border-[#1a1a24]">
                <Upload className="h-6 w-6" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <span className="font-semibold text-white text-sm flex items-center justify-center gap-1.5">
                    <FileText className="h-4 w-4 text-teal-400" />
                    {file.name}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono block">
                    {(file.size / 1024).toFixed(1)} KB • Ready for extraction
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">
                    Drop your resume PDF here or <span className="text-teal-400 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Supports PDF, DOCX, and TXT (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="parse-resume-btn"
                onClick={handleUploadAndParse}
                disabled={parsing}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
              >
                <Sparkles className={`h-4 w-4 ${parsing ? 'animate-spin' : ''}`} />
                <span>{parsing ? 'Gemini 3.7 Vectorizing...' : 'Vectorize with AI'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Verification Review */
          <div className="space-y-5">
            <div className="rounded-xl bg-teal-500/10 p-4 border border-teal-500/20 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">Resume Successfully Parsed!</span>
                <span className="text-teal-300">
                  Gemini extracted {parsedData.skills?.length || 0} technical skills and calculated a {parsedData.completenessScore}% profile completeness score.
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#1a1a24] pb-2">
                <span className="text-gray-500">Candidate:</span>
                <span className="font-bold text-white">{parsedData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-[#1a1a24] pb-2">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-300">{parsedData.email}</span>
              </div>
              <div className="flex justify-between border-b border-[#1a1a24] pb-2">
                <span className="text-gray-500">Experience Count:</span>
                <span className="text-gray-300">{parsedData.experience?.length || 0} entries</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1.5">Parsed Key Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {parsedData.skills?.slice(0, 8).map((s, i) => (
                    <span key={i} className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-300 border border-teal-500/20">
                      {s}
                    </span>
                  ))}
                  {(parsedData.skills?.length || 0) > 8 && (
                    <span className="text-[10px] text-gray-500 self-center">
                      +{parsedData.skills!.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              id="confirm-onboarding-btn"
              onClick={handleCompleteOnboarding}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-xs font-bold text-black shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:brightness-110 cursor-pointer uppercase tracking-wider transition"
            >
              <span>Unlock Dashboard & Find High-Fit Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
