// API Models Service
// Fetches available models per provider for dynamic key-based filtering

// Curated fallback for Anthropic (no public models API)
const ANTHROPIC_MODELS = [
  'anthropic/claude-opus-4',
  'anthropic/claude-sonnet-4',
  'anthropic/claude-3-7-sonnet',
  'anthropic/claude-3-5-sonnet',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-sonnet',
];

// OpenRouter model mappings (for display names)
const MODEL_NAMES: Record<string, string> = {
  'anthropic/claude-opus-4': 'Claude Opus 4',
  'anthropic/claude-sonnet-4': 'Claude Sonnet 4',
  'anthropic/claude-3-7-sonnet': 'Claude 3.7 Sonnet',
  'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet',
  'anthropic/claude-3-haiku': 'Claude 3 Haiku',
  'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
  'openai/gpt-4o': 'GPT-4o',
  'openai/gpt-4o-mini': 'GPT-4o Mini',
  'openai/gpt-4-turbo': 'GPT-4 Turbo',
  'openai/gpt-4': 'GPT-4',
  'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'openai/o1': 'o1',
  'openai/o1-mini': 'o1 Mini',
  'openai/o1-preview': 'o1 Preview',
  'google/gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
  'google/gemini-pro-1.5': 'Gemini 1.5 Pro',
  'google/gemini-1.5-flash': 'Gemini 1.5 Flash',
  'google/gemini-1.5-pro': 'Gemini 1.5 Pro',
  'deepseek/deepseek-chat': 'DeepSeek Chat',
  'deepseek/deepseek-reasoner': 'DeepSeek Reasoner',
  'mistralai/mistral-large-2411': 'Mistral Large',
  'mistralai/mistral-small-2409': 'Mistral Small',
  'mistralai/mistral-nemo': 'Mistral Nemo',
  'meta-llama/llama-3.3-70b-instruct': 'Llama 3.3 70B',
  'meta-llama/llama-3.1-405b-instruct': 'Llama 3.1 405B',
  'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
};

export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
}

export interface ProviderModels {
  provider: string;
  models: AvailableModel[];
  fetchedAt: number;
  expiresIn: number; // hours
}

// Cache available models in localStorage
const MODELS_CACHE_KEY = 'promptlab_available_models';
const CACHE_DURATION_HOURS = 1; // Reduced to 1 hour for faster key changes

// Clear entire cache (useful when keys change)
export function clearModelsCache() {
  try {
    localStorage.removeItem(MODELS_CACHE_KEY);
  } catch {
    // Ignore errors
  }
}

function getCachedModels(provider: string): ProviderModels | null {
  try {
    const cache = localStorage.getItem(MODELS_CACHE_KEY);
    if (!cache) return null;
    
    const parsed: Record<string, ProviderModels> = JSON.parse(cache);
    const cached = parsed[provider];
    if (!cached) return null;
    
    const now = Date.now();
    const ageHours = (now - cached.fetchedAt) / (1000 * 60 * 60);
    
    if (ageHours < cached.expiresIn) {
      return cached;
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function cacheModels(provider: string, models: AvailableModel[], expiresIn = 1) {
  try {
    const cache = localStorage.getItem(MODELS_CACHE_KEY);
    const parsed: Record<string, ProviderModels> = cache ? JSON.parse(cache) : {};
    
    parsed[provider] = {
      provider,
      models,
      fetchedAt: Date.now(),
      expiresIn
    };
    
    localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore cache errors
  }
}

// Fetch from OpenRouter
async function fetchOpenRouterModels(apiKey: string): Promise<AvailableModel[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const models: AvailableModel[] = [];
    
    for (const model of data.data || []) {
      const id = model.id;
      const name = MODEL_NAMES[id] || id;
      
      // Skip if already have a better name
      if (!models.find(m => m.id === id)) {
        models.push({
          id,
          name,
          provider: 'openrouter'
        });
      }
    }
    
    return models;
  } catch {
    return [];
  }
}

// Fetch from OpenAI
async function fetchOpenAIModels(apiKey: string): Promise<AvailableModel[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const allowedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1', 'o1-mini', 'o1-preview'];
    const models: AvailableModel[] = [];
    
    for (const model of data.data || []) {
      if (allowedModels.includes(model.id)) {
        models.push({
          id: `openai/${model.id}`,
          name: MODEL_NAMES[`openai/${model.id}`] || model.id,
          provider: 'openai'
        });
      }
    }
    
    return models;
  } catch {
    return [];
  }
}

// Fetch from Google
async function fetchGoogleModels(apiKey: string): Promise<AvailableModel[]> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const allowedModels = ['gemini-2.0-flash-exp', 'gemini-pro-1.5', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const models: AvailableModel[] = [];
    
    for (const model of data.models || []) {
      const id = model.name?.replace('models/', '');
      if (id && allowedModels.includes(id)) {
        models.push({
          id: `google/${id}`,
          name: MODEL_NAMES[`google/${id}`] || id,
          provider: 'google'
        });
      }
    }
    
    return models;
  } catch {
    return [];
  }
}

// Main function to fetch available models for a provider
// Note: Only OpenRouter works from browser. Other providers require server-side calls.
export async function fetchAvailableModels(
  provider: string,
  apiKey: string
): Promise<AvailableModel[]> {
  // Check cache first
  const cached = getCachedModels(provider);
  if (cached) {
    return cached.models;
  }
  
  let models: AvailableModel[] = [];
  
  switch (provider) {
    case 'openrouter':
      models = await fetchOpenRouterModels(apiKey);
      break;
    case 'openai':
    case 'google':
    case 'anthropic':
      // These APIs don't allow browser calls (CORS)
      // Use curated fallback list
      models = getCuratedModels().filter(m => m.provider === provider);
      break;
    default:
      models = [];
  }
  
  // Cache the results
  cacheModels(provider, models);
  
  return models;
}

// Get all curated models (fallback when no API key)
export function getCuratedModels(): AvailableModel[] {
  return [
    // Anthropic
    { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', provider: 'anthropic' },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic' },
    { id: 'anthropic/claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'anthropic' },
    { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
    
    // OpenAI
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
    { id: 'openai/o1', name: 'o1', provider: 'openai' },
    { id: 'openai/o1-mini', name: 'o1 Mini', provider: 'openai' },
    
    // Google
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'google' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', provider: 'google' },
    
    // OpenRouter extras
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' },
    { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', provider: 'mistralai' },
    { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'meta-llama' },
  ];
}

// Get model display name
export function getModelName(modelId: string): string {
  return MODEL_NAMES[modelId] || modelId.split('/').pop() || modelId;
}
