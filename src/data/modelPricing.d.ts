// src/data/modelPricing.d.ts

export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
  contextWindow: number;
}

export const MODEL_PRICING: Record<string, ModelPricing>;

export function getModelPricing(modelId: string): ModelPricing;

export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  breakdown: {
    inputTokens: number;
    outputTokens: number;
    inputRate: number;
    outputRate: number;
  };
};

export function estimateTokens(text: string): number;

export const COST_TIERS: {
  budget: { name: string; maxCostPer1M: number; models: string[] };
  standard: { name: string; maxCostPer1M: number; models: string[] };
  premium: { name: string; maxCostPer1M: number; models: string[] };
};

export function getModelTier(modelId: string): string;
