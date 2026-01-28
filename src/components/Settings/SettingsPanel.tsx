import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900/100 border-2 border-zinc-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'rgb(24, 24, 27)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b-2 border-zinc-700 bg-zinc-950/100" style={{ backgroundColor: 'rgb(9, 9, 11)' }}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-zinc-100 font-mono tracking-tight">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-zinc-700 bg-zinc-950/100 px-6" style={{ backgroundColor: 'rgb(9, 9, 11)' }}>
          <button
            onClick={() => setActiveTab('apiKeys')}
            className={`px-5 py-3.5 text-sm font-semibold transition-all relative ${
              activeTab === 'apiKeys'
                ? 'text-blue-400 bg-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {activeTab === 'apiKeys' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-5 py-3.5 text-sm font-semibold transition-all relative ${
              activeTab === 'models'
                ? 'text-blue-400 bg-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {activeTab === 'models' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
            🤖 Default Models
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-5 py-3.5 text-sm font-semibold transition-all relative ${
              activeTab === 'backup'
                ? 'text-blue-400 bg-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {activeTab === 'backup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
            💾 Backup & Restore
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-900/100" style={{ backgroundColor: 'rgb(24, 24, 27)' }}>
          {activeTab === 'apiKeys' && (
            <div className="space-y-6">
              <p className="text-sm text-zinc-400 mb-6">
                Add API keys for the providers you want to test against. Keys are stored locally in your browser.
              </p>
              {Object.values(PROVIDERS).map((provider) => (
                <ApiKeyInput
                  key={provider.id}
                  providerName={provider.name}
                  providerId={provider.id}
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

  // Use portal to render modal outside #root container
  return createPortal(modalContent, document.body);
};
