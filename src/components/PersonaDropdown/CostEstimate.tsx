// src/components/PersonaDropdown/CostEstimate.tsx

import { useMemo } from 'react';
import { usePersonaStore } from '../../state/personaStore';
import { estimateQueryCost, formatCost } from '../../utils/costEstimator';
import type { ModelPricing } from '../../data/modelPricing';

interface CostEstimateProps {
  query: string;
  showThreshold?: boolean;
  threshold?: number;
  className?: string;
}

export function CostEstimate({
  query,
  showThreshold = true,
  threshold,
  className = '',
}: CostEstimateProps) {
  const { models, preferences } = usePersonaStore();
  
  const estimate = useMemo(() => {
    if (!query || models.length === 0) return null;
    
    return estimateQueryCost(
      query,
      models.map((m) => ({
        id: m.id,
        persona: m.persona || undefined,
      }))
    );
  }, [query, models]);

  const thresholdToUse = threshold ?? preferences.costThreshold;
  const totalCost = estimate?.total.totalCost ?? 0;
  const exceedsThreshold = totalCost > thresholdToUse;

  if (!estimate || totalCost === 0) {
    return null;
  }
  
  return (
    <div className={`cost-estimate ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Estimated cost:</span>
        <span className={`font-medium ${exceedsThreshold ? 'text-red-400' : 'text-green-400'}`}>
          {formatCost(totalCost)}
        </span>
      </div>
      
      {/* Cost breakdown */}
      <div className="mt-2 space-y-1">
        {estimate.models.slice(0, 3).map((model) => (
          <div key={model.modelId} className="flex items-center justify-between text-xs text-zinc-500">
            <span className="truncate max-w-[150px]">
              {model.modelName}
            </span>
            <span>{formatCost(model.totalCost)}</span>
          </div>
        ))}
        {estimate.models.length > 3 && (
          <div className="text-xs text-zinc-500">
            +{estimate.models.length - 3} more models
          </div>
        )}
      </div>
      
      {/* Threshold warning */}
      {showThreshold && exceedsThreshold && (
        <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-xs text-red-400">
            ⚠️ Cost exceeds threshold of {formatCost(thresholdToUse)}
          </p>
        </div>
      )}
    </div>
  );
}

export default CostEstimate;
