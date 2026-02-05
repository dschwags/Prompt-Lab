// src/components/PersonaDropdown/PersonaConfigurationPanel.tsx

import { useState } from 'react';
import { usePersonaStore } from '../../state/personaStore';
import { PersonaDropdown } from './PersonaDropdown';
import { GlobalPersonaSection } from './GlobalPersonaSection';
import { ModelPersonaItem } from './ModelPersonaItem';
import { CustomPersonaModal } from './CustomPersonaModal';
import { TemplateSelector } from './TemplateSelector';
import { SynthesisSelector } from './SynthesisSelector';
import { CostEstimate } from './CostEstimate';
import { SmartSuggestions } from './SmartSuggestions';

interface PersonaConfigurationPanelProps {
  query?: string;
  className?: string;
}

export function PersonaConfigurationPanel({
  query = '',
  className = '',
}: PersonaConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState<'personas' | 'templates' | 'synthesis'>('personas');
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const {
    models,
    addModel,
    removeModel,
    globalPersona,
    setGlobalPersona,
    synthesisMode,
    setSynthesisMode,
    activeTemplate,
  } = usePersonaStore();

  return (
    <div className={`persona-configuration-panel ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-4">
        <button
          onClick={() => setActiveTab('personas')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'personas'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Personas
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('synthesis')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'synthesis'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Synthesis
        </button>
      </div>
      
      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'personas' && (
          <>
            {/* Global Persona */}
            <GlobalPersonaSection />
            
            {/* Smart Suggestions */}
            {query && <SmartSuggestions query={query} />}
            
            {/* Per-model personas */}
            {models.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-zinc-200">
                    Model Personas
                  </h4>
                  <span className="text-xs text-zinc-500">
                    {models.length} model{models.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {models.map((model) => (
                  <ModelPersonaItem
                    key={model.id}
                    modelId={model.id}
                    modelName={model.name}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700 text-center">
                <p className="text-sm text-zinc-400">
                  No models selected. Enable Workshop mode to add models.
                </p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'templates' && (
          <TemplateSelector />
        )}
        
        {activeTab === 'synthesis' && (
          <SynthesisSelector />
        )}
      </div>
      
      {/* Cost Estimate */}
      {query && models.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-700">
          <CostEstimate query={query} />
        </div>
      )}
    </div>
  );
}

export default PersonaConfigurationPanel;
