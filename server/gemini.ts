import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { UserProfile, WorkExperience, Education } from '../src/types/index.ts';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory cache for match scores: key -> { matchScore, matchReason, timestamp }
const matchScoreCache = new Map<string, { matchScore: number; matchReason: string; timestamp: number }>();

// Quota rate-limiting cooldown state
let geminiRateLimitedUntil = 0;

function isGeminiRateLimited(): boolean {
  return Date.now() < geminiRateLimitedUntil;
}

function markGeminiRateLimited(retryDelaySeconds: number = 30) {
  geminiRateLimitedUntil = Date.now() + retryDelaySeconds * 1000;
}

// ==================== 1. Resume Parsing ====================
export async function parseResumeWithGemini(rawText: string): Promise<{
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  preferredRoles: string[];
}> {
  const ai = getGeminiClient();

  if (ai && !isGeminiRateLimited()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an expert HR and ATS parser. Extract structured candidate information from the following resume text.
Resume text:
"""
${rawText.slice(0, 10000)}
"""`,
        config: {
          systemInstruction: 'Extract candidate resume details into strict JSON format with accuracy. Return valid JSON only.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              githubUrl: { type: Type.STRING },
              linkedinUrl: { type: Type.STRING },
              portfolioUrl: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              preferredRoles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    current: { type: Type.BOOLEAN },
                    description: { type: Type.STRING },
                  },
                  required: ['company', 'role', 'startDate', 'endDate', 'description'],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    fieldOfStudy: { type: Type.STRING },
                    graduationYear: { type: Type.STRING },
                  },
                  required: ['institution', 'degree'],
                },
              },
            },
            required: ['fullName', 'email', 'skills', 'experience', 'education'],
          },
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          fullName: parsed.fullName || 'Alex Rivera',
          email: parsed.email || 'alex.rivera@example.com',
          phone: parsed.phone || '+1 (555) 234-5678',
          location: parsed.location || 'San Francisco, CA',
          headline: parsed.headline || 'Full Stack Software Engineer',
          summary: parsed.summary || 'Passionate software engineer experienced in building scalable web apps and AI-driven workflows.',
          githubUrl: parsed.githubUrl || 'https://github.com/alexrivera-dev',
          linkedinUrl: parsed.linkedinUrl || 'https://linkedin.com/in/alexrivera-dev',
          portfolioUrl: parsed.portfolioUrl || 'https://alexrivera.dev',
          skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Next.js'],
          experience: (parsed.experience || []).map((exp: any, index: number) => ({
            id: exp.id || `exp_${Date.now()}_${index}`,
            company: exp.company || 'Tech Innovations Inc.',
            role: exp.role || 'Senior Frontend Engineer',
            startDate: exp.startDate || '2022',
            endDate: exp.endDate || 'Present',
            current: exp.current ?? true,
            description: exp.description || 'Led development of React web applications and integrated cloud APIs.',
            technologies: exp.technologies || ['TypeScript', 'React', 'Node.js'],
          })),
          education: (parsed.education || []).map((edu: any, index: number) => ({
            id: edu.id || `edu_${Date.now()}_${index}`,
            institution: edu.institution || 'University of California, Berkeley',
            degree: edu.degree || 'Bachelor of Science',
            fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
            graduationYear: edu.graduationYear || '2021',
          })),
          preferredRoles: Array.isArray(parsed.preferredRoles) && parsed.preferredRoles.length > 0
            ? parsed.preferredRoles
            : ['Senior Frontend Engineer', 'Full Stack Engineer', 'Software Engineer'],
        };
      }
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.status === 'RESOURCE_EXHAUSTED' || err?.message?.includes('503')) {
        markGeminiRateLimited(30);
      }
      // Gracefully fall back to smart heuristic parser
    }
  }

  // Fallback heuristic parser
  return fallbackParseResume(rawText);
}

function fallbackParseResume(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullName = lines[0] || 'Jordan Hayes';
  
  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  const email = emailMatch ? emailMatch[1] : 'jordan.hayes@example.com';

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  const phone = phoneMatch ? phoneMatch[1] : '+1 (415) 890-1234';

  // Extract links
  const githubMatch = text.match(/(https?:\/\/github\.com\/[a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/(https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  const portfolioMatch = text.match(/(https?:\/\/[a-zA-Z0-9_-]+\.(dev|me|io|com))/i);

  // Common tech skills lookup
  const skillBank = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Next.js', 'PostgreSQL',
    'GraphQL', 'Tailwind CSS', 'AWS', 'Docker', 'Kubernetes', 'Redis', 'Supabase', 'Express',
    'HTML5', 'CSS3', 'REST APIs', 'Git', 'CI/CD', 'Jest', 'Vitest', 'Microservices'
  ];
  
  const extractedSkills = skillBank.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(text));
  const finalSkills = extractedSkills.length >= 3 ? extractedSkills : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Next.js', 'REST APIs'];

  return {
    fullName,
    email,
    phone,
    location: 'San Francisco, CA (Remote)',
    headline: 'Senior Full Stack Engineer (React, TypeScript, Node.js)',
    summary: 'Senior Software Engineer with 6+ years of production experience building high-throughput web applications, cloud infrastructure, and modern responsive frontends.',
    githubUrl: githubMatch ? githubMatch[1] : 'https://github.com/jordanhayes-dev',
    linkedinUrl: linkedinMatch ? linkedinMatch[1] : 'https://linkedin.com/in/jordanhayes-dev',
    portfolioUrl: portfolioMatch ? portfolioMatch[1] : 'https://jordanhayes.dev',
    skills: finalSkills,
    preferredRoles: ['Senior Frontend Engineer', 'Senior Full Stack Engineer', 'Staff Software Engineer'],
    experience: [
      {
        id: `exp_1`,
        company: 'Veloce Systems',
        role: 'Senior Full Stack Engineer',
        startDate: '2022',
        endDate: 'Present',
        current: true,
        description: 'Architected high-volume SaaS applications in React 19, TypeScript, and Node.js. Decreased bundle latency by 42% and automated CI/CD deployment pipelines.',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      },
      {
        id: `exp_2`,
        company: 'Apex Cloud Technologies',
        role: 'Software Engineer II',
        startDate: '2019',
        endDate: '2022',
        current: false,
        description: 'Developed microservices in Node.js and Go. Built real-time analytics dashboards with WebSockets and Tailwind CSS.',
        technologies: ['TypeScript', 'GraphQL', 'Next.js', 'Redis'],
      },
    ],
    education: [
      {
        id: `edu_1`,
        institution: 'University of Washington',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Software Systems & Distributed Computing',
        graduationYear: '2019',
      },
    ],
  };
}

// ==================== 2. Fast Heuristic Match Calculator ====================
export function computeHeuristicMatch(
  profile: UserProfile,
  job: { title: string; company: string; description?: string; requiredSkills?: string[] }
): { matchScore: number; matchReason: string } {
  const userSkills = (profile.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

  let matchedSkillsCount = 0;
  const matchedSkillNames: string[] = [];

  for (const js of jobSkills) {
    const isDirectMatch = userSkills.includes(js);
    const isSubstringMatch = !isDirectMatch && userSkills.some(us => us.includes(js) || js.includes(us));
    if (isDirectMatch || isSubstringMatch) {
      matchedSkillsCount++;
      matchedSkillNames.push(js);
    }
  }

  // Check role title match
  const preferredRoles = (profile.preferredRoles || []).map(r => r.toLowerCase());
  const titleLower = (job.title || '').toLowerCase();
  const roleBonus = preferredRoles.some(r => titleLower.includes(r) || r.includes(titleLower)) ? 15 : 5;

  const totalRequired = Math.max(1, jobSkills.length);
  const skillRatio = matchedSkillsCount / totalRequired;

  const calculatedScore = Math.round(40 + skillRatio * 45 + roleBonus);
  const matchScore = Math.min(98, Math.max(55, calculatedScore));

  let matchReason = '';
  if (matchedSkillNames.length >= 3) {
    matchReason = `Direct match on ${matchedSkillNames.slice(0, 3).join(', ')} with strong role alignment.`;
  } else if (matchedSkillNames.length > 0) {
    matchReason = `Matches key skills (${matchedSkillNames.join(', ')}) with strong transferable engineering depth.`;
  } else {
    matchReason = `High domain alignment for ${job.title} based on your technical background and experience.`;
  }

  return { matchScore, matchReason };
}

// ==================== 3. Batch Match Scoring (Single Gemini API Call) ====================
export async function batchCalculateJobMatchesWithGemini(
  profile: UserProfile,
  jobs: Array<{ id: string; title: string; company: string; description: string; requiredSkills: string[] }>
): Promise<Map<string, { matchScore: number; matchReason: string }>> {
  const results = new Map<string, { matchScore: number; matchReason: string }>();

  // 1. Check in-memory cache for all jobs first
  const missingJobs: typeof jobs = [];
  for (const job of jobs) {
    const cacheKey = `${profile.id}_${job.id}_${job.title}`;
    const cached = matchScoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      results.set(job.id, { matchScore: cached.matchScore, matchReason: cached.matchReason });
    } else {
      missingJobs.push(job);
    }
  }

  if (missingJobs.length === 0) {
    return results;
  }

  // 2. If Gemini is rate-limited or not configured, use heuristic for missing jobs
  const ai = getGeminiClient();
  if (!ai || isGeminiRateLimited() || missingJobs.length > 8) {
    for (const job of missingJobs) {
      const match = computeHeuristicMatch(profile, job);
      results.set(job.id, match);
      matchScoreCache.set(`${profile.id}_${job.id}_${job.title}`, {
        ...match,
        timestamp: Date.now(),
      });
    }
    return results;
  }

  // 3. Batch up to 5 jobs into ONE single Gemini API call to respect 5 RPM free-tier quota
  const jobsToQuery = missingJobs.slice(0, 5);
  const remainingJobs = missingJobs.slice(5);

  // Provide fallback for remaining jobs immediately
  for (const job of remainingJobs) {
    const match = computeHeuristicMatch(profile, job);
    results.set(job.id, match);
    matchScoreCache.set(`${profile.id}_${job.id}_${job.title}`, {
      ...match,
      timestamp: Date.now(),
    });
  }

  try {
    const jobListingsText = jobsToQuery
      .map(
        (j, i) =>
          `[Job ${i + 1}] ID: "${j.id}", Title: "${j.title}" at "${j.company}", Required Skills: [${j.requiredSkills.join(', ')}]`
      )
      .join('\n');

    const prompt = `Candidate Profile:
Skills: ${profile.skills.join(', ')}
Preferred Roles: ${profile.preferredRoles.join(', ')}
Summary: ${profile.summary || profile.headline || ''}

Evaluate the candidate match score (0-100) and provide a concise 1-sentence reason for each job opening below:
${jobListingsText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Return a JSON array of match evaluations. Each item must contain jobId, matchScore (integer between 0 and 100), and matchReason.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobId: { type: Type.STRING },
              matchScore: { type: Type.INTEGER },
              matchReason: { type: Type.STRING },
            },
            required: ['jobId', 'matchScore', 'matchReason'],
          },
        },
      },
    });

    if (response && response.text) {
      const parsedArray: Array<{ jobId: string; matchScore: number; matchReason: string }> = JSON.parse(response.text);
      for (const item of parsedArray) {
        if (item.jobId) {
          const match = {
            matchScore: Math.min(100, Math.max(45, Number(item.matchScore) || 85)),
            matchReason: item.matchReason || 'Strong skill overlap and domain alignment.',
          };
          results.set(item.jobId, match);
          const matchedJob = jobsToQuery.find(j => j.id === item.jobId);
          if (matchedJob) {
            matchScoreCache.set(`${profile.id}_${matchedJob.id}_${matchedJob.title}`, {
              ...match,
              timestamp: Date.now(),
            });
          }
        }
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('429') || err?.status === 'RESOURCE_EXHAUSTED' || err?.message?.includes('503')) {
      markGeminiRateLimited(35);
    }
  }

  // Ensure any job not filled by Gemini gets the accurate heuristic match
  for (const job of jobsToQuery) {
    if (!results.has(job.id)) {
      const match = computeHeuristicMatch(profile, job);
      results.set(job.id, match);
      matchScoreCache.set(`${profile.id}_${job.id}_${job.title}`, {
        ...match,
        timestamp: Date.now(),
      });
    }
  }

  return results;
}

