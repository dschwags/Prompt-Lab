// src/components/PersonaDropdown/SmartSuggestions.tsx

import { useState, useEffect } from 'react';
import { analyzeQuery } from '../../utils/queryAnalyzer';
import { usePersonaStore } from '../../state/personaStore';
import { PERSONA_PRESETS } from '../../data/personas';
import type { QueryAnalysis, SuggestedPersona } from '../../utils/queryAnalyzer';

interface SmartSuggestionsProps {
  query: string;
  className?: string;
}

export function SmartSuggestions({ query, className = '' }: SmartSuggestionsProps) {
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const { setModelPersona, models } = usePersonaStore();
  
  useEffect(() => {
    if (query && query.length > 15) {
      const result = analyzeQuery(query);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [query]);
  
  const handleApplySuggestion = (personaId: string) => {
    // Find first model without a persona
    const firstModel = models.find((m) => !m.persona);
    if (firstModel) {
      setModelPersona(firstModel.id, personaId);
    }
  };

  if (!analysis) {
    return null;
  }
  
  const confidence = analysis.confidence;
  const suggestedPersonas: SuggestedPersona[] = analysis.suggestedPersonas;
  
  if (confidence < 0.3 || suggestedPersonas.length === 0) {
    return null;
  }
  
  return (
    <div className={`smart-suggestions ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">💡</span>
        <span className="text-sm text-zinc-400">
          Detected: {analysis.queryTypes.join(', ')}
        </span>
        <span className="text-xs text-zinc-600">
          ({Math.round(confidence * 100)}% confidence)
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestedPersonas.slice(0, 4).map(({ personaId, score }) => {
          const persona = PERSONA_PRESETS[personaId as keyof typeof PERSONA_PRESETS];
          if (!persona) return null;
          
          return (
            <button
              key={personaId}
              onClick={() => handleApplySuggestion(personaId)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors"
              title={`Match score: ${(score * 100).toFixed(0)}%`}
            >
              <span>{persona.icon}</span>
              <span>{persona.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SmartSuggestions;
