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

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{providerName}</h3>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Get API Key →
          </a>
        </div>
        {value && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <span className="text-xs text-green-600 font-medium">✅ Format OK</span>
              ) : (
                <span className="text-xs text-red-600 font-medium" title={validation.message}>
                  ⚠️ Invalid format
                </span>
              )}
            </div>
            {validationResult && (
              <div className="flex items-center gap-1">
                {validationResult.valid ? (
                  <span className="text-xs text-green-700 font-medium" title={validationResult.credits}>
                    ✅ {validationResult.message}
                  </span>
                ) : (
                  <span className="text-xs text-red-700 font-medium" title={validationResult.details}>
                    ❌ {validationResult.message}
                  </span>
                )}
              </div>
            )}
            {validationResult?.credits && (
              <span className="text-xs text-gray-500">{validationResult.credits}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type={showKey ? 'text' : 'password'}
          value={value ? maskedValue : localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {value && (
          <button
            onClick={() => setShowKey(!showKey)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
            title={showKey ? 'Hide' : 'Show'}
          >
            {showKey ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
        
        {value && validation.valid && (
          <button
            onClick={handleTestKey}
            disabled={isValidating}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            title="Validate API key by making a test call"
          >
            {isValidating ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Testing...
              </>
            ) : (
              <>🧪 Test Key</>
            )}
          </button>
        )}
        
        {localValue !== value && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        )}
        
        {value && (
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
