# Job Buddy - Architectural Decisions & ADRs

## ADR 001: Unified Full-Stack Express + Vite Architecture
- **Context**: The application requires high-performance client interactivity with React 19, Tailwind CSS, Lucide icons, while maintaining robust server-side security for Gemini 3.7 AI, Brave Search, Browserbase headless browser automation, Inngest workflows, and Stripe payment processing.
- **Decision**: Implemented an Express backend hosting `/api/*` endpoints and mounting Vite in development mode (with single CommonJS bundle for production on Port 3000).
- **Consequences**: Fast developer feedback, zero secret leakage to the browser, seamless container execution.

## ADR 002: Real-Time Brave Search ATS Discovery + Smart Semantic Match Scoring
- **Context**: Static job boards are quickly outdated and do not reflect newly published roles.
- **Decision**: Brave Search API is used to query live open positions across targeted ATS domains (`greenhouse.io`, `lever.co`, `workable.com`, `wellfound.com`). Match scores (0-100%) are computed in real time using Gemini semantic alignment algorithms.

## ADR 003: Browserbase Cloud Automation with Missing Information Interception
- **Context**: ATS forms frequently include custom, non-standard screening questions (e.g. "Do you require sponsorship?", "Years of GraphQL experience?").
- **Decision**: Rather than failing or submitting dummy answers, Browserbase detects missing required fields and transitions the application state to `missing_info`. The user is immediately alerted via an in-app interactive modal to provide the missing detail, which is then dynamically fed back to the agent session.

## ADR 004: Inngest Background Orchestration
- **Context**: Form-filling and search crawls take several seconds/minutes and should not block user browser sessions.
- **Decision**: Background tasks are queued and dispatched via Inngest step functions (`/api/inngest`), providing automatic retries, event observability, and asynchronous execution.

## ADR 005: Zero-Config Hybrid Persistence with Supabase RLS Model
- **Context**: Ensure the application functions smoothly in both live Supabase environments and local preview environments without breaking if external credentials are initially unconfigured.
- **Decision**: Implemented a resilient storage provider that connects to Supabase when credentials are provided while seamlessly falling back to an in-memory transactional datastore that strictly simulates RLS policies, ensuring full functionality in any runtime.
