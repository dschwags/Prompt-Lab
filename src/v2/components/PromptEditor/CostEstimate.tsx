import { useState } from 'react';
import { DollarSign, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { MODEL_PRICING, getModelPricing, calculateCost, getModelTier, COST_TIERS } from '../../data/modelPricing';

interface CostEstimateProps {
  selectedModels: string[];
  inputTokens: number;
  outputTokens: number;
  showDetails?: boolean;
}

const MODEL_ICONS: Record<string, string> = {
  anthropic: '🦙',
  openai: '🔮',
  google: '🔷',
  deepseek: '🧠',
  mistral: '🌪️',
  meta: '📘',
};

export function CostEstimate({
  selectedModels,
  inputTokens,
  outputTokens,
  showDetails = false
}: CostEstimateProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate total cost across all selected models
  const totalCost = selectedModels.reduce((sum, modelId) => {
    const cost = calculateCost(modelId, inputTokens, outputTokens);
    return sum + cost.totalCost;
  }, 0);

  // Get average cost per model
  const averageCost = selectedModels.length > 0 ? totalCost / selectedModels.length : 0;

  // Get tier for each model
  const modelTiers = selectedModels.map(id => getModelTier(id));
  const tierColors: Record<string, string> = {
    budget: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    standard: 'bg-amber-100 text-amber-700 border-amber-200',
    premium: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  // Find highest tier
  const highestTier = modelTiers.reduce((max, tier) => {
    const tierOrder = { budget: 1, standard: 2, premium: 3 };
    return tierOrder[tier as keyof typeof tierOrder] > tierOrder[max as keyof typeof tierOrder] ? tier : max;
  }, 'budget' as string);

  // Calculate cost breakdown by provider
  const providerBreakdown = selectedModels.reduce((acc, modelId) => {
    const pricing = getModelPricing(modelId);
    const cost = calculateCost(modelId, inputTokens, outputTokens);
    
    if (!acc[pricing.provider]) {
      acc[pricing.provider] = {
        models: [],
        totalCost: 0,
        icon: MODEL_ICONS[pricing.provider] || '🤖',
      };
    }
    
    acc[pricing.provider].models.push({
      id: modelId,
      name: pricing.name,
      cost: cost.totalCost,
    });
    acc[pricing.provider].totalCost += cost.totalCost;
    
    return acc;
  }, {} as Record<string, { models: { id: string; name: string; cost: number }[]; totalCost: number; icon: string }>);

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            highestTier === 'premium' ? 'bg-purple-100' :
            highestTier === 'standard' ? 'bg-amber-100' : 'bg-emerald-100'
          }`}>
            <DollarSign 
              size={24} 
              className={
                highestTier === 'premium' ? 'text-purple-600' :
                highestTier === 'standard' ? 'text-amber-600' : 'text-emerald-600'
              }
            />
          </div>
          <div className="text-left">
            <div className="font-black text-slate-900 text-sm uppercase tracking-wide">
              Cost Estimate
            </div>
            <div className="text-xs text-slate-500">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} × ~{(inputTokens + outputTokens).toLocaleString()} tokens
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Average Cost */}
          <div className="text-right">
            <div className="font-black text-2xl text-slate-900">
              ${averageCost.toFixed(4)}
            </div>
            <div className="text-xs text-slate-500">
              per model
            </div>
          </div>
          
          {/* Total Cost */}
          <div className="text-right px-4 py-2 bg-slate-900 rounded-xl">
            <div className="font-black text-xl text-white">
              ${totalCost.toFixed(4)}
            </div>
            <div className="text-xs text-slate-400">
              total
            </div>
          </div>
          
          {isExpanded ? (
            <ChevronUp size={20} className="text-slate-400" />
          ) : (
            <ChevronDown size={20} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-5 space-y-5 animate-in fade-in slide-in-from-top-2">
          {/* Token Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Token Breakdown
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info size={14} />
                <span>1 token ≈ 4 characters</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <div className="text-2xl font-black text-indigo-600">
                  {inputTokens.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">Input Tokens</div>
                <div className="text-xs font-bold text-emerald-600 mt-1">
                  ${selectedModels.reduce((sum, id) => sum + calculateCost(id, inputTokens, 0).inputCost, 0).toFixed(4)}
                </div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <div className="text-2xl font-black text-purple-600">
                  {outputTokens.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">Output Tokens</div>
                <div className="text-xs font-bold text-purple-600 mt-1">
                  ${selectedModels.reduce((sum, id) => sum + calculateCost(id, 0, outputTokens).outputCost, 0).toFixed(4)}
                </div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <div className="text-2xl font-black text-slate-700">
                  {(inputTokens + outputTokens).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">Total Tokens</div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  ${totalCost.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Model Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Per Model Cost
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${tierColors[highestTier]}`}>
                {COST_TIERS[highestTier as keyof typeof COST_TIERS]?.name} Tier
              </span>
            </div>
            
            <div className="space-y-2">
              {selectedModels.map(modelId => {
                const pricing = getModelPricing(modelId);
                const cost = calculateCost(modelId, inputTokens, outputTokens);
                const tier = getModelTier(modelId);
                
                return (
                  <div
                    key={modelId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{MODEL_ICONS[pricing.provider] || '🤖'}</span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{pricing.name}</div>
                        <div className="text-xs text-slate-500">
                          {pricing.inputPer1M}/M in • {pricing.outputPer1M}/M out
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-0.5 rounded text-xs font-bold border ${tierColors[tier]}`}>
                        {COST_TIERS[tier as keyof typeof COST_TIERS]?.name}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">
                          ${cost.totalCost.toFixed(4)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {((inputTokens + outputTokens) / 1000).toFixed(1)}K tokens
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider Breakdown */}
          {Object.keys(providerBreakdown).length > 1 && (
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 block">
                By Provider
              </span>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(providerBreakdown).map(([provider, data]) => (
                  <div
                    key={provider}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{data.icon}</span>
                      <span className="font-bold text-slate-700 text-sm capitalize">
                        {provider}
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      ${data.totalCost.toFixed(4)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {data.models.length} model{data.models.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <TrendingUp size={20} className="text-indigo-600 mt-0.5" />
            <div>
              <div className="font-bold text-indigo-900 text-sm">Cost Optimization Tips</div>
              <ul className="text-xs text-indigo-700 mt-1 space-y-1">
                <li>• Use budget-tier models (DeepSeek, Gemini Flash) for simple tasks</li>
                <li>• Reserve premium models (Claude Opus, o1) for complex reasoning</li>
                <li>• Keep prompts concise to reduce input token costs</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple inline cost display for when expanded is false
export function CostBadge({
  selectedModels,
  inputTokens,
  outputTokens
}: CostEstimateProps) {
  const totalCost = selectedModels.reduce((sum, modelId) => {
    const cost = calculateCost(modelId, inputTokens, outputTokens);
    return sum + cost.totalCost;
  }, 0);

  const highestTier = selectedModels.length > 0 
    ? getModelTier(selectedModels[0]) 
    : 'standard';

  const tierColors: Record<string, string> = {
    budget: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    standard: 'bg-amber-50 text-amber-700 border-amber-200',
    premium: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${tierColors[highestTier]}`}>
      <DollarSign size={14} />
      <span>${totalCost.toFixed(4)}</span>
      <span className="text-slate-400 font-normal">
        ({selectedModels.length})
      </span>
    </div>
  );
}
