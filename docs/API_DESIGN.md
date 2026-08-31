# Job Buddy - API Design Specification

## 1. REST API Endpoints Overview

All API routes run behind the `/api` prefix with standardized JSON error formatting:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error response format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [ ... ]
  }
}
```

---

## 2. API Endpoints Reference

### Health & Observability
- `GET /api/health`: System health, service connectivity statuses (Gemini, Supabase, Brave, Browserbase, Inngest, Stripe).

### Authentication & User
- `POST /api/auth/session`: Get or verify current authenticated session.
- `POST /api/auth/login`: Email/password or OAuth simulation login.
- `POST /api/auth/logout`: Invalidate session tokens.

### Resumes & Gemini Parsing
- `POST /api/resumes/upload`: Upload resume (PDF, DOCX, TXT) and triggers Gemini 3.7 JSON structured extraction.
- `GET /api/resumes`: List user's resumes and parse statuses.
- `POST /api/resumes/parse-text`: Direct text parsing with Gemini 3.7.

### Profile Management
- `GET /api/profile`: Retrieve user profile, parsed skills, experiences, and completeness breakdown.
- `PUT /api/profile`: Update profile fields and recompute completeness score.

### Job Discovery & Matching
- `GET /api/jobs`: Query discovered jobs with semantic match scoring, platform filters, keywords, and pagination.
- `POST /api/jobs/search`: Trigger real-time Brave Search API discovery across Greenhouse, Lever, Workable, and Wellfound.

### Application Agent & Workflows
- `POST /api/applications/apply`: Queue an automated AI application via Browserbase.
- `GET /api/applications`: List all applications with status filters (`queued`, `detecting_fields`, `in_progress`, `missing_info`, `submitted`, `failed`).
- `GET /api/applications/:id`: Retrieve detailed application audit logs and Browserbase session execution events.
- `POST /api/applications/:id/provide-missing-info`: Resolve a `missing_info` state by submitting answers to required form fields.
- `POST /api/applications/:id/retry`: Retry a failed application run.

### Inngest Background Tasks
- `POST /api/inngest`: Inngest handler for processing background workflows (`job.crawl`, `application.submit`, `application.retry`).
- `GET /api/inngest/status`: Current status of background workflows and execution queue.

### Billing & Stripe
- `GET /api/billing/subscription`: Current user subscription, daily application quota, and usage counters.
- `POST /api/billing/checkout`: Create a Stripe checkout session for Pro or Unlimited plans.
- `POST /api/billing/portal`: Create a Stripe Customer Portal session.
- `POST /api/stripe/webhook`: Handle incoming Stripe events with signature verification and idempotent processing.
