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

      const result = await sendPromptToClaude(systemPrompt, userPrompt, apiKey);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send prompt');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Cmd+Enter or Enter keyboard shortcut
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Cmd+Enter for macOS, Ctrl+Enter for Windows/Linux, or just Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.id === 'user-prompt') {
        // Plain Enter in user prompt (Shift+Enter for newline)
        e.preventDefault();
        handleSend();
      }
    },
    [systemPrompt, userPrompt]
  );

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 font-mono">
      {/* IDE-Style Header with Status Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">PROMPT EDITOR</h2>
          
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-400">
              ~{combinedTokens.toLocaleString()} tok
            </span>
            <span className="px-2 py-0.5 text-xs bg-emerald-950/30 border border-emerald-800/30 rounded text-emerald-400">
              ${estimatedCostInput.toFixed(4)}
            </span>
            {isSaving ? (
              <span className="px-2 py-0.5 text-xs bg-amber-950/30 border border-amber-800/30 rounded text-amber-400 animate-pulse">
                saving...
              </span>
            ) : lastSaved ? (
              <span className="px-2 py-0.5 text-xs bg-zinc-800/30 border border-zinc-700/30 rounded text-zinc-500">
                {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Input Deck - IDE Console Style */}
      <div className="flex flex-col gap-0 flex-1 overflow-auto">
        {/* System Prompt Panel */}
        <div className="border-b border-zinc-800/50">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              System Prompt <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <TokenCounter characterCount={systemPrompt.length} label="System" />
          </div>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Enter system-level instructions (role, behavior, constraints)..."
            className="w-full h-28 px-4 py-3 bg-zinc-950/50 text-zinc-300 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono placeholder:text-zinc-700 placeholder:italic"
          />
        </div>

        {/* User Prompt Panel with Integrated Send */}
        <div className="flex-1 flex flex-col border-b border-zinc-800/50 relative">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              User Prompt
            </label>
            <TokenCounter characterCount={userPrompt.length} label="User" />
          </div>
          <div className="relative flex-1">
            <textarea
              id="user-prompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="// Enter your prompt... (Press Enter or ⌘+Enter to send, Shift+Enter for newline)"
              className="w-full h-full px-4 py-3 pb-16 bg-zinc-950/50 text-zinc-300 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono placeholder:text-zinc-700 placeholder:italic"
            />
            
            {/* Integrated Send Button - Bottom Right of Textarea */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                Enter to send
              </span>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded border border-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-900/20"
                title="Send prompt (Enter or ⌘+Enter)"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                    SENDING
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    SEND
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Response Output Panel - IDE Style */}
        {(isLoading || error || response) && (
          <div className="border-t border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/70">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                  Output
                </span>
              </div>
              
              {/* Response Metadata Badges */}
              {response && !isLoading && (
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-400">
                    {response.model}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-400">
                    in: {response.tokensIn.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-400">
                    out: {response.tokensOut.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-800/30 rounded text-emerald-400">
                    ${((response.tokensIn / 1_000_000) * 3 + (response.tokensOut / 1_000_000) * 15).toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            <div className="px-4 py-4 bg-zinc-950/30 max-h-[400px] overflow-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-3 text-zinc-500">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Waiting for Claude...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-950/20 border border-red-800/30 rounded text-red-400 text-sm font-mono">
                  <div className="font-semibold mb-1 text-red-300">ERROR</div>
                  {error}
                </div>
              )}

              {/* Success Response */}
              {response && !isLoading && (
                <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300 leading-relaxed">
                  {response.content}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint Bar */}
      <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/50 flex items-center justify-between">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
          💡 <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 bg-zinc-800/50 border border-zinc-700/30 rounded">Enter</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 bg-zinc-800/50 border border-zinc-700/30 rounded">⌘ Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}
