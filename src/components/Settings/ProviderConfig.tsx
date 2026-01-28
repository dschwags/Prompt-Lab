import React from 'react';
import type { Settings } from '../../types';
import { PROVIDERS } from '../../constants/providers';

interface ProviderConfigProps {
  settings: Settings;
  onDefaultModelChange: (provider: string, modelId: string) => void;
}

export const ProviderConfig: React.FC<ProviderConfigProps> = ({
  settings,
  onDefaultModelChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-zinc-400">
          Select default models for each provider. These will be pre-selected when creating new prompts.
        </p>
      </div>

      {Object.values(PROVIDERS).map((provider) => {
        const hasApiKey = !!settings.apiKeys[provider.id];
        const defaultModel = settings.defaultModels[provider.id];

        return (
          <div
            key={provider.id}
            className={`rounded-lg border-2 p-5 transition-all shadow-lg ${
              hasApiKey 
                ? 'bg-zinc-950/100 border-zinc-700 hover:border-zinc-600' 
                : 'bg-zinc-900/100 border-zinc-800 opacity-60'
            }`}
            style={{ backgroundColor: hasApiKey ? 'rgb(9, 9, 11)' : 'rgb(24, 24, 27)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-zinc-200">{provider.name}</span>
              {!hasApiKey && (
                <span className="px-3 py-1 text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/50 rounded-md font-bold">
                  API key not configured
                </span>
              )}
            </div>

            <select
              value={defaultModel || ''}
              onChange={(e) => onDefaultModelChange(provider.id, e.target.value)}
              disabled={!hasApiKey}
              className="w-full px-4 py-3 bg-zinc-900/100 border-2 border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 font-mono transition-all"
              style={{ backgroundColor: 'rgb(24, 24, 27)' }}
            >
              <option value="" className="text-zinc-500">No default selected</option>
              {provider.models.map((model) => (
                <option key={model.id} value={model.id} className="text-zinc-200 bg-zinc-900">
                  {model.name} ({(model.contextWindow / 1000).toFixed(0)}K context)
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};
