// src/utils/queryAnalyzer.d.ts

export interface SuggestedPersona {
  personaId: string;
  persona?: {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    instruction: string;
    bestFor: string[];
    worstFor: string[];
    pairsWellWith: string[] | null;
    conflicts: string[] | null;
    exampleQueries: string[];
    utilityScore: number;
  };
  score: number;
}

export interface QueryAnalysis {
  queryTypes: string[];
  suggestedPersonas: SuggestedPersona[];
  suggestedTemplates: Array<{ id: string; score: number; reason: string }>;
  confidence: number;
  urgency: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedResponseLength: number;
  metadata?: {
    typeScores?: Record<string, number>;
    queryLength?: number;
    questionMarks?: number;
  };
}

export interface SynthesisRecommendation {
  mode: string;
  reason: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function analyzeQuery(query: string): QueryAnalysis;

export function recommendSynthesisMode(
  queryAnalysis: QueryAnalysis,
  selectedPersonas: string[]
): SynthesisRecommendation;

export function validateQuery(query: string): ValidationResult;

export function extractKeywords(query: string): string[];

export function detectDomain(query: string): string;

export function determineComplexity(query: string): 'simple' | 'medium' | 'complex';

export function suggestPersonas(analysis: QueryAnalysis): SuggestedPersona[];
