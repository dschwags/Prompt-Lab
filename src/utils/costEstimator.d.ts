// src/utils/costEstimator.d.ts

import type { ModelPricing } from '../data/modelPricing';

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  breakdown: {
    inputTokens: number;
    outputTokens: number;
    inputRate: number;
    outputRate: number;
  };
  modelId: string;
  modelName: string;
}

export interface CostBreakdown {
  models: CostEstimate[];
  total: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  tier: string;
  budgetFriendly: boolean;
}

export function estimateQueryCost(
  query: string,
  models: Array<{ id: string; persona?: string | undefined }>,
  pricing?: Record<string, ModelPricing>
): CostBreakdown;

export function formatCost(cost: number): string;

export function getModelEfficiencyScore(modelId: string): number;

export function suggestBudgetFriendlyOptions(
  breakdown: CostBreakdown,
  budgetThreshold: number
): Array<{ modelId: string; potentialSavings: number }>;
