import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { settingsService } from '../../services/settings.service';
import { validateApiKey, type ValidationResult } from '../../services/api-validator.service';
import { PROVIDERS } from '../../constants/providers';
import type { Settings } from '../../types';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'apiKeys' | 'models' | 'backup';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('apiKeys');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
    
    // ESC key closes modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
      alert('❌ Failed to import: ' + (error as Error).message);
    }
  };

  const handleReset = async () => {
    if (confirm('⚠️ Reset all settings to defaults? This cannot be undone.')) {
      await settingsService.resetToDefaults();
      await loadSettings();
      alert('✅ Settings reset to defaults');
    }
  };

  if (!settings) return null;

  const modalContent = (
    // Portal backdrop - CRITICAL: centered flexbox
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      {/* Modal container - CRITICAL: centered, solid background */}
      <div 
        ref={modalRef}
        className="w-full max-w-[700px] max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#18181b',
          border: '1px solid #3f3f46'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ 
            backgroundColor: '#18181b',
            borderBottom: '1px solid #3f3f46'
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: '#fafafa' }}>Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors hover:bg-zinc-800"
            style={{ color: '#a1a1aa' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex gap-1 px-6 py-3"
          style={{ 
            backgroundColor: '#18181b',
            borderBottom: '1px solid #3f3f46'
          }}
        >
          <button
            onClick={() => setActiveTab('apiKeys')}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              backgroundColor: activeTab === 'apiKeys' ? '#27272a' : 'transparent',
              color: activeTab === 'apiKeys' ? '#fafafa' : '#a1a1aa'
            }}
          >
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              backgroundColor: activeTab === 'models' ? '#27272a' : 'transparent',
              color: activeTab === 'models' ? '#fafafa' : '#a1a1aa'
            }}
          >
            🤖 Default Models
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              backgroundColor: activeTab === 'backup' ? '#27272a' : 'transparent',
              color: activeTab === 'backup' ? '#fafafa' : '#a1a1aa'
            }}
          >
            💾 Backup & Restore
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#18181b' }}>
          {activeTab === 'apiKeys' && (
            <ApiKeysTab 
              settings={settings}
              onApiKeyChange={handleApiKeyChange}
              onApiKeyRemove={handleApiKeyRemove}
            />
          )}
          {activeTab === 'models' && (
            <ModelsTab 
              settings={settings}
              onDefaultModelChange={handleDefaultModelChange}
            />
          )}
          {activeTab === 'backup' && (
            <BackupTab 
              onExport={handleExport}
              onImport={handleImport}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ============================================================================
// API KEYS TAB
// ============================================================================

interface ApiKeysTabProps {
  settings: Settings;
  onApiKeyChange: (provider: string, value: string) => void;
  onApiKeyRemove: (provider: string) => void;
}

const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ settings, onApiKeyChange, onApiKeyRemove }) => {
  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: '#a1a1aa' }}>
        Add API keys for the providers you want to test. Keys are stored locally in your browser.
      </p>
      {Object.values(PROVIDERS).map((provider) => (
        <ApiKeyCard
          key={provider.id}
          providerId={provider.id}
          providerName={provider.name}
          value={settings.apiKeys[provider.id] || ''}
          placeholder={provider.apiKeyPlaceholder}
          docsUrl={provider.docsUrl}
          onChange={(value) => onApiKeyChange(provider.id, value)}
          onRemove={() => onApiKeyRemove(provider.id)}
        />
      ))}
    </div>
  );
};

// ============================================================================
// API KEY CARD
// ============================================================================

interface ApiKeyCardProps {
  providerId: string;
  providerName: string;
  value: string;
  placeholder: string;
  docsUrl: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  providerId,
  providerName,
  value,
  placeholder,
  docsUrl,
  onChange,
  onRemove,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const formatValid = validateKeyFormat(providerId, value);

  const handleSave = () => {
    onChange(localValue);
  };

  const handleClear = () => {
    setLocalValue('');
    setValidationResult(null);
    onRemove();
  };

