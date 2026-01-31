/**
 * Workshop Mode Component - Main Workshop Interface
 * 
 * FILE: WorkshopMode.tsx
 * PURPOSE: Full workshop experience with parallel model testing
 * 
 * Features:
 * - System/User prompt input (shared with PromptEditor)
 * - Model selection via ModelMultiSelect
 * - ParallelResponseGrid for results
 * - Starred collection panel
 * - Session management
 * - Toggle back to single mode
 */

import { useState, useCallback, useEffect } from 'react';

// Generate UUID for iteration IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
import { ModelMultiSelect } from './ModelMultiSelect';
import { ParallelResponseGrid } from './ParallelResponseGrid';
import { IterationTimeline } from './IterationTimeline';
import { IterationComparison } from './IterationComparison';
import { sendPromptToClaude } from '../../services/api.service';
import { openRouterService } from '../../services/openrouter.service';
import { findModel, requiresOpenRouter } from '../../utils/models';
import {
  createNewSession,
  saveSession,
  addIterationToSession,
  toggleResponseStar,
  addStarredItem,
  getLastSession,
  exportSessionAsMarkdown,
  exportStarredItemsAsMarkdown,
  clearAllSessions,
} from '../../services/workshop.service';
import type {
  WorkshopSession,
  WorkshopIteration,
  IterationResponse,
  StarredItem,
} from '../../types/Workshop';

interface WorkshopModeProps {
  systemPrompt: string;
  userPrompt: string;
  onSystemPromptChange: (value: string) => void;
  onUserPromptChange: (value: string) => void;
  onExit: () => void;
}

