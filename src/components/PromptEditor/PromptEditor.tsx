import { useEffect, useState, useCallback } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { TokenCounter } from './TokenCounter';

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

  // Handle Cmd+Enter keyboard shortcut
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    },
    [systemPrompt, userPrompt]
  );

  const handleSend = () => {
    // TODO: Wire this up to API call in Step 5
    console.log('Send triggered!', { systemPrompt, userPrompt });
  };

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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send (⌘↵)
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
        <div className="flex flex-col gap-2 flex-1">
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
            className="w-full flex-1 min-h-[200px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
          />
        </div>
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
