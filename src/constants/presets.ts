import { ModelOption, PersonaPreset } from '../types/chat';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-flash-latest',
    name: 'Gemini 2.5 Flash',
    description: 'Fast, responsive, and versatile for everyday coding and chat.',
    badge: 'Default',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Advanced reasoning, deep technical analysis, and complex queries.',
    badge: 'Advanced',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini Flash Lite',
    description: 'High speed, lightweight responses with minimal latency.',
    badge: 'Fast',
  },
];

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Balanced, thoughtful, and articulate for all inquiries.',
    systemPrompt: 'You are Gemini Chat Studio, a knowledgeable, concise, and helpful AI assistant. Provide clear, direct, and well-structured answers.',
  },
  {
    id: 'developer',
    name: 'Staff Engineer',
    description: 'Production-ready code, strict types, architecture, and edge cases.',
    systemPrompt: 'You are an elite principal software engineer. Provide robust, production-grade code with TypeScript, handle edge cases, and explain architectural trade-offs concisely without conversational fluff.',
  },
  {
    id: 'concise',
    name: 'Concise Analyst',
    description: 'Bullet points, quantitative precision, and zero filler text.',
    systemPrompt: 'You are an executive analyst. Respond in compact, bulleted format with high information density. Emphasize key facts, metrics, and actionable takeaways.',
  },
  {
    id: 'creative',
    name: 'Creative Strategist',
    description: 'Compelling narratives, original metaphors, and vivid writing.',
    systemPrompt: 'You are a master creative writer and brand strategist. Use engaging, evocative language, crisp prose, and memorable phrasing.',
  },
];

export interface SuggestedPrompt {
  id: string;
  category: string;
  title: string;
  prompt: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'ts-debounce',
    category: 'Code & Systems',
    title: 'Debounce with TypeScript',
    prompt: 'Write a type-safe TypeScript debounce function with support for immediate invocation, maxWait, and cancellation.',
  },
  {
    id: 'arch-compare',
    category: 'Architecture',
    title: 'Monolith vs Microservices',
    prompt: 'Give a concrete decision framework for choosing between a modular monolith and microservices for an early-stage B2B SaaS.',
  },
  {
    id: 'sql-optimize',
    category: 'Data & DB',
    title: 'Index Optimization Strategy',
    prompt: 'Explain composite index ordering in PostgreSQL and how B-Trees handle range filters versus equality filters.',
  },
  {
    id: 'doc-summary',
    category: 'Strategy & Copy',
    title: 'Product Launch Pitch',
    prompt: 'Draft a crisp, persuasive product release announcement highlighting three major technical breakthroughs.',
  },
];
