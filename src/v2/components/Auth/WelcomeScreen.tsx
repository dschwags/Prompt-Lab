import { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Users, 
  DollarSign, 
  ArrowRight, 
  X,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Key
} from 'lucide-react';
import { Settings } from '../../types';

interface WelcomeScreenProps {
  onEnter: () => void;
  onLearnMore: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
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

const FEATURES = [
  {
    icon: Layers,
    title: 'Multi-Model Comparison',
    description: 'Send one prompt to Claude, GPT, Gemini, and 100+ models. See all responses side-by-side.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Sparkles,
    title: 'Workshop Mode',
    description: 'Refine prompts iteratively. Lock best responses, compare improvements, synthesize the perfect answer.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Users,
    title: 'Choose Your Personas',
    description: 'Apply expert personas to your prompts. Engineer better responses with role-based instructions.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: DollarSign,
    title: 'Cost Estimation',
    description: 'See real-time cost and token estimates before you send. Stay within budget effortlessly.',
    color: 'from-rose-500 to-pink-500'
  }
] as const;

function ApiKeysSection({ settings, onSave }: { settings: Settings; onSave: (settings: Settings) => void }) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verified, setVerified] = useState<Record<string, boolean | null>>({});
  const [testError, setTestError] = useState<Record<string, string>>({});

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSave = () => onSave(localSettings);

  const verifyKey = async (providerId: string, key: string) => {
    if (!key.trim()) return;
    setVerifying(prev => ({ ...prev, [providerId]: true }));
    setTestError(prev => ({ ...prev, [providerId]: '' }));
    setVerified(prev => ({ ...prev, [providerId]: null }));

    try {
      const response = await fetch(`https://openrouter.ai/api/v1/models`, {
        headers: { 'Authorization': `Bearer ${key}`, 'HTTP-Referer': window.location.origin }
      });
      if (response.ok) {
        setVerified(prev => ({ ...prev, [providerId]: true }));
      } else if (response.status === 401) {
        setVerified(prev => ({ ...prev, [providerId]: false }));
        setTestError(prev => ({ ...prev, [providerId]: 'Invalid API key' }));
      } else if (providerId === 'openrouter') {
        setVerified(prev => ({ ...prev, [providerId]: false }));
        setTestError(prev => ({ ...prev, [providerId]: 'Could not verify key' }));
      } else {
        setVerified(prev => ({ ...prev, [providerId]: null }));
      }
    } catch {
      setVerified(prev => ({ ...prev, [providerId]: false }));
      setTestError(prev => ({ ...prev, [providerId]: 'Could not verify key' }));
    } finally {
      setVerifying(prev => ({ ...prev, [providerId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Key size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">API Keys</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configure your keys to get started</p>
          </div>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-700 transition-colors">
          Save Keys
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-3 border border-blue-100">
          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[10px] font-black">i</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            API keys are stored locally in your browser. They never leave your device.
          </p>
        </div>

        {PROVIDERS.map(({ id, label, url, description }) => {
          const keyValue = localSettings.keys[id as keyof Settings['keys']] || '';
          const isVerified = verified[id];
          const isVerifying = verifying[id];
          const errorMessage = testError[id];

          return (
            <div key={id} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</label>
                  {keyValue && (
                    <span className="flex items-center gap-1">
                      {isVerifying ? <Loader2 size={10} className="text-indigo-500 animate-spin" /> : 
                       isVerified === true ? <CheckCircle size={10} className="text-emerald-500" /> : 
                       isVerified === false ? <XCircle size={10} className="text-red-500" /> : null}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-bold transition-colors">
                    Get Key <ExternalLink size={10} />
                  </a>
                  <button onClick={() => toggleKeyVisibility(id)} className="text-slate-400 hover:text-indigo-600 transition-colors" title={showKeys[id] ? 'Hide key' : 'Show key'}>
                    {showKeys[id] ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showKeys[id] ? 'text' : 'password'}
                  value={keyValue}
                  onChange={(e) => {
                    setLocalSettings({ ...localSettings, keys: { ...localSettings.keys, [id]: e.target.value }});
                    setVerified(prev => ({ ...prev, [id]: null }));
                    setTestError(prev => ({ ...prev, [id]: '' }));
                  }}
                  placeholder={`Enter ${label} API key...`}
                  className={`w-full p-3 pr-20 bg-slate-50 rounded-xl border-2 text-sm font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all ${isVerified === false ? 'border-red-300 focus:border-red-400' : ''}`}
                />
                <button
                  onClick={() => verifyKey(id, keyValue)}
                  disabled={!keyValue.trim() || isVerifying}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {isVerifying ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                  Verify
                </button>
              </div>
              {errorMessage && <p className="text-xs text-red-600 font-medium flex items-center gap-1 px-1"><XCircle size={10} />{errorMessage}</p>}
              <p className="text-xs text-slate-400 px-1">{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WelcomeScreen({ onEnter, onLearnMore, settings, onSaveSettings }: WelcomeScreenProps) {
  const [showApiKeys, setShowApiKeys] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50">
      {/* Header */}
      <div className="pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Prompt Lab</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-lg mx-auto px-4">
          Your AI workshop for comparing, refining, and synthesizing the best responses from multiple models.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="text-white" size={22} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pb-6 text-center space-y-4">
        <button
          onClick={onEnter}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-200 hover:scale-105 transition-all duration-300"
        >
          Enter Prompt Lab
          <ArrowRight size={22} />
        </button>
        
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onLearnMore}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
          >
            Learn more about Prompt Lab
            <ChevronRight size={16} />
          </button>
          
          <button
            onClick={() => setShowApiKeys(!showApiKeys)}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-medium text-xs transition-colors"
          >
            <Key size={14} />
            {showApiKeys ? 'Hide API Keys' : 'Configure API Keys'}
            <ChevronRight size={14} className={showApiKeys ? 'rotate-90' : '-rotate-90'} />
          </button>
        </div>
      </div>

      {/* API Keys Section - Expandable */}
      {showApiKeys && (
        <div className="max-w-2xl mx-auto px-4 pb-8 animate-in slide-in-from-top-2 duration-300">
          <ApiKeysSection settings={settings} onSave={onSaveSettings} />
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-slate-400">
          Configure API keys above to get started
        </p>
      </div>
    </div>
  );
}

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">About</h3>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Prompt Lab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {/* What is Prompt Lab */}
          <section className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-4">What is Prompt Lab?</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Prompt Lab is your AI workshop for mastering prompt engineering. 
              Compare responses from multiple models, iteratively refine your prompts, 
              and synthesize the perfect answer using the best parts from each response.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-slate-900 mb-4">Key Features</h2>
            
            <div className="space-y-6">
              {/* Multi-Model */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Layers className="text-white" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Multi-Model Comparison</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Send one prompt to Claude, GPT,4o, Gemini 2.0, DeepSeek, and 100+ models via OpenRouter. 
                    See all responses side-by-side and pick the best one—or combine parts from multiple.
                  </p>
                </div>
              </div>

              {/* Workshop Mode */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="text-white" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Workshop Mode</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Don't like the first response? Refine your prompt and send again. 
                    Lock your favorite response, compare iterations, and track improvements over time.
                  </p>
                </div>
              </div>

              {/* Choose Your Personas */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="text-white" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Choose Your Personas</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Apply expert personas to your prompts. Choose from engineers, architects, 
                    marketers, and more—or create custom personas to get role-specific expertise.
                  </p>
                </div>
              </div>

              {/* Cost Estimation */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <DollarSign className="text-white" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Cost Estimation</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    See estimated costs and token counts for each response before you send. 
                    Stay within budget and track your spending across sessions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-3">Getting Started</h2>
            <ol className="space-y-3 text-slate-600 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Configure your API keys in <strong>Settings</strong> (top-right gear icon)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Choose a persona or write your system instructions</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Select 2+ models to compare</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Send your prompt and compare results!</span>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