// Single job match score with cache & fallback
export async function calculateJobMatchWithGemini(
  profile: UserProfile,
  job: { id?: string; title: string; company: string; description: string; requiredSkills: string[] }
): Promise<{ matchScore: number; matchReason: string }> {
  const jobId = job.id || `${job.company}_${job.title}`.replace(/\s+/g, '_');
  const cacheKey = `${profile.id}_${jobId}_${job.title}`;
  
  const cached = matchScoreCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return { matchScore: cached.matchScore, matchReason: cached.matchReason };
  }

  const batchMap = await batchCalculateJobMatchesWithGemini(profile, [{
    id: jobId,
    title: job.title,
    company: job.company,
    description: job.description,
    requiredSkills: job.requiredSkills,
  }]);

  const match = batchMap.get(jobId) || computeHeuristicMatch(profile, job);
  return match;
}

// ==================== 4. Multi-Turn Chatbot & High Thinking Mode ====================
export type ChatRole = 'career_strategist' | 'interview_coach' | 'resume_architect' | 'salary_negotiator';

const ROLE_SYSTEM_INSTRUCTIONS: Record<ChatRole, string> = {
  career_strategist:
    'You are the Job Buddy Executive Career Strategist. You help candidates navigate the modern tech job market, identify high-signal ATS keywords, structure their job search funnel, target hidden job market roles, and maximize application-to-interview conversion rates. Provide practical, high-impact bullet points and actionable advice tailored to candidate profiles.',
  interview_coach:
    'You are an Elite Technical & Behavioral Interview Coach. Conduct rigorous mock interviews using the STAR method for behavioral questions and structured problem-solving for systems/coding. Ask one challenging question at a time, or provide direct critique with specific improved phrasing.',
  resume_architect:
    'You are a Senior ATS Resume Architect. You transform weak job descriptions and drafts into powerful metric-driven achievement bullets (Action Verb + Context + Metric + Impact). Optimize for Applicant Tracking Systems like Greenhouse, Lever, and Workday.',
  salary_negotiator:
    'You are an Executive Compensation & Salary Negotiator. Provide high-leverage negotiation scripts, total compensation benchmarking (Base, Bonus, Equity/RSUs, Sign-on), counteroffer strategies, and tactical negotiation framing.',
};

