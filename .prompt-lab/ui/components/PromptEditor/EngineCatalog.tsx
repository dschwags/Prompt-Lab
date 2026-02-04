import { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, Table, Cpu, Info, Zap, Brain, Star, Sparkles } from 'lucide-react';
import { ModelDefinition } from '../../types';
import { getFlagByProvider, formatPrice } from '../../utils/format';
import { apiService } from '../../services/api.service';
import { getModelBadges, scoreModel, shouldExcludeModel } from '../../config/model-curation';

interface EngineCatalogProps {
  selectedModels: string[];
  onSelectionChange: (modelIds: string[]) => void;
  maxSelection?: number;
}

export function EngineCatalog({ selectedModels, onSelectionChange, maxSelection = 5 }: EngineCatalogProps) {
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'recommended' | 'all'>('recommended');
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'score', 
    direction: 'desc' 
  });

  // Fetch models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const raw = await apiService.fetchOpenRouterModels();
        
        // Transform to our format
        const transformed: ModelDefinition[] = raw.map((m: any) => ({
          id: m.id,
          name: m.name || m.id.split('/').pop() || m.id,
          provider: m.id.split('/')[0] || 'unknown',
          flag: getFlagByProvider(m.id),
          description: m.description,
          context_length: m.context_length || 0,
          pricing: {
            prompt: m.pricing?.prompt || '0',
            completion: m.pricing?.completion || '0'
          }
        }));

        setModels(transformed);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Handle sort click
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Sort icon component
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) {
      return <span className="opacity-30 ml-1">↕</span>;
    }
    return <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // Filtered and sorted models with curation
  const filteredModels = useMemo(() => {
    let filtered = models;

    // Apply category filter (recommended vs all)
    if (categoryFilter === 'recommended') {
      // Filter out excluded models first
      filtered = filtered.filter(m => !shouldExcludeModel(m));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
      );
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(m => m.flag === regionFilter);
    }

    // Sort based on sortConfig
    filtered.sort((a, b) => {
      // If using score-based sorting (for recommended)
      if (sortConfig.key === 'score') {
        if (categoryFilter === 'recommended') {
          const scoreA = scoreModel(a);
          const scoreB = scoreModel(b);
          if (scoreA !== scoreB) return sortConfig.direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
          return b.context_length - a.context_length;
        }
        return a.name.localeCompare(b.name);
      }
      
      // Column-based sorting
      let aVal: any, bVal: any;
      
      switch (sortConfig.key) {
        case 'model':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'provider':
          aVal = a.provider.toLowerCase();
          bVal = b.provider.toLowerCase();
          break;
        case 'region':
          aVal = a.flag;
          bVal = b.flag;
          break;
        case 'type':
          // Turbo models first in desc, Reasoner first in asc
          aVal = a.id.includes('flash') || a.id.includes('mini') ? 1 : 0;
          bVal = b.id.includes('flash') || b.id.includes('mini') ? 1 : 0;
          break;
        case 'cost':
          aVal = parseFloat(a.pricing.prompt) || 0;
          bVal = parseFloat(b.pricing.prompt) || 0;
          break;
        case 'context':
          aVal = a.context_length;
          bVal = b.context_length;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [models, searchQuery, regionFilter, categoryFilter, sortConfig]);

  // Toggle model selection
  const toggleModel = (modelId: string) => {
    const isSelected = selectedModels.includes(modelId);
    
    if (isSelected) {
      // Deselect
      onSelectionChange(selectedModels.filter(id => id !== modelId));
    } else {
      // Select (if not at max)
      if (selectedModels.length < maxSelection) {
        onSelectionChange([...selectedModels, modelId]);
      }
    }
  };

  const regions = [
    { id: 'all', label: 'All Regions', icon: '🌐' },
    { id: '🇺🇸', label: 'United States', icon: '🇺🇸' },
    { id: '🇪🇺', label: 'Europe', icon: '🇪🇺' },
    { id: '🇨🇳', label: 'China', icon: '🇨🇳' }
  ];

  // Badge color classes
  const badgeColorClasses: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700'
  };

  // Tooltip component for table rows - uses fixed positioning
  const ModelTooltip = ({ model, style }: { model: ModelDefinition; style?: React.CSSProperties }) => (
    <div 
      className="fixed z-[100] w-72 p-5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10"
      style={style}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-black text-xs uppercase tracking-tight text-indigo-400 truncate pr-2">
          {model.name}
        </h4>
        <span className="text-xs">{model.flag}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-300 mb-3">
        {model.description || 'Specialized AI model for various tasks.'}
      </p>
      <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-500 uppercase">Speed</span>
          <span className="text-xs font-bold text-slate-200">
            {model.id.includes('flash') || model.id.includes('mini') ? '⚡ Turbo' : '🧠 Reasoner'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-500 uppercase">Context</span>
          <span className="text-xs font-bold text-slate-200">
            {(model.context_length / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="col-span-2 bg-slate-800/50 p-2 rounded-lg text-xs font-bold text-emerald-400 text-center">
          {formatPrice(model.pricing.prompt)} / 1M tokens
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-400">Loading model catalog...</p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <Cpu size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight">Engine Catalog</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {selectedModels.length} of {maxSelection} selected • {filteredModels.length} models
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setCategoryFilter('recommended')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'recommended'
                  ? 'bg-white shadow-md text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Curated quality models"
            >
              <Star size={14} /> Recommended
            </button>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white shadow-md text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="All available models"
            >
              <Sparkles size={14} /> All
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl border-2 border-slate-100 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Region Filter */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => setRegionFilter(region.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  regionFilter === region.id
                    ? 'bg-white shadow-md text-indigo-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={region.label}
              >
                {region.icon}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl ${
                viewMode === 'grid'
                  ? 'bg-white shadow-md text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl ${
                viewMode === 'table'
                  ? 'bg-white shadow-md text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Models Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map(model => {
            const isSelected = selectedModels.includes(model.id);
            const isMaxed = selectedModels.length >= maxSelection && !isSelected;
            const badges = getModelBadges(model);

            return (
              <div
                key={model.id}
                className="relative group"
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
              >
                <button
                  onClick={() => toggleModel(model.id)}
                  disabled={isMaxed}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xl'
                      : isMaxed
                      ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-black text-xs uppercase tracking-tight text-slate-700 truncate">
                        {model.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                        {model.provider}
                      </p>
                    </div>
                    <span className="text-lg flex-shrink-0">{model.flag}</span>
                  </div>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${badgeColorClasses[badge.color] || 'bg-slate-100 text-slate-600'}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      {model.id.includes('flash') || model.id.includes('mini') ? (
                        <><Zap size={12} /> Turbo</>
                      ) : (
                        <><Brain size={12} /> Reasoner</>
                      )}
                    </div>
                    <div className="flex-1 text-right font-bold text-emerald-600">
                      {formatPrice(model.pricing.prompt)}/1M
                    </div>
                  </div>
                </button>

                {/* Tooltip */}
                {hoveredModel === model.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 pointer-events-none border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-xs uppercase tracking-tight text-indigo-400 truncate pr-2">
                        {model.name}
                      </h4>
                      <span className="text-xs">{model.flag}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 mb-3">
                      {model.description || 'Specialized AI model for various tasks.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-500 uppercase">Speed</span>
                        <span className="text-xs font-bold text-slate-200">
                          {model.id.includes('flash') || model.id.includes('mini') ? '⚡ Turbo' : '🧠 Reasoner'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-500 uppercase">Context</span>
                        <span className="text-xs font-bold text-slate-200">
                          {(model.context_length / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="col-span-2 bg-slate-800/50 p-2 rounded-lg text-xs font-bold text-emerald-400 text-center">
                        {formatPrice(model.pricing.prompt)} / 1M tokens
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th 
                  className="text-left py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors select-none"
                  onClick={() => handleSort('model')}
                >
                  Model <SortIcon column="model" />
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors select-none"
                  onClick={() => handleSort('provider')}
                >
                  Provider <SortIcon column="provider" />
                </th>
                <th 
                  className="text-center py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors select-none"
                  onClick={() => handleSort('region')}
                >
                  Region <SortIcon column="region" />
                </th>
                <th 
                  className="text-center py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors select-none"
                  onClick={() => handleSort('type')}
                >
                  Type <SortIcon column="type" />
                </th>
                <th 
                  className="text-right py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors select-none"
                  onClick={() => handleSort('cost')}
                >
                  Cost/1M <SortIcon column="cost" />
                </th>
                <th className="text-center py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => {
                const isSelected = selectedModels.includes(model.id);
                const isMaxed = selectedModels.length >= maxSelection && !isSelected;
                const badges = getModelBadges(model);

                return (
                  <tr
                    key={model.id}
                    className={`relative border-b border-slate-100 transition-colors ${
                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                    }`}
                    onMouseEnter={(e) => {
                      setHoveredModel(model.id);
                      // Calculate position between Provider (col 2) and Region (col 3)
                      // Table columns: Model(1) | Provider(2) | Region(3) | Type(4) | Cost(5) | Select(6)
                      const rect = e.currentTarget.getBoundingClientRect();
                      // Position tooltip after Provider column (around 30-40% from left)
                      const x = rect.left + rect.width * 0.35;
                      const y = rect.top + window.scrollY - 10;
                      setTooltipPosition({ x, y });
                    }}
                    onMouseLeave={() => {
                      setHoveredModel(null);
                      setTooltipPosition(null);
                    }}
                  >
                    <td className="py-3 px-4">
                      <p className="font-black text-xs text-slate-700">{model.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{model.id}</p>
                      {/* Badges row in table */}
                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {badges.slice(0, 3).map((badge, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold ${badgeColorClasses[badge.color] || 'bg-slate-100 text-slate-600'}`}
                            >
                              {badge.icon} {badge.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{model.provider}</td>
                    <td className="py-3 px-4 text-center text-lg">{model.flag}</td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {model.id.includes('flash') || model.id.includes('mini') ? '⚡ Turbo' : '🧠 Reasoner'}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-emerald-600">
                      {formatPrice(model.pricing.prompt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleModel(model.id)}
                        disabled={isMaxed}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table tooltip overlay - renders outside overflow container */}
      {hoveredModel && tooltipPosition && (
        <>
          {(() => {
            const model = filteredModels.find(m => m.id === hoveredModel);
            if (!model) return null;
            return (
              <ModelTooltip 
                model={model} 
                style={{ 
                  left: tooltipPosition.x, 
                  top: tooltipPosition.y,
                  transform: 'translate(0, -100%)'
                }} 
              />
            );
          })()}
        </>
      )}

      {filteredModels.length === 0 && (
        <div className="text-center py-20">
          <Info className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-sm font-bold text-slate-400">No models match your filters</p>
        </div>
      )}
    </section>
  );
}
