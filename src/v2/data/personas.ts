/**
 * PERSONA PRESETS LIBRARY
 */

export const PERSONA_CATEGORIES = {
  THINKING: 'thinking',
  CRITIQUE: 'critique',
  EXPERTISE: 'expertise',
  PERSPECTIVE: 'perspective',
} as const;

export type PersonaCategory = typeof PERSONA_CATEGORIES[keyof typeof PERSONA_CATEGORIES];

export interface PersonaPreset {
  id: string;
  name: string;
  icon: string;
  category: PersonaCategory;
  description: string;
  instruction: string;
  bestFor: string[];
  worstFor: string[];
  pairsWellWith: string[] | null;
  conflicts: string[] | null;
  exampleQueries: string[];
  utilityScore: number;
}

export const PERSONA_PRESETS: Record<string, PersonaPreset> = {
  creative: {
    id: 'creative',
    name: 'Creative',
    icon: '🎨',
    category: PERSONA_CATEGORIES.THINKING,
    description: 'Generates bold, innovative ideas',
    instruction: 'You are a creative genius who thinks outside the box.',
    bestFor: ['brainstorming', 'innovation'],
    worstFor: ['debugging', 'security review'],
    pairsWellWith: ['analyst', 'pragmatist'],
    conflicts: ['pessimist'],
    exampleQueries: ['Design a revolutionary feature'],
    utilityScore: 0.8,
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    icon: '📊',
    category: PERSONA_CATEGORIES.THINKING,
    description: 'Data-driven, systematic reasoning',
    instruction: 'You are a meticulous data analyst.',
    bestFor: ['data analysis', 'metrics'],
    worstFor: ['pure creativity'],
    pairsWellWith: ['creative', 'engineer'],
    conflicts: null,
    exampleQueries: ['Analyze performance metrics'],
    utilityScore: 0.9,
  },
  pragmatist: {
    id: 'pragmatist',
    name: 'Pragmatist',
    icon: '⚙️',
    category: PERSONA_CATEGORIES.THINKING,
    description: 'Realistic and practical focus',
    instruction: 'You are a pragmatic realist.',
    bestFor: ['project planning', 'MVP definition'],
    worstFor: ['blue-sky thinking'],
    pairsWellWith: ['creative', 'futurist'],
    conflicts: ['perfectionist'],
    exampleQueries: ['What can we realistically ship?'],
    utilityScore: 0.85,
  },
  skeptic: {
    id: 'skeptic',
    name: 'Skeptic',
    icon: '🔍',
    category: PERSONA_CATEGORIES.CRITIQUE,
    description: 'Questions assumptions and finds flaws',
    instruction: 'You are a critical skeptic.',
    bestFor: ['risk assessment', 'code review'],
    worstFor: ['brainstorming'],
    pairsWellWith: ['optimist', 'creative'],
    conflicts: ['optimist'],
    exampleQueries: ['What could go wrong?'],
    utilityScore: 0.75,
  },
  devil_advocate: {
    id: 'devil_advocate',
    name: "Devil's Advocate",
    icon: '😈',
    category: PERSONA_CATEGORIES.CRITIQUE,
    description: 'Argues opposite positions',
    instruction: 'You are a professional devil\'s advocate.',
    bestFor: ['decision validation', 'debate prep'],
    worstFor: ['team building'],
    pairsWellWith: ['optimist'],
    conflicts: ['consensus_builder'],
    exampleQueries: ['Argue against this strategy'],
    utilityScore: 0.65,
  },
  socratic: {
    id: 'socratic',
    name: 'Socratic Questioner',
    icon: '❓',
    category: PERSONA_CATEGORIES.CRITIQUE,
    description: 'Uses questions to guide thinking',
    instruction: 'You are a Socratic questioner.',
    bestFor: ['problem definition', 'requirements'],
    worstFor: ['urgent decisions'],
    pairsWellWith: ['analyst', 'engineer'],
    conflicts: null,
    exampleQueries: ['Help me understand the problem'],
    utilityScore: 0.7,
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    icon: '🔧',
    category: PERSONA_CATEGORIES.EXPERTISE,
    description: 'Technical feasibility focus',
    instruction: 'You are a systems engineer.',
    bestFor: ['architecture review', 'API design'],
    worstFor: ['marketing'],
    pairsWellWith: ['analyst', 'product_manager'],
    conflicts: null,
    exampleQueries: ['Design the architecture'],
    utilityScore: 0.9,
  },
  security_expert: {
    id: 'security_expert',
    name: 'Security Expert',
    icon: '🔒',
    category: PERSONA_CATEGORIES.EXPERTISE,
    description: 'Identifies vulnerabilities',
    instruction: 'You are a cybersecurity expert.',
    bestFor: ['security review', 'auth design'],
    worstFor: ['rapid prototyping'],
    pairsWellWith: ['engineer', 'lawyer'],
    conflicts: ['move_fast'],
    exampleQueries: ['Review for vulnerabilities'],
    utilityScore: 0.8,
  },
  lawyer: {
    id: 'lawyer',
    name: 'Legal Expert',
    icon: '⚖️',
    category: PERSONA_CATEGORIES.EXPERTISE,
    description: 'Legal implications focus',
    instruction: 'You are a legal expert.',
    bestFor: ['contract review', 'compliance'],
    worstFor: ['creative writing'],
    pairsWellWith: ['ethicist', 'product_manager'],
    conflicts: ['move_fast'],
    exampleQueries: ['Review terms for issues'],
    utilityScore: 0.85,
  },
  optimist: {
    id: 'optimist',
    name: 'Optimist',
    icon: '🌟',
    category: PERSONA_CATEGORIES.PERSPECTIVE,
    description: 'Focuses on positive outcomes',
    instruction: 'You are an eternal optimist.',
    bestFor: ['team motivation', 'vision'],
    worstFor: ['risk assessment'],
    pairsWellWith: ['skeptic'],
    conflicts: ['pessimist'],
    exampleQueries: ['What are the possibilities?'],
    utilityScore: 0.6,
  },
  historian: {
    id: 'historian',
    name: 'Historian',
    icon: '📜',
    category: PERSONA_CATEGORIES.PERSPECTIVE,
    description: 'Lessons from history',
    instruction: 'You are a historical expert.',
    bestFor: ['strategic planning', 'risks'],
    worstFor: ['immediate action'],
    pairsWellWith: ['analyst', 'futurist'],
    conflicts: null,
    exampleQueries: ['What can we learn from history?'],
    utilityScore: 0.75,
  },
  futurist: {
    id: 'futurist',
    name: 'Futurist',
    icon: '🔮',
    category: PERSONA_CATEGORIES.PERSPECTIVE,
    description: 'Future trends projection',
    instruction: 'You are a futurist.',
    bestFor: ['roadmap building', 'scenarios'],
    worstFor: ['tactical decisions'],
    pairsWellWith: ['analyst', 'historian'],
    conflicts: null,
    exampleQueries: ['How might AI change this?'],
    utilityScore: 0.8,
  },
  ethicist: {
    id: 'ethicist',
    name: 'Ethicist',
    icon: '⚖️',
    category: PERSONA_CATEGORIES.PERSPECTIVE,
    description: 'Moral implications focus',
    instruction: 'You are an ethicist.',
    bestFor: ['policy decisions', 'AI ethics'],
    worstFor: ['quick prototyping'],
    pairsWellWith: ['lawyer', 'product_manager'],
    conflicts: ['move_fast'],
    exampleQueries: ['What are ethical implications?'],
    utilityScore: 0.8,
  },
};

// Helper functions
export function getPersonaById(id: string): PersonaPreset | undefined {
  return PERSONA_PRESETS[id];
}

export function getPersonasByCategory(category: string): PersonaPreset[] {
  return Object.values(PERSONA_PRESETS).filter(p => p.category === category);
}

export function getPersonasByUseCase(useCase: string): Array<{ persona: PersonaPreset; relevance: number }> {
  const results: Array<{ persona: PersonaPreset; relevance: number }> = [];
  Object.values(PERSONA_PRESETS).forEach(persona => {
    let relevance = 0;
    if (persona.bestFor.includes(useCase)) relevance += 2;
    if (persona.worstFor.includes(useCase)) relevance -= 1;
    if (relevance > 0) results.push({ persona, relevance });
  });
  return results.sort((a, b) => b.relevance - a.relevance);
}
