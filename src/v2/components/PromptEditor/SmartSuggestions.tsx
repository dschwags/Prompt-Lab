import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Lightbulb, Zap, AlertCircle, ChevronRight, X } from 'lucide-react';
import { PERSONA_PRESETS } from '../../data/personas';
import { INDUSTRY_TEMPLATES } from '../../data/industryTemplates';

// Keyword patterns for detecting user intent
const KEYWORD_PATTERNS = {
  code: {
    keywords: ['code', 'function', 'class', 'api', 'implement', 'refactor', 'debug', 'review', 'bug', 'error', 'test'],
    icon: '💻',
    label: 'Code Related',
    suggestions: [
      'Please provide the complete implementation with error handling',
      'Add unit tests for this code',
      'What are the edge cases to consider?',
      'How can this be optimized for performance?',
      'Review this code for security vulnerabilities',
    ],
  },
  analysis: {
    keywords: ['analyze', 'review', 'evaluate', 'compare', 'assess', 'examine', 'investigate'],
    icon: '📊',
    label: 'Analysis',
    suggestions: [
      'What are the key findings and insights?',
      'What data supports this conclusion?',
      'What are the limitations or caveats?',
      'How does this compare to industry standards?',
      'What additional information would strengthen this analysis?',
    ],
  },
  creative: {
    keywords: ['design', 'create', 'invent', ' brainstorm', 'ideate', 'innovate', 'creative', 'novel', 'unique'],
    icon: '🎨',
    label: 'Creative',
    suggestions: [
      'What are 5 different approaches to solve this?',
      'How would you approach this if there were no constraints?',
      'What are some unconventional solutions?',
      'How can we differentiate from competitors?',
      'What emerging trends should we consider?',
    ],
  },
  planning: {
    keywords: ['plan', 'strategy', 'roadmap', 'prioritize', 'schedule', 'timeline', 'estimate', 'approach'],
    icon: '📋',
    label: 'Planning',
    suggestions: [
      'What is the recommended implementation order?',
      'What are the key milestones and timelines?',
      'What resources are required?',
      'What are the dependencies between tasks?',
      'How should we prioritize these items?',
    ],
  },
  explanation: {
    keywords: ['explain', 'describe', 'understand', 'learn', 'what is', 'how does', 'why is'],
    icon: '📚',
    label: 'Explanation',
    suggestions: [
      'Can you explain this in simple terms?',
      'What are the prerequisites to understand this?',
      'Can you provide examples to illustrate?',
      'What are the common misconceptions about this?',
      'How does this relate to [concept]?',
    ],
  },
  security: {
    keywords: ['security', 'vulnerability', 'attack', 'threat', 'risk', 'authenti', 'permission', 'access control'],
    icon: '🔒',
    label: 'Security',
    suggestions: [
      'What are the potential security vulnerabilities?',
      'How should we handle sensitive data?',
      'What authentication and authorization checks are needed?',
      'What are the compliance requirements?',
      'How can we harden this against attacks?',
    ],
  },
};

// Context modifiers based on prompt structure
const CONTEXT_MODIFIERS = [
  {
    id: 'step_by_step',
    trigger: ['step', 'first', 'then', 'sequence', 'process'],
    modifier: 'Please think through this step by step, explaining each stage clearly.',
    icon: '📝',
  },
  {
    id: 'concise',
    trigger: ['brief', 'summary', 'quick', 'short', 'summary'],
    modifier: 'Please be concise and focus on the key points only.',
    icon: '🎯',
  },
  {
    id: 'detailed',
    trigger: ['detailed', 'comprehensive', 'thorough', 'deep', 'extensive'],
    modifier: 'Please provide a comprehensive and detailed response with examples.',
    icon: '📖',
  },
  {
    id: 'actionable',
    trigger: ['action', 'implement', 'do', 'create', 'build'],
    modifier: 'Please provide actionable recommendations with specific next steps.',
    icon: '⚡',
  },
];

interface SmartSuggestionsProps {
  inputText: string;
  onInsertSuggestion: (text: string, position: 'before' | 'after' | 'replace') => void;
  field: 'system' | 'user';
  selectedModels: string[];
}

