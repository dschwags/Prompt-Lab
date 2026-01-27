import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings.service';
import { PROVIDERS, OPENROUTER_PROVIDER, getAvailableProviders, detectIntegrationMode } from '../../constants/providers';
import type { Settings, IntegrationMode } from '../../types';
import { IntegrationModeSelector } from './IntegrationModeSelector';
import { ApiKeyInput } from './ApiKeyInput';
import { ProviderConfig } from './ProviderConfig';
import { ExportImport } from './ExportImport';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<'mode' | 'apiKeys' | 'models' | 'backup'>('mode');
  const isPro = settings?.membershipTier === 'pro' || settings?.membershipTier === 'team';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const current = await settingsService.getSettings();
    setSettings(current);
  };

  const handleModeChange = async (mode: IntegrationMode) => {
    await settingsService.updateSettings({ integrationMode: mode });
    await loadSettings();
  };

  const handleApiKeyChange = async (provider: string, value: string) => {
    await settingsService.setApiKey(provider, value);
    await loadSettings();
    
    // Auto-detect mode based on keys
    const current = await settingsService.getSettings();
    const detectedMode = detectIntegrationMode(current.apiKeys);
    if (detectedMode !== current.integrationMode) {
      await settingsService.updateSettings({ integrationMode: detectedMode });
      await loadSettings();
    }
  };

  const handleApiKeyRemove = async (provider: string) => {
    await settingsService.removeApiKey(provider);
    await loadSettings();
  };

  const handleDefaultModelChange = async (provider: string, modelId: string) => {
    await settingsService.setDefaultModel(provider, modelId);
    await loadSettings();
  };

  const handleExport = async (includeApiKeys: boolean) => {
    const json = await settingsService.exportSettings(includeApiKeys);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-lab-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File, mergeApiKeys: boolean) => {
    try {
      const text = await file.text();
      await settingsService.importSettings(text, mergeApiKeys);
      await loadSettings();
      alert('✅ Settings imported successfully');
    } catch (error) {
      alert('❌ Failed to import settings: ' + (error as Error).message);
    }
  };

  const handleReset = async () => {
    await settingsService.resetToDefaults();
    await loadSettings();
    alert('✅ Settings reset to defaults');
  };

  if (!settings) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  const configuredKeys = Object.keys(settings.apiKeys).filter(key => settings.apiKeys[key]);
  const availableProviders = getAvailableProviders(settings.integrationMode);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">⚙️ Settings</h2>
            {settings.integrationMode && (
              <p className="text-sm text-gray-500 mt-1">
                Current mode: {INTEGRATION_MODES[settings.integrationMode]?.name || settings.integrationMode}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mode')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'mode'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 Integration
          </button>
          <button
            onClick={() => setActiveTab('apiKeys')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'apiKeys'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔑 API Keys
            {configuredKeys.length > 0 && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {configuredKeys.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'models'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🤖 Default Models
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'backup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💾 Backup
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'mode' && (
            <IntegrationModeSelector
              currentMode={settings.integrationMode}
              configuredKeys={configuredKeys}
              isPro={isPro}
              onModeChange={handleModeChange}
            />
          )}

          {activeTab === 'apiKeys' && (
            <div className="space-y-4">
              {/* Mode-specific guidance */}
              {settings.integrationMode === 'managed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">🌟 Managed Keys Active</h3>
                  <p className="text-sm text-blue-800">
                    You're using our managed API keys. No configuration needed!
                    {!isPro && ' Upgrade to Pro to unlock this feature.'}
                  </p>
                </div>
              )}

              {settings.integrationMode === 'openrouter' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-900 mb-2">🔑 OpenRouter Mode</h3>
                  <p className="text-sm text-green-800 mb-2">
                    Configure your OpenRouter key to access 100+ models with one key.
                  </p>
                  <ApiKeyInput
                    provider="openrouter"
                    providerName={OPENROUTER_PROVIDER.name}
                    value={settings.apiKeys.openrouter || ''}
                    placeholder={OPENROUTER_PROVIDER.apiKeyPlaceholder}
                    docsUrl={OPENROUTER_PROVIDER.docsUrl}
                    onChange={(value) => handleApiKeyChange('openrouter', value)}
                    onRemove={() => handleApiKeyRemove('openrouter')}
                  />
                </div>
              )}

              {settings.integrationMode === 'single-provider' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-purple-900 mb-2">🎯 Workshop Mode</h3>
                  <p className="text-sm text-purple-800 mb-3">
                    Choose one provider to focus on. You can add more providers anytime.
                  </p>
                </div>
              )}

              {settings.integrationMode === 'multi-provider' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-orange-900 mb-2">🔐 Multi-Provider Mode</h3>
                  <p className="text-sm text-orange-800">
                    Configure API keys for each provider you want to test against.
                  </p>
                </div>
              )}

              {/* API Key Inputs */}
              {settings.integrationMode !== 'managed' && (
                <div className="space-y-4">
                  {settings.integrationMode === 'openrouter' ? (
                    // Only show OpenRouter
                    <ApiKeyInput
                      provider="openrouter"
                      providerName={OPENROUTER_PROVIDER.name}
                      value={settings.apiKeys.openrouter || ''}
                      placeholder={OPENROUTER_PROVIDER.apiKeyPlaceholder}
                      docsUrl={OPENROUTER_PROVIDER.docsUrl}
                      onChange={(value) => handleApiKeyChange('openrouter', value)}
                      onRemove={() => handleApiKeyRemove('openrouter')}
                    />
                  ) : (
                    // Show all direct providers
                    Object.values(PROVIDERS).map((provider) => (
                      <ApiKeyInput
                        key={provider.id}
                        provider={provider.id}
                        providerName={provider.name}
                        value={settings.apiKeys[provider.id] || ''}
                        placeholder={provider.apiKeyPlaceholder}
                        docsUrl={provider.docsUrl}
                        onChange={(value) => handleApiKeyChange(provider.id, value)}
                        onRemove={() => handleApiKeyRemove(provider.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'models' && (
            <ProviderConfig
              settings={settings}
              onDefaultModelChange={handleDefaultModelChange}
            />
          )}

          {activeTab === 'backup' && (
            <ExportImport
              onExport={handleExport}
              onImport={handleImport}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};
