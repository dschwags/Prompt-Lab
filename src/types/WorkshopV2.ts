/**
 * Workshop Mode V2 Type Definitions
 * 
 * Matches Gemini's Workshop Mode component spec
 * Iteration-based architecture with rounds
 */

// === CORE TYPES ===

export interface ApiKeys {
  anthropic: string;
  openRouter: string;
  openai: string;
  google: string;
}

export interface Settings {
  keys: ApiKeys;
  preferredModels: string[];
  theme: 'dark' | 'light' | 'system';
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  flag: string;
  description?: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
}

export interface AIResponse {
  id: string;
  model: string;
  modelId: string;
  text: string;
  metrics: { time: number; cost: number; tokens: number };
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface ConversationRound {
  id: string;
  number: number;
  timestamp: number;
  type: 'initial' | 'discussion';
  pivot?: string;
  responses: AIResponse[];
}

export interface WorkshopIteration {
  id: string;
  number: number;
  status: 'active' | 'completed';
  rounds: ConversationRound[];
  lockedModelId: string | null;
  pivotFrom?: string;
}

export interface WorkshopSession {
  id: string;
  iterations: WorkshopIteration[];
  currentIterationIndex: number;
  systemPrompt: string;
  userPrompt: string;
  selectedModelIds: string[];
  createdAt: number;
  updatedAt: number;
  name: string;
  lockedModelId: string | null;
}

// === HELPER FUNCTIONS ===

export function getFlagByProvider(providerId: string): string {
  const us = ['anthropic', 'openai', 'google', 'meta-llama', 'cohere'];
  const eu = ['mistralai', 'nous-research', 'mistral'];
  const cn = ['deepseek', 'qwen', '01-ai', 'yi'];
  
  const pid = providerId.toLowerCase();
  if (us.some(p => pid.includes(p))) return '🇺🇸';
  if (eu.some(p => pid.includes(p))) return '🇪🇺';
  if (cn.some(p => pid.includes(p))) return '🇨🇳';
  return '🌐';
}

export function formatPrice(priceStr: string): string {
  const p = parseFloat(priceStr) * 1000000;
  return p === 0 ? "Free" : `$${p.toFixed(2)}`;
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createAIResponse(
  model: string,
  modelId: string,
  status: AIResponse['status'] = 'idle'
): AIResponse {
  return {
    id: generateId(),
    model,
    modelId,
    text: '',
    metrics: { time: 0, cost: 0, tokens: 0 },
    status,
  };
}

export function createConversationRound(
  number: number,
  type: 'initial' | 'discussion',
  responses: AIResponse[],
  pivot?: string
): ConversationRound {
  return {
    id: generateId(),
    number,
    timestamp: Date.now(),
    type,
    pivot,
    responses,
  };
}

export function createWorkshopIteration(
  number: number,
  round: ConversationRound,
  lockedModelId: string | null = null
): WorkshopIteration {
  return {
    id: generateId(),
    number,
    status: 'active',
    rounds: [round],
    lockedModelId,
  };
}

export function createWorkshopSession(
  systemPrompt: string,
  userPrompt: string,
  selectedModelIds: string[]
): WorkshopSession {
  const now = Date.now();
  return {
    id: `session-${now}-${Math.random().toString(36).substr(2, 9)}`,
    iterations: [],
    currentIterationIndex: 0,
    systemPrompt,
    userPrompt,
    selectedModelIds,
    createdAt: now,
    updatedAt: now,
    name: `Workshop ${new Date().toLocaleDateString()}`,
    lockedModelId: null,
  };
}

// === STORAGE TYPES ===

export interface WorkshopV2Storage {
  sessions: WorkshopSession[];
  lastSessionId?: string;
}

export const WORKSHOP_V2_STORAGE_KEY = 'promptlab_workshop_v2';
export const MAX_SESSIONS = 20;
export const MAX_ITERATIONS_PER_SESSION = 10;
