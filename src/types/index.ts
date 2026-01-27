// === CORE ENTITIES ===

export interface Prompt {
  id: string;                    // UUID
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
  currentVersionId: string;      // Points to active version
  tags: string[];                // Unified tags/notes array
}

export interface PromptVersion {
  id: string;                    // UUID
  promptId: string;              // Parent prompt reference
  versionNumber: number;         // 1, 2, 3, etc.
  systemPrompt: string;          // System prompt content (can be empty)
  userPrompt: string;            // User prompt content
  createdAt: number;             // Unix timestamp
  characterCount: number;        // Combined character count
  tokenEstimate: number;         // Estimated tokens (chars ÷ 4)
  hash: string;                  // SHA-256 for cache lookup
}

export interface Response {
  id: string;                    // UUID
  promptVersionId: string;       // Which version generated this
  promptHash: string;            // For cache lookup
  provider: Provider;            // 'claude' | 'openai' | 'gemini'
  model: string;                 // e.g., 'claude-sonnet-4-5-20250929'
  content: string;               // Full response text
  tokensIn: number;              // Input tokens (from API)
  tokensOut: number;             // Output tokens (from API)
  estimatedCost: number;         // In USD
  createdAt: number;             // Unix timestamp
  responseTimeMs: number;        // Latency tracking
  fromCache: boolean;            // Was this served from cache?
}

export interface Rule {
  id: string;                    // UUID
  content: string;               // The rule text
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
  order: number;                 // Display order
  active: boolean;               // Can disable without deleting
}

export interface TagMeta {
  name: string;                  // The tag text (also primary key)
  usageCount: number;            // How many prompts use this
  lastUsedAt: number;            // For sorting suggestions
}

export interface Settings {
  id: string;                    // Always 'settings' (singleton)
  apiKeys: {
    claude?: string;
    openai?: string;
    gemini?: string;
  };
  defaultModels: {
    claude: string;
    openai: string;
    gemini: string;
  };
  lastBackupAt?: number;
}

// === VALIDATION ===

export interface ValidationResult {
  passed: boolean;
  gaps: ValidationGap[];
  checkedAt: number;
  rulesChecked: number;
  rulesCovered: number;
}

export interface ValidationGap {
  ruleId: string;
  ruleContent: string;
  suggestion: string;            // AI-generated fix suggestion
}

// === CLACKY EXECUTION TRACKING ===

export interface ClackyExecution {
  id: string;
  promptVersionId: string;
  threadId: string;              // Clacky thread name
  threadUrl?: string;            // Link to Clacky thread
  checkpointName: string;        // "Step 3 - Settings & API Keys"
  executedAt: number;
  outcome: 'success' | 'partial' | 'failed' | 'rolled-back';
  
  achievements: string[];
  filesChanged: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
  
  gotchas: string[];
  learnings: string[];
  suggestedRules: string[];
  
  // If rolled back
  rollbackData?: {
    rolledBackTo: string;
    promptDeficiencies: string[];
  };
}

// === TYPES ===

export type Provider = 'claude' | 'openai' | 'gemini';

export interface ModelInfo {
  id: string;                    // API model string
  name: string;                  // Display name
  provider: Provider;
  inputCostPer1M: number;        // $ per 1M input tokens
  outputCostPer1M: number;       // $ per 1M output tokens
}
