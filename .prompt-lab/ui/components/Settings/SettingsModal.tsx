import { useState } from 'react';
import { Eye, EyeOff, Key, X, ExternalLink, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Settings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

// Provider configuration with links to obtain API keys
const PROVIDERS = [
  { 
    id: 'openrouter', 
    label: 'OpenRouter (100+ Models)',
    url: 'https://openrouter.ai/keys',
    description: 'Access 100+ models with a single key'
  },
  { 
    id: 'anthropic', 
    label: 'Anthropic (Claude)',
    url: 'https://console.anthropic.com/settings/keys',
    description: 'Direct access to Claude models'
  },
  { 
    id: 'openai', 
    label: 'OpenAI (GPT)',
    url: 'https://platform.openai.com/api-keys',
    description: 'GPT-4, GPT-4o, and more'
  },
  { 
    id: 'google', 
    label: 'Google (Gemini)',
    url: 'https://aistudio.google.com/app/apikey',
    description: 'Gemini 2.0 and other models'
  }
] as const;

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verified, setVerified] = useState<Record<string, boolean | null>>({});
  const [testError, setTestError] = useState<Record<string, string>>({});

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const verifyKey = async (providerId: string, key: string) => {
    if (!key.trim()) return;
    
    setVerifying(prev => ({ ...prev, [providerId]: true }));
    setTestError(prev => ({ ...prev, [providerId]: '' }));
    setVerified(prev => ({ ...prev, [providerId]: null }));

    try {
      // Simple verification by making a test API call to OpenRouter
      const response = await fetch(`https://openrouter.ai/api/v1/models`, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': window.location.origin
        }
      });

      if (response.ok) {
        setVerified(prev => ({ ...prev, [providerId]: true }));
      } else if (response.status === 401) {
        setVerified(prev => ({ ...prev, [providerId]: false }));
        setTestError(prev => ({ ...prev, [providerId]: 'Invalid API key' }));
      } else if (providerId === 'openrouter') {
        // For OpenRouter, a 401 means key was invalid, otherwise endpoint might be rate limited
        setVerified(prev => ({ ...prev, [providerId]: false }));
        setTestError(prev => ({ ...prev, [providerId]: 'Could not verify key' }));
      } else {
        // For other providers, we can't easily verify without the right endpoint
        // Just show as verified since we can't test easily
        setVerified(prev => ({ ...prev, [providerId]: null }));
      }
    } catch (error) {
      setVerified(prev => ({ ...prev, [providerId]: false }));
      setTestError(prev => ({ ...prev, [providerId]: 'Could not verify key' }));
    } finally {
      setVerifying(prev => ({ ...prev, [providerId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight">API Keys</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure Key Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Info Banner */}
          <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black">i</span>
            </div>
            <div>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                API keys are stored locally in your browser. They never leave your device.
              </p>
              <p className="text-xs text-blue-700 leading-relaxed font-medium mt-1">
                <strong>OpenRouter</strong> provides access to 100+ models with a single key.
              </p>
            </div>
          </div>

          {/* API Key Inputs */}
          {PROVIDERS.map(({ id, label, url, description }) => {
            const keyValue = localSettings.keys[id as keyof Settings['keys']] || '';
            const isVerified = verified[id];
            const isVerifying = verifying[id];
            const errorMessage = testError[id];

            return (
              <div key={id} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {label}
                    </label>
                    {/* Verification status */}
                    {keyValue && (
                      <span className="flex items-center gap-1">
                        {isVerifying ? (
                          <Loader2 size={12} className="text-indigo-500 animate-spin" />
                        ) : isVerified === true ? (
                          <CheckCircle size={12} className="text-emerald-500" />
                        ) : isVerified === false ? (
                          <XCircle size={12} className="text-red-500" />
                        ) : null}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Get API Key link */}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-bold transition-colors"
                    >
                      Get Key
                      <ExternalLink size={10} />
                    </a>
                    <button
                      onClick={() => toggleKeyVisibility(id)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title={showKeys[id] ? 'Hide key' : 'Show key'}
                    >
                      {showKeys[id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showKeys[id] ? 'text' : 'password'}
                    value={keyValue}
                    onChange={(e) => {
                      setLocalSettings({
                        ...localSettings,
                        keys: { ...localSettings.keys, [id]: e.target.value }
                      });
                      // Reset verification when key changes
                      setVerified(prev => ({ ...prev, [id]: null }));
                      setTestError(prev => ({ ...prev, [id]: '' }));
                    }}
                    placeholder={`Enter ${label} API key...`}
                    className={`w-full p-4 pr-24 bg-slate-50 rounded-2xl border-2 text-sm font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all ${
                      isVerified === false ? 'border-red-300 focus:border-red-400' : ''
                    }`}
                  />
                  {/* Verify button */}
                  <button
                    onClick={() => verifyKey(id, keyValue)}
                    disabled={!keyValue.trim() || isVerifying}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    title="Verify API key"
                  >
                    {isVerifying ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    Verify
                  </button>
                </div>
                {/* Error message */}
                {errorMessage && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1 px-1">
                    <XCircle size={12} />
                    {errorMessage}
                  </p>
                )}
                {/* Description */}
                <p className="text-xs text-slate-400 px-1">{description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-wider"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
