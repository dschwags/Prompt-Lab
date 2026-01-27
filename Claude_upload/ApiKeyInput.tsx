import React, { useState } from 'react';

interface ApiKeyInputProps {
  provider: string;
  providerName: string;
  value: string;
  placeholder: string;
  docsUrl: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  provider,
  providerName,
  value,
  placeholder,
  docsUrl,
  onChange,
  onRemove,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleSave = () => {
    onChange(localValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onRemove();
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
          <span className="text-xs text-green-600 font-medium">✅ Configured</span>
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
