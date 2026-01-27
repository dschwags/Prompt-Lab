import React from 'react';
import type { IntegrationMode } from '../../constants/providers';
import { INTEGRATION_MODES } from '../../constants/providers';

interface IntegrationModeSelectorProps {
  currentMode: IntegrationMode;
  configuredKeys: string[];
  isPro: boolean;
  onModeChange: (mode: IntegrationMode) => void;
}

export const IntegrationModeSelector: React.FC<IntegrationModeSelectorProps> = ({
  currentMode,
  configuredKeys,
  isPro,
  onModeChange,
}) => {
  const modes: IntegrationMode[] = ['managed', 'openrouter', 'multi-provider', 'single-provider'];
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Integration</h3>
        <p className="text-sm text-gray-600">
          Select how you want to access AI models. You can change this anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const info = INTEGRATION_MODES[mode];
          const isDisabled = info.proOnly && !isPro;
          const isRecommended = mode === 'openrouter' && configuredKeys.length === 0;
          const isDetected = mode === 'single-provider' && configuredKeys.length === 1;
          
          return (
            <button
              key={mode}
              onClick={() => !isDisabled && onModeChange(mode)}
              disabled={isDisabled}
              className={`
                relative p-4 border-2 rounded-lg text-left transition-all
                ${currentMode === mode 
                  ? 'border-blue-600 bg-blue-50' 
                  : isDisabled 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              {/* Badges */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{info.icon}</span>
                <div className="flex gap-1">
                  {isRecommended && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                  {isDetected && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      Detected
                    </span>
                  )}
                  {info.proOnly && !isPro && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      Pro
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="font-semibold text-gray-900 mb-1">{info.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{info.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className={`
                    inline-block w-2 h-2 rounded-full
                    ${info.setupDifficulty === 'easy' ? 'bg-green-500' : 
                      info.setupDifficulty === 'medium' ? 'bg-yellow-500' : 
                      'bg-red-500'}
                  `} />
                  <span className="capitalize">{info.setupDifficulty}</span>
                </div>
                <div>
                  {info.requiredKeys === 0 ? 'No keys needed' : 
                   info.requiredKeys === 1 ? '1 key' : 
                   `${info.requiredKeys}+ keys`}
                </div>
              </div>

              {/* Selection indicator */}
              {currentMode === mode && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mode-specific instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        {currentMode === 'managed' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🌟 Managed Keys Setup</h4>
            <p className="text-sm text-gray-600 mb-2">
              With a Pro membership, we handle all API keys for you. No setup required!
            </p>
            {!isPro && (
              <a href="#pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Upgrade to Pro →
              </a>
            )}
          </div>
        )}

        {currentMode === 'openrouter' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔑 OpenRouter Setup</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Get your free API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">openrouter.ai</a></li>
              <li>Add $5-10 credit to your OpenRouter account</li>
              <li>Paste your key in the "OpenRouter" section below</li>
              <li>Access 100+ models instantly! 🎉</li>
            </ol>
            <div className="mt-3 text-xs text-gray-500">
              💡 OpenRouter is cheaper than direct APIs and gives you access to every model with one key.
            </div>
          </div>
        )}

        {currentMode === 'multi-provider' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔐 Multi-Provider Setup</h4>
            <p className="text-sm text-gray-600 mb-2">
              Get API keys from each provider for maximum control:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600">OpenAI</a> - For GPT models</li>
              <li><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600">Anthropic</a> - For Claude models</li>
              <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600">Google AI</a> - For Gemini models</li>
            </ul>
          </div>
        )}

        {currentMode === 'single-provider' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Workshop Mode</h4>
            <p className="text-sm text-gray-600 mb-2">
              Perfect for focused prompt refinement with one provider. Great uses:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Compare different Gemini models (Pro vs Flash vs 2.0)</li>
              <li>Test prompt variations with different temperatures</li>
              <li>Refine system prompts before scaling to other providers</li>
              <li>Learn one provider deeply before expanding</li>
            </ul>
            <div className="mt-3 text-xs text-gray-500">
              💡 You'll still get full comparison features, just with one provider's models.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
