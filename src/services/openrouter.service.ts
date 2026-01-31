/**
 * OpenRouter API Service
 * Provides access to 200+ models from multiple providers via OpenRouter
 * 
 * FILE: openrouter.service-20250129-0252.ts
 * INSTALL AS: src/services/openrouter.service.ts
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SendMessageResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export class OpenRouterService {
  private readonly baseURL = 'https://openrouter.ai/api/v1';

  async sendMessage(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string
  ): Promise<SendMessageResponse> {
    // Build messages array
    const messages: OpenRouterMessage[] = [];
    
    if (systemPrompt.trim()) {
      messages.push({
        role: 'system',
        content: systemPrompt.trim(),
      });
    }
    
    messages.push({
      role: 'user',
      content: userPrompt.trim(),
    });

    const requestBody: OpenRouterRequest = {
      model,
      messages,
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Prompt Lab',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenRouter API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        } else if (response.status === 402) {
          throw new Error('Insufficient credits. Please add credits to your OpenRouter account.');
        } else {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter');
      }

      return {
        text: data.choices[0].message.content,
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        model: data.model,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with OpenRouter API');
    }
  }

  /**
   * Test API key validity
   */
  async testApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    try {
      await this.sendMessage(
        '',
        'test',
        'openai/gpt-3.5-turbo', // Use cheap model for testing
        apiKey
      );
      return {
        valid: true,
        message: 'Key is valid and working',
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Invalid API key',
      };
    }
  }
}

export const openRouterService = new OpenRouterService();
