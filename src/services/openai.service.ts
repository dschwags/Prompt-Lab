/**
 * OpenAI API Service
 * Direct integration with OpenAI API (not via OpenRouter)
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
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

export interface SendMessageResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export class OpenAIService {
  private readonly baseURL = 'https://api.openai.com/v1';

  async sendMessage(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string
  ): Promise<SendMessageResponse> {
    const messages: OpenAIMessage[] = [];
    
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

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        } else if (response.status === 400) {
          throw new Error(`Invalid request: ${errorText}`);
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      }

      const data: OpenAIResponse = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
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
      throw new Error('Failed to communicate with OpenAI API');
    }
  }

  /**
   * Get list of available models from OpenAI
   */
  async getModels(apiKey: string): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      // Filter for chat completion models
      const chatModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-3.5'];
      
      return data.data
        .filter((model: any) => chatModels.some(cm => model.id.includes(cm)))
        .map((model: any) => ({
          id: model.id,
          name: model.id.replace(/^(gpt-)/, 'GPT- ').replace(/-/g, ' '),
        }))
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error);
      return [];
    }
  }

  /**
   * Test API key validity
   */
  async testApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    try {
      await this.sendMessage('', 'test', 'gpt-4o-mini', apiKey);
      return {
        valid: true,
        message: 'API key is valid and working',
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Invalid API key',
      };
    }
  }
}

export const openAIService = new OpenAIService();