export function WorkshopMode({
  systemPrompt,
  userPrompt,
  onSystemPromptChange,
  onUserPromptChange,
  onExit,
}: WorkshopModeProps) {
  // Session state
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  
  // Current iteration state
  const [currentIteration, setCurrentIteration] = useState<IterationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [showModelSelect, setShowModelSelect] = useState(true);
  const [showStarredPanel, setShowStarredPanel] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Version history state
  const [viewMode, setViewMode] = useState<'current' | 'timeline' | 'comparison'>('current');
  const [selectedIterationId, setSelectedIterationId] = useState<string | null>(null);

  // Load last session on mount
  useEffect(() => {
    const lastSession = getLastSession();
    if (lastSession) {
      setSession(lastSession);
      setSelectedModels(lastSession.selectedModels);
      if (lastSession.iterations.length > 0) {
        // Show results from last iteration
        const lastIter = lastSession.iterations[lastSession.iterations.length - 1];
        setCurrentIteration(lastIter.responses);
        setShowModelSelect(false);
      }
    }
  }, []);

  // Create new session when needed
  const ensureSession = useCallback(() => {
    if (!session) {
      const newSession = createNewSession(systemPrompt, userPrompt, selectedModels);
      setSession(newSession);
      return newSession;
    }
    return session;
  }, [session, systemPrompt, userPrompt, selectedModels]);

  // Execute parallel API calls
  const handleSendToAll = useCallback(async () => {
    if (selectedModels.length < 2) {
      setError('Please select at least 2 models');
      return;
    }
    if (!userPrompt.trim()) {
      setError('Please enter a user prompt');
      return;
    }

    setError(null);
    setIsLoading(true);
    setShowModelSelect(false);

    // Initialize responses array with pending status
    const iterationId = generateId();
    const iterationNumber = session ? session.iterations.length + 1 : 1;

    const initialResponses: IterationResponse[] = selectedModels.map(modelId => {
      const modelInfo = findModel(modelId);
      return {
        modelId,
        modelName: modelInfo?.name || modelId,
        provider: modelInfo?.provider || 'Unknown',
        region: modelInfo?.region || 'US',
        isOpenRouter: modelInfo?.isOpenRouter || false,
        text: '',
        timeSeconds: 0,
        cost: 0,
        inputTokens: 0,
        outputTokens: 0,
        status: 'loading' as const,
        starred: false,
      };
    });

    setCurrentIteration(initialResponses);

    // Execute calls with stagger to avoid rate limits
    const results: IterationResponse[] = [];
    const DELAY_MS = 500; // Stagger between requests

    for (let i = 0; i < selectedModels.length; i++) {
      const modelId = selectedModels[i];
      const modelInfo = findModel(modelId);
      
      // Update this response to "in progress"
      setCurrentIteration(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'loading' as const } : r
      ));

      try {
        const isOpenRouterModel = requiresOpenRouter(modelId);
        const openRouterKey = isOpenRouterModel ? localStorage.getItem('apiKey_openrouter') : null;
        const anthropicKey = !isOpenRouterModel ? localStorage.getItem('apiKey_anthropic') : null;

        // Validate API keys
        if (isOpenRouterModel && !openRouterKey) {
          throw new Error('OpenRouter API key required');
        }
        if (!isOpenRouterModel && !anthropicKey) {
          throw new Error('Claude API key required');
        }

        // Send request (with stagger)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }

        const callStartTime = Date.now();
        let result: { text: string; inputTokens: number; outputTokens: number; model: string };

        if (isOpenRouterModel) {
          result = await openRouterService.sendMessage(
            systemPrompt,
            userPrompt,
            modelId,
            openRouterKey!
          );
        } else {
          const apiResult = await sendPromptToClaude(
            systemPrompt,
            userPrompt,
            anthropicKey!,
            modelId
          );
          result = {
            text: apiResult.content,
            inputTokens: apiResult.tokensIn,
            outputTokens: apiResult.tokensOut,
            model: apiResult.model,
          };
        }

        const callEndTime = Date.now();
        const timeSeconds = (callEndTime - callStartTime) / 1000;

        // Calculate cost (simplified)
        const inputCost = (result.inputTokens / 1_000_000) * 0.00015;
        const outputCost = (result.outputTokens / 1_000_000) * 0.0006;
        const cost = inputCost + outputCost;

        const response: IterationResponse = {
          modelId,
          modelName: modelInfo?.name || result.model,
          provider: modelInfo?.provider || 'Unknown',
          region: modelInfo?.region || 'US',
          isOpenRouter: modelInfo?.isOpenRouter || false,
          text: result.text,
          timeSeconds,
          cost,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          status: 'complete' as const,
          starred: false,
        };

        results.push(response);
        
        // Update UI
        setCurrentIteration(prev => prev.map((r, idx) => 
          idx === i ? response : r
        ));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        const response: IterationResponse = {
          modelId,
          modelName: modelInfo?.name || modelId,
          provider: modelInfo?.provider || 'Unknown',
          region: modelInfo?.region || 'US',
          isOpenRouter: modelInfo?.isOpenRouter || false,
          text: '',
          timeSeconds: 0,
          cost: 0,
          inputTokens: 0,
          outputTokens: 0,
          status: 'error' as const,
          errorMessage,
          starred: false,
        };

        results.push(response);
        
        setCurrentIteration(prev => prev.map((r, idx) => 
          idx === i ? response : r
        ));
      }
    }

    // Save iteration to session
    const newSession = ensureSession();
    const iteration: WorkshopIteration = {
      id: iterationId,
      iterationNumber,
      createdAt: Date.now(),
      modelIds: selectedModels,
      responses: results,
      promptChanged: false,
    };

    const updatedSession = addIterationToSession(newSession, iteration);
    setSession(updatedSession);
    saveSession(updatedSession);

    setIsLoading(false);
  }, [selectedModels, systemPrompt, userPrompt, session, ensureSession]);

  // Handle star toggle
  const handleStarToggle = useCallback((modelId: string, response: IterationResponse) => {
    if (!session) return;

    // Get current iteration ID (use latest iteration)
    const currentIterId = session.iterations.length > 0 
      ? session.iterations[session.iterations.length - 1].id 
      : 'current';

    // Update current iteration UI state immediately
    setCurrentIteration(prev => prev.map(r => 
      r.modelId === modelId ? { ...r, starred: !r.starred } : r
    ));

    const updatedSession = toggleResponseStar(session, currentIterId, modelId);
    
    // Add or remove from starred items collection
    let finalSession = updatedSession;
    if (!response.starred) {
      // Adding star
      const starredItem: Omit<StarredItem, 'id' | 'createdAt'> = {
        iterationId: currentIterId,
        modelId,
        modelName: response.modelName,
        originalText: response.text,
        selectedText: response.text, // Full text for MVP
        category: 'best-answer',
      };
      finalSession = addStarredItem(updatedSession, starredItem);
    } else {
      // Removing star - remove from starred items
      finalSession = {
        ...updatedSession,
        starredItems: updatedSession.starredItems.filter(
          item => !(item.iterationId === currentIterId && item.modelId === modelId)
        ),
      };
    }
    
    setSession(finalSession);
    saveSession(finalSession);
  }, [session]);

  // Copy all starred items
  const handleCopyAllStarred = useCallback(async () => {
    if (!session || session.starredItems.length === 0) return;
    
    const markdown = exportStarredItemsAsMarkdown(session);
    try {
      await navigator.clipboard.writeText(markdown);
      setSuccessMessage(`✓ Copied ${session.starredItems.length} starred items to clipboard`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to copy starred items:', error);
      setError('Failed to copy to clipboard');
    }
  }, [session]);

  // Export session
  const handleExportSession = useCallback(() => {
    if (!session) return;
    const markdown = exportSessionAsMarkdown(session);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-session-${session.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('✓ Session exported successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
    setShowSessionMenu(false);
  }, [session]);

  // Clear current session and start fresh
  const handleClearSession = useCallback(() => {
    setSession(null);
    setCurrentIteration([]);
    setSelectedModels([]);
    setShowModelSelect(true);
    setShowStarredPanel(false);
    setShowClearConfirm(false);
    setShowSessionMenu(false);
  }, []);

  // Clear all sessions from storage
  const handleClearAllSessions = useCallback(() => {
    clearAllSessions();
    handleClearSession();
  }, [handleClearSession]);

  // New session (keep current but start fresh iteration)
  const handleNewIteration = useCallback(() => {
    setShowModelSelect(true);
    setCurrentIteration([]);
    setViewMode('current');
  }, []);

  // Select an iteration to view
  const handleSelectIteration = useCallback((iteration: WorkshopIteration) => {
    setSelectedIterationId(iteration.id);
    setCurrentIteration(iteration.responses);
    setViewMode('current');
    setShowModelSelect(false);
    setSuccessMessage(`Viewing Iteration ${iteration.iterationNumber}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Restore iteration prompts
  const handleRestoreIteration = useCallback((iteration: WorkshopIteration) => {
    onSystemPromptChange(iteration.promptChanged ? iteration.promptChangeSummary || '' : session?.systemPrompt || '');
    setSuccessMessage(`Restored prompts from Iteration ${iteration.iterationNumber}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [session, onSystemPromptChange]);

  // Stats
  const starredCount = session?.starredItems.length || 0;
  const iterationCount = session?.iterations.length || 0;

  return (
    <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50">Workshop Mode</h2>
          <p className="text-sm text-zinc-400">
            Test your prompt across multiple models simultaneously
          </p>
          {session && (
            <p className="text-xs text-zinc-500 mt-1">
              Session: {new Date(session.createdAt).toLocaleDateString()} {new Date(session.createdAt).toLocaleTimeString()} | 
              {session.selectedModels.length} models | 
              {iterationCount} iteration{iterationCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {session && (
            <>
              {/* Session Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSessionMenu(!showSessionMenu)}
                  className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors flex items-center gap-1"
                >
                  ⚙️ Session
                  <span className="text-xs">{showSessionMenu ? '▲' : '▼'}</span>
                </button>
                
                {showSessionMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[200px]">
                    <button
                      onClick={handleNewIteration}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                      🔄 New Iteration
                    </button>
                    <button
                      onClick={handleExportSession}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                      📤 Export Session
                    </button>
                    <div className="border-t border-zinc-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowClearConfirm(true);
                        setShowSessionMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      🗑️ Clear Current Session
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('⚠️ This will delete ALL workshop sessions from storage. Continue?')) {
                          handleClearAllSessions();
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      💣 Clear All Sessions
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowStarredPanel(!showStarredPanel)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  showStarredPanel 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                }`}
              >
                ⭐ Starred ({starredCount})
              </button>
              
              {/* Version History Toggle */}
              {iterationCount > 1 && (
                <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('current')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      viewMode === 'current' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="View Current"
                  >
                    📊 Current
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      viewMode === 'timeline' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Timeline"
                  >
                    📅 Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('comparison')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      viewMode === 'comparison' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Compare Iterations"
                  >
                    ⚖️ Compare
                  </button>
                </div>
              )}
            </>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
          >
            ← Exit Workshop
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-700/50 text-green-300 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-200">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Clear Session Confirmation */}
      {showClearConfirm && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 p-4 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Clear Current Session?</p>
                <p className="text-sm text-red-200 mt-1">This will remove the current session, all iterations, and starred items. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm font-medium"
              >
                Yes, Clear Session
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-200">
            System Prompt (optional)
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="Enter system-level instructions..."
            className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-200">
            User Prompt
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => onUserPromptChange(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Model Selection */}
      {showModelSelect && (
        <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
          <ModelMultiSelect
            selectedModels={selectedModels}
            onChange={setSelectedModels}
            maxModels={5}
            minModels={2}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSendToAll}
              disabled={isLoading || selectedModels.length < 2}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? 'Sending...' : `🚀 Send to ${selectedModels.length} Models`}
            </button>
            
            <button
              onClick={() => setShowModelSelect(false)}
              disabled={isLoading}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Iteration Counter */}
      {iterationCount > 0 && (
        <div className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700 rounded-lg px-4 py-2">
          <span className="text-sm text-zinc-400">
            {iterationCount} iteration{iterationCount !== 1 ? 's' : ''} completed
          </span>
          <button
            onClick={() => setShowModelSelect(!showModelSelect)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showModelSelect ? 'Hide Model Select' : 'Change Models'}
          </button>
        </div>
      )}

      {/* Results Grid */}
      {!showModelSelect && viewMode === 'current' && (
        <ParallelResponseGrid
          responses={currentIteration}
          onStarToggle={handleStarToggle}
          starredIds={new Set(
            currentIteration.filter(r => r.starred).map(r => r.modelId)
          )}
        />
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && session && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <IterationTimeline
              iterations={session.iterations}
              currentIterationId={selectedIterationId}
              onSelectIteration={handleSelectIteration}
            />
          </div>
          <div className="col-span-2">
            {selectedIterationId && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">
                  Selected Iteration Details
                </h3>
                <ParallelResponseGrid
                  responses={currentIteration}
                  onStarToggle={handleStarToggle}
                  starredIds={new Set(
                    currentIteration.filter(r => r.starred).map(r => r.modelId)
                  )}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {viewMode === 'comparison' && session && (
        <IterationComparison
          iterations={session.iterations}
          onRestoreIteration={handleRestoreIteration}
        />
      )}

      {/* Starred Collection Panel */}
      {showStarredPanel && session && session.starredItems.length > 0 && (
        <div className="bg-zinc-800/30 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-yellow-400">
              ⭐ Starred Collection ({starredCount})
            </h3>
            <button
              onClick={handleCopyAllStarred}
              className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
            >
              📋 Copy All
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {session.starredItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-800 border border-zinc-700 rounded p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-300">
                    {item.modelName}
                  </span>
                  <span className="text-xs text-zinc-500 capitalize">
                    {item.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-sm text-zinc-400 line-clamp-3">
                  {item.selectedText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