  const handleTestKey = async () => {
    if (!value || !formatValid.valid) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await validateApiKey(providerId, value);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        status: 'error',
        message: 'Validation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const maskedValue = showKey ? localValue : '•'.repeat(localValue.length);
  const hasChanges = localValue !== value;

  return (
    <div 
      className="rounded-lg p-5"
      style={{ 
        backgroundColor: '#27272a',
        border: '1px solid #52525b'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold mb-1" style={{ color: '#fafafa' }}>
            {providerName}
          </h3>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs inline-flex items-center gap-1 hover:underline"
            style={{ color: '#3b82f6' }}
          >
            Get API Key
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <StatusBadge 
          formatValid={formatValid}
          validationResult={validationResult}
          hasValue={!!value}
        />
      </div>

      {/* Input */}
      <div className="relative mb-3">
        <input
          type={showKey ? 'text' : 'password'}
          value={value ? maskedValue : localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm font-mono rounded-md transition-all focus:outline-none focus:ring-2"
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #52525b',
            color: '#fafafa'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#52525b'}
        />
        {value && (
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-700"
            style={{ color: '#a1a1aa' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showKey ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            Save
          </button>
        )}
        {value && formatValid.valid && (
          <button
            onClick={handleTestKey}
            disabled={isValidating}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
          >
            {isValidating ? 'Testing...' : 'Test Key'}
          </button>
        )}
        {value && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-red-950"
            style={{ border: '1px solid #52525b', color: '#ef4444' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MODELS TAB
// ============================================================================

interface ModelsTabProps {
  settings: Settings;
  onDefaultModelChange: (provider: string, modelId: string) => void;
}

const ModelsTab: React.FC<ModelsTabProps> = ({ settings, onDefaultModelChange }) => {
  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: '#a1a1aa' }}>
        Select default models for each provider. These will be pre-selected when creating new prompts.
      </p>
      {Object.values(PROVIDERS).map((provider) => {
        const hasApiKey = !!settings.apiKeys[provider.id];
        const defaultModel = settings.defaultModels[provider.id];

        return (
          <div
            key={provider.id}
            className="rounded-lg p-5"
            style={{
              backgroundColor: hasApiKey ? '#27272a' : '#18181b',
              border: '1px solid #52525b',
              opacity: hasApiKey ? 1 : 0.6
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: '#fafafa' }}>
                {provider.name}
              </h3>
              {!hasApiKey && (
                <span 
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{ backgroundColor: '#78350f', color: '#fbbf24' }}
                >
                  No API Key
                </span>
              )}
            </div>
            <select
              value={defaultModel || ''}
              onChange={(e) => onDefaultModelChange(provider.id, e.target.value)}
              disabled={!hasApiKey}
              className="w-full px-3 py-2.5 text-sm font-mono rounded-md transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #52525b',
                color: '#fafafa'
              }}
              onFocus={(e) => !e.target.disabled && (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => e.target.style.borderColor = '#52525b'}
            >
              <option value="">No default selected</option>
              {provider.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({(model.contextWindow / 1000).toFixed(0)}K)
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// BACKUP TAB
// ============================================================================

interface BackupTabProps {
  onExport: (includeApiKeys: boolean) => void;
  onImport: (file: File, mergeApiKeys: boolean) => void;
  onReset: () => void;
}

const BackupTab: React.FC<BackupTabProps> = ({ onExport, onImport, onReset }) => {
  const [includeApiKeys, setIncludeApiKeys] = useState(false);
  const [mergeApiKeys, setMergeApiKeys] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file, mergeApiKeys);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export */}
      <div 
        className="rounded-lg p-5"
        style={{ backgroundColor: '#27272a', border: '1px solid #52525b' }}
      >
        <h3 className="text-base font-semibold mb-3" style={{ color: '#fafafa' }}>
          Export Settings
        </h3>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={includeApiKeys}
            onChange={(e) => setIncludeApiKeys(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm" style={{ color: '#a1a1aa' }}>
            Include API keys (store securely!)
          </span>
        </label>
        <button
          onClick={() => onExport(includeApiKeys)}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors"
          style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
        >
          Export Settings
        </button>
      </div>

      {/* Import */}
      <div 
        className="rounded-lg p-5"
        style={{ backgroundColor: '#27272a', border: '1px solid #52525b' }}
      >
        <h3 className="text-base font-semibold mb-3" style={{ color: '#fafafa' }}>
          Import Settings
        </h3>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={mergeApiKeys}
            onChange={(e) => setMergeApiKeys(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm" style={{ color: '#a1a1aa' }}>
            Merge with existing API keys
          </span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors"
          style={{ backgroundColor: '#52525b', color: '#fafafa' }}
        >
          Import Settings
        </button>
      </div>

      {/* Reset */}
      <div 
        className="rounded-lg p-5"
        style={{ backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}
      >
        <h3 className="text-base font-semibold mb-3" style={{ color: '#fca5a5' }}>
          Danger Zone
        </h3>
        <button
          onClick={onReset}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors"
          style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

function validateKeyFormat(providerId: string, apiKey: string): { valid: boolean; message?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false };
  }

  switch (providerId) {
    case 'anthropic':
      if (apiKey.startsWith('sk-ant-')) return { valid: true };
      return { valid: false, message: 'Should start with "sk-ant-"' };
    case 'openai':
      if (apiKey.startsWith('sk-')) return { valid: true };
      return { valid: false, message: 'Should start with "sk-"' };
    case 'google':
      if (apiKey.startsWith('AIza')) return { valid: true };
      return { valid: false, message: 'Should start with "AIza"' };
    case 'cohere':
      if (apiKey.length > 10) return { valid: true };
      return { valid: false, message: 'Key seems too short' };
    default:
      return { valid: true };
  }
}

interface StatusBadgeProps {
  formatValid: { valid: boolean; message?: string };
  validationResult: ValidationResult | null;
  hasValue: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ formatValid, validationResult, hasValue }) => {
  if (!hasValue) return null;

  if (validationResult) {
    if (validationResult.valid) {
      return (
        <span 
          className="px-2 py-1 text-xs font-semibold rounded"
          style={{ backgroundColor: '#166534', color: '#22c55e' }}
        >
          ✓ Valid
        </span>
      );
    } else {
      return (
        <span 
          className="px-2 py-1 text-xs font-semibold rounded"
          style={{ backgroundColor: '#7f1d1d', color: '#ef4444' }}
        >
          ✗ {validationResult.message || 'Invalid'}
        </span>
      );
    }
  }

  if (formatValid.valid) {
    return (
      <span 
        className="px-2 py-1 text-xs font-semibold rounded"
        style={{ backgroundColor: '#3f3f46', color: '#a1a1aa' }}
      >
        Format OK
      </span>
    );
  }

  return (
    <span 
      className="px-2 py-1 text-xs font-semibold rounded"
      style={{ backgroundColor: '#78350f', color: '#fbbf24' }}
      title={formatValid.message}
    >
      Invalid format
    </span>
  );
};
