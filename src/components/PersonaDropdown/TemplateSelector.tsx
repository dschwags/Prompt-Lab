// src/components/PersonaDropdown/TemplateSelector.tsx

import { useMemo } from 'react';
import { usePersonaStore } from '../../state/personaStore';
import { INDUSTRY_TEMPLATES, suggestTemplates } from '../../data/industryTemplates';
import { formatCost } from '../../utils/costEstimator';

interface TemplateSelectorProps {
  className?: string;
}

export function TemplateSelector({ className = '' }: TemplateSelectorProps) {
  const { applyIndustryTemplate, models, activeTemplate, clearTemplate } = usePersonaStore();
  
  const suggestedTemplates = useMemo(() => {
    return suggestTemplates(models.map((m) => ({
      id: m.id,
      persona: m.persona || undefined,
    })));
  }, [models]);

  const handleApply = (templateId: string) => {
    applyIndustryTemplate(templateId, models);
  };

  const templates = Object.values(INDUSTRY_TEMPLATES);
  
  return (
    <div className={`template-selector ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-zinc-200">
          Quick Start Templates
        </h4>
        {activeTemplate && (
          <button
            onClick={clearTemplate}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear template
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {templates.slice(0, 6).map((template) => (
          <button
            key={template.id}
            onClick={() => handleApply(template.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
              activeTemplate === template.id
                ? 'bg-purple-900/30 border-purple-600'
                : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            <span className="text-2xl">{template.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200 truncate">
                  {template.name}
                </span>
                {activeTemplate === template.id && (
                  <span className="text-xs text-purple-400">Active</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 truncate">
                {template.description}
              </p>
            </div>
            <div className="text-xs text-zinc-400">
              ~{formatCost(template.estimatedCost)}
            </div>
          </button>
        ))}
      </div>
      
      {suggestedTemplates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <p className="text-xs text-zinc-500 mb-2">
            Suggested for your current setup:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTemplates.slice(0, 3).map((suggestion) => {
              const template = INDUSTRY_TEMPLATES[suggestion.id as keyof typeof INDUSTRY_TEMPLATES];
              if (!template) return null;
              return (
                <button
                  key={suggestion.id}
                  onClick={() => handleApply(suggestion.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 rounded-lg text-xs text-purple-300 transition-colors"
                >
                  <span>{template.icon}</span>
                  <span>{template.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateSelector;
