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
    <div className="space-y-8">
      {/* Export */}
      <div className="bg-zinc-950/100 border-2 border-zinc-700 rounded-lg p-6 space-y-4 shadow-lg" style={{ backgroundColor: 'rgb(9, 9, 11)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <h4 className="text-base font-bold text-zinc-200">Export Settings</h4>
        </div>
        
        <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer group">
          <input
            type="checkbox"
            checked={includeApiKeys}
            onChange={(e) => setIncludeApiKeys(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500/40"
          />
          <span className="group-hover:text-zinc-300 transition-colors font-medium">Include API keys (store securely!)</span>
        </label>
        
        <button
          onClick={() => onExport(includeApiKeys)}
          className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg border border-blue-500/30 transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Settings
        </button>
      </div>

      {/* Import */}
      <div className="bg-zinc-950/100 border-2 border-zinc-700 rounded-lg p-6 space-y-4 shadow-lg" style={{ backgroundColor: 'rgb(9, 9, 11)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <h4 className="text-base font-bold text-zinc-200">Import Settings</h4>
        </div>
        
        <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer group">
          <input
            type="checkbox"
            checked={mergeApiKeys}
            onChange={(e) => setMergeApiKeys(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500/40"
          />
          <span className="group-hover:text-zinc-300 transition-colors font-medium">Merge with existing API keys</span>
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-lg border border-zinc-700 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Import Settings
        </button>
      </div>

      {/* Reset */}
      <div className="bg-red-950/100 border-2 border-red-800 rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'rgb(69, 10, 10)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="text-base font-bold text-red-400">Danger Zone</h4>
        </div>
        <button
          onClick={handleReset}
          className="w-full px-5 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg border border-red-500/30 transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};