export function SmartSuggestions({
  inputText,
  onInsertSuggestion,
  field,
  selectedModels,
}: SmartSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Detect keywords in input
  const detectedCategories = useMemo(() => {
    const text = inputText.toLowerCase();
    const detected: Array<{ category: string; info: typeof KEYWORD_PATTERNS[keyof typeof KEYWORD_PATTERNS] }> = [];
    
    Object.entries(KEYWORD_PATTERNS).forEach(([key, pattern]) => {
      if (pattern.keywords.some(kw => text.includes(kw))) {
        detected.push({ category: key, info: pattern });
      }
    });
    
    return detected;
  }, [inputText]);

  // Get context modifiers
  const detectedModifiers = useMemo(() => {
    const text = inputText.toLowerCase();
    return CONTEXT_MODIFIERS.filter(mod =>
      mod.trigger.some(trigger => text.includes(trigger))
    );
  }, [inputText]);

  // Generate dynamic suggestions based on input
  const dynamicSuggestions = useMemo(() => {
    const suggestions: Array<{ text: string; category: string; icon: string }> = [];
    
    // Add suggestions from detected categories
    detectedCategories.forEach(({ category, info }) => {
      info.suggestions.forEach(suggestion => {
        suggestions.push({
          text: suggestion,
          category: info.label,
          icon: info.icon,
        });
      });
    });
    
    // Add persona-based suggestions if personas are selected
    const personaSuggestions = Object.values(PERSONA_PRESETS)
      .slice(0, 3)
      .map(persona => ({
        text: persona.exampleQueries[0] || '',
        category: `Persona: ${persona.name}`,
        icon: persona.icon,
      }))
      .filter(s => s.text);
    
    suggestions.push(...personaSuggestions);
    
    // Add template-based suggestions
    const templateSuggestions = Object.values(INDUSTRY_TEMPLATES)
      .slice(0, 2)
      .map(template => ({
        text: template.exampleQueries[0] || '',
        category: `Template: ${template.name}`,
        icon: template.icon,
      }))
      .filter(s => s.text);
    
    suggestions.push(...templateSuggestions);
    
    // Remove duplicates and dismissed suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text === suggestion.text)
    );
    
    return uniqueSuggestions.filter(s => !dismissedSuggestions.has(s.text));
  }, [detectedCategories, dismissedSuggestions]);

  // Check if we should show suggestions
  const shouldShowSuggestions = useMemo(() => {
    return inputText.length >= 10 && dynamicSuggestions.length > 0;
  }, [inputText, dynamicSuggestions]);

  const handleDismiss = useCallback((suggestionText: string) => {
    setDismissedSuggestions(prev => new Set(prev).add(suggestionText));
  }, []);

  const handleUseSuggestion = useCallback((suggestion: { text: string }) => {
    onInsertSuggestion(suggestion.text, 'after');
    handleDismiss(suggestion.text);
  }, [onInsertSuggestion, handleDismiss]);

  // Auto-expand when user stops typing
  useEffect(() => {
    if (shouldShowSuggestions && !isExpanded) {
      const timer = setTimeout(() => setIsExpanded(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowSuggestions, isExpanded]);

  if (!shouldShowSuggestions) {
    return null;
  }

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-70'}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600 animate-pulse" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
            Smart Suggestions
          </span>
          {detectedCategories.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-lg text-xs font-bold text-indigo-600">
              {detectedCategories[0]?.info.icon}
              {detectedCategories[0]?.info.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-500">
            {dynamicSuggestions.length} suggestions
          </span>
          <ChevronRight 
            size={16} 
            className={`text-indigo-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Suggestions */}
      {isExpanded && (
        <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2">
          {/* Quick Actions */}
          {detectedModifiers.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-amber-600" />
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                  Suggested Modifier
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedModifiers.map(modifier => (
                  <button
                    key={modifier.id}
                    onClick={() => onInsertSuggestion(`\n${modifier.modifier}\n`, 'after')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-amber-200 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <span>{modifier.icon}</span>
                    <span>{modifier.id.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions List */}
          <div className="space-y-1">
            {dynamicSuggestions.slice(0, 5).map((suggestion, idx) => (
              <div
                key={`${suggestion.text.slice(0, 20)}-${idx}`}
                className="group flex items-start gap-2 p-2 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                <button
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="flex-1 flex items-start gap-2 text-left"
                >
                  <span className="text-lg mt-0.5">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-700 mb-0.5">
                      {suggestion.category}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                      "{suggestion.text}"
                    </div>
                  </div>
                </button>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDismiss(suggestion.text)}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                    title="Dismiss"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {dynamicSuggestions.length === 0 && (
            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
              <Lightbulb size={20} className="text-slate-400" />
              <span className="text-xs text-slate-500">
                Keep typing to get more relevant suggestions...
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Suggestions update as you type
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline suggestion pill for compact display
export function SuggestionPill({ 
  text, 
  onClick 
}: { 
  text: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
    >
      <Sparkles size={12} />
      <span>{text}</span>
    </button>
  );
}

// Context-aware tip banner
export function ContextTip({
  inputText,
  field
}: {
  inputText: string;
  field: 'system' | 'user';
}) {
  const tips = useMemo(() => {
    if (field === 'system') {
      if (!inputText.includes('role') && !inputText.includes('You are')) {
        return {
          icon: '💡',
          message: 'Tip: Start with "You are a..." to define the AI\'s role clearly',
          color: 'amber',
        };
      }
      if (inputText.length < 100) {
        return {
          icon: '📝',
          message: 'Tip: Add specific constraints and examples for better results',
          color: 'indigo',
        };
      }
    } else {
      if (!inputText.includes('?')) {
        return {
          icon: '❓',
          message: 'Tip: End with a clear question or call-to-action',
          color: 'blue',
        };
      }
    }
    return null;
  }, [inputText, field]);

  if (!tips) return null;

  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border ${colorClasses[tips.color]}`}>
      <span>{tips.icon}</span>
      <span className="text-xs font-medium">{tips.message}</span>
    </div>
  );
}
