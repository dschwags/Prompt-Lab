/**
 * Model Multi-Select Component
 * 
 * FILE: ModelMultiSelect.tsx
 * PURPOSE: Checkbox list for selecting multiple models with preset buttons
 * 
 * Features:
 * - Checkbox list organized by provider
 * - Preset buttons (All US, All EU, Reasoning, etc.)
 * - Validation (min 2, max 5 models)
 * - Visual feedback on selection count
 */

import { useState, useMemo } from 'react';
import { getModelGroups } from '../../utils/models';
import type { ModelDefinition } from '../../utils/models';

interface ModelMultiSelectProps {
  selectedModels: string[];
  onChange: (modelIds: string[]) => void;
  maxModels?: number;
  minModels?: number;
}

export function ModelMultiSelect({
  selectedModels,
  onChange,
  maxModels = 5,
  minModels = 2,
}: ModelMultiSelectProps) {
  const modelGroups = getModelGroups();
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set(modelGroups.map(g => g.provider))
  );

  // Count by region for preset calculations
  const modelsByRegion = useMemo(() => {
    const byRegion = { US: [] as ModelDefinition[], EU: [] as ModelDefinition[], China: [] as ModelDefinition[] };
    modelGroups.forEach(group => {
      group.models.forEach(model => {
        if (model.region === 'US') byRegion.US.push(model);
        else if (model.region === 'EU') byRegion.EU.push(model);
        else if (model.region === 'China') byRegion.China.push(model);
      });
    });
    return byRegion;
  }, [modelGroups]);

  const reasoningModels = useMemo(() => {
    return modelGroups.flatMap(g => g.models).filter(m =>
      m.name.toLowerCase().includes('reasoning') ||
      m.id.includes('o1') ||
      m.id.includes('r1')
    );
  }, [modelGroups]);

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onChange(selectedModels.filter(id => id !== modelId));
    } else {
      if (selectedModels.length < maxModels) {
        onChange([...selectedModels, modelId]);
      }
    }
  };

  const toggleProvider = (provider: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(provider)) {
      newExpanded.delete(provider);
    } else {
      newExpanded.add(provider);
    }
    setExpandedProviders(newExpanded);
  };

  const selectRegion = (region: 'US' | 'EU' | 'China') => {
    const models = modelsByRegion[region];
    const ids = models.slice(0, maxModels).map(m => m.id);
    onChange(ids);
  };

  const clearSelection = () => onChange([]);

  const isValid = selectedModels.length >= minModels && selectedModels.length <= maxModels;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-zinc-200">Select Models</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${
            isValid ? 'text-green-400' : 'text-amber-400'
          }`}>
            {selectedModels.length}/{maxModels}
          </span>
          {selectedModels.length > 0 && (
            <button
              onClick={clearSelection}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <PresetButton
          label="🇺🇸 US"
          count={modelsByRegion.US.length}
          onClick={() => selectRegion('US')}
        />
        <PresetButton
          label="🇪🇺 EU"
          count={modelsByRegion.EU.length}
          onClick={() => selectRegion('EU')}
        />
        <PresetButton
          label="🇨🇳 China"
          count={modelsByRegion.China.length}
          onClick={() => selectRegion('China')}
        />
        <PresetButton
          label="🧠 Reasoning"
          count={reasoningModels.length}
          onClick={() => onChange(reasoningModels.slice(0, maxModels).map(m => m.id))}
        />
      </div>

      {/* Provider Sections */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {modelGroups.map((group) => (
          <div key={group.provider} className="border border-zinc-700 rounded-lg overflow-hidden">
            {/* Provider Header */}
            <button
              onClick={() => toggleProvider(group.provider)}
              className="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-750 flex items-center justify-between text-left"
            >
              <span className="font-medium text-zinc-200">
                {getProviderIcon(group.provider)} {group.provider}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  {selectedModels.filter(id => group.models.find(m => m.id === id)).length}/{group.models.length}
                </span>
                <span className="text-zinc-400">
                  {expandedProviders.has(group.provider) ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {/* Model List */}
            {expandedProviders.has(group.provider) && (
              <div className="bg-zinc-900/50 p-2 space-y-1">
                {group.models.map((model) => {
                  const isSelected = selectedModels.includes(model.id);
                  return (
                    <label
                      key={model.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-900/30 border border-blue-700/50'
                          : 'hover:bg-zinc-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleModel(model.id)}
                        className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300 flex-1">
                        {model.name}
                      </span>
                      {model.isOpenRouter && (
                        <span className="text-xs text-zinc-500">OR</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      <div className={`text-sm p-2 rounded ${
        isValid ? 'bg-green-900/20 text-green-400' : 'bg-amber-900/20 text-amber-400'
      }`}>
        {isValid ? (
          <span>✓ {selectedModels.length} models selected - Ready to test</span>
        ) : selectedModels.length < minModels ? (
          <span>⚠ Select at least {minModels} models</span>
        ) : (
          <span>⚠ Maximum {maxModels} models allowed</span>
        )}
      </div>
    </div>
  );
}

// === HELPER COMPONENTS ===

function PresetButton({
  label,
  count,
  onClick,
}: {
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
    >
      <span>{label}</span>
      <span className="text-xs text-zinc-500">({count})</span>
    </button>
  );
}

function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    'Anthropic': '🔵',
    'OpenAI': '🟢',
    'Google': '🟣',
    'Meta': '🟠',
    'Mistral': '🔴',
    'Cohere': '🟡',
    'DeepSeek': '🐉',
    'Qwen': '🧧',
  };
  return icons[provider] || '⚪';
}
