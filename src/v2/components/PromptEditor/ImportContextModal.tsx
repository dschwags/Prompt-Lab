import { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { ClackyProjectContext } from '../../types';

interface ImportContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (context: ClackyProjectContext) => void;
}

export function ImportContextModal({ isOpen, onClose, onImport }: ImportContextModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Validate structure
      if (parsed.type !== 'clacky-project') {
        throw new Error('Invalid project type. Expected "clacky-project".');
      }
      
      if (!parsed.projectName || !parsed.context || !parsed.files) {
        throw new Error('Missing required fields: projectName, context, or files.');
      }

      onImport(parsed as ClackyProjectContext);
      setSuccess(true);
      setError(null);
      
      // Close after short delay
      setTimeout(() => {
        onClose();
        setJsonInput('');
        setSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
      setSuccess(false);
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Import Project Context</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">From Clacky Export</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Instructions */}
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <p className="text-xs text-purple-800 leading-relaxed font-medium">
              Paste the JSON export from your Clacky project. This will provide context about your codebase
              to all AI models, enabling more relevant and accurate responses.
            </p>
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              Project JSON
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              placeholder='{"type": "clacky-project", "projectName": "...", ...}'
              className="w-full h-64 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 text-sm font-mono leading-relaxed focus:ring-4 focus:ring-purple-500/10 focus:border-purple-200 outline-none transition-all resize-none"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-red-900">Import Failed</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-emerald-900">Import Successful</p>
                <p className="text-xs text-emerald-700 mt-1">Project context loaded. Closing modal...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!jsonInput.trim() || success}
            className="px-8 py-3 bg-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            Import Context
          </button>
        </div>
      </div>
    </div>
  );
}
