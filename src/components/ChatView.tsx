import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Zap,
  Flame,
  Target,
  FileText,
  DollarSign,
  MessageSquare,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, ChatMessage, ChatRole, ModelTier } from '../types/index.ts';
import { saveChatMessageToFirestore } from '../lib/firebase.ts';

interface ChatViewProps {
  profile: UserProfile | null;
}

const ROLE_PRESETS: Array<{
  id: ChatRole;
  label: string;
  desc: string;
  icon: React.ElementType;
  starterPrompts: string[];
}> = [
  {
    id: 'career_strategist',
    label: 'Career Strategist',
    desc: 'Job market analysis, high-signal ATS positioning, and career roadmap',
    icon: Target,
    starterPrompts: [
      'Analyze my profile skills and suggest top 3 high-probability job titles',
      'What are the highest-paying niches for Full Stack Engineers in 2026?',
      'How should I structure my application queue to get 5+ interviews this month?',
    ],
  },
  {
    id: 'interview_coach',
    label: 'Interview Coach',
    desc: 'STAR behavioral mock interviews & system design drill downs',
    icon: MessageSquare,
    starterPrompts: [
      'Conduct a behavioral mock interview for a Senior Engineer role using STAR method',
      'Ask me a challenging conflict resolution question and grade my response',
      'Give me a 5-minute system design framework for a distributed web crawler',
    ],
  },
  {
    id: 'resume_architect',
    label: 'Resume Architect',
    desc: 'Metric-driven bullet transformation and ATS keyword injection',
    icon: FileText,
    starterPrompts: [
      'Rewrite this bullet using Google XYZ formula: "Built API endpoints for the web app"',
      'What hard keywords are missing from my resume for Lead Frontend roles?',
      'How do I showcase AI reasoning & automation workflows on my resume?',
    ],
  },
  {
    id: 'salary_negotiator',
    label: 'Salary Negotiator',
    desc: 'Executive compensation benchmarking, counteroffer scripts & equity valuation',
    icon: DollarSign,
    starterPrompts: [
      'I got an offer for $165k base + 20k equity. How do I negotiate for $185k?',
      'Write me a professional counteroffer email emphasizing multiple competing opportunities',
      'How should I evaluate illiquid startup RSUs vs public company stock?',
    ],
  },
];

export const ChatView: React.FC<ChatViewProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      content: `👋 **Welcome to Job Buddy AI Career Intelligence!**\n\nI'm synced with your resume profile (${profile?.fullName || 'Candidate'}, ${profile?.skills?.slice(0, 4).join(', ') || 'Software Engineer'}). \n\nSelect a specialized persona above, toggle **High Thinking Mode** for complex strategic queries, or pick a starter question below!`,
      modelUsed: 'gemini-3.7-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('career_strategist');
  const [modelTier, setModelTier] = useState<ModelTier>('flash_general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const activeRoleConfig = ROLE_PRESETS.find((r) => r.id === selectedRole) || ROLE_PRESETS[0];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Save user message to Firestore
    saveChatMessageToFirestore(
      {
        id: userMessage.id,
        role: 'user',
        content: userMessage.content,
        modelUsed: modelTier,
      },
      profile?.id
    );

    try {
      // Build request payload with conversation history
      const historyPayload = newMessages
        .filter((m) => m.id !== 'msg_welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload.length > 0 ? historyPayload : [{ role: 'user', content: text }],
          role: selectedRole,
          modelTier,
        }),
      });

      const data = await res.json();
      const modelMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        content: data.response || 'No response received.',
        thought: data.thought,
        modelUsed: data.modelUsed || (modelTier === 'pro_thinking' ? 'gemini-3.1-pro-preview' : 'gemini-3.7-flash'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Save AI message to Firestore
      saveChatMessageToFirestore(
        {
          id: modelMessage.id,
          role: 'model',
          content: modelMessage.content,
          thought: modelMessage.thought,
          modelUsed: modelMessage.modelUsed || 'gemini-3.7-flash',
        },
        profile?.id
      );
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: '⚠️ Failed to connect to Gemini AI. Please check your network connection and try again.',
          modelUsed: 'offline',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg_welcome',
        role: 'model',
        content: `Chat cleared. Ready for your next strategic question!`,
        modelUsed: 'gemini-3.7-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="gemini_chat_view" className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      {/* Top Header & Role Presets */}
      <div className="bg-[#0f0f15] border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Gemini Career Intelligence
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Multi-Turn AI
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Multi-persona career strategist, interview coach, and negotiation engine
              </p>
            </div>
          </div>

          {/* Model Selection & Thinking Mode */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn_model_pro_thinking"
              type="button"
              onClick={() => setModelTier('pro_thinking')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                modelTier === 'pro_thinking'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>High Thinking (3.1 Pro)</span>
            </button>

            <button
              id="btn_model_flash_general"
              type="button"
              onClick={() => setModelTier('flash_general')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                modelTier === 'flash_general'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>General (3.7 Flash)</span>
            </button>

            <button
              id="btn_model_flash_lite"
              type="button"
              onClick={() => setModelTier('flash_lite')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                modelTier === 'flash_lite'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Fast (3.1 Lite)</span>
            </button>

            <button
              id="btn_clear_chat"
              type="button"
              onClick={clearChat}
              title="Clear conversation"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 border border-white/5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          {ROLE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedRole === preset.id;
            return (
              <button
                key={preset.id}
                id={`role_btn_${preset.id}`}
                type="button"
                onClick={() => setSelectedRole(preset.id)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500/50 text-white shadow-md shadow-purple-500/10'
                    : 'bg-black/30 border-white/5 hover:bg-white/5 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-semibold">{preset.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 bg-[#09090e] border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              id={`chat_msg_${msg.id}`}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#13131b] border border-white/10 text-neutral-200 rounded-tl-none'
                }`}
              >
                {/* Reasoning Thought Accordion if available */}
                {msg.thought && (
                  <div className="mb-3 border border-purple-500/20 bg-purple-950/30 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleThought(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-xs font-medium text-purple-300 hover:bg-purple-900/20 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        Deep Reasoning Process
                      </span>
                      {expandedThoughts[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {expandedThoughts[msg.id] && (
                      <div className="p-3 text-xs text-neutral-300 bg-black/40 border-t border-purple-500/20 whitespace-pre-wrap font-mono">
                        {msg.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className="prose prose-invert max-w-none text-sm space-y-2 whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Footer Meta */}
                <div
                  className={`mt-2.5 pt-2 flex items-center justify-between text-[11px] border-t ${
                    isUser ? 'border-white/20 text-indigo-200' : 'border-white/5 text-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[10px] text-neutral-400">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-neutral-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#13131b] border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-lg text-sm text-neutral-300 flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
              <span>
                {modelTier === 'pro_thinking'
                  ? 'Gemini 3.1 Pro is deep reasoning (Thinking Mode HIGH)...'
                  : 'Gemini is drafting strategy...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Quick Ask:
        </span>
        {activeRoleConfig.starterPrompts.map((prompt, i) => (
          <button
            key={i}
            id={`starter_prompt_${i}`}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-xs bg-white/5 hover:bg-white/10 hover:border-purple-500/40 text-neutral-300 px-3 py-1.5 rounded-full border border-white/5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-[#0f0f15] border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-end gap-2">
          <textarea
            id="chat_input_textarea"
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activeRoleConfig.label} anything about your job search, interview answers, or salary... (Press Enter to send)`}
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none resize-none px-2 py-1"
          />

          <button
            id="btn_send_chat_message"
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
