import { ModelDefinition } from '../types';

/**
 * Model Curation Configuration
 * Philosophy: Inform users, don't gatekeep. Show betas/previews with badges.
 */
export const ModelCuration = {
  // Hand-picked quality models (update quarterly)
  recommended: [
    // Anthropic (reasoning powerhouses)
    'anthropic/claude-opus-4',
    'anthropic/claude-opus-4.5',
    'anthropic/claude-sonnet-4',
    'anthropic/claude-sonnet-4.5',
    'anthropic/claude-3.7-sonnet',
    'anthropic/claude-3-5-sonnet',
    
    // OpenAI (general purpose)
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo',
    'openai/o1',
    'openai/o1-mini',
    'openai/o1-preview',
    
    // Google (fast, multimodal)
    'google/gemini-2.0-flash-exp',
    'google/gemini-exp-1206',
    'google/gemini-pro-1.5',
    
    // Meta (open source leaders)
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-405b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    
    // DeepSeek (cost-effective reasoning)
    'deepseek/deepseek-chat',
    'deepseek/deepseek-reasoner',
    
    // Mistral (EU, fast)
    'mistralai/mistral-large-2411',
    'mistralai/mistral-small-2409',
    
    // Cohere (enterprise)
    'cohere/command-r-plus',
    'cohere/command-r7b-12-2024',
    
    // Perplexity (research)
    'perplexity/llama-3.1-sonar-large-128k-online',
    
    // Qwen (Chinese, multilingual)
    'qwen/qwen-2.5-72b-instruct',
    
    // X.AI (Grok)
    'x-ai/grok-2-1212',
    'x-ai/grok-beta'
  ],

  // Auto-exclude patterns (actually broken/useless)
  excludePatterns: [
    /vision/i,           // We're text-only for now
    /-vision/,
    /:free$/,            // Unreliable free tiers
    /free$/,
    /:nitro$/,           // Speed variants (clutter)
    /\b(v0)\b/i,         // Ancient deprecated
    /functionary/i,      // Known broken

    // Known broken/deprecated models (HTTP 404)
    /deephermes-3-mistral-24/i,
    /deephermes/i,
    /hermes-3/i
  ],

  // Synthesis-specific models (good at summarization and instruction following)
  synthesisModels: [
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google', strengths: ['Fast', 'Large context', 'JSON structured'] },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', strengths: ['Instruction following', 'Nuanced synthesis', 'Long context'] },
    { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', strengths: ['Reasoning', 'Deep analysis', 'Premium quality'] },
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', strengths: ['Multimodal', 'Balanced', 'Reliable'] },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', strengths: ['Fast', 'Large context', 'Cost effective'] },
    { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', provider: 'Google', strengths: ['Massive context', 'Fast', 'Reasoning'] },
    { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', strengths: ['Open source', 'Large scale', 'Instruction following'] },
    { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', provider: 'Mistral', strengths: ['European', 'Fast', 'Multilingual'] },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', strengths: ['Cost effective', 'Reasoning', 'Code'] }
  ],

  // Capability badges
  badges: {
    reasoning: {
      pattern: /(o1|deepseek-reasoner|claude-opus|claude-3\.7)/i,
      icon: '🧠',
      label: 'Reasoner',
      color: 'purple'
    },
    fast: {
      pattern: /(flash|mini|turbo|haiku|lite)/i,
      icon: '⚡',
      label: 'Fast',
      color: 'amber'
    },
    beta: {
      pattern: /(beta|preview|experimental|exp)/i,
      icon: '⚠️',
      label: 'Beta',
      color: 'orange'
    },
    multilingual: {
      pattern: /(qwen|yi|01-ai|aya)/i,
      icon: '🌏',
      label: 'Multilingual',
      color: 'blue'
    }
  },

  minimumContextLength: 8000,
  
  trustedProviders: [
    'anthropic', 'openai', 'google', 'meta-llama',
    'mistralai', 'cohere', 'deepseek', 'perplexity',
    'x-ai', 'qwen', '01-ai'
  ]
};

/**
 * Model Pricing Rates (USD per million tokens)
 * Used for cost calculation in response metrics
 */
export const MODEL_RATES: Record<string, { input: number; output: number }> = {
  // Google
  'google/gemini-2.0-flash-exp': { input: 0.075 / 1000000, output: 0.30 / 1000000 },
  'google/gemini-pro-1.5': { input: 0.075 / 1000000, output: 0.30 / 1000000 },
  'google/gemini-exp-1206': { input: 0.075 / 1000000, output: 0.30 / 1000000 },
  
  // OpenAI
  'openai/gpt-4o': { input: 2.50 / 1000000, output: 10.00 / 1000000 },
  'openai/gpt-4o-mini': { input: 0.15 / 1000000, output: 0.60 / 1000000 },
  'openai/gpt-4-turbo': { input: 10.00 / 1000000, output: 30.00 / 1000000 },
  'openai/o1': { input: 15.00 / 1000000, output: 60.00 / 1000000 },
  'openai/o1-mini': { input: 1.10 / 1000000, output: 4.40 / 1000000 },
  
  // Anthropic
  'anthropic/claude-opus-4': { input: 15.00 / 1000000, output: 75.00 / 1000000 },
  'anthropic/claude-opus-4.5': { input: 15.00 / 1000000, output: 75.00 / 1000000 },
  'anthropic/claude-sonnet-4': { input: 3.00 / 1000000, output: 15.00 / 1000000 },
  'anthropic/claude-sonnet-4.5': { input: 3.00 / 1000000, output: 15.00 / 1000000 },
  'anthropic/claude-3.7-sonnet': { input: 3.00 / 1000000, output: 15.00 / 1000000 },
  'anthropic/claude-3-5-sonnet': { input: 3.00 / 1000000, output: 15.00 / 1000000 },
  
  // Meta
  'meta-llama/llama-3.1-405b-instruct': { input: 0.50 / 1000000, output: 0.50 / 1000000 },
  'meta-llama/llama-3.1-70b-instruct': { input: 0.20 / 1000000, output: 0.20 / 1000000 },
  'meta-llama/llama-3.3-70b-instruct': { input: 0.20 / 1000000, output: 0.20 / 1000000 },
  
  // DeepSeek
  'deepseek/deepseek-chat': { input: 0.14 / 1000000, output: 0.28 / 1000000 },
  'deepseek/deepseek-reasoner': { input: 0.55 / 1000000, output: 2.19 / 1000000 },
  
  // Mistral
  'mistralai/mistral-large-2411': { input: 2.00 / 1000000, output: 6.00 / 1000000 },
  'mistralai/mistral-small-2409': { input: 0.20 / 1000000, output: 0.60 / 1000000 },
  
  // Cohere
  'cohere/command-r-plus': { input: 3.00 / 1000000, output: 15.00 / 1000000 },
  'cohere/command-r7b-12-2024': { input: 0.50 / 1000000, output: 1.50 / 1000000 },
  
  // Perplexity
  'perplexity/llama-3.1-sonar-large-128k-online': { input: 1.00 / 1000000, output: 1.00 / 1000000 },
  
  // Qwen
  'qwen/qwen-2.5-72b-instruct': { input: 0.90 / 1000000, output: 0.90 / 1000000 },
  
  // X.AI
  'x-ai/grok-2-1212': { input: 2.00 / 1000000, output: 10.00 / 1000000 },
  'x-ai/grok-beta': { input: 5.00 / 1000000, output: 15.00 / 1000000 },
};

/**
 * Calculate cost for a response based on model and token counts
 */
export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const rates = MODEL_RATES[modelId];
  if (!rates) return 0;
  return (inputTokens * rates.input) + (outputTokens * rates.output);
}

