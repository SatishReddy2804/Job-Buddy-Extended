import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import {
  parseResumeWithGemini,
  calculateJobMatchWithGemini,
  batchCalculateJobMatchesWithGemini,
  generateChatResponseWithGemini,
} from './server/gemini.ts';
import { searchJobsWithBrave } from './server/brave.ts';
import { runBrowserbaseApplicationSession, resumeBrowserbaseApplicationAfterMissingInfo } from './server/browserbase.ts';
import { getInngestWorkflows, triggerInngestJobDiscovery } from './server/inngest.ts';
import { getSubscriptionForUser, createStripeCheckoutSession, handleStripeWebhookEvent } from './server/stripe.ts';
import {
  serverSignUp,
  serverSignIn,
  serverResetPassword,
  serverUpdatePassword,
  serverResendVerification,
  serverVerifyEmailToken,
  validatePassword,
} from './server/supabase.ts';
import { JobApplication, PlanTier } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Request logging & tracking middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // ==================== 1. Health & Status ====================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      integrations: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        braveSearch: Boolean(process.env.BRAVE_SEARCH_API_KEY),
        browserbase: Boolean(process.env.BROWSERBASE_API_KEY),
        supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      },
    });
  });

  // ==================== 2. Supabase Auth & Session ====================
  app.get('/api/auth/session', (req: Request, res: Response) => {
    const profile = db.getProfile();
    res.json({
      authenticated: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        onboardingCompleted: profile.onboardingCompleted,
      },
    });
  });

  // Supabase Email & Password Sign Up
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const result = await serverSignUp(email, password, fullName || email.split('@')[0]);

      // Update local profile representation
      db.updateProfile({
        email: email.trim().toLowerCase(),
        fullName: fullName || email.split('@')[0],
      });

      res.json({
        success: true,
        user: result.user,
        session: result.session,
        emailConfirmationRequired: result.emailConfirmationRequired,
        message: result.message,
      });
    } catch (err: any) {
      console.error('[Auth SignUp Error]', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to create account.' });
    }
  });

  // Supabase Email & Password Sign In
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const result = await serverSignIn(email, password);

      // Synchronize database profile
      db.updateProfile({
        email: email.trim().toLowerCase(),
        fullName: (result.user as any)?.user_metadata?.full_name || email.split('@')[0],
      });

      res.json({
        success: true,
        user: db.getProfile(),
        session: result.session,
      });
    } catch (err: any) {
      console.error('[Auth Login Error]', err);
      res.status(401).json({ success: false, error: err.message || 'Invalid email or password.' });
    }
  });

  // Supabase Password Reset Request
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }

      const result = await serverResetPassword(email);
      res.json({ success: true, message: result.message, resetToken: (result as any).resetToken });
    } catch (err: any) {
      console.error('[Auth Reset Password Error]', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to send password reset.' });
    }
  });

  // Supabase Update Password
  app.post('/api/auth/update-password', async (req: Request, res: Response) => {
    try {
      const { email, newPassword, token } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ success: false, error: 'Email and new password are required.' });
      }

      const result = await serverUpdatePassword(email, newPassword, token);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      console.error('[Auth Update Password Error]', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to update password.' });
    }
  });

  // Supabase Resend Email Verification
  app.post('/api/auth/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
      }

      const result = await serverResendVerification(email);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      console.error('[Auth Resend Verification Error]', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to resend verification email.' });
    }
  });

  // Supabase Email Verification Token Confirmation
  app.post('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: 'Verification token is required.' });
      }

      const result = await serverVerifyEmailToken(token);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      console.error('[Auth Verify Email Error]', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to verify email.' });
    }
  });

  // Sign out / Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // ==================== 3. Profile Management ====================
  app.get('/api/profile', (req: Request, res: Response) => {
    const profile = db.getProfile();
    res.json({ success: true, profile });
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    const updates = req.body;
    const updated = db.updateProfile(updates);
    res.json({ success: true, profile: updated });
  });

  // ==================== 4. Resumes & Gemini AI Parsing ====================
  app.get('/api/resumes', (req: Request, res: Response) => {
    res.json({ success: true, resumes: db.getResumes() });
  });

  app.post('/api/resumes/upload', async (req: Request, res: Response) => {
    try {
      const { fileName, rawText, fileSize = 120000, mimeType = 'application/pdf' } = req.body;
      const textToParse = rawText || `Alex Rivera
Senior Full Stack Engineer
alex.rivera@example.com | +1 (415) 555-0199 | San Francisco, CA
https://github.com/alexrivera-dev | https://linkedin.com/in/alexrivera-dev

Summary:
Full Stack Engineer with 6+ years designing React 19, TypeScript, and Node.js microservices.

Skills:
TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Docker, Supabase, GraphQL, Git, Vitest

Experience:
Senior Software Engineer at MetaFlow Inc. (2022 - Present)
- Engineered scalable frontend architectures and reduced load times by 40%.
- Integrated AI reasoning workflows and automated CI/CD pipelines.

Education:
B.S. in Computer Science, UC Berkeley (2020)`;

      const parsedData = await parseResumeWithGemini(textToParse);

      // Create new resume record
      const resume = db.addResume({
        id: `res_${Date.now()}`,
        userId: db.getProfile().id,
        fileName: fileName || 'Uploaded_Resume.pdf',
        fileSize,
        mimeType,
        parseStatus: 'completed',
        parsedData,
        rawText: textToParse,
        createdAt: new Date().toISOString(),
      });

      // Update current user profile from parsed resume data
      const updatedProfile = db.updateProfile({
        fullName: parsedData.fullName,
        email: parsedData.email,
        phone: parsedData.phone,
        location: parsedData.location,
        headline: parsedData.headline,
        summary: parsedData.summary,
        githubUrl: parsedData.githubUrl,
        linkedinUrl: parsedData.linkedinUrl,
        portfolioUrl: parsedData.portfolioUrl,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        preferredRoles: parsedData.preferredRoles,
        onboardingCompleted: true,
      });

      res.json({
        success: true,
        resume,
        profile: updatedProfile,
      });
    } catch (err: any) {
      console.error('Resume upload error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to parse resume.' });
    }
  });

  // ==================== 5. Jobs Discovery (Brave Search) ====================
  app.get('/api/jobs', async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || '';
      const platform = (req.query.platform as any) || undefined;
      const remoteOnly = req.query.remote === 'true';

      const jobs = await searchJobsWithBrave(query, { platform, remoteOnly });
      const profile = db.getProfile();

      // Calculate match scores in batch to protect quota
      const matchMap = await batchCalculateJobMatchesWithGemini(
        profile,
        jobs.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          description: j.description || '',
          requiredSkills: j.requiredSkills || [],
        }))
      );

      const scoredJobs = jobs.map((job) => {
        const match = matchMap.get(job.id);
        return {
          ...job,
          matchScore: match ? match.matchScore : 85,
          matchReason: match ? match.matchReason : 'Strong match for your skills and experience.',
        };
      });

      // Sort by match score descending
      scoredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      res.json({
        success: true,
        jobs: scoredJobs,
        count: scoredJobs.length,
      });
    } catch (err: any) {
      console.error('Jobs discovery error:', err);
      res.status(500).json({ success: false, error: 'Failed to discover jobs.' });
    }
  });

  // ==================== 6. AI Application Agent (Browserbase) ====================
  app.get('/api/applications', (req: Request, res: Response) => {
    res.json({ success: true, applications: db.getApplications() });
  });

  app.post('/api/applications/apply', async (req: Request, res: Response) => {
    try {
      const { job } = req.body;
      if (!job) {
        return res.status(400).json({ success: false, error: 'Job object is required.' });
      }

      const profile = db.getProfile();
      const plan = db.getUserPlan();
      const usedToday = db.getApplicationsCountToday();
      const sub = getSubscriptionForUser(plan, usedToday);

      if (sub.applicationsRemaining <= 0) {
        return res.status(403).json({
          success: false,
          error: `Daily application limit reached for ${plan.toUpperCase()} tier (${sub.dailyLimit}/day). Upgrade plan for more applications.`,
          upgradeRequired: true,
        });
      }

      // Create new application in queued status
      const newApp: JobApplication = {
        id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: profile.id,
        jobId: job.id,
        job,
        status: 'queued',
        matchScore: job.matchScore || 90,
        missingFields: [],
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.addApplication(newApp);

      // Return immediately with queued status, launch Browserbase session in background
      res.json({ success: true, application: newApp });

      // Start Browserbase automation asynchronously
      runBrowserbaseApplicationSession(
        newApp,
        profile,
        (event) => {
          db.addApplicationEvent(event.id, newApp.id, event);
        },
        (status, missingFields, errorMessage) => {
          db.updateApplication(newApp.id, {
            status,
            missingFields: missingFields || [],
            errorMessage,
            submittedAt: status === 'submitted' ? new Date().toISOString() : undefined,
          });
        }
      );
    } catch (err: any) {
      console.error('Apply error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to start AI application.' });
    }
  });

  app.post('/api/applications/:id/provide-missing-info', async (req: Request, res: Response) => {
    try {
      const appId = req.params.id;
      const { answers } = req.body;

      const appRecord = db.getApplicationById(appId);
      if (!appRecord) {
        return res.status(404).json({ success: false, error: 'Application not found.' });
      }

      // Resume session with candidate's answers
      res.json({ success: true, message: 'Resuming application submission...' });

      resumeBrowserbaseApplicationAfterMissingInfo(
        appRecord,
        answers || {},
        (event) => {
          db.addApplicationEvent(event.id, appRecord.id, event);
        },
        (status, missingFields, errorMessage) => {
          db.updateApplication(appRecord.id, {
            status,
            missingFields: missingFields || [],
            errorMessage,
            submittedAt: status === 'submitted' ? new Date().toISOString() : undefined,
          });
        }
      );
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to submit missing info.' });
    }
  });

  app.post('/api/applications/:id/retry', async (req: Request, res: Response) => {
    const appId = req.params.id;
    const appRecord = db.getApplicationById(appId);
    if (!appRecord) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    db.updateApplication(appId, { status: 'queued', errorMessage: undefined });
    res.json({ success: true, message: 'Retry initiated.' });

    const profile = db.getProfile();
    runBrowserbaseApplicationSession(
      appRecord,
      profile,
      (event) => {
        db.addApplicationEvent(event.id, appRecord.id, event);
      },
      (status, missingFields, errorMessage) => {
        db.updateApplication(appRecord.id, {
          status,
          missingFields: missingFields || [],
          errorMessage,
          submittedAt: status === 'submitted' ? new Date().toISOString() : undefined,
        });
      }
    );
  });

  // Get all application events (historical agent actions audit log)
  app.get('/api/applications/events', (req: Request, res: Response) => {
    try {
      const events = db.getAllApplicationEvents();
      res.json({ success: true, events, count: events.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch application events.' });
    }
  });

  // Get events for a specific application
  app.get('/api/applications/:id/events', (req: Request, res: Response) => {
    try {
      const appId = req.params.id;
      const events = db.getApplicationEvents(appId);
      res.json({ success: true, events, count: events.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch events for application.' });
    }
  });

  // Get Browserbase Live Session Metadata & Stream URLs
  app.get('/api/applications/:id/browserbase-session', (req: Request, res: Response) => {
    try {
      const appId = req.params.id;
      const appRecord = db.getApplicationById(appId);
      if (!appRecord) {
        return res.status(404).json({ success: false, error: 'Application not found.' });
      }

      const sessionId = appRecord.browserbaseSessionId || `bb_sess_${appRecord.id.replace('app_', '')}`;
      const sessionUrl = `https://www.browserbase.com/sessions/${sessionId}`;
      const debugUrl = `https://browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/session/${sessionId}`;
      const liveStreamUrl = `https://connect.browserbase.com/stream/${sessionId}`;

      res.json({
        success: true,
        sessionId,
        sessionUrl,
        debugUrl,
        liveStreamUrl,
        targetUrl: appRecord.job.applyUrl,
        platform: appRecord.job.platform,
        company: appRecord.job.company,
        role: appRecord.job.title,
        status: appRecord.status,
        events: appRecord.events,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to generate session stream.' });
    }
  });

  // ==================== 7. Inngest Workflows ====================
  app.get('/api/inngest/workflows', (req: Request, res: Response) => {
    res.json({ success: true, workflows: getInngestWorkflows() });
  });

  app.post('/api/inngest/trigger', async (req: Request, res: Response) => {
    const result = await triggerInngestJobDiscovery();
    res.json({ success: true, ...result });
  });

  // ==================== 8. Billing & Stripe ====================
  app.get('/api/billing/subscription', (req: Request, res: Response) => {
    const plan = db.getUserPlan();
    const usedToday = db.getApplicationsCountToday();
    const subscription = getSubscriptionForUser(plan, usedToday);
    res.json({ success: true, subscription });
  });

  app.post('/api/billing/checkout', async (req: Request, res: Response) => {
    const { tier } = req.body;
    const targetTier: PlanTier = tier === 'unlimited' ? 'unlimited' : 'pro';
    db.setUserPlan(targetTier);
    const checkout = await createStripeCheckoutSession(db.getProfile().id, targetTier, '/billing');
    res.json({ success: true, checkoutUrl: checkout.url, upgradedTier: targetTier });
  });

  app.post('/api/billing/portal', (req: Request, res: Response) => {
    res.json({
      success: true,
      portalUrl: 'https://billing.stripe.com/p/session/test_portal_session',
    });
  });

  app.post('/api/stripe/webhook', (req: Request, res: Response) => {
    const signature = (req.headers['stripe-signature'] as string) || '';
    const result = handleStripeWebhookEvent(JSON.stringify(req.body), signature);
    res.json(result);
  });

  // ==================== 9. Gemini Multi-Turn Chat & Thinking Mode ====================
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, role, modelTier } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, error: 'Messages array is required.' });
      }

      const profile = db.getProfile();
      const response = await generateChatResponseWithGemini({
        messages,
        role,
        modelTier,
        profile,
      });

      res.json({
        success: true,
        response: response.text,
        thought: response.thought,
        modelUsed: response.modelUsed,
      });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to generate chat response.',
        response: 'I encountered a temporary connection error. Please try sending your query again.',
      });
    }
  });

  // ==================== Vite / Static Asset Serving ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Job Buddy Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
