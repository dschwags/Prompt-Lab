import { WorkshopSession, AARTemplateId, SynthesisResult } from '../types';
import { aarTemplates } from '../config/aar-templates';

interface ModelInfo {
  id: string;
  provider: 'google' | 'anthropic' | 'openai' | 'meta' | 'mistral' | 'deepseek';
  endpoint: string;
}

const MODEL_CONFIG: Record<string, ModelInfo> = {
  'google/gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    provider: 'google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
  },
  'google/gemini-pro-1.5': {
    id: 'gemini-1.5-pro',
    provider: 'google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  },
  'anthropic/claude-sonnet-4': {
    id: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  'anthropic/claude-opus-4': {
    id: 'claude-opus-4-20250514',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  'openai/gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  'openai/gpt-4-turbo': {
    id: 'gpt-4-turbo',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  'meta-llama/llama-3.1-405b-instruct': {
    id: 'llama-3.1-405b-instruct',
    provider: 'meta',
    endpoint: 'https://api.deepinfra.com/v1/inference/meta-llama/Llama-3.1-405B-Instruct'
  },
  'mistralai/mistral-large-2411': {
    id: 'mistral-large-2411',
    provider: 'mistral',
    endpoint: 'https://api.mistral.ai/v1/chat/completions'
  },
  'deepseek/deepseek-chat': {
    id: 'deepseek-chat',
    provider: 'deepseek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions'
  }
};

class SynthesisService {
  async synthesize(session: WorkshopSession, templateId: AARTemplateId, modelId: string): Promise<SynthesisResult> {
    const template = aarTemplates.find(t => t.id === templateId);
    if (!template) throw new Error(`Unknown template: ${templateId}`);

    const modelConfig = MODEL_CONFIG[modelId];
    if (!modelConfig) throw new Error(`Unsupported model: ${modelId}`);

    const settings = localStorage.getItem('prompt_lab_settings');
    if (!settings) throw new Error('No API keys configured. Please add your API keys in the API Keys menu.');
    
    const parsed = JSON.parse(settings);
    const apiKey = parsed.keys[modelConfig.provider];
    if (!apiKey) throw new Error(`${modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1)} API key required for synthesis. Please add your ${modelConfig.provider} API key in the API Keys menu.`);

    const history = this.buildHistory(session);
    const fullPrompt = `${template.systemPrompt}\n\nSession History:\n${history}`;

    let result: SynthesisResult;

    switch (modelConfig.provider) {
      case 'google':
        result = await this.callGoogle(modelConfig, apiKey, fullPrompt);
        break;
      case 'anthropic':
        result = await this.callAnthropic(modelConfig, apiKey, fullPrompt);
        break;
      case 'openai':
        result = await this.callOpenAI(modelConfig, apiKey, fullPrompt);
        break;
      case 'mistral':
        result = await this.callMistral(modelConfig, apiKey, fullPrompt);
        break;
      case 'deepseek':
        result = await this.callDeepSeek(modelConfig, apiKey, fullPrompt);
        break;
      case 'meta':
        result = await this.callMeta(modelConfig, apiKey, fullPrompt);
        break;
      default:
        throw new Error(`Provider ${modelConfig.provider} not yet supported for synthesis`);
    }

    return result;
  }

  private async callGoogle(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    const response = await fetch(`${modelConfig.endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              insights: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING' },
                    desc: { type: 'STRING' }
                  },
                  required: ['title', 'desc']
                }
              },
              finalPrompt: { type: 'STRING' }
            },
            required: ['insights', 'finalPrompt']
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }

  private async callAnthropic(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: modelConfig.id,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nRespond with a JSON object containing 'insights' (array of {title, desc}) and 'finalPrompt' (string).`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Anthropic response');
    return JSON.parse(jsonMatch[0]);
  }

  private async callOpenAI(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages: [
          {
            role: 'system',
            content: 'You are a prompt synthesis assistant. Output ONLY valid JSON with this structure: { "insights": [{ "title": "string", "desc": "string" }], "finalPrompt": "string" }'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private async callMistral(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages: [
          {
            role: 'system',
            content: 'You are a prompt synthesis assistant. Output ONLY valid JSON with this structure: { "insights": [{ "title": "string", "desc": "string" }], "finalPrompt": "string" }'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mistral API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private async callDeepSeek(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages: [
          {
            role: 'system',
            content: 'You are a prompt synthesis assistant. Output ONLY valid JSON with this structure: { "insights": [{ "title": "string", "desc": "string" }], "finalPrompt": "string" }'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private async callMeta(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a prompt synthesis assistant. Output ONLY valid JSON with this structure: { "insights": [{ "title": "string", "desc": "string" }], "finalPrompt": "string" }'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Meta/Llama API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Meta response');
    return JSON.parse(jsonMatch[0]);
  }

  private buildHistory(session: WorkshopSession): string {
    const lines: string[] = [];
    lines.push('=== Original Prompt ===');
    if (session.promptData.system) lines.push(`System: ${session.promptData.system}`);
    lines.push(`User: ${session.promptData.user}`);
    
    if (session.clackyContext) {
      lines.push('');
      lines.push('=== Project Context ===');
      lines.push(`Project: ${session.clackyContext.projectName}`);
      lines.push(`Framework: ${session.clackyContext.context.framework}`);
      lines.push(`Language: ${session.clackyContext.context.language}`);
    }
    
    session.iterations.forEach(iteration => {
      lines.push('');
      lines.push(`=== Iteration ${iteration.number} ${iteration.status === 'completed' ? '(Completed)' : '(Active)'} ===`);
      if (iteration.lockedModelId) lines.push(`Locked to: ${iteration.lockedModelId}`);
      iteration.rounds.forEach(round => {
        lines.push('');
        lines.push(`--- Round ${round.number} (${round.type}) ---`);
        if (round.pivot) lines.push(`Human Pivot: "${round.pivot}"`);
        round.responses.forEach(response => {
          if (response.status === 'success') {
            lines.push(`\n[${response.model}]:`);
            lines.push(response.text.substring(0, 500) + '...');
          }
        });
      });
    });
    return lines.join('\n');
  }
}

export const synthesisService = new SynthesisService();
