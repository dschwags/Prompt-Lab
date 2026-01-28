import { useEffect, useState, useCallback } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { TokenCounter } from './TokenCounter';
import { sendPromptToClaude } from '../../services/api.service';
import { settingsService } from '../../services/settings.service';

interface Response {
  content: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

// Model options for dropdown
const CLAUDE_MODELS = [
  { id: 'claude-opus-4-20251101', name: 'Opus 4.5 (Most capable)', description: 'Best for complex tasks' },
  { id: 'claude-sonnet-4-20250514', name: 'Sonnet 4.5 (Balanced)', description: 'Default - balanced intelligence' },
  { id: 'claude-haiku-4-20251001', name: 'Haiku 4.5 (Fast & economical)', description: 'Fast and cost-effective' },
];

export function PromptEditor() {
  const {
    systemPrompt,
    userPrompt,
    setSystemPrompt,
    setUserPrompt,
    currentPrompt,
    createNewPrompt,
  } = usePrompt();

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Model selection state with localStorage persistence
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || CLAUDE_MODELS[1].id; // Default to Sonnet 4.5
  });

  // Persist model selection
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('selectedModel', modelId);
  };

  // Initialize a new prompt on mount if none exists
  useEffect(() => {
    if (!currentPrompt) {
      createNewPrompt();
    }
  }, [currentPrompt, createNewPrompt]);

  // Update last saved timestamp when content changes
  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [systemPrompt, userPrompt]);

  // Calculate combined token estimate
  const combinedCharCount = systemPrompt.length + userPrompt.length;
  const combinedTokens = Math.ceil(combinedCharCount / 4);

  // Estimate cost (using Claude Sonnet 4.5 pricing: $3 per 1M input tokens)
  const estimatedCostInput = (combinedTokens / 1_000_000) * 3;

  // Handle sending to Claude
  const handleSend = async () => {
    // Check if user prompt is empty
    if (!userPrompt.trim()) {
      setError('Please enter a user prompt');
      return;
    }

    // Get API key from IndexedDB settings
    try {
      const settings = await settingsService.getSettings();
      const apiKey = settings.apiKeys['anthropic'];
      
      if (!apiKey) {
        setError('Please add your Claude API key in Settings');
        return;
      }

      setIsLoading(true);
      setError(null);
      setResponse(null);

      const result = await sendPromptToClaude(systemPrompt, userPrompt, apiKey, selectedModel);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send prompt');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Cmd+Enter keyboard shortcut
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    },
    [systemPrompt, userPrompt, selectedModel]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header with Combined Stats */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold text-gray-900">Prompt Editor</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Total: <span className="font-medium text-gray-900">~{combinedTokens.toLocaleString()} tokens</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              Est. Cost: <span className="font-medium text-green-600">${estimatedCostInput.toFixed(4)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Model Selection Dropdown */}
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CLAUDE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          {isSaving && (
            <span className="text-xs text-gray-500">Saving...</span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-xs text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send (⌘↵)'}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex flex-col gap-4 p-4 flex-1 overflow-auto">
        {/* System Prompt */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              System Prompt <span className="text-gray-400">(optional)</span>
            </label>
            <TokenCounter characterCount={systemPrompt.length} label="System" />
          </div>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter system-level instructions (e.g., role, behavior, constraints)..."
            className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
          />
        </div>

        {/* User Prompt */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              User Prompt
            </label>
            <TokenCounter characterCount={userPrompt.length} label="User" />
          </div>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt here... (Press Cmd+Enter to send)"
            className="w-full min-h-[200px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
          />
        </div>

        {/* Response Section */}
        {(isLoading || error || response) && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-gray-700">Response</h3>
            
            {/* Loading */}
            {isLoading && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>Waiting for Claude...</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-semibold text-red-900 mb-2">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Response */}
            {response && !isLoading && (
              <div className="flex flex-col gap-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-600 px-3">
                  <span className="font-medium">{response.model}</span>
                  <span>In: {response.tokensIn.toLocaleString()} tokens</span>
                  <span>Out: {response.tokensOut.toLocaleString()} tokens</span>
                  <span className="text-green-600 font-medium">
                    Cost: ${((response.tokensIn / 1_000_000) * 3 + (response.tokensOut / 1_000_000) * 15).toFixed(4)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                    {response.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Help Text */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">⌘ Enter</kbd> to send your prompt
        </p>
      </div>
    </div>
  );
}
