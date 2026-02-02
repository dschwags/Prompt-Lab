/**
 * Prompt Editor with Multi-Provider Support
 * Supports: Anthropic (Claude), OpenAI (GPT), Google (Gemini), OpenRouter
 */

import { useState, useCallback, useEffect } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { TokenCounter } from './TokenCounter';
import { ResponseViewer } from './ResponseViewer';
import { unifiedAPIService, type LLMProvider } from '../../services/unified-api.service';
import { WorkshopModeV2 } from '../Workshop/WorkshopModeV2';
import { ComparisonView } from './ComparisonView';

export function PromptEditor() {
  const {
    systemPrompt,
    setSystemPrompt,
    userPrompt,
    setUserPrompt,
  } = usePrompt();

  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Provider selection
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(() => {
    return (localStorage.getItem('selectedProvider') as LLMProvider) || 'anthropic';
  });

  // Model selection
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || 'claude-sonnet-4-5-20250929';
  });

  // Save selections
  useEffect(() => {
    localStorage.setItem('selectedProvider', selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  // Get models for current provider
  const modelsByProvider = unifiedAPIService.getModelsByProvider();
  const currentModels = modelsByProvider[selectedProvider] || [];

  // Set default model when provider changes
  useEffect(() => {
    if (currentModels.length > 0 && !currentModels.find(m => m.id === selectedModel)) {
      setSelectedModel(currentModels[0].id);
    }
  }, [selectedProvider, currentModels, selectedModel]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value as LLMProvider);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleSend = useCallback(async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      const apiKey = unifiedAPIService.getApiKey(selectedProvider);
      
      if (!apiKey) {
        throw new Error(`Please add your ${selectedProvider} API key in Settings`);
      }

      const result = await unifiedAPIService.sendPrompt(
        systemPrompt,
        userPrompt,
        selectedModel,
        apiKey,
        selectedProvider
      );

      const displayData = {
        text: result.text,
        model: result.model,
        timeSeconds: result.responseTimeMs / 1000,
        cost: result.cost,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      };

      setResponse(displayData);

      // Save to storage (background)
      console.log('Response saved:', displayData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Send error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [systemPrompt, userPrompt, selectedModel, selectedProvider]);

  // Keyboard shortcut: Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) {
          handleSend();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSend, isLoading]);

  const currentModelInfo = currentModels.find(m => m.id === selectedModel);

  // Workshop mode state
  const [isWorkshopMode, setIsWorkshopMode] = useState<boolean>(() => {
    return localStorage.getItem('promptlab_workshopMode') === 'true';
  });

  // Comparison mode state
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(() => {
    return localStorage.getItem('promptlab_comparisonMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('promptlab_workshopMode', isWorkshopMode.toString());
  }, [isWorkshopMode]);

  useEffect(() => {
    localStorage.setItem('promptlab_comparisonMode', isComparisonMode.toString());
  }, [isComparisonMode]);

  // If in workshop mode, render workshop interface V2
  if (isWorkshopMode) {
    return (
      <WorkshopModeV2
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
        onSystemPromptChange={setSystemPrompt}
        onUserPromptChange={setUserPrompt}
        onExit={() => setIsWorkshopMode(false)}
      />
    );
  }

  // If in comparison mode, render comparison interface
  if (isComparisonMode) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 min-h-full">
        <ComparisonView
          systemPrompt={systemPrompt}
          userPrompt={userPrompt}
          onSystemPromptChange={setSystemPrompt}
          onUserPromptChange={setUserPrompt}
          onExit={() => setIsComparisonMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-50">Prompt Editor</h2>
        <div className="flex items-center gap-4">
          <TokenCounter characterCount={systemPrompt.length + userPrompt.length} label="Total" />
          {/* Comparison Mode - The Big Feature */}
          <div className="relative group">
            <button
              onClick={() => setIsComparisonMode(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-900/30 flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Compare</span>
            </button>
            {/* Rollover Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="text-sm font-medium text-white mb-1">🔄 Comparison Mode</p>
              <p className="text-xs text-zinc-200">
                Compare 2-3 models side-by-side, see AI analysis, and let models discuss each other's responses.
              </p>
              <div className="mt-2 pt-2 border-t border-zinc-600">
                <p className="text-xs text-blue-400">✨ The big ticket item!</p>
              </div>
            </div>
          </div>
          {/* Workshop Mode */}
          <div className="relative group">
            <button
              onClick={() => setIsWorkshopMode(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span>🧪</span>
              <span>Workshop</span>
            </button>
            {/* Rollover Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="text-sm font-medium text-white mb-1">🧪 Workshop Mode</p>
              <p className="text-xs text-zinc-200">
                Test prompts across multiple models simultaneously. Great for batch experiments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Prompt (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          System Prompt (optional)
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Enter system-level instructions (role, behavior, constraints)..."
          className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
        />
      </div>

      {/* User Prompt */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          User Prompt
        </label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Enter your prompt... (Press ⌘+Enter to send)"
          className="w-full h-48 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
        />
      </div>

      {/* Provider + Model Selection */}
      <div className="flex items-center gap-3">
        <div className="w-40">
          <select
            value={selectedProvider}
            onChange={handleProviderChange}
            className="w-full px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="anthropic">🦙 Anthropic</option>
            <option value="openai">🔵 OpenAI</option>
            <option value="google">🔷 Google</option>
            <option value="openrouter">🌐 OpenRouter</option>
          </select>
        </div>

        <div className="flex-1">
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {currentModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.contextWindow >= 1000000 ? `${model.contextWindow / 1000000}M` : `${model.contextWindow / 1000}K`})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSend}
          disabled={isLoading || !userPrompt.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {isLoading ? 'Sending...' : 'Send (⌘↵)'}
        </button>
      </div>

      {/* Selected Model Info */}
      {currentModelInfo && (
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span>
            {selectedProvider === 'anthropic' && '🦙'}
            {selectedProvider === 'openai' && '🔵'}
            {selectedProvider === 'google' && '🔷'}
            {selectedProvider === 'openrouter' && '🌐'}
            {' '}{currentModelInfo.name}
          </span>
          <span>
            {currentModelInfo.contextWindow >= 1000000 
              ? `${(currentModelInfo.contextWindow / 1000000).toFixed(0)}M` 
              : `${(currentModelInfo.contextWindow / 1000).toFixed(0)}K`} context
          </span>
          {currentModelInfo.supportsStreaming && (
            <span className="text-green-400">● Streaming</span>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-950 border border-red-800 rounded-lg">
          <p className="text-sm text-red-200">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Response Display */}
      {response && <ResponseViewer response={response} />}
    </div>
  );
}
