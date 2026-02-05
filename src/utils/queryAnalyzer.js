// src/utils/queryAnalyzer.js

import { PERSONA_PRESETS, getPersona } from '../data/personas.js'
import { INDUSTRY_TEMPLATES, suggestTemplates } from '../data/industryTemplates.js'

const QUERY_PATTERNS = {
  technical: {
    keywords: /\b(api|code|bug|architecture|database|security|deploy|server|backend|frontend|refactor|optimize|performance|scale)\b/i,
    weight: 1.0,
    suggestedPersonas: ['engineer', 'security_expert', 'analyst'],
  },
  
  creative: {
    keywords: /\b(design|innovative|creative|brainstorm|idea|unique|novel|revolutionary|disrupt|reimagine)\b/i,
    weight: 1.0,
    suggestedPersonas: ['creative', 'artist', 'futurist'],
  },
  
  business: {
    keywords: /\b(strategy|revenue|market|customer|growth|roi|profit|sales|pricing|monetize)\b/i,
    weight: 1.0,
    suggestedPersonas: ['product_manager', 'analyst', 'pragmatist'],
  },
  
  risk: {
    keywords: /\b(risk|safe|secure|problem|wrong|fail|threat|vulnerability|danger|breach)\b/i,
    weight: 1.2,
    suggestedPersonas: ['skeptic', 'security_expert', 'historian'],
  },
  
  user_focused: {
    keywords: /\b(user|ux|ui|interface|experience|usability|accessible|intuitive|onboard)\b/i,
    weight: 1.0,
    suggestedPersonas: ['ux_designer', 'product_manager', 'qa_tester'],
  },
  
  legal: {
    keywords: /\b(legal|compliance|gdpr|privacy|terms|contract|liability|policy|regulation)\b/i,
    weight: 1.2,
    suggestedPersonas: ['lawyer', 'ethicist', 'security_expert'],
  },
  
  planning: {
    keywords: /\b(plan|roadmap|timeline|milestone|sprint|prioritize|schedule|deadline)\b/i,
    weight: 0.8,
    suggestedPersonas: ['product_manager', 'pragmatist', 'analyst'],
  },
  
  testing: {
    keywords: /\b(test|qa|quality|bug|error|edge case|validate|verify)\b/i,
    weight: 1.0,
    suggestedPersonas: ['qa_tester', 'skeptic', 'engineer'],
  },
  
  decision: {
    keywords: /\b(decide|choose|should|which|better|versus|vs|compare|evaluate)\b/i,
    weight: 0.9,
    suggestedPersonas: ['analyst', 'devil_advocate', 'pragmatist'],
  },
  
  vision: {
    keywords: /\b(future|vision|long-term|strategy|trend|predict|forecast|years)\b/i,
    weight: 0.8,
    suggestedPersonas: ['futurist', 'historian', 'creative'],
  },
}

const URGENCY_PATTERNS = {
  high: /\b(urgent|critical|emergency|asap|now|immediately|production down|breach)\b/i,
  medium: /\b(soon|today|this week|deadline)\b/i,
  low: /\b(eventually|someday|future|long-term)\b/i,
}

const COMPLEXITY_PATTERNS = {
  simple: /\b(simple|quick|basic|straightforward|easy)\b/i,
  complex: /\b(complex|complicated|sophisticated|advanced|enterprise|scale)\b/i,
}

export function analyzeQuery(query) {
  if (!query || query.trim().length === 0) {
    return {
      queryTypes: [],
      suggestedPersonas: [],
      suggestedTemplates: [],
      confidence: 0,
      urgency: 'medium',
      complexity: 'medium',
      estimatedResponseLength: 1500,
    }
  }
  
  const queryLower = query.toLowerCase()
  
  const detectedTypes = []
  const typeScores = {}
  
  Object.entries(QUERY_PATTERNS).forEach(([type, pattern]) => {
    if (pattern.keywords.test(queryLower)) {
      detectedTypes.push(type)
      typeScores[type] = pattern.weight
    }
  })
  
  const urgency = detectUrgency(queryLower)
  const complexity = detectComplexity(queryLower, detectedTypes)
  const suggestedPersonas = getSuggestedPersonas(detectedTypes, typeScores)
  const suggestedTemplates = suggestTemplates(query)
  const confidence = calculateConfidence(detectedTypes, query)
  const estimatedResponseLength = estimateResponseLength(complexity, detectedTypes)
  
  return {
    queryTypes: detectedTypes,
    suggestedPersonas,
    suggestedTemplates,
    confidence,
    urgency,
    complexity,
    estimatedResponseLength,
    metadata: {
      typeScores,
      queryLength: query.length,
      questionMarks: (query.match(/\?/g) || []).length,
    },
  }
}

