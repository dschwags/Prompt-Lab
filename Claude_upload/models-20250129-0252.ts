/**
 * Model Definitions and Catalog
 * Organized by provider for easy selection
 * 
 * FILE: models-20250129-0252.ts
 * INSTALL AS: src/utils/models.ts
 */

export interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  isOpenRouter: boolean;
  description?: string;
}

export interface ModelGroup {
  provider: string;
  models: ModelDefinition[];
}

// Direct Anthropic models (via Anthropic API)
export const ANTHROPIC_DIRECT_MODELS: ModelDefinition[] = [
  {
    id: 'claude-opus-4-20251101',
    name: 'Opus 4.5',
    provider: 'Anthropic',
    isOpenRouter: false,
    description: 'Most capable, best for complex tasks',
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Sonnet 4.5',
    provider: 'Anthropic',
    isOpenRouter: false,
    description: 'Balanced intelligence and speed',
  },
  {
    id: 'claude-haiku-4-20251001',
    name: 'Haiku 4.5',
    provider: 'Anthropic',
    isOpenRouter: false,
    description: 'Fast and cost-effective',
  },
];

// OpenRouter models
export const OPENROUTER_MODELS: ModelDefinition[] = [
  // Anthropic via OpenRouter
  {
    id: 'anthropic/claude-opus-4-5-20251101',
    name: 'Opus 4.5 (OR)',
    provider: 'Anthropic',
    isOpenRouter: true,
  },
  {
    id: 'anthropic/claude-sonnet-4-5-20250929',
    name: 'Sonnet 4.5 (OR)',
    provider: 'Anthropic',
    isOpenRouter: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (OR)',
    provider: 'Anthropic',
    isOpenRouter: true,
  },
  
  // OpenAI
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    isOpenRouter: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    isOpenRouter: true,
  },
  {
    id: 'openai/o1',
    name: 'o1 (Reasoning)',
    provider: 'OpenAI',
    isOpenRouter: true,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    isOpenRouter: true,
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    isOpenRouter: true,
  },
  
  // Google
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    isOpenRouter: true,
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    isOpenRouter: true,
  },
  
  // Meta (Llama)
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    isOpenRouter: true,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    isOpenRouter: true,
  },
  
  // Mistral
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    isOpenRouter: true,
  },
  {
    id: 'mistralai/mistral-medium',
    name: 'Mistral Medium',
    provider: 'Mistral',
    isOpenRouter: true,
  },
  
  // Cohere
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    isOpenRouter: true,
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
  
  // Return in desired order
  const providerOrder = ['Anthropic', 'OpenAI', 'Google', 'Meta', 'Mistral', 'Cohere'];
  
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
