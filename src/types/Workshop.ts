/**
 * Workshop Types - For Multi-Model Parallel Testing
 * 
 * FILE: Workshop.ts
 * PURPOSE: Type definitions for Workshop session, iteration, and starred items
 * 
 * Philosophy: Lean types that extend existing Prompt/Response types
 */



// === WORKSHOP SESSION ===

export interface WorkshopSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;                    // User-editable session name
  systemPrompt: string;            // Current system prompt
  userPrompt: string;              // Current user prompt
  selectedModels: string[];        // Model IDs selected for this session
  iterations: WorkshopIteration[]; // All iterations in this session
  starredItems: StarredItem[];     // Starred snippets across iterations
  currentIterationNumber: number;
}

// === WORKSHOP ITERATION ===

export interface WorkshopIteration {
  id: string;
  iterationNumber: number;
  createdAt: number;
  modelIds: string[];              // Which models were called
  responses: IterationResponse[];  // Response from each model
  promptChanged: boolean;          // Did prompt change from previous iteration?
  promptChangeSummary?: string;    // Brief note on what changed
}

export interface IterationResponse {
  modelId: string;
  modelName: string;
  provider: string;
  region: string;                  // 🇺🇸🇪🇺🇨🇳
  isOpenRouter: boolean;
  
  // Response content
  text: string;
  
  // Metrics (from ResponseDisplay)
  timeSeconds: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  
  // Metadata
  status: 'pending' | 'loading' | 'complete' | 'error';
  errorMessage?: string;
  starred: boolean;                // Individual response starred
}

// === STARRED ITEMS ===

export interface StarredItem {
  id: string;
  createdAt: number;
  iterationId: string;             // Link back to iteration
  modelId: string;
  modelName: string;
  originalText: string;            // Full response text
  selectedText: string;            // Highlighted/selected portion (or full)
  selectionRange?: {               // Character range if specific selection
    start: number;
    end: number;
  };
  notes?: string;                  // User notes on why this was starred
  category: 'best-answer' | 'insight' | 'pattern' | 'code' | 'other';
}

// === MODEL SELECTION ===

export interface ModelPreset {
  id: string;
  name: string;
  description: string;
  modelIds: string[];
  icon: string;
}

export const WORKSHOP_MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'all-us',
    name: '🇺🇸 All US Models',
    description: 'Anthropic, OpenAI, Google, Meta, Cohere',
    modelIds: [],
    icon: '🇺🇸',
  },
  {
    id: 'all-eu',
    name: '🇪🇺 All EU Models',
    description: 'Mistral (France)',
    modelIds: [],
    icon: '🇪🇺',
  },
  {
    id: 'all-china',
    name: '🇨🇳 All Chinese Models',
    description: 'DeepSeek, Qwen',
    modelIds: [],
    icon: '🇨🇳',
  },
  {
    id: 'reasoning',
    name: '🧠 Reasoning Models',
    description: 'Models with explicit reasoning capabilities',
    modelIds: [
      'openai/o1',                          // o1
      'deepseek/deepseek-r1',               // DeepSeek R1
      'tngtech/deepseek-r1t-chimera:free',  // Free reasoning
    ],
    icon: '🧠',
  },
  {
    id: 'flagship',
    name: '⭐ Flagship Models',
    description: 'Most capable from each provider',
    modelIds: [
      'claude-opus-4-20251101',             // Opus 4
      'openai/gpt-4-turbo',                 // GPT-4 Turbo
      'google/gemini-2.5-pro',              // Gemini 2.5 Pro
      'deepseek/deepseek-chat-v3.1',        // DeepSeek V3.1
    ],
    icon: '⭐',
  },
  {
    id: 'fast',
    name: '⚡ Fast & Cheap',
    description: 'Quick responses, low cost',
    modelIds: [
      'claude-haiku-4-20251001',            // Haiku
      'openai/gpt-4o-mini',                 // GPT-4o Mini
      'google/gemini-2.5-flash',            // Gemini 2.5 Flash
    ],
    icon: '⚡',
  },
];

// === STORAGE ===

export interface WorkshopStorage {
  sessions: WorkshopSession[];
  lastSessionId?: string;
}

export const WORKSHOP_STORAGE_KEY = 'promptlab_workshop';
export const MAX_SESSIONS = 20;
export const MAX_ITERATIONS_PER_SESSION = 5;
export const MAX_STARRED_PER_SESSION = 20;

// === HELPER TYPES ===

export interface WorkshopMetrics {
  totalResponses: number;
  successfulResponses: number;
  failedResponses: number;
  totalCost: number;
  totalTimeSeconds: number;
  averageTimePerModel: number;
  modelsTested: string[];
}

export function calculateWorkshopMetrics(iteration: WorkshopIteration): WorkshopMetrics {
  const responses = iteration.responses;
  const successful = responses.filter(r => r.status === 'complete');
  const failed = responses.filter(r => r.status === 'error');
  
  const totalCost = successful.reduce((sum, r) => sum + r.cost, 0);
  const totalTime = successful.reduce((sum, r) => sum + r.timeSeconds, 0);
  
  return {
    totalResponses: responses.length,
    successfulResponses: successful.length,
    failedResponses: failed.length,
    totalCost,
    totalTimeSeconds: totalTime,
    averageTimePerModel: successful.length > 0 ? totalTime / successful.length : 0,
    modelsTested: successful.map(r => r.modelName),
  };
}
