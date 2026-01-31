/**
 * Model Definitions - WITH CHINESE MODELS
 * 
 * FILE: models-20250129-0400-WITH-CHINESE.ts
 * INSTALL AS: src/utils/models.ts
 * 
 * ADDITIONS:
 * - 5 Chinese models (DeepSeek, Qwen)
 * - Clear 🇨🇳 flag in model names
 * - Region field for transparency
 * - Geographic diversity for personality testing
 * 
 * Total: 27 models across 7 providers
 */

export interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  isOpenRouter: boolean;
  region?: 'US' | 'EU' | 'China' | 'Global';  // NEW: Geopolitical transparency
  description?: string;
}

export interface ModelGroup {
  provider: string;
  models: ModelDefinition[];
}

// Direct Anthropic models (via Anthropic API) - WORKING ✅
export const ANTHROPIC_DIRECT_MODELS: ModelDefinition[] = [
  {
    id: 'claude-opus-4-20251101',
    name: 'Opus 4.5 🇺🇸',
    provider: 'Anthropic',
    region: 'US',
    isOpenRouter: false,
    description: 'Most capable, best for complex tasks',
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Sonnet 4.5 🇺🇸',
    provider: 'Anthropic',
    region: 'US',
    isOpenRouter: false,
    description: 'Balanced intelligence and speed',
  },
  {
    id: 'claude-haiku-4-20251001',
    name: 'Haiku 4.5 🇺🇸',
    provider: 'Anthropic',
    region: 'US',
    isOpenRouter: false,
    description: 'Fast and cost-effective',
  },
];

