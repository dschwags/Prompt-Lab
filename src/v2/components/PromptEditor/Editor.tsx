import { useState } from 'react';
import { Zap, Code, User, Upload, CheckCircle, Loader2, Clock, XCircle } from 'lucide-react';
import { EngineCatalog } from './EngineCatalog';
import { ImportContextModal } from './ImportContextModal';
import { ClackyProjectContext } from '../../types';

interface EditorProps {
  promptData: { system: string; user: string };
  selectedModels: string[];
  clackyContext?: ClackyProjectContext;
  onChange: (data: { system: string; user: string }) => void;
  onModelSelectionChange: (modelIds: string[]) => void;
  onContextImport: (context: ClackyProjectContext) => void;
  onStartWorkshop: () => void;
  isLoading?: boolean;
  loadingProgress?: Record<string, 'pending' | 'loading' | 'complete' | 'error'>;
}

export function Editor({
  promptData,
  selectedModels,
  clackyContext,
  onChange,
  onModelSelectionChange,
  onContextImport,
  onStartWorkshop,
  isLoading,
  loadingProgress = {}
}: EditorProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeField, setActiveField] = useState<'system' | 'user' | null>(null);

  const systemChars = promptData.system.length;
  const userChars = promptData.user.length;
  const estimatedTokens = Math.ceil((systemChars + userChars) / 4);

  const canStartWorkshop = selectedModels.length >= 2 && promptData.user.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-lg bg-indigo-50 text-xs font-black text-indigo-600 uppercase tracking-widest">
              Workshop v2.0
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Prompt Editor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build, test, and refine AI prompts across multiple models
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Import Context Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl text-sm font-black hover:bg-purple-100 transition-all border-2 border-purple-100"
          >
            <Upload size={16} />
            <span>Import Context</span>
          </button>

          {/* Start Workshop Button */}
          <button
            onClick={onStartWorkshop}
            disabled={isLoading || !canStartWorkshop}
            className="group flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={20} className="group-hover:animate-pulse" />
                <span>Start Workshop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Context Badge */}
      {clackyContext && (
        <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <CheckCircle size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-purple-900">
              Project Context: {clackyContext.projectName}
            </p>
            <p className="text-xs text-purple-700">
              {clackyContext.context.framework} • {clackyContext.context.language} • {clackyContext.files.length} files
            </p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Update
          </button>
        </div>
      )}

      {/* Dual Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Prompt */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Code size={14} />
              System Persona
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {systemChars.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={promptData.system}
            onChange={(e) => onChange({ ...promptData, system: e.target.value })}
            onFocus={() => setActiveField('system')}
            onBlur={() => setActiveField(null)}
            placeholder="Define the AI's role, constraints, and behavior...  Example: You are a senior software architect specializing in React applications. You prioritize clean code, performance, and maintainability."
            className={`w-full h-64 p-6 rounded-2xl border-2 text-sm leading-relaxed resize-none outline-none transition-all shadow-md ${
              activeField === 'system'
                ? 'bg-white border-indigo-300 ring-4 ring-indigo-500/10 shadow-lg'
                : 'bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-200 shadow-sm'
            }`}
          />
        </div>

        {/* User Prompt */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} />
              User Task
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {userChars.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={promptData.user}
            onChange={(e) => onChange({ ...promptData, user: e.target.value })}
            onFocus={() => setActiveField('user')}
            onBlur={() => setActiveField(null)}
            placeholder="What do you want the AI to do?  Example: Review this React component for performance issues and suggest specific optimizations."
            className={`w-full h-64 p-6 rounded-[2.5rem] border-2 text-sm leading-relaxed resize-none outline-none transition-all shadow-md ${
              activeField === 'user'
                ? 'bg-white border-indigo-300 ring-4 ring-indigo-500/10 shadow-lg'
                : 'bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-200 shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="font-black text-slate-400 uppercase tracking-widest">Total Chars</span>
            <span className="ml-2 font-bold text-slate-700">{(systemChars + userChars).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-black text-slate-400 uppercase tracking-widest">Est. Tokens</span>
            <span className="ml-2 font-bold text-slate-700">~{estimatedTokens.toLocaleString()}</span>
          </div>
          <div>
            <span className="font-black text-slate-400 uppercase tracking-widest">Models Selected</span>
            <span className="ml-2 font-bold text-indigo-600">{selectedModels.length}</span>
          </div>
        </div>

        {!canStartWorkshop && (
          <div className="text-xs text-amber-600 font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {selectedModels.length < 2 ? 'Select at least 2 models' : 'Enter a user task'}
          </div>
        )}
      </div>

      {/* Loading Progress Indicator */}
      {isLoading && Object.keys(loadingProgress).length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={18} className="text-indigo-600 animate-spin" />
            <h3 className="font-black text-slate-700 uppercase tracking-tight text-sm">Running Workshop</h3>
            <span className="ml-auto text-xs font-bold text-slate-400">
              {Object.values(loadingProgress).filter(s => s === 'complete').length} / {Object.keys(loadingProgress).length}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(loadingProgress).map(([modelId, status]) => {
              const modelName = modelId.split('/').pop() || modelId;
              return (
                <div 
                  key={modelId}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    status === 'pending' 
                      ? 'bg-slate-50 text-slate-400 border border-slate-100'
                      : status === 'loading'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : status === 'complete'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {status === 'pending' && <Clock size={14} className="animate-pulse" />}
                  {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
                  {status === 'complete' && <CheckCircle size={14} />}
                  {status === 'error' && <XCircle size={14} />}
                  <span className="truncate">{modelName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Engine Catalog */}
      <EngineCatalog
        selectedModels={selectedModels}
        onSelectionChange={onModelSelectionChange}
        maxSelection={5}
      />

      {/* Import Context Modal */}
      <ImportContextModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(context) => {
          onContextImport(context);
          setShowImportModal(false);
        }}
      />
    </div>
  );
}
