# Job Buddy - Architecture Documentation

## 1. System Topology Overview

```
+-------------------------------------------------------------------------+
|                              CLIENT (Browser)                           |
|  React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion Animations |
|  - Marketing Site & Interactive Demo                                    |
|  - Resume Onboarding & Parsing Visualizer                               |
|  - Live Job Match & Filter Dashboard                                    |
|  - AI Agent Control Center with Missing Info Modal                      |
|  - Real-time Session Replay & Activity Log                              |
|  - Billing & Plan Management                                            |
+------------------------------------+------------------------------------+
                                     |  REST API / SSE (Port 3000)
                                     v
+-------------------------------------------------------------------------+
|                         FULL-STACK SERVER (Express + Vite)              |
|  - Centralized Route Handlers (/api/*)                                  |
|  - Zod Request Validation & Structured Error Middleware                 |
|  - Supabase Auth & Session Verification                                 |
|  - Service Orchestration Layer (/src/lib/* or /lib/*)                   |
+-----+---------------+---------------+------------------+----------------+
      |               |               |                  |                |
      v               v               v                  v                v
+-----------+   +-----------+   +-----------+      +-----------+    +-----------+
|  Google   |   |   Brave   |   |Browserbase|      |  Inngest  |    |  Stripe   |
|  Gemini   |   |  Search   |   | Automation|      | Workflows |    | Payments  |
|  3.7 AI   |   |    API    |   |  Engine   |      | & Queues  |    | & Billing |
|  (Parse & |   |  (Live    |   | (Headless |      | (Cron &   |    | (Webhooks |
|  Match)   |   |Discovery) |   |  Forms)   |      | Retries)  |    | & Portal) |
+-----------+   +-----------+   +-----------+      +-----------+    +-----------+
                                      |
                                      v
                        +---------------------------+
                        |    PostgreSQL Database    |
                        |     (Supabase + RLS)      |
                        +---------------------------+
```

## 2. Component Layers

### Frontend Layer
- **State Management**: Reactive hooks and optimistic updates for smooth dashboard interactions.
- **UI Architecture**: Modular component design using Tailwind CSS utility tokens, responsive layouts, and accessibility patterns.
- **Real-time Pipeline Updates**: Periodic poll and event-driven updates for tracking Browserbase automation progress.

### Service Layer (`/lib`)
- `lib/gemini/`: Implements resume text & PDF extraction, JSON schema-enforced field mapping (work experience, education, skills, contact), and semantic job match scoring.
- `lib/brave-search/`: Queries Brave Search for active postings on greenhouse.io, lever.co, workable.com, and wellfound.com.
- `lib/browserbase/`: Manages cloud browser sessions, inspects DOM elements for ATS inputs, performs automated form-filling, handles missing-info prompts, and records execution traces.
- `lib/inngest/`: Background step-function workflow definitions (`job-discovery-cron`, `auto-apply-processor`, `retry-failed-applications`).
- `lib/stripe/`: Stripe checkout sessions, customer portal generation, and webhook event dispatching.
- `lib/supabase/`: Unified data access layer with strict row-level authorization and persistent storage.
