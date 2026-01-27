import { settingsService } from './settings.service';
import type { Settings, Response as PromptResponse } from '../types';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

interface UnifiedResponse {
  content: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  provider: string;
  latency: number;
  finishReason?: string;
}

/**
 * Unified LLM Service
 * Handles all 4 integration modes:
 * - Managed (Pro tier with pooled keys)
 * - OpenRouter (single key, many models)
 * - Multi-Provider (direct API keys)
 * - Single-Provider (workshop mode)
 */
export class LLMService {
  /**
   * Main entry point - routes to appropriate integration method
   */
  async sendPrompt(
    provider: string,
    model: string,
    messages: Message[],
    options?: LLMOptions
  ): Promise<UnifiedResponse> {
    const settings = await settingsService.getSettings();
    const startTime = Date.now();

    try {
      let response: UnifiedResponse;

      switch (settings.integrationMode) {
        case 'managed':
          response = await this.sendViaManagedKeys(provider, model, messages, options, settings);
          break;

        case 'openrouter':
          response = await this.sendViaOpenRouter(provider, model, messages, options, settings);
          break;

        case 'multi-provider':
        case 'single-provider':
          response = await this.sendViaDirectAPI(provider, model, messages, options, settings);
          break;

        default:
          throw new Error(`Unknown integration mode: ${settings.integrationMode}`);
      }

      response.latency = Date.now() - startTime;
      return response;

    } catch (error) {
      throw this.handleError(error, provider, settings.integrationMode);
    }
  }

  /**
   * Managed Keys - Use Clacky's built-in LLM functions
   */
  private async sendViaManagedKeys(
    provider: string,
    model: string,
    messages: Message[],
    options?: LLMOptions,
    settings?: Settings
  ): Promise<UnifiedResponse> {
    // Check quota
    const hasQuota = await this.checkQuota(settings);
    if (!hasQuota) {
      throw new Error('Monthly quota exceeded. Upgrade your plan or switch to BYOK mode.');
    }

    // Use Clacky's built-in functions
    let response: any;

    switch (provider) {
      case 'anthropic':
        response = await anthropic_complete({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
        });
        break;

      case 'openai':
        response = await openai_complete({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
        });
        break;

      case 'google':
        response = await google_complete({
          model,
          contents: this.formatGeminiMessages(messages),
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
        });
        break;

      default:
        throw new Error(`Provider ${provider} not supported in managed mode`);
    }

    // Track usage
    await this.incrementUsage(settings);

    return this.normalizeResponse(response, provider, model);
  }

  /**
   * OpenRouter - Single key for all models
   */
  private async sendViaOpenRouter(
    provider: string,
    model: string,
    messages: Message[],
    options?: LLMOptions,
    settings?: Settings
  ): Promise<UnifiedResponse> {
    const apiKey = settings?.apiKeys?.openrouter;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured. Please add it in Settings.');
    }

