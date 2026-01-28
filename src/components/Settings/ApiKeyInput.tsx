import React, { useState } from 'react';
import { validateApiKey, type ValidationResult } from '../../services/api-validator.service';

interface ApiKeyInputProps {
  providerName: string;
  providerId: string;
  value: string;
  placeholder: string;
  docsUrl: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

// API key format validation
function validateApiKeyFormat(providerId: string, apiKey: string): { valid: boolean; message?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false };
  }

  switch (providerId) {
    case 'anthropic':
      if (apiKey.startsWith('sk-ant-')) {
        return { valid: true };
      }
      return { valid: false, message: 'Anthropic keys start with "sk-ant-"' };
    
    case 'openai':
      if (apiKey.startsWith('sk-')) {
        return { valid: true };
      }
      return { valid: false, message: 'OpenAI keys start with "sk-"' };
    
    case 'google':
      if (apiKey.startsWith('AIza')) {
        return { valid: true };
      }
      return { valid: false, message: 'Google AI keys start with "AIza"' };
    
    case 'cohere':
      // Cohere doesn't have a strict prefix format, just validate it's not empty
      if (apiKey.length > 10) {
        return { valid: true };
      }
      return { valid: false, message: 'Key seems too short' };
    
    default:
      return { valid: true }; // Unknown provider, accept any non-empty key
  }
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  providerName,
  providerId,
  value,
  placeholder,
  docsUrl,
  onChange,
  onRemove,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const validation = validateApiKeyFormat(providerId, value);

  const handleSave = () => {
    onChange(localValue);
  };

  const handleClear = () => {
    setLocalValue('');
    setValidationResult(null);
    onRemove();
  };

  const handleTestKey = async () => {
    if (!value || !validation.valid) return;
    
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

  // Determine status badge styles
  const getStatusBadge = () => {
    if (!value && !localValue) return null;
    
    if (validationResult) {
      if (validationResult.valid) {
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-md text-emerald-300 text-xs font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Valid
          </span>
        );
      } else if (validationResult.status === 'error' || validationResult.status === 'invalid') {
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-md text-red-300 text-xs font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {validationResult.message}
          </span>
        );
      } else if (validationResult.status === 'rate_limited') {
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded-md text-amber-300 text-xs font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Rate Limited
          </span>
        );
      }
    }
    
    if (validation.valid) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700/50 border border-zinc-600/50 rounded-md text-zinc-300 text-xs font-bold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Format OK
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded-md text-amber-300 text-xs font-bold" title={validation.message}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Invalid format
      </span>
    );
  };

  return (
    <div className="bg-zinc-950/100 border-2 border-zinc-700 rounded-lg p-6 space-y-4 hover:border-zinc-600 transition-all shadow-lg" style={{ backgroundColor: 'rgb(9, 9, 11)' }}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-base font-bold text-zinc-200 mb-1.5">{providerName}</h3>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            Get API Key
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge()}
          {validationResult?.credits && (
            <span className="text-[10px] text-zinc-500 font-mono">{validationResult.credits}</span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={value ? maskedValue : localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-zinc-900/100 border-2 border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-zinc-600 font-mono transition-all"
            style={{ backgroundColor: 'rgb(24, 24, 27)' }}
          />
          
          {value && (
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
              title={showKey ? 'Hide' : 'Show'}
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {value && validation.valid && (
          <button
            onClick={handleTestKey}
            disabled={isValidating}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white text-sm font-semibold rounded-lg border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 whitespace-nowrap"
            title="Validate API key by making a test call"
          >
            {isValidating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Key
              </>
            )}
          </button>
        )}
        
        {localValue !== value && (
          <button
            onClick={handleSave}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg border border-blue-500/30 transition-all shadow-lg shadow-blue-900/30 whitespace-nowrap"
          >
            Save
          </button>
        )}
        
        {value && (
          <button
            onClick={handleClear}
            className="px-3 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border-2 border-zinc-700 hover:border-red-800/50 rounded-lg text-sm transition-all"
            title="Clear API key"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
