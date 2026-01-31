/**
 * Google Gemini API Service
 * Direct integration with Google AI Studio / Gemini API
 */

interface GoogleMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GoogleRequest {
  contents: GoogleMessage[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface SendMessageResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export class GoogleAIService {
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  async sendMessage(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string
  ): Promise<SendMessageResponse> {
    // Build contents array
    const contents: GoogleMessage[] = [];
    
    if (systemPrompt.trim()) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt.trim() }]
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt.trim() }]
    });

    const requestBody: GoogleRequest = {
      contents,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    };

    try {
      const response = await fetch(
        `${this.baseURL}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google AI API error:', response.status, errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid request or model not found');
        } else if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        } else {
          throw new Error(`Google AI API error: ${response.status}`);
        }
      }

      const data: GoogleResponse = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Google AI');
      }

      const text = data.candidates[0].content.parts
        .map(part => part.text)
        .join('\n');

      return {
        text,
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        model,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with Google AI API');
    }
  }

  /**
   * Get list of available models from Google
   */
  async getModels(apiKey: string): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(
        `${this.baseURL}/models?key=${apiKey}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      // Filter for gemini models
      return data.models
        ?.filter((model: any) => model.name?.includes('gemini'))
        ?.map((model: any) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name,
        }))
        ?.slice(0, 10) || [];
    } catch (error) {
      console.error('Failed to fetch Google models:', error);
      return [];
    }
  }

  /**
   * Test API key validity
   */
  async testApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    try {
      await this.sendMessage('', 'test', 'gemini-1.5-flash', apiKey);
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

export const googleAIService = new GoogleAIService();
