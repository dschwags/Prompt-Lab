import type { Settings, ModelInfo } from '../types';

export interface ProviderDefinition {
  id: string;
  name: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  models: ModelInfo[];
  docsUrl: string;
  description?: string;
}

// ⭐ OpenRouter - Single key for all models
export const OPENROUTER_PROVIDER: ProviderDefinition = {
  id: 'openrouter',
  name: 'OpenRouter',
  apiKeyLabel: 'OpenRouter API Key',
  apiKeyPlaceholder: 'sk-or-v1-...',
  docsUrl: 'https://openrouter.ai/keys',
  description: '🌟 One key for 100+ models across all providers',
  models: [
    // Claude via OpenRouter
    { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5', contextWindow: 200000, supportsStreaming: true },
    { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5', contextWindow: 200000, supportsStreaming: true },
    { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5', contextWindow: 200000, supportsStreaming: true },
    
    // GPT via OpenRouter
    { id: 'openai/gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsStreaming: true },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsStreaming: true },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true },
    
    // Gemini via OpenRouter
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', contextWindow: 1000000, supportsStreaming: true },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2000000, supportsStreaming: true },
    { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1000000, supportsStreaming: true },
    
    // Bonus models (only available via OpenRouter)
    { id: 'meta-llama/llama-3.3-70b', name: 'Llama 3.3 70B', contextWindow: 128000, supportsStreaming: true },
    { id: 'mistralai/mistral-large', name: 'Mistral Large', contextWindow: 128000, supportsStreaming: true },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', contextWindow: 64000, supportsStreaming: true },
  ],
};

// Direct provider configurations
export const PROVIDERS: Record<string, ProviderDefinition> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiKeyLabel: 'OpenAI API Key',
    apiKeyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsStreaming: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsStreaming: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385, supportsStreaming: true },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyLabel: 'Anthropic API Key',
    apiKeyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000, supportsStreaming: true },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', contextWindow: 200000, supportsStreaming: true },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000, supportsStreaming: true },
    ],
  },
  google: {
    id: 'google',
    name: 'Google AI',
    apiKeyLabel: 'Google AI API Key',
    apiKeyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', contextWindow: 1000000, supportsStreaming: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2000000, supportsStreaming: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1000000, supportsStreaming: true },
    ],
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    apiKeyLabel: 'Cohere API Key',
    apiKeyPlaceholder: 'your-api-key',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    models: [
      { id: 'command-r-plus', name: 'Command R+', contextWindow: 128000, supportsStreaming: true },
      { id: 'command-r', name: 'Command R', contextWindow: 128000, supportsStreaming: true },
    ],
  },
};

// Integration modes
export type IntegrationMode = 'managed' | 'openrouter' | 'multi-provider' | 'single-provider';

export interface IntegrationModeInfo {
  id: IntegrationMode;
  name: string;
  description: string;
  icon: string;
  setupDifficulty: 'easy' | 'medium' | 'advanced';
  requiredKeys: number;
  proOnly?: boolean;
}

export const INTEGRATION_MODES: Record<IntegrationMode, IntegrationModeInfo> = {
  managed: {
    id: 'managed',
    name: 'Managed Keys',
    description: 'We handle everything. Zero setup, just start testing.',
    icon: '🌟',
    setupDifficulty: 'easy',
    requiredKeys: 0,
    proOnly: true,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'One key for 100+ models. Best BYOK experience.',
    icon: '🔑',
    setupDifficulty: 'easy',
    requiredKeys: 1,
  },
  'multi-provider': {
    id: 'multi-provider',
    name: 'Multi-Provider',
    description: 'Direct API keys for full control and lowest costs.',
    icon: '🔐',
    setupDifficulty: 'advanced',
    requiredKeys: 3,
  },
  'single-provider': {
    id: 'single-provider',
    name: 'Single Provider',
    description: 'Workshop mode - refine prompts with one provider.',
    icon: '🎯',
    setupDifficulty: 'easy',
    requiredKeys: 1,
  },
};

export const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  theme: 'system',
  
  // Default to OpenRouter (best free tier experience)
  integrationMode: 'openrouter',
  
  // API keys (user-provided)
  apiKeys: {},
  
  // Default models per provider
  defaultModels: {},
  
  // Membership info (for managed mode)
  membershipTier: 'free',
  monthlyQuota: 0,
  usageThisMonth: 0,
  
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Get available providers based on integration mode
 */
export function getAvailableProviders(mode: IntegrationMode): ProviderDefinition[] {
  switch (mode) {
    case 'managed':
      // All providers available
      return [...Object.values(PROVIDERS), OPENROUTER_PROVIDER];
    
    case 'openrouter':
      // Only OpenRouter
      return [OPENROUTER_PROVIDER];
    
    case 'multi-provider':
      // All direct providers
      return Object.values(PROVIDERS);
    
    case 'single-provider':
      // All providers, user picks one
      return Object.values(PROVIDERS);
    
    default:
      return [];
  }
}

/**
 * Detect integration mode based on configured keys
 */
export function detectIntegrationMode(apiKeys: Record<string, string>): IntegrationMode {
  const configuredKeys = Object.keys(apiKeys).filter(key => apiKeys[key]);
  
  if (configuredKeys.length === 0) {
    return 'managed'; // Default to managed if no keys
  }
  
  if (configuredKeys.includes('openrouter')) {
    return 'openrouter';
  }
  
  if (configuredKeys.length === 1) {
    return 'single-provider';
  }
  
  if (configuredKeys.length >= 3) {
    return 'multi-provider';
  }
  
  return 'single-provider'; // Fallback
}

/**
 * Get user-friendly mode name
 */
export function getModeName(mode: IntegrationMode, apiKeys: Record<string, string>): string {
  if (mode === 'single-provider') {
    const provider = Object.keys(apiKeys).find(key => apiKeys[key]);
    if (provider && PROVIDERS[provider]) {
      return `${PROVIDERS[provider].name} Workshop`;
    }
  }
  return INTEGRATION_MODES[mode].name;
}
