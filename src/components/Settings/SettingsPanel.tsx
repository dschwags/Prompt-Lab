import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings.service';
import { PROVIDERS } from '../../constants/providers';
import type { Settings } from '../../types';
import { ApiKeyInput } from './ApiKeyInput';
import { ProviderConfig } from './ProviderConfig';
import { ExportImport } from './ExportImport';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<'apiKeys' | 'models' | 'backup'>('apiKeys');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const current = await settingsService.getSettings();
    setSettings(current);
  };

  const handleApiKeyChange = async (provider: string, value: string) => {
    await settingsService.setApiKey(provider, value);
    await loadSettings();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('apiKeys')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'apiKeys'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'models'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🤖 Default Models
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'backup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💾 Backup & Restore
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'apiKeys' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Add API keys for the providers you want to test against. Keys are stored locally in your browser.
              </p>
              {Object.values(PROVIDERS).map((provider) => (
                <ApiKeyInput
                  key={provider.id}
                  providerName={provider.name}
                  value={settings.apiKeys[provider.id] || ''}
                  placeholder={provider.apiKeyPlaceholder}
                  docsUrl={provider.docsUrl}
                  onChange={(value) => handleApiKeyChange(provider.id, value)}
                  onRemove={() => handleApiKeyRemove(provider.id)}
                />
              ))}
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
