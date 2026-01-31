/**
 * UPDATED PromptEditor with OpenRouter Integration
 * 
 * FILE: PromptEditor-20250129-0252.tsx
 * INSTALL AS: src/components/PromptEditor/PromptEditor.tsx
 * 
 * Changes:
 * - Expanded model dropdown with 15+ models from multiple providers
 * - Smart API routing (Anthropic direct vs OpenRouter)
 * - Model grouping by provider
 * - OpenRouter API integration
 */

import { useState, useCallback, useEffect } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { TokenCounter } from './TokenCounter';
import { ResponseViewer } from './ResponseViewer';
import { apiService } from '../../services/api.service';
import { openRouterService } from '../../services/openrouter.service';
import { getModelGroups, requiresOpenRouter, findModel } from '../../utils/models';

export function PromptEditor() {
  const {
    systemPrompt,
    setSystemPrompt,
    userPrompt,
    setUserPrompt,
  } = usePrompt();

  const [response, setResponse] = useState<{
    text: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    model: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Model selection with persistence
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || 'claude-sonnet-4-20250514';
  });

  // Save selected model
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

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
      const model = selectedModel;
      const isOpenRouter = requiresOpenRouter(model);

      let result;

      if (isOpenRouter) {
        // Use OpenRouter API
        const openRouterKey = localStorage.getItem('apiKey_openrouter');
        if (!openRouterKey) {
          throw new Error('Please add your OpenRouter API key in Settings');
        }

        result = await openRouterService.sendMessage(
          systemPrompt,
          userPrompt,
          model,
          openRouterKey
        );

        // Calculate approximate cost (will vary by model)
        const inputCost = (result.inputTokens / 1000) * 0.00015;
        const outputCost = (result.outputTokens / 1000) * 0.0006;
        const totalCost = inputCost + outputCost;

        setResponse({
          text: result.text,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          cost: totalCost,
          model: result.model,
        });

      } else {
        // Use direct Anthropic API
        const anthropicKey = localStorage.getItem('apiKey_anthropic');
        if (!anthropicKey) {
          throw new Error('Please add your Claude API key in Settings');
        }

        result = await apiService.sendMessage(
          systemPrompt,
          userPrompt,
          model
        );

        setResponse({
          text: result.text,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          cost: result.cost,
          model: result.model,
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Send error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [systemPrompt, userPrompt, selectedModel]);

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

  const modelGroups = getModelGroups();
  const selectedModelInfo = findModel(selectedModel);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-50">Prompt Editor</h2>
        <div className="flex items-center gap-4">
          <TokenCounter systemPrompt={systemPrompt} userPrompt={userPrompt} />
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
          placeholder="Enter your prompt... (Press Enter or ⌘+Enter to send, Shift+Enter for newline)"
          className="w-full h-48 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
        />
      </div>

      {/* Model Selection + Send Button */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {modelGroups.map((group) => (
              <optgroup key={group.provider} label={group.provider}>
                {group.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.isOpenRouter ? '(OR)' : ''}
                    {model.description ? ` - ${model.description}` : ''}
                  </option>
                ))}
              </optgroup>
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
      {selectedModelInfo && (
        <div className="text-xs text-zinc-400">
          Selected: {selectedModelInfo.name} ({selectedModelInfo.provider})
          {selectedModelInfo.isOpenRouter ? ' via OpenRouter' : ' via Direct API'}
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
      {response && (
        <ResponseViewer
          response={response.text}
          inputTokens={response.inputTokens}
          outputTokens={response.outputTokens}
          cost={response.cost}
          model={response.model}
        />
      )}
    </div>
  );
}
