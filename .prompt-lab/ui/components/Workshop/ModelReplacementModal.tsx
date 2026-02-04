import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { ModelDefinition } from '../../types';
import { getModelBadges, shouldExcludeModel, scoreModel } from '../../config/model-curation';

interface ModelReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  failedModelName: string;
  availableModels: ModelDefinition[];
  onSelectModel: (modelId: string) => void;
}

export function ModelReplacementModal({
  isOpen,
  onClose,
  failedModelName,
  availableModels,
  onSelectModel
}: ModelReplacementModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter and sort models
  const filteredModels = availableModels
    .filter(m => !shouldExcludeModel(m))
    .filter(m => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const scoreA = scoreModel(a);
      const scoreB = scoreModel(b);
      return scoreB - scoreA;
    })
    .slice(0, 12); // Show top 12 models

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-red-50 border-b border-red-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <RefreshCw className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Replace Failed Model
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-bold text-red-600">{failedModelName}</span> encountered an error
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="text-slate-400" size={24} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            className="w-full px-6 py-3 bg-slate-50 rounded-2xl border-2 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all"
          />
        </div>

        {/* Model Grid */}
        <div className="p-8 max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => {
              const badges = getModelBadges(model);

              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    onClose();
                  }}
                  className="group p-4 rounded-3xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xl transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-black text-xs uppercase tracking-tight text-slate-700 truncate">
                        {model.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {model.provider}
                      </p>
                    </div>
                    <span className="text-lg flex-shrink-0">{model.flag}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {badges.slice(0, 2).map((badge, i) => (
                      <span
                        key={i}
                        className="text-xs px-1"
                      >
                        {badge.icon}
                      </span>
                    ))}
                  </div>

                  {/* Cost */}
                  <div className="text-xs font-bold text-emerald-600">
                    ${(parseFloat(model.pricing.prompt) * 1000000).toFixed(2)}/1M
                  </div>
                </button>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400">No models match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