// OpenRouter models - ALL VERIFIED ✅
export const OPENROUTER_MODELS: ModelDefinition[] = [
  // Anthropic via OpenRouter
  {
    id: 'anthropic/claude-opus-4.5',
    name: 'Opus 4.5 🇺🇸 (OR)',
    provider: 'Anthropic',
    region: 'US',
    isOpenRouter: true,
    description: 'Via OpenRouter',
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Sonnet 4.5 🇺🇸 (OR)',
    provider: 'Anthropic',
    region: 'US',
    isOpenRouter: true,
    description: 'Via OpenRouter',
  },
  
  // OpenAI - CONFIRMED WORKING ✅
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo 🇺🇸',
    provider: 'OpenAI',
    region: 'US',
    isOpenRouter: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o 🇺🇸',
    provider: 'OpenAI',
    region: 'US',
    isOpenRouter: true,
  },
  {
    id: 'openai/o1',
    name: 'o1 🇺🇸 (Reasoning)',
    provider: 'OpenAI',
    region: 'US',
    isOpenRouter: true,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini 🇺🇸',
    provider: 'OpenAI',
    region: 'US',
    isOpenRouter: true,
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo 🇺🇸',
    provider: 'OpenAI',
    region: 'US',
    isOpenRouter: true,
  },
  
  // Google (Gemini) - CORRECT IDs ✅
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro 🇺🇸',
    provider: 'Google',
    region: 'US',
    isOpenRouter: true,
    description: 'Advanced reasoning & thinking',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash 🇺🇸',
    provider: 'Google',
    region: 'US',
    isOpenRouter: true,
    description: 'Fast with thinking capabilities',
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview 🇺🇸',
    provider: 'Google',
    region: 'US',
    isOpenRouter: true,
    description: 'Latest flagship model',
  },
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview 🇺🇸',
    provider: 'Google',
    region: 'US',
    isOpenRouter: true,
    description: 'High-speed thinking model',
  },
  
  // Meta (Llama) - CONFIRMED WORKING ✅
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B 🇺🇸',
    provider: 'Meta',
    region: 'US',
    isOpenRouter: true,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B 🇺🇸',
    provider: 'Meta',
    region: 'US',
    isOpenRouter: true,
  },
  
  // Mistral - CONFIRMED WORKING ✅
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large 🇪🇺',
    provider: 'Mistral',
    region: 'EU',
    isOpenRouter: true,
  },
  {
    id: 'mistralai/mistral-medium',
    name: 'Mistral Medium 🇪🇺',
    provider: 'Mistral',
    region: 'EU',
    isOpenRouter: true,
  },
  
  // Cohere - CORRECT IDs ✅
  {
    id: 'cohere/command-a',
    name: 'Command A 🇺🇸',
    provider: 'Cohere',
    region: 'US',
    isOpenRouter: true,
    description: '111B model for agents',
  },
  {
    id: 'cohere/command-r7b-12-2024',
    name: 'Command R7B 🇺🇸',
    provider: 'Cohere',
    region: 'US',
    isOpenRouter: true,
    description: 'Small, fast, great for RAG',
  },
  {
    id: 'cohere/command-r-08-2024',
    name: 'Command R 🇺🇸',
    provider: 'Cohere',
    region: 'US',
    isOpenRouter: true,
    description: '35B multilingual model',
  },
  {
    id: 'cohere/command-r-plus-08-2024',
    name: 'Command R+ 🇺🇸',
    provider: 'Cohere',
    region: 'US',
    isOpenRouter: true,
    description: '104B flagship model',
  },
  
  // ========================================
  // 🇨🇳 CHINESE MODELS - NEW ADDITIONS
  // ========================================
  
  // DeepSeek - Chinese flagship models
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek V3.1 🇨🇳',
    provider: 'DeepSeek',
    region: 'China',
    isOpenRouter: true,
    description: 'Chinese flagship, rivals GPT-4',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 🇨🇳',
    provider: 'DeepSeek',
    region: 'China',
    isOpenRouter: true,
    description: 'Reasoning model, rivals o1',
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'DeepSeek R1T Chimera 🇨🇳 (FREE)',
    provider: 'DeepSeek',
    region: 'China',
    isOpenRouter: true,
    description: 'Free reasoning model',
  },
  
  // Qwen - Chinese MoE models from Alibaba
  {
    id: 'qwen/qwen3-30b-a3b',
    name: 'Qwen3 30B 🇨🇳',
    provider: 'Qwen',
    region: 'China',
    isOpenRouter: true,
    description: 'Chinese MoE, thinking mode',
  },
  {
    id: 'qwen/qwq-32b',
    name: 'QwQ 32B 🇨🇳',
    provider: 'Qwen',
    region: 'China',
    isOpenRouter: true,
    description: 'Chinese reasoning model',
  },
];

// Combine all models
export const ALL_MODELS = [...ANTHROPIC_DIRECT_MODELS, ...OPENROUTER_MODELS];

// Group models by provider for display
export function getModelGroups(): ModelGroup[] {
  const groups: { [provider: string]: ModelDefinition[] } = {};
  
  ALL_MODELS.forEach((model) => {
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
  });
  
  // Return in desired order (Western first, then Chinese)
  const providerOrder = [
    'Anthropic',
    'OpenAI', 
    'Google', 
    'Meta', 
    'Mistral', 
    'Cohere',
    'DeepSeek',  // Chinese
    'Qwen',      // Chinese
  ];
  
  return providerOrder
    .filter((provider) => groups[provider])
    .map((provider) => ({
      provider,
      models: groups[provider],
    }));
}

// Find model by ID
export function findModel(modelId: string): ModelDefinition | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

// Check if model requires OpenRouter
export function requiresOpenRouter(modelId: string): boolean {
  const model = findModel(modelId);
  return model?.isOpenRouter || false;
}

// NEW: Check if model is from China (for UI warnings)
export function isChineseModel(modelId: string): boolean {
  const model = findModel(modelId);
  return model?.region === 'China';
}

// NEW: Get region badge for UI
export function getRegionBadge(region?: string): string {
  switch (region) {
    case 'China':
      return '🇨🇳';
    case 'EU':
      return '🇪🇺';
    case 'US':
      return '🇺🇸';
    default:
      return '';
  }
}
