import React, { useState, useRef } from 'react';

interface ExportImportProps {
  onExport: (includeApiKeys: boolean) => Promise<void>;
  onImport: (file: File, mergeApiKeys: boolean) => Promise<void>;
  onReset: () => Promise<void>;
}

export const ExportImport: React.FC<ExportImportProps> = ({
  onExport,
  onImport,
  onReset,
}) => {
  const [includeApiKeys, setIncludeApiKeys] = useState(false);
  const [mergeApiKeys, setMergeApiKeys] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file, mergeApiKeys);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    if (confirm('⚠️ Reset all settings to defaults? This cannot be undone.')) {
      onReset();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Backup & Restore</h3>

      {/* Export */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900">Export Settings</h4>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeApiKeys}
            onChange={(e) => setIncludeApiKeys(e.target.checked)}
            className="rounded"
          />
          <span>Include API keys (store securely!)</span>
        </label>
        <button
          onClick={() => onExport(includeApiKeys)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          📥 Export Settings
        </button>
      </div>

      {/* Import */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900">Import Settings</h4>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mergeApiKeys}
            onChange={(e) => setMergeApiKeys(e.target.checked)}
            className="rounded"
          />
          <span>Merge with existing API keys</span>
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
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          📤 Import Settings
        </button>
      </div>

      {/* Reset */}
      <div className="border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};
