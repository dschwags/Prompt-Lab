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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Default Models</h3>
      <p className="text-sm text-gray-600">
        Select default models for each provider. These will be pre-selected when creating new prompts.
      </p>

      {Object.values(PROVIDERS).map((provider) => {
        const hasApiKey = !!settings.apiKeys[provider.id];
        const defaultModel = settings.defaultModels[provider.id];

        return (
          <div
            key={provider.id}
            className={`border rounded-lg p-4 ${
              hasApiKey ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{provider.name}</span>
              {!hasApiKey && (
                <span className="text-xs text-gray-500">⚠️ API key not configured</span>
              )}
            </div>

            <select
              value={defaultModel || ''}
              onChange={(e) => onDefaultModelChange(provider.id, e.target.value)}
              disabled={!hasApiKey}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">No default selected</option>
              {provider.models.map((model) => (
                <option key={model.id} value={model.id}>
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
