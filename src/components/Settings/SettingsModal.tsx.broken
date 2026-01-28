import { useState } from 'react';
import { createPortal } from 'react-dom';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'api-keys' | 'models' | 'backup';

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('api-keys');
  const [apiKeys, setApiKeys] = useState({
    anthropic: localStorage.getItem('apiKey_anthropic') || '',
    openai: localStorage.getItem('apiKey_openai') || '',
    google: localStorage.getItem('apiKey_google') || '',
  });

  const handleSave = (provider: 'anthropic' | 'openai' | 'google', value: string) => {
    localStorage.setItem(`apiKey_${provider}`, value);
    setApiKeys({ ...apiKeys, [provider]: value });
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

      {/* Modal - CENTERED with flexbox */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-50">⚙️ Settings</h2>
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

          {/* Content - Scrollable */}
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
                    <input
                      type="password"
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                      onBlur={(e) => handleSave('anthropic', e.target.value)}
                      placeholder="sk-ant-..."
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-950 transition-colors whitespace-nowrap"
                    >
                      Get Key →
                    </a>
                  </div>
                  {apiKeys.anthropic && (
                    <p className="text-xs text-green-500">✓ Saved</p>
                  )}
                </div>

                {/* OpenAI */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-200">
                    OpenAI
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      onBlur={(e) => handleSave('openai', e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-950 transition-colors whitespace-nowrap"
                    >
                      Get Key →
                    </a>
                  </div>
                  {apiKeys.openai && (
                    <p className="text-xs text-green-500">✓ Saved</p>
                  )}
                </div>

                {/* Google AI */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-200">
                    Google AI (Gemini)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeys.google}
                      onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                      onBlur={(e) => handleSave('google', e.target.value)}
                      placeholder="AIza..."
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-600 rounded-lg hover:bg-blue-950 transition-colors whitespace-nowrap"
                    >
                      Get Key →
                    </a>
                  </div>
                  {apiKeys.google && (
                    <p className="text-xs text-green-500">✓ Saved</p>
                  )}
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-950 border border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-200">
                    💡 <strong>MVP Note:</strong> Only Anthropic is currently integrated. OpenAI and Google support coming in Phase B.
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
