/**
 * Comparison View Component
 * 
 * Side-by-side comparison of 2 or 3 models/providers
 * Includes AI-powered synthesis/analysis feature
 */

import { useState, useCallback } from 'react';
import { ResponseViewer } from './ResponseViewer';
import { unifiedAPIService, type LLMProvider } from '../../services/unified-api.service';
import type { ResponseDisplay } from '../../types/ResponseMetrics';
import { useComparisonConversation } from '../../hooks/useComparisonConversation';

interface ComparisonViewProps {
  systemPrompt: string;
  userPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  onUserPromptChange: (prompt: string) => void;
  onExit: () => void;
}

interface ComparisonResponse {
  response: ResponseDisplay | null;
  status: 'idle' | 'loading' | 'complete' | 'error';
  error?: string;
  provider?: LLMProvider;
  modelId?: string;
}

/**
 * Recommended models for synthesis/analysis tasks
 * These models are particularly good at reasoning and comparison tasks
 */
const RECOMMENDED_FOR_SYNTHESIS: Record<string, string[]> = {
  anthropic: ['claude-sonnet-4-20250514', 'claude-opus-4-20251101'],
  openai: ['gpt-4o', 'o1'],
  google: ['gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp-1219'],
  openrouter: [
    'anthropic/claude-opus-4.5',
    'anthropic/claude-sonnet-4.5',
    'openai/o1',  // Reasoning model
    'openai/gpt-4o',
    'google/gemini-2.5-pro',
    'google/gemini-3-pro-preview',
    'deepseek/deepseek-r1',  // Reasoning model
    'deepseek/deepseek-chat-v3.1',
    'qwen/qwq-32b',  // Reasoning model
  ],
};

/**
 * Check if a model is recommended for synthesis/analysis
 */
function isRecommendedForSynthesis(provider: LLMProvider, modelId: string): boolean {
  const recommended = RECOMMENDED_FOR_SYNTHESIS[provider];
  return recommended ? recommended.includes(modelId) : false;
}

