# Job Buddy - Database Design (Supabase / PostgreSQL)

## 1. Schema Specifications & Entity Relationship Model

```sql
-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    headline TEXT,
    summary TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]'::JSONB,
    education JSONB DEFAULT '[]'::JSONB,
    preferred_roles TEXT[] DEFAULT '{}',
    target_salary_min INTEGER,
    work_authorization TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    raw_text TEXT,
    storage_url TEXT,
    parse_status TEXT NOT NULL CHECK (parse_status IN ('pending', 'parsing', 'completed', 'failed')),
    parsed_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs Table (Cached & Discovered Postings)
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    remote_type TEXT NOT NULL CHECK (remote_type IN ('remote', 'hybrid', 'onsite')),
    platform TEXT NOT NULL CHECK (platform IN ('greenhouse', 'lever', 'workable', 'wellfound', 'direct')),
    apply_url TEXT NOT NULL UNIQUE,
    salary_range TEXT,
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    source TEXT NOT NULL,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications Table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('queued', 'detecting_fields', 'in_progress', 'missing_info', 'submitted', 'failed')),
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    missing_fields JSONB DEFAULT '[]'::JSONB,
    submitted_at TIMESTAMPTZ,
    error_message TEXT,
    browserbase_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Application Events Table (Audit & Live Execution Log)
CREATE TABLE public.application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::JSONB,
    screenshot_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('free', 'pro', 'unlimited')) DEFAULT 'free',
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
    daily_application_limit INTEGER NOT NULL DEFAULT 3,
    applications_used_today INTEGER NOT NULL DEFAULT 0,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 2. Row Level Security (RLS) Policies
- All user tables (`profiles`, `resumes`, `applications`, `application_events`, `subscriptions`) have RLS enabled:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE` allowed ONLY where `auth.uid() = user_id` (or `id = auth.uid()` for profiles).
- Jobs table is publicly viewable by authenticated users (`SELECT WHERE auth.role() = 'authenticated'`).
