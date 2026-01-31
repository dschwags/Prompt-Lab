/**
 * Unified API Service
 * Handles all LLM providers (Claude, OpenAI, Google, OpenRouter)
 */

import { sendPromptToClaude } from './api.service';
import { openAIService, type SendMessageResponse } from './openai.service';
import { googleAIService, type SendMessageResponse as GoogleSendMessageResponse } from './google.service';
import { openRouterService } from './openrouter.service';
import { PROVIDERS } from '../constants/providers';
import { OPENROUTER_MODELS } from '../utils/models';
import type { ModelInfo } from '../types';

// Re-export provider type for convenience
export type LLMProvider = 'anthropic' | 'openai' | 'google' | 'openrouter';

export interface UnifiedResponse {
  text: string;
  model: string;
  provider: LLMProvider;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  responseTimeMs: number;
}

// Provider pricing per 1M tokens (USD)
const PRICING: Record<LLMProvider, { input: number; output: number }> = {
  anthropic: { input: 3, output: 15 },    // Claude
  openai: { input: 2.5, output: 10 },     // GPT-4o
  google: { input: 0.125, output: 0.5 },  // Gemini
  openrouter: { input: 0.15, output: 0.6 }, // Dynamic (approximate)
};

// Sanitize API key to remove non-ASCII characters
function sanitizeApiKey(key: string): string {
  return key.replace(/[^\x00-\x7F]/g, '').trim();
}

