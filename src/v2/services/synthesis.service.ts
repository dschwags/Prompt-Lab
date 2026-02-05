import { WorkshopSession, AARTemplateId, SynthesisResult } from '../types';
import { aarTemplates } from '../config/aar-templates';

interface ModelInfo {
  id: string;
  // All models route through OpenRouter for browser compatibility
  provider: 'openrouter';
  endpoint: string;
}

const MODEL_CONFIG: Record<string, ModelInfo> = {
  // All models route through OpenRouter (browser-compatible)
  // Using OpenRouter's model ID format
  'google/gemini-2.0-flash-exp': {
    id: 'google/gemini-2.0-flash-exp',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  'google/gemini-pro-1.5': {
    id: 'gemini-1.5-pro',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  // Anthropic models - use OpenRouter's ID format
  'anthropic/claude-sonnet-4': {
    id: 'anthropic/claude-sonnet-4-20250514',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  'anthropic/claude-opus-4': {
    id: 'anthropic/claude-opus-4-20250514',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  // OpenAI models - use OpenRouter's ID format
  'openai/gpt-4o': {
    id: 'gpt-4o',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  'openai/gpt-4-turbo': {
    id: 'gpt-4-turbo',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  'meta-llama/llama-3.1-405b-instruct': {
    id: 'llama-3.1-405b-instruct',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  'mistralai/mistral-large-2411': {
    id: 'mistral-large-2411',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  'deepseek/deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
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
    // All models now use OpenRouter for browser compatibility
    const apiKey = parsed.keys.openrouter;
    if (!apiKey) throw new Error('OpenRouter API key required for synthesis. Please add your OpenRouter API key in the API Keys menu.');

    const history = this.buildHistory(session);
    const fullPrompt = `${template.systemPrompt}\n\nSession History:\n${history}`;

    return this.callOpenRouter(modelConfig, apiKey, fullPrompt);
  }

  private async callOpenRouter(modelConfig: ModelInfo, apiKey: string, prompt: string): Promise<SynthesisResult> {
    try {
      const response = await fetch(modelConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://promptlab.ai',
          'X-Title': 'Prompt Lab v2'
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
        console.error('OpenRouter API error:', response.status, response.statusText, error);
        throw new Error(`OpenRouter API error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err: any) {
      console.error('OpenRouter fetch error:', err);
      throw new Error(`API call failed: ${err.message || 'Unknown error'}`);
    }
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
