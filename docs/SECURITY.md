# Job Buddy - Security Strategy & Hardening

## 1. Threat Modeling & OWASP Top 10 Protections

### A. Broken Access Control & IDOR
- Supabase Row-Level Security (RLS) guarantees that every SQL query on `profiles`, `resumes`, `applications`, and `application_events` filters strictly by `auth.uid()`.
- Server routes validate session identity before processing operations on application IDs or user profiles.

### B. Sensitive Data Exposure & API Key Security
- `GEMINI_API_KEY`, `BRAVE_SEARCH_API_KEY`, `BROWSERBASE_API_KEY`, `STRIPE_SECRET_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are strictly server-side and never exposed to the client or browser bundle.
- Telemetry headers: Gemini client sets `User-Agent: 'aistudio-build'` as mandated.

### C. File Upload Security
- Resumes undergo mime-type validation (application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain) and strict size constraints (max 10MB).
- Uploaded content is processed in memory or ephemeral sandboxes before extraction.

### D. Automated Agent & SSRF Protection
- Browserbase automation calls are constrained to verified ATS domains (`greenhouse.io`, `lever.co`, `workable.com`, `wellfound.com`). Arbitrary external redirect chains are blocked.
- Browserbase session credentials and user PII transmitted to headless browsers are strictly scoped to the fields identified in the ATS DOM.

### E. Stripe Webhook Verification & Idempotency
- Incoming Stripe webhook payloads are validated using HMAC-SHA256 signatures (`stripe.webhooks.constructEvent`).
- Event IDs are tracked in an idempotency cache to prevent double-charging or out-of-order execution.
