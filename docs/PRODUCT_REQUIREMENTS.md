# Job Buddy - Product Requirements Document (PRD)

## 1. Executive Summary
**Job Buddy** is an intelligent full-stack SaaS platform that automates the end-to-end job discovery and application process. By combining Google Gemini 3.7 for resume parsing & semantic profile matching, the Brave Search API for real-time ATS job discovery (Greenhouse, Lever, Workable, Wellfound), Browserbase for cloud browser automated form-filling, and Inngest for background orchestration, Job Buddy eliminates manual data entry and repetitive application burnout.

---

## 2. User Personas
1. **The Active Job Seeker**: Needs to apply to 10-30 high-fit roles per week without spending 45 minutes manually copy-pasting resumes into ATS portals.
2. **The Career Transitioner**: Needs smart matching algorithms that understand transferable skills from their resume and target relevant entry/mid-level roles.
3. **The Power Candidate (Pro/Unlimited)**: Wants automated scheduled background crawls, continuous auto-submission to matched roles, and real-time live browser session inspection.

---

## 3. Core Functional Requirements

### A. Authentication & Onboarding Gate
- Authentication via Supabase Auth (Google OAuth + Email/Password).
- **Mandatory Onboarding Gate**: New users are barred from browsing jobs or initiating applications until a resume is uploaded and parsed by Gemini.
- Profile fields (Skills, Experience, Education, Contact, Socials) are auto-populated from the parsed resume.

### B. Profile Completeness & Management
- Circular completeness indicator with breakdown of missing high-impact fields (e.g. GitHub, LinkedIn, Portfolio, Salary expectations).
- Editable structured profiles with instant re-matching score recalculations.

### C. Real-Time Job Discovery & Smart Match Engine
- Live search queries powered by Brave Search API targeting automation-ready ATS endpoints (`boards.greenhouse.io`, `jobs.lever.co`, `apply.workable.com`, `wellfound.com`).
- Semantic match score (0-100%) computed by analyzing skill overlap, role seniority, tech stack, and location preferences.

### D. AI Application Agent (Browserbase Automation)
- Single-click automated application trigger.
- Browserbase cloud browser session drives form detection and field mapping.
- **Missing Information Interceptor**: When a form requires data not present in the profile (e.g., custom screening questions, EEOC disclosures, specific portfolio links), the workflow shifts to `missing_info` state, prompting the user with an interactive dialog.
- Live session log viewer with simulated DOM interaction timeline.

### E. Application Pipeline & Status Tracker
- Granular statuses: `queued` → `detecting_fields` → `in_progress` → `missing_info` → `submitted` / `failed`.
- Detailed audit logs, execution metrics, and direct links to ATS postings.

### F. Billing & Monetization (Stripe)
- **Free Tier**: 3 AI applications / day, standard discovery, manual review.
- **Pro Tier ($29/mo)**: 25 AI applications / day, priority background queue, live session inspection.
- **Unlimited Tier ($79/mo)**: Unlimited automated applications, auto-apply background triggers, dedicated headless instances.

---

## 4. Non-Functional Requirements
- **Security**: Supabase Row-Level Security (RLS) on all user tables; sanitized payload filtering for Browserbase sessions.
- **Reliability**: Idempotent webhook handling, automatic retries with exponential backoff on ATS transient errors.
- **Performance**: <2s response for job search queries; non-blocking background execution for browser automation.
- **Accessibility & UX**: WCAG AA compliant contrast, full keyboard navigation, clear visual state transitions.
