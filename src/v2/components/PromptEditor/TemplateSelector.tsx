import { useState, useMemo } from 'react';
import { Search, FileText, ChevronDown, X, Sparkles, Clock, Users } from 'lucide-react';
import { INDUSTRY_TEMPLATES } from '../../data/industryTemplates';
import { PERSONA_PRESETS } from '../../data/personas';

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string | null) => void;
  onApplyTemplate: (template: typeof INDUSTRY_TEMPLATES[keyof typeof INDUSTRY_TEMPLATES]) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  development: '💻',
  product: '📦',
  ideation: '💡',
  analysis: '📊',
  compliance: '⚖️',
  marketing: '📣',
  writing: '✍️',
  research: '🔬',
};

const CATEGORY_LABELS: Record<string, string> = {
  development: 'Development',
  product: 'Product & Planning',
  ideation: 'Ideation & Strategy',
  analysis: 'Analysis & Research',
  compliance: 'Legal & Compliance',
  marketing: 'Marketing & Sales',
  writing: 'Writing & Content',
  research: 'Research & Data',
};

export function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  onApplyTemplate
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const templates = Object.values(INDUSTRY_TEMPLATES);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.exampleQueries.some(q => q.toLowerCase().includes(query))
    );
  }, [templates, searchQuery]);

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, typeof templates> = {};
    
    filteredTemplates.forEach(template => {
      if (!groups[template.category]) {
        groups[template.category] = [];
      }
      groups[template.category].push(template);
    });
    
    return groups;
  }, [filteredTemplates]);

  const selectedTemplateData = selectedTemplate 
    ? INDUSTRY_TEMPLATES[selectedTemplate] 
    : null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <FileText size={20} />
          </div>
          <div className="text-left">
            <div className="font-black text-slate-900 text-sm uppercase tracking-wide">
              Templates
            </div>
            <div className="text-xs text-slate-500">
              {selectedTemplateData 
                ? `${selectedTemplateData.icon} ${selectedTemplateData.name}`
                : 'Start with a pre-built workflow template'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedTemplateData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
              <Clock size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-700">
                ~{selectedTemplateData.estimatedTime}min
              </span>
            </div>
          )}
          <ChevronDown 
            size={20} 
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-3 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, category, or use case..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Selected Template Quick Action */}
          {selectedTemplateData && (
            <div className="p-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedTemplateData.icon}</span>
                  <div>
                    <div className="font-black text-amber-900">
                      {selectedTemplateData.name}
                    </div>
                    <div className="text-xs text-amber-700">
                      {selectedTemplateData.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onTemplateSelect(null)}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-amber-600" />
                </button>
              </div>
            </div>
          )}

          {/* Template Categories */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category} className="border-b border-slate-100 last:border-0">
                <div className="px-4 py-3 bg-slate-50 flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[category] || '📁'}</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </div>
                
                <div className="p-3 space-y-2">
                  {categoryTemplates.map(template => {
                    const isSelected = selectedTemplate === template.id;
                    const isExpanded = expandedTemplate === template.id;
                    
                    return (
                      <div
                        key={template.id}
                        className={`rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-amber-300 bg-amber-50 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {/* Template Header */}
                        <div className="p-4 flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <button
                            onClick={() => onTemplateSelect(isSelected ? null : template.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600'
                            }`}
                          >
                            {isSelected ? (
                              <Sparkles size={16} />
                            ) : (
                              <span className="text-lg">{template.icon}</span>
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-black text-slate-900">{template.name}</span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {template.description}
                            </p>
                            
                            {/* Quick Stats */}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={12} />
                                <span>~{template.estimatedTime}min</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Users size={12} />
                                <span>{template.personas.length} personas</span>
                              </div>
                              <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                                template.synthesisMode === 'merge' ? 'bg-indigo-100 text-indigo-700' :
                                template.synthesisMode === 'consensus' ? 'bg-emerald-100 text-emerald-700' :
                                template.synthesisMode === 'debate' ? 'bg-red-100 text-red-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {template.synthesisMode}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Apply Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApplyTemplate(template);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600'
                              }`}
                            >
                              Apply
                            </button>
                            
                            {/* Expand/Collapse Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTemplate(isExpanded ? null : template.id);
                              }}
                              className="text-xs font-bold text-amber-600 hover:text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                            >
                              {isExpanded ? 'Less' : 'More'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 space-y-4">
                            {/* Recommended Personas */}
                            <div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Recommended Personas
                              </span>
                              <div className="space-y-2 mt-2">
                                {template.personas.map((personaRec, idx) => {
                                  const persona = PERSONA_PRESETS[personaRec.personaId];
                                  if (!persona) return null;
                                  
                                  return (
                                    <div 
                                      key={idx}
                                      className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100"
                                    >
                                      <span className="text-lg">{persona.icon}</span>
                                      <div className="flex-1">
                                        <div className="font-bold text-slate-700 text-sm">
                                          {persona.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                          {personaRec.rationale}
                                        </div>
                                      </div>
                                      <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">
                                        {personaRec.modelRecommendation}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Example Queries */}
                            <div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Example Queries
                              </span>
                              <div className="space-y-2 mt-2">
                                {template.exampleQueries.map((query, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      onApplyTemplate(template);
                                      setIsOpen(false);
                                    }}
                                    className="w-full text-left p-3 bg-white rounded-lg border border-slate-100 text-sm text-slate-600 hover:border-amber-200 hover:shadow-sm transition-all"
                                  >
                                    "{query}"
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Estimated Cost */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Estimated Cost
                              </span>
                              <span className="font-black text-slate-700">
                                ${template.estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {templates.length} templates available
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