export class UnifiedAPIService {
  /**
   * Send prompt to any supported model
   */
  async sendPrompt(
    systemPrompt: string,
    userPrompt: string,
    modelId: string,
    apiKey: string,
    provider: LLMProvider
  ): Promise<UnifiedResponse> {
    const startTime = Date.now();
    const sanitizedKey = sanitizeApiKey(apiKey);

    try {
      let result: SendMessageResponse | GoogleSendMessageResponse;

      switch (provider) {
        case 'anthropic':
          const claudeResult = await sendPromptToClaude(systemPrompt, userPrompt, sanitizedKey, modelId);
          result = {
            text: claudeResult.content,
            inputTokens: claudeResult.tokensIn,
            outputTokens: claudeResult.tokensOut,
            model: claudeResult.model,
          };
          break;
          
        case 'openai':
          result = await openAIService.sendMessage(systemPrompt, userPrompt, modelId, sanitizedKey);
          break;
          
        case 'google':
          result = await googleAIService.sendMessage(systemPrompt, userPrompt, modelId, sanitizedKey);
          break;
          
        case 'openrouter':
          result = await openRouterService.sendMessage(systemPrompt, userPrompt, modelId, sanitizedKey);
          break;
          
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const endTime = Date.now();
      const responseTimeMs = endTime - startTime;

      // Calculate cost
      const pricing = PRICING[provider];
      const cost = 
        (result.inputTokens / 1_000_000) * pricing.input +
        (result.outputTokens / 1_000_000) * pricing.output;

      return {
        text: result.text,
        model: result.model,
        provider,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        cost,
        responseTimeMs,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to get response from ${provider}`);
    }
  }

  /**
   * Send prompt to multiple models in parallel
   */
  async sendToMultiple(
    systemPrompt: string,
    userPrompt: string,
    models: Array<{ modelId: string; provider: LLMProvider }>,
    apiKeys: Record<LLMProvider, string>
  ): Promise<UnifiedResponse[]> {
    const results = await Promise.all(
      models.map(async ({ modelId, provider }) => {
        const apiKey = apiKeys[provider];
        if (!apiKey) {
          throw new Error(`No API key configured for ${provider}`);
        }
        return this.sendPrompt(systemPrompt, userPrompt, modelId, apiKey, provider);
      })
    );
    return results;
  }

  /**
   * Get all available models
   */
  getAllModels(): ModelInfo[] {
    const models: ModelInfo[] = [];

    // Anthropic models
    const anthropicProvider = Object.values(PROVIDERS).find(p => p.id === 'anthropic');
    anthropicProvider?.models.forEach(model => {
      models.push({
        id: model.id,
        name: model.name,
        contextWindow: model.contextWindow,
        supportsStreaming: model.supportsStreaming,
      });
    });

    // OpenAI models
    const openaiProvider = Object.values(PROVIDERS).find(p => p.id === 'openai');
    openaiProvider?.models.forEach(model => {
      models.push({
        id: model.id,
        name: model.name,
        contextWindow: model.contextWindow,
        supportsStreaming: model.supportsStreaming,
      });
    });

    // Google models
    const googleProvider = Object.values(PROVIDERS).find(p => p.id === 'google');
    googleProvider?.models.forEach(model => {
      models.push({
        id: model.id,
        name: model.name,
        contextWindow: model.contextWindow,
        supportsStreaming: model.supportsStreaming,
      });
    });

    return models;
  }

  /**
   * Get models grouped by provider
   */
  getModelsByProvider(): Record<LLMProvider, ModelInfo[]> {
    const grouped: Record<LLMProvider, ModelInfo[]> = {
      anthropic: [],
      openai: [],
      google: [],
      openrouter: [],
    };

    // Add models from providers
    const anthropicProvider = Object.values(PROVIDERS).find(p => p.id === 'anthropic');
    anthropicProvider?.models.forEach(model => {
      grouped.anthropic.push({
        id: model.id,
        name: model.name,
        contextWindow: model.contextWindow,
        supportsStreaming: model.supportsStreaming,
      });
    });

    const openaiProvider = Object.values(PROVIDERS).find(p => p.id === 'openai');
    openaiProvider?.models.forEach(model => {
      grouped.openai.push({
        id: model.id,
        name: model.name,
        contextWindow: model.contextWindow,
        supportsStreaming: model.supportsStreaming,
      });
    });

    const googleProvider = Object.values(PROVIDERS).find(p => p.id === 'google');
    googleProvider?.models.forEach(model => {
      grouped.google.push({
        id: model.id,
        name: model.name,
        contextWindow: model.contextWindow,
        supportsStreaming: model.supportsStreaming,
      });
    });

    // OpenRouter models - use verified models from models.ts
    OPENROUTER_MODELS.forEach(model => {
      grouped.openrouter.push({
        id: model.id,
        name: model.name,
        contextWindow: 128000, // Default for most OpenRouter models
        supportsStreaming: true,
      });
    });

    return grouped;
  }

  /**
   * Test API key for a provider
   */
  async testApiKey(
    provider: LLMProvider,
    apiKey: string
  ): Promise<{ valid: boolean; message: string }> {
    const sanitizedKey = sanitizeApiKey(apiKey);
    
    switch (provider) {
      case 'anthropic':
        try {
          await sendPromptToClaude('', 'test', sanitizedKey, 'claude-haiku-4-5-20251001');
          return { valid: true, message: 'Anthropic API key is valid' };
        } catch (error) {
          return { valid: false, message: error instanceof Error ? error.message : 'Invalid key' };
        }
        
      case 'openai':
        return await openAIService.testApiKey(sanitizedKey);
        
      case 'google':
        return await googleAIService.testApiKey(sanitizedKey);
        
      case 'openrouter':
        return await openRouterService.testApiKey(sanitizedKey);
        
      default:
        return { valid: false, message: 'Unknown provider' };
    }
  }

  /**
   * Get API key storage key for a provider
   */
  getApiKeyStorageKey(provider: LLMProvider): string {
    const keyMap: Record<LLMProvider, string> = {
      anthropic: 'apiKey_anthropic',
      openai: 'apiKey_openai',
      google: 'apiKey_google',
      openrouter: 'apiKey_openrouter',
    };
    return keyMap[provider];
  }

  /**
   * Get API key for a provider
   */
  getApiKey(provider: LLMProvider): string | null {
    return localStorage.getItem(this.getApiKeyStorageKey(provider));
  }

  /**
   * Set API key for a provider
   */
  setApiKey(provider: LLMProvider, key: string): void {
    localStorage.setItem(this.getApiKeyStorageKey(provider), key);
  }
}

export const unifiedAPIService = new UnifiedAPIService();