export function ComparisonView({
  systemPrompt,
  userPrompt,
  onSystemPromptChange,
  onUserPromptChange,
  onExit,
}: ComparisonViewProps) {
  // 2-column vs 3-column toggle
  const [threeColumnMode, setThreeColumnMode] = useState<boolean>(() => {
    return localStorage.getItem('compare_three_column') === 'true';
  });

  // Left side config
  const [leftProvider, setLeftProvider] = useState<LLMProvider>(() => {
    return (localStorage.getItem('compare_left_provider') as LLMProvider) || 'anthropic';
  });
  const [leftModel, setLeftModel] = useState<string>(() => {
    return localStorage.getItem('compare_left_model') || 'claude-sonnet-4-5-20250929';
  });

  // Middle side config (for 3-column mode)
  const [middleProvider, setMiddleProvider] = useState<LLMProvider>(() => {
    return (localStorage.getItem('compare_middle_provider') as LLMProvider) || 'google';
  });
  const [middleModel, setMiddleModel] = useState<string>(() => {
    return localStorage.getItem('compare_middle_model') || 'gemini-2.0-flash-exp';
  });

  // Right side config
  const [rightProvider, setRightProvider] = useState<LLMProvider>(() => {
    return (localStorage.getItem('compare_right_provider') as LLMProvider) || 'openrouter';
  });
  const [rightModel, setRightModel] = useState<string>(() => {
    return localStorage.getItem('compare_right_model') || 'openai/gpt-4o';
  });

  // Response state
  const [leftResponse, setLeftResponse] = useState<ComparisonResponse>({ response: null, status: 'idle' });
  const [middleResponse, setMiddleResponse] = useState<ComparisonResponse>({ response: null, status: 'idle' });
  const [rightResponse, setRightResponse] = useState<ComparisonResponse>({ response: null, status: 'idle' });

  // Synthesis state
  const [synthesisResponse, setSynthesisResponse] = useState<ComparisonResponse>({ response: null, status: 'idle' });

  // Phase A: Conversation state for Round 2 discussion
  const {
    startConversation,
    addDiscussionRound,
    hasRound1,
    hasRound2,
  } = useComparisonConversation();

  // Round 2 response state (separate from Round 1)
  const [leftRound2Response, setLeftRound2Response] = useState<ComparisonResponse>({ response: null, status: 'idle' });
  const [rightRound2Response, setRightRound2Response] = useState<ComparisonResponse>({ response: null, status: 'idle' });
  const [isDiscussing, setIsDiscussing] = useState(false);

  // Synthesis model config
  const [synthesisProvider, setSynthesisProvider] = useState<LLMProvider>(() => {
    return (localStorage.getItem('compare_synthesis_provider') as LLMProvider) || 'openrouter';
  });
  const [synthesisModel, setSynthesisModel] = useState<string>(() => {
    return localStorage.getItem('compare_synthesis_model') || 'anthropic/claude-sonnet-4-20250514';
  });

  // Save synthesis preferences
  const saveSynthesisConfig = (provider: LLMProvider, model: string) => {
    localStorage.setItem('compare_synthesis_provider', provider);
    localStorage.setItem('compare_synthesis_model', model);
  };

  // Handle synthesis provider change
  const handleSynthesisProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as LLMProvider;
    setSynthesisProvider(newProvider);
    const newModels = modelsByProvider[newProvider] || [];
    if (newModels.length > 0) {
      // Prefer a recommended model for synthesis
      const recommended = RECOMMENDED_FOR_SYNTHESIS[newProvider];
      const preferredModel = newModels.find(m => recommended?.includes(m.id)) || newModels[0];
      setSynthesisModel(preferredModel.id);
      saveSynthesisConfig(newProvider, preferredModel.id);
    }
  };

  // Handle synthesis model change
  const handleSynthesisModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSynthesisModel(e.target.value);
    saveSynthesisConfig(synthesisProvider, e.target.value);
  };

  // Get models by provider
  const modelsByProvider = unifiedAPIService.getModelsByProvider();
  const leftModels = modelsByProvider[leftProvider] || [];
  const middleModels = modelsByProvider[middleProvider] || [];
  const rightModels = modelsByProvider[rightProvider] || [];

  // Save preferences
  const saveConfig = (position: 'left' | 'middle' | 'right', provider: LLMProvider, model: string) => {
    localStorage.setItem(`compare_${position}_provider`, provider);
    localStorage.setItem(`compare_${position}_model`, model);
  };

  // Toggle 3-column mode
  const handleToggleThreeColumn = () => {
    const newMode = !threeColumnMode;
    setThreeColumnMode(newMode);
    localStorage.setItem('compare_three_column', newMode.toString());
  };

  // Handle provider changes
  const handleProviderChange = (
    position: 'left' | 'middle' | 'right',
    newProvider: LLMProvider,
    setProvider: (p: LLMProvider) => void,
    setModel: (m: string) => void
  ) => {
    setProvider(newProvider);
    const newModels = modelsByProvider[newProvider] || [];
    if (newModels.length > 0) {
      setModel(newModels[0].id);
      saveConfig(position, newProvider, newModels[0].id);
    }
  };

  const handleLeftProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleProviderChange('left', e.target.value as LLMProvider, setLeftProvider, setLeftModel);
  };

  const handleMiddleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleProviderChange('middle', e.target.value as LLMProvider, setMiddleProvider, setMiddleModel);
  };

  const handleRightProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleProviderChange('right', e.target.value as LLMProvider, setRightProvider, setRightModel);
  };

  const handleModelChange = (
    position: 'left' | 'middle' | 'right',
    value: string,
    provider: LLMProvider,
    setModel: (m: string) => void
  ) => {
    setModel(value);
    saveConfig(position, provider, value);
  };

  const handleLeftModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleModelChange('left', e.target.value, leftProvider, setLeftModel);
  };

  const handleMiddleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleModelChange('middle', e.target.value, middleProvider, setMiddleModel);
  };

  const handleRightModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleModelChange('right', e.target.value, rightProvider, setRightModel);
  };

  // Execute comparison
  const handleCompare = useCallback(async () => {
    if (!userPrompt.trim()) {
      setLeftResponse({ response: null, status: 'error', error: 'Please enter a prompt' });
      setRightResponse({ response: null, status: 'error', error: 'Please enter a prompt' });
      if (threeColumnMode) {
        setMiddleResponse({ response: null, status: 'error', error: 'Please enter a prompt' });
      }
      return;
    }

    // Reset synthesis
    setSynthesisResponse({ response: null, status: 'idle' });

    // Reset and start loading
    setLeftResponse({ response: null, status: 'loading', provider: leftProvider, modelId: leftModel });
    setRightResponse({ response: null, status: 'loading', provider: rightProvider, modelId: rightModel });
    if (threeColumnMode) {
      setMiddleResponse({ response: null, status: 'loading', provider: middleProvider, modelId: middleModel });
    }

    const executeCall = async (
      provider: LLMProvider,
      model: string,
      setResponse: (r: ComparisonResponse) => void
    ) => {
      try {
        const apiKey = unifiedAPIService.getApiKey(provider);
        if (!apiKey) {
          throw new Error(`Missing ${provider} API key`);
        }

        const result = await unifiedAPIService.sendPrompt(
          systemPrompt,
          userPrompt,
          model,
          apiKey,
          provider
        );

        setResponse({
          response: {
            text: result.text,
            model: result.model,
            timeSeconds: result.responseTimeMs / 1000,
            cost: result.cost,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
          },
          status: 'complete',
          provider,
          modelId: model,
        });
      } catch (err) {
        setResponse({
          response: null,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
          provider,
          modelId: model,
        });
      }
    };

    // Execute all calls in parallel
    const promises = [
      executeCall(leftProvider, leftModel, setLeftResponse),
      executeCall(rightProvider, rightModel, setRightResponse),
    ];

    if (threeColumnMode) {
      promises.push(executeCall(middleProvider, middleModel, setMiddleResponse));
    }

    await Promise.all(promises);
  }, [systemPrompt, userPrompt, leftProvider, leftModel, middleProvider, middleModel, rightProvider, rightModel, threeColumnMode]);

  // Phase A: Build cross-reaction prompt for Round 2
  const buildCrossReactionPrompt = (
    originalSystemPrompt: string,
    originalUserPrompt: string,
    thisModelResponse: string,
    otherModelName: string,
    otherModelResponse: string
  ): string => {
    return `Original prompt from user:
"""
System: ${originalSystemPrompt || '(none)'}
User: ${originalUserPrompt}
"""

Your previous response:
"""
${thisModelResponse}
"""

The other model's response (${otherModelName}):
"""
${otherModelResponse}
"""

Instructions:
Review the other model's response and provide your reaction:
1. What did they get right that you might have missed?
2. What did they miss or get wrong?
3. What would you add or change based on seeing their approach?
4. How would you combine the best of both responses?

Be specific and constructive.`;
  };

  // Phase A: Handle Round 2 (Discuss button)
  const handleDiscuss = useCallback(async () => {
    if (!leftResponse.response || !rightResponse.response) {
      console.error('Cannot discuss: Round 1 responses missing');
      return;
    }

    // Initialize conversation if not already started
    if (!hasRound1) {
      startConversation(
        systemPrompt,
        userPrompt,
        leftProvider,
        leftModel,
        leftResponse.response,
        rightProvider,
        rightModel,
        rightResponse.response
      );
    }

    setIsDiscussing(true);
    setLeftRound2Response({ response: null, status: 'loading' });
    setRightRound2Response({ response: null, status: 'loading' });

    // Build cross-reaction prompts
    const leftCrossPrompt = buildCrossReactionPrompt(
      systemPrompt,
      userPrompt,
      leftResponse.response.text,
      rightResponse.response.model,
      rightResponse.response.text
    );

    const rightCrossPrompt = buildCrossReactionPrompt(
      systemPrompt,
      userPrompt,
      rightResponse.response.text,
      leftResponse.response.model,
      leftResponse.response.text
    );

    // Execute both calls in parallel
    const executeDiscussionCall = async (
      provider: LLMProvider,
      model: string,
      prompt: string,
      setResponse: (r: ComparisonResponse) => void
    ) => {
      try {
        const apiKey = unifiedAPIService.getApiKey(provider);
        if (!apiKey) {
          throw new Error(`Missing ${provider} API key`);
        }

        const result = await unifiedAPIService.sendPrompt(
          'You are a collaborative AI assistant reviewing and reacting to another AI\'s response.',
          prompt,
          model,
          apiKey,
          provider
        );

        const responseDisplay: ResponseDisplay = {
          text: result.text,
          model: result.model,
          timeSeconds: result.responseTimeMs / 1000,
          cost: result.cost,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        };

        setResponse({
          response: responseDisplay,
          status: 'complete',
          provider,
          modelId: model,
        });

        return responseDisplay;
      } catch (err) {
        setResponse({
          response: null,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
          provider,
          modelId: model,
        });
        return null;
      }
    };

    const [leftResult, rightResult] = await Promise.all([
      executeDiscussionCall(leftProvider, leftModel, leftCrossPrompt, setLeftRound2Response),
      executeDiscussionCall(rightProvider, rightModel, rightCrossPrompt, setRightRound2Response),
    ]);

    // Add Round 2 to conversation
    if (leftResult && rightResult) {
      addDiscussionRound(leftResult, rightResult);
    }

    setIsDiscussing(false);
  }, [leftResponse, rightResponse, systemPrompt, userPrompt, leftProvider, leftModel, rightProvider, rightModel, hasRound1, startConversation, addDiscussionRound]);

  // Synthesis AI - Analyze all responses
  const handleAnalyze = useCallback(async () => {
    const responses = threeColumnMode 
      ? [leftResponse, middleResponse, rightResponse]
      : [leftResponse, rightResponse];

    const completeResponses = responses.filter(r => r.status === 'complete' && r.response);

    if (completeResponses.length < 2) {
      setSynthesisResponse({
        response: null,
        status: 'error',
        error: 'Need at least 2 successful responses to analyze',
      });
      return;
    }

    setSynthesisResponse({ response: null, status: 'loading' });

    try {
      // Build synthesis prompt
      const analysisPrompt = buildAnalysisPrompt(
        systemPrompt,
        userPrompt,
        completeResponses
      );

      // Get API key for synthesis provider
      const synthesisKey = unifiedAPIService.getApiKey(synthesisProvider);
      if (!synthesisKey) {
        throw new Error(`${synthesisProvider} API key required for synthesis`);
      }

      const result = await unifiedAPIService.sendPrompt(
        'You are an expert AI analyst comparing multiple LLM responses.',
        analysisPrompt,
        synthesisModel,
        synthesisKey,
        synthesisProvider
      );

      setSynthesisResponse({
        response: {
          text: result.text,
          model: `Synthesis (${result.model})`,
          timeSeconds: result.responseTimeMs / 1000,
          cost: result.cost,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
        status: 'complete',
      });
    } catch (err) {
      setSynthesisResponse({
        response: null,
        status: 'error',
        error: err instanceof Error ? err.message : 'Analysis failed',
      });
    }
  }, [systemPrompt, userPrompt, leftResponse, middleResponse, rightResponse, threeColumnMode, synthesisProvider, synthesisModel]);

  const isLoading = leftResponse.status === 'loading' || 
                    rightResponse.status === 'loading' || 
                    (threeColumnMode && middleResponse.status === 'loading');

  const hasCompleteResponses = [leftResponse, rightResponse, middleResponse]
    .filter(r => r.status === 'complete').length >= 2;

  const gridCols = threeColumnMode ? 'grid-cols-3' : 'grid-cols-2';

  return (
    // Main container with overflow handling to prevent clipping
    <div className="w-full space-y-4 overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-zinc-50">🔄 Comparison Mode</h2>
          <button
            onClick={handleToggleThreeColumn}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              threeColumnMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
            }`}
            title="Toggle 2-column vs 3-column comparison"
          >
            {threeColumnMode ? '3 Columns' : '2 Columns'}
          </button>
        </div>
        <button
          onClick={onExit}
          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors text-sm"
        >
          ← Back to Single Mode
        </button>
      </div>

      {/* Prompt Input Areas */}
      <div className="space-y-3">
        {/* System Prompt */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            System Prompt (optional)
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="Enter system-level instructions (role, behavior, constraints)..."
            className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />
        </div>

        {/* User Prompt */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            User Prompt
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => onUserPromptChange(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Model Selection Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {/* LEFT SIDE */}
        <ModelSelector
          label="Left Model"
          provider={leftProvider}
          model={leftModel}
          models={leftModels}
          onProviderChange={handleLeftProviderChange}
          onModelChange={handleLeftModelChange}
        />

        {/* MIDDLE SIDE (3-column only) */}
        {threeColumnMode && (
          <ModelSelector
            label="Middle Model"
            provider={middleProvider}
            model={middleModel}
            models={middleModels}
            onProviderChange={handleMiddleProviderChange}
            onModelChange={handleMiddleModelChange}
          />
        )}

        {/* RIGHT SIDE */}
        <ModelSelector
          label="Right Model"
          provider={rightProvider}
          model={rightModel}
          models={rightModels}
          onProviderChange={handleRightProviderChange}
          onModelChange={handleRightModelChange}
        />
      </div>

      {/* Compare Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={isLoading || !userPrompt.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? '⏳ Comparing...' : `🔄 Compare ${threeColumnMode ? '3' : '2'} Models`}
        </button>
      </div>

      {/* Response Grid */}
      {(leftResponse.status !== 'idle' || rightResponse.status !== 'idle' || middleResponse.status !== 'idle') && (
        <div className={`grid ${gridCols} gap-4`}>
          <ResponseCard response={leftResponse} label="Left" />
          {threeColumnMode && <ResponseCard response={middleResponse} label="Middle" />}
          <ResponseCard response={rightResponse} label="Right" />
        </div>
      )}

      {/* Comparison Metrics */}
      {hasCompleteResponses && (
        <ComparisonMetrics
          responses={threeColumnMode 
            ? [leftResponse, middleResponse, rightResponse]
            : [leftResponse, rightResponse]}
        />
      )}

      {/* Phase A: Discuss Button (appears after Round 1, only in 2-column mode) */}
      {hasCompleteResponses && !threeColumnMode && !hasRound2 && (
        <div className="flex items-center justify-center py-6">
          <button
            onClick={handleDiscuss}
            disabled={isDiscussing}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-emerald-900/30"
            title="Models react to each other's Round 1 responses"
          >
            {isDiscussing ? 
              <><span className="animate-pulse">💬</span> Models discussing... (this may take 30-60s)</> : 
              <><span>🔄</span> Discuss (Models React to Each Other)</>
            }
          </button>
        </div>
      )}

      {/* Phase A: Round 2 Responses (Discussion) */}
      {hasRound2 && (
        <div className="space-y-4 mt-6 overflow-visible">
          <div className="border-t-2 border-emerald-700 pt-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <span>💬</span>
              <span>Round 2: Discussion (Models React to Each Other)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ResponseCard response={leftRound2Response} label="Left Discussion" />
              <ResponseCard response={rightRound2Response} label="Right Discussion" />
            </div>
          </div>
        </div>
      )}

      {/* Synthesis AI Section */}
      {hasCompleteResponses && (
        <div className="space-y-4">
          {/* Synthesis Model Selector */}
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-400">🔬</span>
              <h3 className="text-sm font-medium text-purple-300">Synthesis Model</h3>
              <span className="text-xs text-purple-500">(Used for analyzing responses)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={synthesisProvider}
                onChange={handleSynthesisProviderChange}
                className="px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="anthropic">🦙 Anthropic</option>
                <option value="openai">🔵 OpenAI</option>
                <option value="google">🔷 Google</option>
                <option value="openrouter">🌐 OpenRouter</option>
              </select>
              <select
                value={synthesisModel}
                onChange={handleSynthesisModelChange}
                className="px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                {(modelsByProvider[synthesisProvider] || []).map((m) => {
                  const recommended = isRecommendedForSynthesis(synthesisProvider, m.id);
                  return (
                    <option key={m.id} value={m.id}>
                      {recommended ? '✨ ' : ''}{m.name}{recommended ? ' ★' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-purple-400 mt-2">
              ✨ = Recommended for analysis tasks (strong reasoning & comparison abilities)
            </p>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleAnalyze}
              disabled={synthesisResponse.status === 'loading'}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {synthesisResponse.status === 'loading' ? '🤔 Analyzing...' : '🔬 Analyze Responses'}
            </button>
          </div>

          {/* Synthesis Result */}
          {synthesisResponse.status !== 'idle' && (
            <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">
                🔬 AI Synthesis Analysis
              </h3>
              {synthesisResponse.status === 'loading' && (
                <div className="space-y-2">
                  <div className="h-4 bg-purple-800 rounded animate-pulse" />
                  <div className="h-4 bg-purple-800 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-purple-800 rounded animate-pulse w-1/2" />
                </div>
              )}
              {synthesisResponse.status === 'error' && (
                <div className="text-red-400 text-sm">
                  ❌ Error: {synthesisResponse.error}
                </div>
              )}
              {synthesisResponse.status === 'complete' && synthesisResponse.response && (
                <ResponseViewer response={synthesisResponse.response} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// === MODEL SELECTOR COMPONENT ===

interface ModelSelectorProps {
  label: string;
  provider: LLMProvider;
  model: string;
  models: any[];
  onProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function ModelSelector({
  label,
  provider,
  model,
  models,
  onProviderChange,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-400">{label}</h3>
      <div className="space-y-2">
        <select
          value={provider}
          onChange={onProviderChange}
          className="w-full px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="anthropic">🦙 Anthropic</option>
          <option value="openai">🔵 OpenAI</option>
          <option value="google">🔷 Google</option>
          <option value="openrouter">🌐 OpenRouter</option>
        </select>
        <select
          value={model}
          onChange={onModelChange}
          className="w-full px-3 py-2 bg-zinc-800 text-zinc-50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// === RESPONSE CARD COMPONENT ===

interface ResponseCardProps {
  response: ComparisonResponse;
  label: string;
}

function ResponseCard({ response, label }: ResponseCardProps) {
  const getProviderIcon = (provider?: LLMProvider) => {
    switch (provider) {
      case 'anthropic': return '🦙';
      case 'openai': return '🔵';
      case 'google': return '🔷';
      case 'openrouter': return '🌐';
      default: return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">
          {getProviderIcon(response.provider)} {label} Response
        </h3>
        {response.status === 'loading' && (
          <span className="text-xs text-blue-400 animate-pulse">Loading...</span>
        )}
      </div>
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 min-h-[300px] max-h-[600px] overflow-y-auto">
        {response.status === 'loading' && (
          <div className="space-y-2">
            <div className="h-4 bg-zinc-700 rounded animate-pulse" />
            <div className="h-4 bg-zinc-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-zinc-700 rounded animate-pulse w-1/2" />
          </div>
        )}
        {response.status === 'error' && (
          <div className="text-red-400 text-sm">
            ❌ Error: {response.error}
          </div>
        )}
        {response.status === 'complete' && response.response && (
          <ResponseViewer response={response.response} />
        )}
      </div>
    </div>
  );
}

// === COMPARISON METRICS COMPONENT ===

interface ComparisonMetricsProps {
  responses: ComparisonResponse[];
}

function ComparisonMetrics({ responses }: ComparisonMetricsProps) {
  const complete = responses.filter(r => r.status === 'complete' && r.response);
  
  if (complete.length < 2) return null;

  const speeds = complete.map(r => r.response!.timeSeconds);
  const costs = complete.map(r => r.response!.cost);
  const outputs = complete.map(r => r.response!.outputTokens);

  const fastestIdx = speeds.indexOf(Math.min(...speeds));
  const cheapestIdx = costs.indexOf(Math.min(...costs));
  const longestIdx = outputs.indexOf(Math.max(...outputs));

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">Comparison Metrics</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-zinc-400 text-xs">Speed</div>
          {complete.map((r, idx) => (
            <div
              key={idx}
              className={`${idx === fastestIdx ? 'text-green-400 font-semibold' : 'text-zinc-400'}`}
            >
              {r.response!.timeSeconds.toFixed(2)}s {idx === fastestIdx && '✓'}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-zinc-400 text-xs">Cost</div>
          {complete.map((r, idx) => (
            <div
              key={idx}
              className={`${idx === cheapestIdx ? 'text-green-400 font-semibold' : 'text-zinc-400'}`}
            >
              ${r.response!.cost.toFixed(6)} {idx === cheapestIdx && '✓'}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-zinc-400 text-xs">Output Length</div>
          {complete.map((r, idx) => (
            <div
              key={idx}
              className={`${idx === longestIdx ? 'text-green-400 font-semibold' : 'text-zinc-400'}`}
            >
              {r.response!.outputTokens} tokens {idx === longestIdx && '✓'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// === SYNTHESIS PROMPT BUILDER ===

function buildAnalysisPrompt(
  systemPrompt: string,
  userPrompt: string,
  responses: ComparisonResponse[]
): string {
  const responseTexts = responses
    .map((r, idx) => {
      const modelName = r.response?.model || 'Unknown';
      const text = r.response?.text || '';
      return `## Response ${idx + 1} (${modelName}):\n\n${text}`;
    })
    .join('\n\n---\n\n');

  return `I tested the following prompt across multiple AI models and need your expert analysis.

**Original System Prompt:**
${systemPrompt || '(none)'}

**User Prompt:**
${userPrompt}

**Responses from ${responses.length} different models:**

${responseTexts}

---

**Please analyze these responses and provide:**

1. **Quality Assessment**: Which response(s) best answered the prompt? Why?
2. **Key Differences**: What are the main differences in approach, tone, or content?
3. **Strengths & Weaknesses**: What did each model do well or poorly?
4. **Consensus & Divergence**: Where do models agree? Where do they diverge?
5. **Recommendation**: Which response would you recommend using, and why?
6. **Prompt Improvement**: Any suggestions to improve the prompt for better results?

Be concise but thorough. Focus on actionable insights.`;
}
