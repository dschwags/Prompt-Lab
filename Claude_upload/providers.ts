import type { Settings, ModelInfo } from '../types';

export interface ProviderDefinition {
  id: string;
  name: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  models: ModelInfo[];
  docsUrl: string;
}

export const PROVIDERS: Record<string, ProviderDefinition> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiKeyLabel: 'OpenAI API Key',
    apiKeyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsStreaming: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsStreaming: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385, supportsStreaming: true },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyLabel: 'Anthropic API Key',
    apiKeyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000, supportsStreaming: true },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', contextWindow: 200000, supportsStreaming: true },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000, supportsStreaming: true },
    ],
  },
  google: {
    id: 'google',
    name: 'Google AI',
    apiKeyLabel: 'Google AI API Key',
    apiKeyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', contextWindow: 1000000, supportsStreaming: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2000000, supportsStreaming: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1000000, supportsStreaming: true },
    ],
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    apiKeyLabel: 'Cohere API Key',
    apiKeyPlaceholder: 'your-api-key',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    models: [
      { id: 'command-r-plus', name: 'Command R+', contextWindow: 128000, supportsStreaming: true },
      { id: 'command-r', name: 'Command R', contextWindow: 128000, supportsStreaming: true },
    ],
  },
};

export const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  theme: 'system',
  apiKeys: {},
  defaultModels: {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
