// src/utils/sessionExport.d.ts

export interface SessionMetrics {
  totalQueries: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  modelsUsed: string[];
  personasUsed: string[];
  synthesisModesUsed: string[];
  averageResponseTime: number;
  sessionDuration: number;
  queryComplexity: {
    simple: number;
    moderate: number;
    complex: number;
  };
}

export interface ExportData {
  sessionId: string;
  timestamp: string;
  version: string;
  metrics: SessionMetrics;
  queries: Array<{
    id: string;
    timestamp: string;
    query: string;
    response: string;
    modelId: string;
    personaId?: string;
    synthesisMode?: string;
    cost: number;
    tokens: {
      input: number;
      output: number;
    };
    analysis?: {
      complexity: string;
      detectedIntent: string;
    };
  }>;
  settings: {
    globalPersona: string | null;
    activeTemplate: string | null;
    activeSynthesisMode: string | null;
  };
}

export function generateSessionId(): string;

export function collectSessionMetrics(
  queries: Array<{
    query: string;
    response: string;
    modelId: string;
    personaId?: string;
    synthesisMode?: string;
    cost: number;
    tokens: {
      input: number;
      output: number;
    };
    responseTime: number;
    timestamp: string;
  }>,
  settings: {
    globalPersona: string | null;
    activeTemplate: string | null;
    activeSynthesisMode: string | null;
  }
): SessionMetrics;

export function formatExportData(
  metrics: SessionMetrics,
  queries: Array<{
    id: string;
    timestamp: string;
    query: string;
    response: string;
    modelId: string;
    personaId?: string;
    synthesisMode?: string;
    cost: number;
    tokens: {
      input: number;
      output: number;
    };
  }>,
  settings: {
    globalPersona: string | null;
    activeTemplate: string | null;
    activeSynthesisMode: string | null;
  }
): ExportData;

export function exportToJSON(data: ExportData): string;

export function exportToCSV(queries: Array<{
  id: string;
  query: string;
  modelId: string;
  personaId?: string;
  cost: number;
  timestamp: string;
}>): string;
