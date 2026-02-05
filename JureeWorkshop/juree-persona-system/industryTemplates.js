// src/data/industryTemplates.js

import { PERSONA_PRESETS } from './personas'

export const INDUSTRY_TEMPLATES = {
  software_architecture: {
    id: 'software_architecture',
    name: 'Software Architecture Review',
    icon: '🏗️',
    description: 'Review technical design, scalability, and implementation approach',
    category: 'development',
    
    personas: [
      {
        personaId: 'engineer',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Technical feasibility and design patterns',
      },
      {
        personaId: 'security_expert',
        modelRecommendation: 'gpt-4o',
        rationale: 'Security vulnerabilities and hardening',
      },
      {
        personaId: 'analyst',
        modelRecommendation: 'deepseek-chat',
        rationale: 'Performance metrics and trade-offs',
      },
    ],
    
    synthesisMode: 'merge',
    expectedQueryTypes: ['technical_design', 'api_design', 'system_architecture'],
    
    exampleQueries: [
      'Design a scalable authentication system',
      'Review this microservices architecture',
      'What's the best approach for real-time data sync?',
    ],
    
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
      {
        personaId: 'product_manager',
        modelRecommendation: 'gpt-4o',
        rationale: 'User value and roadmap fit',
      },
      {
        personaId: 'ux_designer',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'User experience impact',
      },
      {
        personaId: 'pragmatist',
        modelRecommendation: 'gemini-pro',
        rationale: 'Realistic scope and timeline',
      },
    ],
    
    synthesisMode: 'consensus',
    expectedQueryTypes: ['product_decision', 'prioritization', 'feature_design'],
    
    exampleQueries: [
      'Should we build feature A or feature B?',
      'What's the MVP for this user story?',
      'How do we prioritize these 5 requests?',
    ],
    
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
      {
        personaId: 'engineer',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Code quality and best practices',
      },
      {
        personaId: 'security_expert',
        modelRecommendation: 'gpt-4o',
        rationale: 'Security vulnerabilities',
      },
      {
        personaId: 'qa_tester',
        modelRecommendation: 'deepseek-chat',
        rationale: 'Edge cases and error handling',
      },
    ],
    
    synthesisMode: 'merge',
    expectedQueryTypes: ['code_review', 'debugging', 'refactoring'],
    
    exampleQueries: [
      'Review this code for bugs and improvements',
      'Is this implementation secure?',
      'What edge cases am I missing?',
    ],
    
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
      {
        personaId: 'creative',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Bold, innovative thinking',
      },
      {
        personaId: 'futurist',
        modelRecommendation: 'gpt-4o',
        rationale: 'Long-term vision',
      },
      {
        personaId: 'pragmatist',
        modelRecommendation: 'gemini-pro',
        rationale: 'Ground ideas in reality',
      },
    ],
    
    synthesisMode: 'merge',
    expectedQueryTypes: ['brainstorming', 'innovation', 'strategy'],
    
    exampleQueries: [
      'Innovative ways to onboard users',
      'How can we disrupt this market?',
      'Creative solutions to increase engagement',
    ],
    
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
      {
        personaId: 'skeptic',
        modelRecommendation: 'claude-opus-4',
        rationale: 'Thorough risk identification',
      },
      {
        personaId: 'historian',
        modelRecommendation: 'gpt-4o',
        rationale: 'Learn from past failures',
      },
      {
        personaId: 'security_expert',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Security-specific threats',
      },
    ],
    
    synthesisMode: 'contrast',
    expectedQueryTypes: ['risk_assessment', 'threat_modeling', 'security_audit'],
    
    exampleQueries: [
      'What could go wrong with this launch?',
      'Identify security risks in this system',
      'What are we not considering?',
    ],
    
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
      {
        personaId: 'lawyer',
        modelRecommendation: 'claude-opus-4',
        rationale: 'Legal reasoning and precedent',
      },
      {
        personaId: 'devil_advocate',
        modelRecommendation: 'gpt-4o',
        rationale: 'Challenge legal positions',
      },
      {
        personaId: 'ethicist',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Moral implications',
      },
    ],
    
    synthesisMode: 'debate',
    expectedQueryTypes: ['legal_review', 'compliance', 'privacy'],
    
    exampleQueries: [
      'Legal implications of this feature',
      'GDPR compliance review',
      'Review our terms of service',
    ],
    
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
      {
        personaId: 'creative',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Creative campaigns',
      },
      {
        personaId: 'analyst',
        modelRecommendation: 'gpt-4o',
        rationale: 'Data-driven targeting',
      },
      {
        personaId: 'ux_designer',
        modelRecommendation: 'gemini-pro',
        rationale: 'User psychology',
      },
    ],
    
    synthesisMode: 'merge',
    expectedQueryTypes: ['marketing', 'campaign', 'positioning'],
    
    exampleQueries: [
      'Design a product launch campaign',
      'How should we position against competitors?',
      'Viral marketing ideas for our app',
    ],
    
    estimatedCost: 0.12,
    estimatedTime: 40,
  },

  user_research: {
    id: 'user_research',
    name: 'User Research & Testing',
    icon: '🔬',
    description: 'Analyze user behavior and testing results',
    category: 'research',
    
    personas: [
      {
        personaId: 'analyst',
        modelRecommendation: 'gpt-4o',
        rationale: 'Data analysis',
      },
      {
        personaId: 'ux_designer',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'UX insights',
      },
      {
        personaId: 'socratic',
        modelRecommendation: 'gemini-pro',
        rationale: 'Deeper questioning',
      },
    ],
    
    synthesisMode: 'consensus',
    expectedQueryTypes: ['user_research', 'testing', 'feedback_analysis'],
    
    exampleQueries: [
      'Analyze this user testing feedback',
      'What do these metrics tell us?',
      'Why are users dropping off here?',
    ],
    
    estimatedCost: 0.10,
    estimatedTime: 35,
  },

  crisis_response: {
    id: 'crisis_response',
    name: 'Crisis Response',
    icon: '🚨',
    description: 'Handle urgent issues and incidents',
    category: 'operations',
    
    personas: [
      {
        personaId: 'pragmatist',
        modelRecommendation: 'gpt-4o',
        rationale: 'Quick, actionable solutions',
      },
      {
        personaId: 'skeptic',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Identify what could get worse',
      },
      {
        personaId: 'engineer',
        modelRecommendation: 'deepseek-chat',
        rationale: 'Technical fixes',
      },
    ],
    
    synthesisMode: 'merge',
    expectedQueryTypes: ['incident', 'debugging', 'crisis'],
    
    exampleQueries: [
      'Production is down, what do we do?',
      'We have a security breach, next steps?',
      'Critical bug affecting all users',
    ],
    
    estimatedCost: 0.15,
    estimatedTime: 30,
  },

  strategic_planning: {
    id: 'strategic_planning',
    name: 'Strategic Planning',
    icon: '🎯',
    description: 'Long-term strategy and vision setting',
    category: 'strategy',
    
    personas: [
      {
        personaId: 'futurist',
        modelRecommendation: 'claude-opus-4',
        rationale: 'Long-term vision',
      },
      {
        personaId: 'analyst',
        modelRecommendation: 'gpt-4o',
        rationale: 'Market analysis',
      },
      {
        personaId: 'historian',
        modelRecommendation: 'claude-sonnet-4',
        rationale: 'Learn from precedent',
      },
    ],
    
    synthesisMode: 'merge',
    expectedQueryTypes: ['strategy', 'planning', 'vision'],
    
    exampleQueries: [
      'Our 3-year product strategy',
      'How should we respond to this market shift?',
      'Vision for our platform in 2030',
    ],
    
    estimatedCost: 0.28,
    estimatedTime: 65,
  },
}