/**
 * Calculate tokens per second
 */
export function calculateTPS(tokens: number, timeMs: number): number {
  if (timeMs <= 0) return 0;
  return tokens / (timeMs / 1000);
}

/**
 * Get rates for a model (for display purposes)
 */
export function getModelRates(modelId: string): { input: number; output: number } | null {
  return MODEL_RATES[modelId] || null;
}
export function getModelBadges(model: ModelDefinition) {
  const badges = [];
  
  // Recommended badge
  if (ModelCuration.recommended.includes(model.id)) {
    badges.push({
      icon: '⭐',
      label: 'Recommended',
      color: 'indigo'
    });
  }
  
  // Check capability badges
  for (const [, badge] of Object.entries(ModelCuration.badges)) {
    if (badge.pattern.test(model.id) || badge.pattern.test(model.name)) {
      badges.push(badge);
    }
  }
  
  // Budget badge (cost-based)
  const cost = parseFloat(model.pricing.prompt) * 1000000;
  if (cost > 0 && cost < 0.50) {
    badges.push({
      icon: '💰',
      label: 'Budget',
      color: 'emerald'
    });
  }
  
  return badges;
}

/**
 * Score model for sorting
 */
export function scoreModel(model: ModelDefinition): number {
  let score = 0;
  
  if (ModelCuration.recommended.includes(model.id)) score += 100;
  
  const provider = model.id.split('/')[0];
  if (ModelCuration.trustedProviders.includes(provider)) score += 50;
  
  if (model.context_length >= 128000) score += 20;
  else if (model.context_length >= 32000) score += 10;
  
  if (/-202[4-9]|-2025/.test(model.id)) score += 15;
  
  return score;
}

/**
 * Should exclude this model?
 */
export function shouldExcludeModel(model: ModelDefinition): boolean {
  for (const pattern of ModelCuration.excludePatterns) {
    if (pattern.test(model.id) || pattern.test(model.name)) {
      return true;
    }
  }
  
  if (model.context_length < ModelCuration.minimumContextLength) {
    return true;
  }
  
  return false;
}
