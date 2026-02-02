import { calculateCost } from '../config/model-curation';

interface APIResponseMetrics {
  time: number;
  cost: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
}

interface APIResponse {
  text: string;
  metrics: APIResponseMetrics;
}

interface APIRequest {
  provider: 'anthropic' | 'openai' | 'google' | 'openrouter';
  model: string;
  messages: { system?: string; user: string; };
}

class UnifiedAPIService {
  private baseUrls = {
    anthropic: 'https://api.anthropic.com/v1/messages',
    openai: 'https://api.openai.com/v1/chat/completions',
    google: 'https://generativelanguage.googleapis.com/v1beta/models',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions'
  };

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    backoff = 1000
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw error;
    }
  }

  private getApiKey(provider: APIRequest['provider']): string {
    const settings = localStorage.getItem('prompt_lab_settings');
    if (!settings) throw new Error('No API keys configured');
    const parsed = JSON.parse(settings);
    const key = parsed.keys[provider];
    if (!key) throw new Error(`Missing API key for ${provider}`);
    return key;
  }

  async sendPrompt(request: APIRequest): Promise<APIResponse> {
    const startTime = Date.now();
    try {
      let text: string;
      let inputTokens = 0;
      let outputTokens = 0;
      switch (request.provider) {
        case 'anthropic': 
          ({ text, inputTokens, outputTokens } = await this.callAnthropic(request)); 
          break;
        case 'openai': 
          ({ text, inputTokens, outputTokens } = await this.callOpenAI(request)); 
          break;
        case 'google': 
          ({ text, inputTokens, outputTokens } = await this.callGoogle(request)); 
          break;
        case 'openrouter': 
          ({ text, inputTokens, outputTokens } = await this.callOpenRouter(request)); 
          break;
      }
      
      const time = (Date.now() - startTime) / 1000;
      const cost = calculateCost(request.model, inputTokens, outputTokens);
      const tokens = inputTokens + outputTokens;
      
      return { 
        text, 
        metrics: { 
          time, 
          cost, 
          tokens,
          inputTokens,
          outputTokens 
        } 
      };
    } catch (error: any) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  private async callAnthropic(request: APIRequest): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const apiKey = this.getApiKey('anthropic');
    const response = await this.fetchWithRetry(this.baseUrls.anthropic, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: 4096,
        messages: [
          ...(request.messages.system ? [{ role: 'system', content: request.messages.system }] : []),
          { role: 'user', content: request.messages.user }
        ]
      })
    });
    const data = await response.json();
    return { 
      text: data.content[0].text, 
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0
    };
  }

  private async callOpenAI(request: APIRequest): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const apiKey = this.getApiKey('openai');
    const response = await this.fetchWithRetry(this.baseUrls.openai, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.messages.system ? [{ role: 'system', content: request.messages.system }] : []),
          { role: 'user', content: request.messages.user }
        ]
      })
    });
    const data = await response.json();
    return { 
      text: data.choices[0].message.content, 
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0
    };
  }

  private async callGoogle(request: APIRequest): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const apiKey = this.getApiKey('google');
    const url = `${this.baseUrls.google}/${request.model}:generateContent?key=${apiKey}`;
    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: request.messages.user }] }],
        systemInstruction: request.messages.system ? { parts: [{ text: request.messages.system }] } : undefined
      })
    });
    const data = await response.json();
    const inputEst = Math.ceil((request.messages.system?.length || 0 + request.messages.user.length) / 4);
    const outputEst = Math.ceil(data.candidates[0].content.parts[0].text.length / 4);
    return { 
      text: data.candidates[0].content.parts[0].text, 
      inputTokens: inputEst,
      outputTokens: outputEst
    };
  }

  private async callOpenRouter(request: APIRequest): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const apiKey = this.getApiKey('openrouter');
    const response = await this.fetchWithRetry(this.baseUrls.openrouter, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://promptlab.ai',
        'X-Title': 'Prompt Lab v2'
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.messages.system ? [{ role: 'system', content: request.messages.system }] : []),
          { role: 'user', content: request.messages.user }
        ]
      })
    });
    const data = await response.json();
    return { 
      text: data.choices[0].message.content, 
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0
    };
  }

  async fetchOpenRouterModels(): Promise<any[]> {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    return data.data || [];
  }
}

export const apiService = new UnifiedAPIService();
