// ============================================================================
// CORE SESSION TYPES
// ============================================================================

export interface WorkshopSession {
  id: string;
  createdAt: number;
  promptData: {
    system: string;
    user: string;
  };
  clackyContext?: ClackyProjectContext;
  iterations: WorkshopIteration[];
  currentIterationIndex: number;
  selectedModels: string[];
  modelColors: Record<string, string>;  // Map modelId to color
}

export interface WorkshopIteration {
  number: number;
  status: 'active' | 'completed';
  rounds: ConversationRound[];
  lockedModelId: string | null;
  lockInRound: number | null;
}

export interface ConversationRound {
  number: number;
  timestamp: number;
  type: 'initial' | 'discussion';
  pivot?: string;
  responses: AIResponse[];
}

export interface AIResponse {
  id: string;
  model: string;
  modelId: string;
  text: string;
  metrics: {
    time: number;
    cost: number;
    tokens: number;
    inputTokens?: number;
    outputTokens?: number;
  };
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  color?: string;  // Color assigned to this response's model
  isWinner?: boolean;  // Track if this was picked as winner
  feedback?: AIResponseFeedback;
}

export interface AIResponseFeedback {
  relevance: 1 | 0 | -1;  // 👍 | neutral | 👎
  tone: 1 | 0 | -1;      // 👍 | neutral | 👎
  timestamp: number;
}

export interface WinnerContext {
  winnerId: string;
  winnerModelId: string;
  winnerResponse: string;
  loserModelId: string;
  loserResponse: string;
  feedbackScores?: {
    winnerId: string;
    relevance: number;  // -1, 0, 1
    tone: number;       // -1, 0, 1
  };
}

export type PostWinnerAction = 'keep-both' | 'lock-winner' | 'replace-loser';

// ============================================================================
// FEEDBACK STORAGE TYPES
// ============================================================================

export interface FeedbackRecord {
  id: string;
  sessionId: string;
  iterationNumber: number;
  roundNumber: number;
  responseId: string;
  modelId: string;
  modelName: string;
  prompt: {
    system: string;
    user: string;
  };
  metrics: {
    time: number;
    cost: number;
    tps: number;
    inputTokens: number;
    outputTokens: number;
  };
  feedback: {
    relevance: 1 | 0 | -1;
    tone: 1 | 0 | -1;
  };
  timestamp: number;
}

// ============================================================================
// MODEL CATALOG TYPES
// ============================================================================

export interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  flag: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

// ============================================================================
// CLACKY INTEGRATION TYPES
// ============================================================================

export interface ClackyProjectContext {
  type: 'clacky-project';
  version: '1.0';
  projectName: string;
  context: {
    framework: string;
    language: string;
    dependencies: string[];
    description?: string;
  };
  files: ClackyProjectFile[];
  fileTree: string;
}

export interface ClackyProjectFile {
  path: string;
  content: string;
  size: number;
}

// ============================================================================
// AAR SYNTHESIS TYPES
// ============================================================================

export type AARTemplateId = 'clacky-developer' | 'aar-architect' | 'marketing-strategy';

export interface AARTemplate {
  id: AARTemplateId;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface SynthesisResult {
  insights: Array<{ title: string; desc: string; }>;
  finalPrompt: string;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface Settings {
  keys: {
    anthropic: string;
    openrouter: string;
    openai: string;
    google: string;
  };
  theme: 'light' | 'dark' | 'system';
}

// ============================================================================
// API SERVICE TYPES
// ============================================================================

export interface APIRequest {
  provider: 'anthropic' | 'openai' | 'google' | 'openrouter';
  model: string;
  messages: { system?: string; user: string; };
}

export interface APIResponse {
  text: string;
  metrics: { time: number; cost: number; tokens: number; };
}