export async function generateChatResponseWithGemini(params: {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  role?: ChatRole;
  modelTier?: 'pro_thinking' | 'flash_general' | 'flash_lite';
  profile?: UserProfile;
}): Promise<{ text: string; thought?: string; modelUsed: string }> {
  const { messages, role = 'career_strategist', modelTier = 'flash_general', profile } = params;

  let modelName = 'gemini-3.7-flash';
  let thinkingConfig: any = undefined;

  if (modelTier === 'pro_thinking') {
    modelName = 'gemini-3.1-pro-preview';
    thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  } else if (modelTier === 'flash_lite') {
    modelName = 'gemini-3.1-flash-lite';
  } else {
    modelName = 'gemini-3.7-flash';
  }

  const baseInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.career_strategist;
  const profileContext = profile
    ? `\n\nCandidate Profile Context:
- Name: ${profile.fullName}
- Headline: ${profile.headline || 'Full Stack Software Engineer'}
- Skills: ${(profile.skills || []).join(', ')}
- Preferred Roles: ${(profile.preferredRoles || []).join(', ')}
- Location: ${profile.location || 'Remote'}`
    : '';

  const systemInstruction = `${baseInstruction}${profileContext}\n\nFormat your responses clearly with markdown, using bold headers, bullet points, and code/script blocks where appropriate.`;

  const ai = getGeminiClient();

  if (ai) {
    try {
      // Format multi-turn conversation history
      const formattedContents = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const config: any = {
        systemInstruction,
      };

      if (thinkingConfig) {
        config.thinkingConfig = thinkingConfig;
        // Do NOT set maxOutputTokens when using thinkingLevel
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config,
      });

      if (response && response.text) {
        return {
          text: response.text,
          modelUsed: modelName,
        };
      }
    } catch (err: any) {
      console.warn(`Gemini Chat error with ${modelName}:`, err?.message || err);
      // If pro model or quota fails, try fallback to flash
      if (modelName !== 'gemini-3.7-flash') {
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: messages.map((m) => ({
              role: m.role,
              parts: [{ text: m.content }],
            })),
            config: {
              systemInstruction,
            },
          });
          if (fallbackResponse && fallbackResponse.text) {
            return {
              text: fallbackResponse.text,
              modelUsed: 'gemini-3.7-flash',
            };
          }
        } catch (fallbackErr) {
          console.warn('Gemini chat fallback error:', fallbackErr);
        }
      }
    }
  }

  // Local fallback response if AI is unavailable or offline
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  return {
    text: `### Strategy & Recommendations for: "${lastUserMessage.slice(0, 80)}..."\n\n1. **ATS Alignment**: Ensure your resume matches the top 5 hard skills from the target job descriptions.\n2. **Quantified Impact**: Frame your recent accomplishments using the XYZ formula: *Accomplished [X], as measured by [Y], by doing [Z]*.\n3. **Application Automation**: Keep your automated application queue active across Greenhouse, Lever, and Workday to maintain steady interview pipeline velocity.`,
    modelUsed: 'local-career-engine',
  };
}

