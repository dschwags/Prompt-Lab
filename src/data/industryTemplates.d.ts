// src/data/industryTemplates.d.ts

export interface TemplatePersona {
  personaId: string;
  modelRecommendation: string;
  rationale: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  personas: TemplatePersona[];
  synthesisMode: string;
  expectedQueryTypes: string[];
  exampleQueries: string[];
  estimatedCost: number;
  estimatedTime: number;
}

export const INDUSTRY_TEMPLATES: {
  software_architecture: IndustryTemplate;
  feature_planning: IndustryTemplate;
  code_review: IndustryTemplate;
  brainstorming: IndustryTemplate;
  risk_assessment: IndustryTemplate;
  legal_review: IndustryTemplate;
  marketing_strategy: IndustryTemplate;
  user_research: IndustryTemplate;
  crisis_response: IndustryTemplate;
  strategic_planning: IndustryTemplate;
};

export function getTemplate(id: string): IndustryTemplate | null;

export function suggestTemplates(models: Array<{id: string, persona?: string}>): Array<{id: string, score: number, reason: string}>;

export function applyTemplate(templateId: string, availableModels: Array<{id: string, name: string}>): {
  models: Array<{id: string, name: string, persona: string | null, customPersona: null}>;
  globalPersona: null;
  synthesisMode: string;
} | null;
