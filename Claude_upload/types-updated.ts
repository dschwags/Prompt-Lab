// Updated Settings interface with integration mode support

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  
  // ⭐ NEW: Integration mode
  integrationMode: 'managed' | 'openrouter' | 'multi-provider' | 'single-provider';
  
  // For managed mode (Pro tier)
  membershipTier?: 'free' | 'pro' | 'team';
  monthlyQuota?: number;
  usageThisMonth?: number;
  
  // For BYOK modes (openrouter, multi-provider, single-provider)
  apiKeys: Record<string, string>;
  
  // Common: Default models per provider
  defaultModels: Record<string, string>;
  
  createdAt: number;
  updatedAt: number;
}

// Rest of existing types remain the same...
export interface ModelInfo {
  id: string;
  name: string;
  provider?: string;
  contextWindow: number;
  supportsStreaming: boolean;
  cost?: {
    input: number;  // per 1M tokens
    output: number; // per 1M tokens
  };
}

export interface Prompt {
  id: string;
  title: string;
  description?: string;
  systemPrompt?: string;
  userPrompt: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  currentVersionId?: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  systemPrompt?: string;
  userPrompt: string;
  note?: string;
  createdAt: number;
}

export interface Response {
  id: string;
  promptId: string;
  promptVersionId?: string;
  provider: string;
  model: string;
  content: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  temperature?: number;
  maxTokens?: number;
  createdAt: number;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TagMeta {
  id: string;
  name: string;
  color?: string;
  description?: string;
  usageCount: number;
  createdAt: number;
}

export interface ValidationResult {
  promptId: string;
  rules: Array<{
    ruleId: string;
    passed: boolean;
    message?: string;
  }>;
  overallPass: boolean;
  timestamp: number;
}

export interface ValidationGap {
  promptId: string;
  responseId: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'critical' | 'major' | 'minor';
  createdAt: number;
}

export interface ClackyExecution {
  id: string;
  promptId: string;
  checkpoint: string;
  gotchas: string[];
  learnings: string[];
  buildStatus: 'success' | 'failed' | 'partial';
  creditsUsed: number;
  timestamp: number;
}

export interface Provider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
}