function detectUrgency(queryLower) {
  if (URGENCY_PATTERNS.high.test(queryLower)) return 'high'
  if (URGENCY_PATTERNS.medium.test(queryLower)) return 'medium'
  if (URGENCY_PATTERNS.low.test(queryLower)) return 'low'
  return 'medium'
}

function detectComplexity(queryLower, detectedTypes) {
  if (COMPLEXITY_PATTERNS.simple.test(queryLower)) return 'simple'
  if (COMPLEXITY_PATTERNS.complex.test(queryLower)) return 'complex'
  
  if (detectedTypes.length === 0) return 'simple'
  if (detectedTypes.length === 1) return 'medium'
  if (detectedTypes.length >= 3) return 'complex'
  
  return 'medium'
}

function getSuggestedPersonas(detectedTypes, typeScores) {
  const personaScores = {}
  
  detectedTypes.forEach(type => {
    const pattern = QUERY_PATTERNS[type]
    const weight = typeScores[type] || 1.0
    
    pattern.suggestedPersonas.forEach(personaId => {
      if (!personaScores[personaId]) {
        personaScores[personaId] = 0
      }
      personaScores[personaId] += weight
    })
  })
  
  const ranked = Object.entries(personaScores)
    .map(([personaId, score]) => ({
      personaId,
      persona: getPersona(personaId),
      score,
    }))
    .sort((a, b) => b.score - a.score)
  
  const count = Math.min(Math.max(detectedTypes.length, 3), 5)
  return ranked.slice(0, count)
}

function calculateConfidence(detectedTypes, query) {
  if (detectedTypes.length === 0) return 0.1
  
  const queryWords = query.split(/\s+/).length
  
  const typeScore = Math.min(detectedTypes.length / 3, 1) * 0.6
  const lengthScore = Math.min(queryWords / 20, 1) * 0.4
  
  return typeScore + lengthScore
}

function estimateResponseLength(complexity, detectedTypes) {
  let baseLength = 1000
  
  if (complexity === 'simple') baseLength = 500
  if (complexity === 'complex') baseLength = 2000
  
  const typeMultiplier = 1 + (detectedTypes.length * 0.2)
  
  return Math.round(baseLength * typeMultiplier)
}

export function recommendSynthesisMode(queryAnalysis, selectedPersonas) {
  const { urgency, queryTypes, complexity } = queryAnalysis
  
  if (urgency === 'high') {
    return {
      mode: 'consensus',
      reason: 'High urgency requires quick agreement',
    }
  }
  
  const hasConflicts = selectedPersonas.some((p1, i) => 
    selectedPersonas.slice(i + 1).some(p2 => {
      const persona1 = getPersona(p1)
      const persona2 = getPersona(p2)
      return persona1.conflicts?.includes(p2) || persona2.conflicts?.includes(p1)
    })
  )
  
  if (hasConflicts) {
    return {
      mode: 'debate',
      reason: 'Conflicting personas benefit from debate',
    }
  }
  
  if (queryTypes.includes('decision')) {
    return {
      mode: 'contrast',
      reason: 'Decision queries need clear comparison',
    }
  }
  
  if (complexity === 'complex' && queryTypes.length >= 3) {
    return {
      mode: 'merge',
      reason: 'Complex multi-faceted query needs comprehensive synthesis',
    }
  }
  
  return {
    mode: 'consensus',
    reason: 'Standard collaborative review',
  }
}

export function validateQuery(query) {
  const errors = []
  const warnings = []
  
  if (!query || query.trim().length < 10) {
    errors.push('Query is too short. Please provide more detail.')
  }
  
  if (query.length > 4000) {
    warnings.push('Query is very long. Consider breaking into multiple workshops.')
  }
  
  if (query.trim().split(/\s+/).length === 1) {
    warnings.push('Single-word query may not provide enough context.')
  }
  
  const placeholders = ['lorem ipsum', 'test', 'asdf', 'xxx']
  if (placeholders.some(p => query.toLowerCase().includes(p))) {
    warnings.push('Query appears to contain placeholder text.')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
