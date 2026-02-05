import { useState, useMemo } from 'react';
import { Search, Sparkles, ChevronDown, X } from 'lucide-react';
import { PERSONA_PRESETS, PERSONA_CATEGORIES } from '../../data/personas';

interface PersonaSelectorProps {
  selectedPersonas: string[];
  onPersonaSelect: (personaIds: string[]) => void;
  onApplyPersona: (personaId: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  [PERSONA_CATEGORIES.THINKING]: { label: 'Thinking Styles', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  [PERSONA_CATEGORIES.CRITIQUE]: { label: 'Critique Roles', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  [PERSONA_CATEGORIES.EXPERTISE]: { label: 'Expertise Roles', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  [PERSONA_CATEGORIES.PERSPECTIVE]: { label: 'Perspective Roles', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export function PersonaSelector({
  selectedPersonas,
  onPersonaSelect,
  onApplyPersona
}: PersonaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const personas = Object.values(PERSONA_PRESETS);

  const filteredPersonas = useMemo(() => {
    if (!searchQuery) return personas;
    
    const query = searchQuery.toLowerCase();
    return personas.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.bestFor.some(b => b.toLowerCase().includes(query))
    );
  }, [personas, searchQuery]);

  const groupedPersonas = useMemo(() => {
    const groups: Record<string, typeof personas> = {};
    
    filteredPersonas.forEach(persona => {
      if (!groups[persona.category]) {
        groups[persona.category] = [];
      }
      groups[persona.category].push(persona);
    });
    
    return groups;
  }, [filteredPersonas]);

  const togglePersona = (personaId: string) => {
    if (selectedPersonas.includes(personaId)) {
      onPersonaSelect(selectedPersonas.filter(id => id !== personaId));
    } else {
      onPersonaSelect([...selectedPersonas, personaId]);
    }
  };

  const selectedPersonaObjects = selectedPersonas
    .map(id => PERSONA_PRESETS[id])
    .filter(Boolean);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div className="text-left">
            <div className="font-black text-slate-900 text-sm uppercase tracking-wide">
              Choose Your Personas
            </div>
            <div className="text-xs text-slate-500">
              {selectedPersonas.length > 0 
                ? `${selectedPersonas.length} selected`
                : 'Select AI personas to enhance your prompts'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedPersonas.length > 0 && (
            <div className="flex gap-1">
              {selectedPersonas.slice(0, 3).map(id => (
                <span key={id} className="text-lg">
                  {PERSONA_PRESETS[id]?.icon}
                </span>
              ))}
              {selectedPersonas.length > 3 && (
                <span className="text-xs text-slate-400">+{selectedPersonas.length - 3}</span>
              )}
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
                placeholder="Search personas by name, description, or use case..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Selected Personas Quick Actions */}
          {selectedPersonas.length > 0 && (
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                  Active Personas
                </span>
                <button
                  onClick={() => onPersonaSelect([])}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPersonas.map(id => {
                  const persona = PERSONA_PRESETS[id];
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border-2 border-indigo-200 shadow-sm"
                    >
                      <span className="text-lg">{persona?.icon}</span>
                      <span className="text-sm font-bold text-slate-700">{persona?.name}</span>
                      <button
                        onClick={() => togglePersona(id)}
                        className="p-0.5 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <X size={14} className="text-indigo-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Persona Categories */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedPersonas).map(([category, categoryPersonas]) => (
              <div key={category} className="border-b border-slate-100 last:border-0">
                <div className={`px-4 py-3 ${CATEGORY_LABELS[category]?.color || 'bg-slate-100'} bg-opacity-50`}>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {CATEGORY_LABELS[category]?.label || category}
                  </span>
                </div>
                
                <div className="p-3 space-y-2">
                  {categoryPersonas.map(persona => {
                    const isSelected = selectedPersonas.includes(persona.id);
                    const isDetailed = showDetails === persona.id;
                    
                    return (
                      <div
                        key={persona.id}
                        className={`rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-indigo-300 bg-indigo-50 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {/* Persona Header */}
                        <div className="p-4 flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <button
                            onClick={() => togglePersona(persona.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'
                            }`}
                          >
                            {isSelected ? (
                              <Sparkles size={16} />
                            ) : (
                              <span className="text-lg">{persona.icon}</span>
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-black text-slate-900">{persona.name}</span>
                              <span className="text-xs text-slate-400">
                                Utility: {Math.round(persona.utilityScore * 100)}%
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {persona.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Apply Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApplyPersona(persona.id);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'
                              }`}
                            >
                              Apply
                            </button>
                            
                            {/* Expand/Collapse Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDetails(isDetailed ? null : persona.id);
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              {isDetailed ? 'Less' : 'More'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isDetailed && (
                          <div className="px-4 pb-4 pt-0 space-y-4">
                            {/* Best For */}
                            <div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Best For
                              </span>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {persona.bestFor.map(useCase => (
                                  <span
                                    key={useCase}
                                    className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg"
                                  >
                                    {useCase}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Worst For */}
                            <div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Worst For
                              </span>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {persona.worstFor.map(useCase => (
                                  <span
                                    key={useCase}
                                    className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-lg"
                                  >
                                    {useCase}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Pairs Well With */}
                            {persona.pairsWellWith && persona.pairsWellWith.length > 0 && (
                              <div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                  Pairs Well With
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {persona.pairsWellWith.map(pairId => {
                                    const pairPersona = PERSONA_PRESETS[pairId];
                                    return pairPersona ? (
                                      <span
                                        key={pairId}
                                        className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-lg"
                                      >
                                        <span>{pairPersona.icon}</span>
                                        <span>{pairPersona.name}</span>
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Example Queries */}
                            <div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Example Queries
                              </span>
                              <div className="space-y-2 mt-2">
                                {persona.exampleQueries.slice(0, 2).map((query, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      onApplyPersona(persona.id);
                                      setIsOpen(false);
                                    }}
                                    className="w-full text-left p-3 bg-white rounded-lg border border-slate-100 text-sm text-slate-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                                  >
                                    "{query}"
                                  </button>
                                ))}
                              </div>
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
              {personas.length} personas available
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
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
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
