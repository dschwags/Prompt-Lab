/**
 * INDUSTRY TEMPLATES LIBRARY
 * Pre-built prompt templates for common workflows
 */

import { PERSONA_PRESETS, PersonaPreset } from './personas';

export interface PersonaRecommendation {
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
  personas: PersonaRecommendation[];
  synthesisMode: string;
  expectedQueryTypes: string[];
  exampleQueries: string[];
  estimatedCost: number;
  estimatedTime: number;
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  software_architecture: {
    id: 'software_architecture',
    name: 'Software Architecture Review',
    icon: '🏗️',
    description: 'Review technical design, scalability, and implementation approach',
    category: 'development',
    personas: [
      { personaId: 'engineer', modelRecommendation: 'claude-sonnet-4', rationale: 'Technical feasibility' },
      { personaId: 'security_expert', modelRecommendation: 'gpt-4o', rationale: 'Security hardening' },
      { personaId: 'analyst', modelRecommendation: 'deepseek-chat', rationale: 'Performance trade-offs' },
    ],
    synthesisMode: 'merge',
    expectedQueryTypes: ['technical_design', 'api_design', 'system_architecture'],
    exampleQueries: ['Design a scalable authentication system', 'Review this microservices architecture'],
    estimatedCost: 0.15,
    estimatedTime: 45,
  },
  feature_planning: {
    id: 'feature_planning',
    name: 'Feature Planning & Prioritization',
    icon: '📋',
    description: 'Evaluate new features, prioritize roadmap, balance user needs',
    category: 'product',
    personas: [
      { personaId: 'product_manager', modelRecommendation: 'gpt-4o', rationale: 'User value' },
      { personaId: 'pragmatist', modelRecommendation: 'gemini-pro', rationale: 'Realistic scope' },
    ],
    synthesisMode: 'consensus',
    expectedQueryTypes: ['product_decision', 'prioritization', 'feature_design'],
    exampleQueries: ['Should we build feature A or B?', 'MVP definition'],
    estimatedCost: 0.12,
    estimatedTime: 40,
  },
  code_review: {
    id: 'code_review',
    name: 'Code Review',
    icon: '👀',
    description: 'Review code quality, find bugs, suggest improvements',
    category: 'development',
    personas: [
      { personaId: 'engineer', modelRecommendation: 'claude-sonnet-4', rationale: 'Code quality' },
      { personaId: 'security_expert', modelRecommendation: 'gpt-4o', rationale: 'Security review' },
    ],
    synthesisMode: 'merge',
    expectedQueryTypes: ['code_review', 'debugging', 'refactoring'],
    exampleQueries: ['Review this code for bugs', 'Edge cases to consider'],
    estimatedCost: 0.18,
    estimatedTime: 50,
  },
  brainstorming: {
    id: 'brainstorming',
    name: 'Creative Brainstorming',
    icon: '💡',
    description: 'Generate innovative ideas and explore possibilities',
    category: 'ideation',
    personas: [
      { personaId: 'creative', modelRecommendation: 'claude-sonnet-4', rationale: 'Bold thinking' },
      { personaId: 'futurist', modelRecommendation: 'gpt-4o', rationale: 'Long-term vision' },
    ],
    synthesisMode: 'merge',
    expectedQueryTypes: ['brainstorming', 'innovation', 'strategy'],
    exampleQueries: ['Innovative ways to onboard users', 'Creative solutions'],
    estimatedCost: 0.10,
    estimatedTime: 35,
  },
  risk_assessment: {
    id: 'risk_assessment',
    name: 'Risk Assessment',
    icon: '⚠️',
    description: 'Identify risks, evaluate threats, plan mitigation',
    category: 'analysis',
    personas: [
      { personaId: 'skeptic', modelRecommendation: 'claude-opus-4', rationale: 'Risk identification' },
      { personaId: 'historian', modelRecommendation: 'gpt-4o', rationale: 'Past lessons' },
    ],
    synthesisMode: 'contrast',
    expectedQueryTypes: ['risk_assessment', 'threat_modeling'],
    exampleQueries: ['What could go wrong?', 'Security risks'],
    estimatedCost: 0.25,
    estimatedTime: 60,
  },
  legal_review: {
    id: 'legal_review',
    name: 'Legal & Compliance Review',
    icon: '⚖️',
    description: 'Evaluate legal implications and compliance requirements',
    category: 'compliance',
    personas: [
      { personaId: 'lawyer', modelRecommendation: 'claude-opus-4', rationale: 'Legal reasoning' },
      { personaId: 'ethicist', modelRecommendation: 'claude-sonnet-4', rationale: 'Moral implications' },
    ],
    synthesisMode: 'debate',
    expectedQueryTypes: ['legal_review', 'compliance', 'privacy'],
    exampleQueries: ['GDPR compliance review', 'Terms of service review'],
    estimatedCost: 0.30,
    estimatedTime: 70,
  },
  marketing_strategy: {
    id: 'marketing_strategy',
    name: 'Marketing Strategy',
    icon: '📣',
    description: 'Develop marketing campaigns and positioning',
    category: 'marketing',
    personas: [
      { personaId: 'creative', modelRecommendation: 'claude-sonnet-4', rationale: 'Creative campaigns' },
      { personaId: 'analyst', modelRecommendation: 'gpt-4o', rationale: 'Data-driven targeting' },
    ],
    synthesisMode: 'merge',
    expectedQueryTypes: ['marketing', 'campaigns', 'positioning'],
    exampleQueries: ['Marketing campaign ideas', 'Brand positioning'],
    estimatedCost: 0.14,
    estimatedTime: 45,
  },
  documentation: {
    id: 'documentation',
    name: 'Technical Documentation',
    icon: '📚',
    description: 'Create clear technical documentation and guides',
    category: 'development',
    personas: [
      { personaId: 'engineer', modelRecommendation: 'claude-sonnet-4', rationale: 'Technical accuracy' },
      { personaId: 'socratic', modelRecommendation: 'gemini-pro', rationale: 'Clarity focus' },
    ],
    synthesisMode: 'merge',
    expectedQueryTypes: ['documentation', 'guides', 'tutorials'],
    exampleQueries: ['Create API documentation', 'Write user guide'],
    estimatedCost: 0.08,
    estimatedTime: 30,
  },
  data_analysis: {
    id: 'data_analysis',
    name: 'Data Analysis & Insights',
    icon: '📊',
    description: 'Analyze data and extract actionable insights',
    category: 'analysis',
    personas: [
      { personaId: 'analyst', modelRecommendation: 'claude-sonnet-4', rationale: 'Statistical analysis' },
      { personaId: 'historian', modelRecommendation: 'gpt-4o', rationale: 'Trend analysis' },
    ],
    synthesisMode: 'merge',
    expectedQueryTypes: ['data_analysis', 'insights', 'visualization'],
    exampleQueries: ['Analyze user behavior data', 'Sales trend insights'],
    estimatedCost: 0.16,
    estimatedTime: 55,
  },
  user_research: {
    id: 'user_research',
    name: 'User Research Synthesis',
    icon: '🔬',
    description: 'Synthesize user research and feedback',
    category: 'research',
    personas: [
      { personaId: 'analyst', modelRecommendation: 'claude-sonnet-4', rationale: 'Pattern identification' },
      { personaId: 'ethicist', modelRecommendation: 'gpt-4o', rationale: 'Impact assessment' },
    ],
    synthesisMode: 'consensus',
    expectedQueryTypes: ['user_research', 'feedback', 'personas'],
    exampleQueries: ['Synthesize user interview feedback', 'User persona development'],
    estimatedCost: 0.12,
    estimatedTime: 40,
  },
};

// Helper functions
export function getTemplateById(id: string): IndustryTemplate | undefined {
  return INDUSTRY_TEMPLATES[id];
}

export function getTemplatesByCategory(category: string): IndustryTemplate[] {
  return Object.values(INDUSTRY_TEMPLATES).filter(t => t.category === category);
}

export function getRecommendedModelsForTemplate(
  templateId: string,
  availableModels: string[]
): string[] {
  const template = INDUSTRY_TEMPLATES[templateId];
  if (!template) return [];
  
  return template.personas
    .filter(p => availableModels.includes(p.modelRecommendation))
    .map(p => p.modelRecommendation);
}

export function getTemplatePersonas(templateId: string): PersonaPreset[] {
  const template = INDUSTRY_TEMPLATES[templateId];
  if (!template) return [];
  
  return template.personas
    .map((p, index) => PERSONA_PRESETS[p.personaId])
    .filter((p): p is PersonaPreset => p !== undefined);
}