export function getTemplate(id) {
  return INDUSTRY_TEMPLATES[id]
}

export function getAllTemplates() {
  return Object.values(INDUSTRY_TEMPLATES)
}

export function getTemplatesByCategory(category) {
  return getAllTemplates().filter(t => t.category === category)
}

export function getTemplateCategories() {
  const categories = new Set(getAllTemplates().map(t => t.category))
  return Array.from(categories)
}

export function applyTemplate(templateId, availableModels) {
  const template = getTemplate(templateId)
  if (!template) return null
  
  const config = {
    templateId,
    templateName: template.name,
    globalPersona: null,
    models: [],
    synthesisMode: template.synthesisMode,
  }
  
  template.personas.forEach((persona, index) => {
    const recommendedModel = availableModels.find(
      m => m.id === persona.modelRecommendation
    )
    
    const modelToUse = recommendedModel || availableModels[index % availableModels.length]
    
    if (modelToUse) {
      config.models.push({
        id: modelToUse.id,
        name: modelToUse.name,
        persona: persona.personaId,
        customPersona: null,
      })
    }
  })
  
  return config
}

export function suggestTemplates(query) {
  const queryLower = query.toLowerCase()
  
  const scores = getAllTemplates().map(template => {
    let score = 0
    
    template.exampleQueries.forEach(example => {
      const exampleLower = example.toLowerCase()
      const commonWords = queryLower.split(' ').filter(word => 
        word.length > 3 && exampleLower.includes(word)
      )
      score += commonWords.length * 2
    })
    
    const words = queryLower.split(' ')
    template.expectedQueryTypes.forEach(type => {
      if (words.some(word => type.includes(word))) {
        score += 3
      }
    })
    
    if (queryLower.includes(template.name.toLowerCase())) {
      score += 5
    }
    
    return { template, score }
  })
  
  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.template.id)
}
