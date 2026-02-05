// src/data/modelPricing.js

export const MODEL_PRICING = {
  'claude-opus-4': {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    inputPer1M: 15.00,
    outputPer1M: 75.00,
    contextWindow: 200000,
  },
  
  'claude-sonnet-4': {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    contextWindow: 200000,
  },
  
  'claude-haiku-4': {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'anthropic',
    inputPer1M: 0.25,
    outputPer1M: 1.25,
    contextWindow: 200000,
  },
  
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    inputPer1M: 2.50,
    outputPer1M: 10.00,
    contextWindow: 128000,
  },
  
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    inputPer1M: 0.15,
    outputPer1M: 0.60,
    contextWindow: 128000,
  },
  
  'o1': {
    id: 'o1',
    name: 'OpenAI o1',
    provider: 'openai',
    inputPer1M: 15.00,
    outputPer1M: 60.00,
    contextWindow: 200000,
  },
  
  'o1-mini': {
    id: 'o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'openai',
    inputPer1M: 3.00,
    outputPer1M: 12.00,
    contextWindow: 128000,
  },
  
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    inputPer1M: 0.50,
    outputPer1M: 1.50,
    contextWindow: 128000,
  },
  
  'gemini-flash': {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    provider: 'google',
    inputPer1M: 0.10,
    outputPer1M: 0.30,
    contextWindow: 128000,
  },
  
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    inputPer1M: 0.14,
    outputPer1M: 0.28,
    contextWindow: 64000,
  },
  
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    inputPer1M: 0.14,
    outputPer1M: 0.28,
    contextWindow: 64000,
  },
  
  'mixtral-8x7b': {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'mistral',
    inputPer1M: 0.24,
    outputPer1M: 0.24,
    contextWindow: 32000,
  },
  
  'llama-3-70b': {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'meta',
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    contextWindow: 8000,
  },
}

export function getModelPricing(modelId) {
  return MODEL_PRICING[modelId] || {
    id: modelId,
    name: modelId,
    provider: 'unknown',
    inputPer1M: 1.00,
    outputPer1M: 3.00,
    contextWindow: 4000,
  }
}

export function calculateCost(modelId, inputTokens, outputTokens) {
  const pricing = getModelPricing(modelId)
  
  const inputCost = (inputTokens / 1000000) * pricing.inputPer1M
  const outputCost = (outputTokens / 1000000) * pricing.outputPer1M
  
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    breakdown: {
      inputTokens,
      outputTokens,
      inputRate: pricing.inputPer1M,
      outputRate: pricing.outputPer1M,
    },
  }
}

export function estimateTokens(text) {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

export const COST_TIERS = {
  budget: {
    name: 'Budget',
    maxCostPer1M: 1.00,
    models: ['gemini-flash', 'deepseek-chat', 'deepseek-coder', 'gpt-4o-mini', 'claude-haiku-4'],
  },
  standard: {
    name: 'Standard',
    maxCostPer1M: 5.00,
    models: ['gpt-4o', 'claude-sonnet-4', 'gemini-pro', 'o1-mini'],
  },
  premium: {
    name: 'Premium',
    maxCostPer1M: Infinity,
    models: ['claude-opus-4', 'o1'],
  },
}

export function getModelTier(modelId) {
  for (const [tier, config] of Object.entries(COST_TIERS)) {
    if (config.models.includes(modelId)) {
      return tier
    }
  }
  return 'standard'
}
