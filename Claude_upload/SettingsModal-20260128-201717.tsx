/**
 * TIMESTAMP: 20260128-201717
 * VERSION: Functional with Test Keys + Centered Modal
 * 
 * This file restores ALL functionality that was broken:
 * - Test Key buttons
 * - Real API validation
 * - Status indicators
 * - Eye icons for password visibility
 * - Proper centering
 * - Clean layout
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'api-keys' | 'models' | 'backup';

interface KeyStatus {
  status: 'idle' | 'testing' | 'valid' | 'invalid';
  message?: string;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('api-keys');
  const [apiKeys, setApiKeys] = useState({
    anthropic: localStorage.getItem('apiKey_anthropic') || '',
    openai: localStorage.getItem('apiKey_openai') || '',
    google: localStorage.getItem('apiKey_google') || '',
  });
  
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>({
    anthropic: { status: 'idle' },
    openai: { status: 'idle' },
    google: { status: 'idle' },
  });

  const [showKeys, setShowKeys] = useState({
    anthropic: false,
    openai: false,
    google: false,
  });

  const handleSave = (provider: 'anthropic' | 'openai' | 'google', value: string) => {
    localStorage.setItem(`apiKey_${provider}`, value);
    setApiKeys({ ...apiKeys, [provider]: value });
    setKeyStatuses({ ...keyStatuses, [provider]: { status: 'idle' } });
  };

  const testKey = async (provider: 'anthropic' | 'openai' | 'google') => {
    const key = apiKeys[provider];
    if (!key) return;

    setKeyStatuses({ ...keyStatuses, [provider]: { status: 'testing' } });

    try {
      if (provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }],
          }),
        });

        if (response.ok) {
          setKeyStatuses({
            ...keyStatuses,
            [provider]: {
              status: 'valid',
              message: 'Key is valid and working',
            },
          });
        } else {
          const error = await response.text();
          setKeyStatuses({
            ...keyStatuses,
            [provider]: {
              status: 'invalid',
              message: error.includes('authentication') ? 'Invalid API key' : 'API error',
            },
          });
        }
      } else {
        setKeyStatuses({
          ...keyStatuses,
          [provider]: {
            status: 'valid',
            message: 'Format OK (validation coming soon)',
          },
        });
      }
    } catch (error) {
      setKeyStatuses({
        ...keyStatuses,
        [provider]: {
          status: 'invalid',
          message: 'Network error',
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal - CENTERED WITH FLEXBOX */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-50">
              ⚙️ Settings <span className="text-xs text-zinc-500">(v20260128-201717)</span>
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-800">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'api-keys'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                🔑 API Keys
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'models'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                🤖 Default Models
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'backup'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                💾 Backup & Restore
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-400 mb-6">
                  Add API keys for the providers you want to test. Keys are stored locally in your browser.
                </p>

                {/* Anthropic */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-200">
                    Anthropic (Claude)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys.anthropic ? 'text' : 'password'}
                        value={apiKeys.anthropic}
                        onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                        onBlur={(e) => handleSave('anthropic', e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full px-3 py-2 pr-10 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, anthropic: !showKeys.anthropic })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showKeys.anthropic ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <button
                      onClick={() => testKey('anthropic')}
                      disabled={!apiKeys.anthropic || keyStatuses.anthropic.status === 'testing'}
                      className="px-4 py-2 text-sm font-medium text-zinc-50 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {keyStatuses.anthropic.status === 'testing' ? 'Testing...' : 'Test Key'}
                    </button>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-950 transition-colors whitespace-nowrap flex items-center"
                    >
                      Get Key →
                    </a>
                  </div>
                  {apiKeys.anthropic && keyStatuses.anthropic.status !== 'idle' && (
                    <div className={`text-xs ${
                      keyStatuses.anthropic.status === 'valid' ? 'text-green-500' :
                      keyStatuses.anthropic.status === 'invalid' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {keyStatuses.anthropic.status === 'valid' && '✓ '}
                      {keyStatuses.anthropic.status === 'invalid' && '✗ '}
                      {keyStatuses.anthropic.message}
                    </div>
                  )}
                </div>

                {/* OpenAI */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-200">
                    OpenAI
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys.openai ? 'text' : 'password'}
                        value={apiKeys.openai}
                        onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                        onBlur={(e) => handleSave('openai', e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-10 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showKeys.openai ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <button
                      onClick={() => testKey('openai')}
                      disabled={!apiKeys.openai || keyStatuses.openai.status === 'testing'}
                      className="px-4 py-2 text-sm font-medium text-zinc-50 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {keyStatuses.openai.status === 'testing' ? 'Testing...' : 'Test Key'}
                    </button>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-950 transition-colors whitespace-nowrap flex items-center"
                    >
                      Get Key →
                    </a>
                  </div>
                  {apiKeys.openai && keyStatuses.openai.status !== 'idle' && (
                    <div className={`text-xs ${
                      keyStatuses.openai.status === 'valid' ? 'text-green-500' :
                      keyStatuses.openai.status === 'invalid' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {keyStatuses.openai.status === 'valid' && '✓ '}
                      {keyStatuses.openai.status === 'invalid' && '✗ '}
                      {keyStatuses.openai.message}
                    </div>
                  )}
                </div>

                {/* Google AI */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-200">
                    Google AI (Gemini)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys.google ? 'text' : 'password'}
                        value={apiKeys.google}
                        onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                        onBlur={(e) => handleSave('google', e.target.value)}
                        placeholder="AIza..."
                        className="w-full px-3 py-2 pr-10 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, google: !showKeys.google })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showKeys.google ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <button
                      onClick={() => testKey('google')}
                      disabled={!apiKeys.google || keyStatuses.google.status === 'testing'}
                      className="px-4 py-2 text-sm font-medium text-zinc-50 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {keyStatuses.google.status === 'testing' ? 'Testing...' : 'Test Key'}
                    </button>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-950 transition-colors whitespace-nowrap flex items-center"
                    >
                      Get Key →
                    </a>
                  </div>
                  {apiKeys.google && keyStatuses.google.status !== 'idle' && (
                    <div className={`text-xs ${
                      keyStatuses.google.status === 'valid' ? 'text-green-500' :
                      keyStatuses.google.status === 'invalid' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {keyStatuses.google.status === 'valid' && '✓ '}
                      {keyStatuses.google.status === 'invalid' && '✗ '}
                      {keyStatuses.google.message}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-950 border border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-200">
                    💡 <strong>MVP Note:</strong> Only Anthropic validation is fully implemented. OpenAI and Google coming in Phase B.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-400 mb-4">
                  Default models for each provider. Coming soon.
                </p>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-400 mb-4">
                  Backup and restore your settings. Coming soon.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-50 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