    // OpenRouter uses provider/model format (e.g., "anthropic/claude-sonnet-4-5")
    const openRouterModel = model.includes('/') ? model : `${provider}/${model}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Prompt Lab',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        top_p: options?.topP,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokens: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      model: openRouterModel,
      provider: 'openrouter',
      latency: 0, // Will be set by caller
      finishReason: data.choices[0].finish_reason,
    };
  }

  /**
   * Direct API - User's own keys
   */
  private async sendViaDirectAPI(
    provider: string,
    model: string,
    messages: Message[],
    options?: LLMOptions,
    settings?: Settings
  ): Promise<UnifiedResponse> {
    const apiKey = settings?.apiKeys?.[provider];
    if (!apiKey) {
      throw new Error(`${provider} API key not configured. Please add it in Settings.`);
    }

    // Use Clacky's built-in functions with user's keys
    // This assumes Clacky allows passing custom API keys
    let response: any;

    switch (provider) {
      case 'anthropic':
        response = await anthropic_complete({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
          // If Clacky supports custom keys:
          // apiKey: apiKey,
        });
        break;

      case 'openai':
        response = await openai_complete({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
          // apiKey: apiKey,
        });
        break;

      case 'google':
        response = await google_complete({
          model,
          contents: this.formatGeminiMessages(messages),
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
          // apiKey: apiKey,
        });
        break;

      default:
        throw new Error(`Provider ${provider} not supported`);
    }

    return this.normalizeResponse(response, provider, model);
  }

  /**
   * Normalize different provider response formats
   */
  private normalizeResponse(response: any, provider: string, model: string): UnifiedResponse {
    switch (provider) {
      case 'anthropic':
        return {
          content: response.content || response.completion,
          tokens: {
            input: response.usage?.input_tokens || 0,
            output: response.usage?.output_tokens || 0,
            total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          },
          model,
          provider,
          latency: response._metadata?.latency_ms || 0,
          finishReason: response.stop_reason,
        };

      case 'openai':
        return {
          content: response.choices?.[0]?.message?.content || '',
          tokens: {
            input: response.usage?.prompt_tokens || 0,
            output: response.usage?.completion_tokens || 0,
            total: response.usage?.total_tokens || 0,
          },
          model,
          provider,
          latency: response._metadata?.latency_ms || 0,
          finishReason: response.choices?.[0]?.finish_reason,
        };

      case 'google':
        return {
          content: response.candidates?.[0]?.content || response.text || '',
          tokens: {
            input: response.usage_metadata?.prompt_token_count || 0,
            output: response.usage_metadata?.candidates_token_count || 0,
            total: response.usage_metadata?.total_token_count || 0,
          },
          model,
          provider,
          latency: response._metadata?.latency_ms || 0,
          finishReason: response.candidates?.[0]?.finish_reason,
        };

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Format messages for Gemini (different structure)
   */
  private formatGeminiMessages(messages: Message[]): any[] {
    // Gemini combines system + user into single content
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsg = messages.find(m => m.role === 'user');

    const content = systemMsg
      ? `System: ${systemMsg.content}\n\nUser: ${userMsg?.content || ''}`
      : userMsg?.content || '';

    return [{ parts: [{ text: content }] }];
  }

  /**
   * Check if user has remaining quota (managed mode)
   */
  private async checkQuota(settings?: Settings): Promise<boolean> {
    if (!settings) return false;
    if (settings.membershipTier === 'free') return false;
    
    const { monthlyQuota = 0, usageThisMonth = 0 } = settings;
    return usageThisMonth < monthlyQuota;
  }

  /**
   * Increment usage counter (managed mode)
   */
  private async incrementUsage(settings?: Settings): Promise<void> {
    if (!settings) return;
    
    const newUsage = (settings.usageThisMonth || 0) + 1;
    await settingsService.updateSettings({ usageThisMonth: newUsage });
  }

  /**
   * Handle errors with user-friendly messages
   */
  private handleError(error: any, provider: string, mode: string): Error {
    const status = error.status || error.response?.status;

    if (status === 401) {
      return new Error(`Invalid API key for ${provider}. Please check your settings.`);
    }

    if (status === 429) {
      return new Error(`Rate limited by ${provider}. Please wait a moment and try again.`);
    }

    if (status === 400) {
      return new Error(`Invalid request to ${provider}: ${error.message}`);
    }

    if (mode === 'managed' && error.message?.includes('quota')) {
      return new Error('Monthly quota exceeded. Upgrade or switch to BYOK mode.');
    }

    return new Error(`LLM request failed: ${error.message || 'Unknown error'}`);
  }

  /**
   * Get available models for current integration mode
   */
  async getAvailableModels(): Promise<string[]> {
    const settings = await settingsService.getSettings();
    
    // Return models based on mode and configured keys
    switch (settings.integrationMode) {
      case 'managed':
        return ['all-models-available'];
      
      case 'openrouter':
        return settings.apiKeys.openrouter ? ['100+-openrouter-models'] : [];
      
      case 'multi-provider':
      case 'single-provider':
        const configuredProviders = Object.keys(settings.apiKeys).filter(k => settings.apiKeys[k]);
        return configuredProviders;
      
      default:
        return [];
    }
  }
}

export const llmService = new LLMService();
