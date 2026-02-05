// src/data/personas.d.ts

export const PERSONA_CATEGORIES: {
  THINKING: 'thinking';
  CRITIQUE: 'critique';
  EXPERTISE: 'expertise';
  PERSPECTIVE: 'perspective';
};

export interface Persona {
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
}

export const PERSONA_PRESETS: {
  creative: Persona;
  analyst: Persona;
  pragmatist: Persona;
  skeptic: Persona;
  devil_advocate: Persona;
  socratic: Persona;
  engineer: Persona;
  security_expert: Persona;
  ux_designer: Persona;
  product_manager: Persona;
  qa_tester: Persona;
  lawyer: Persona;
  optimist: Persona;
  pessimist: Persona;
  historian: Persona;
  futurist: Persona;
};

export function getPersona(id: string): Persona | null;

export function validatePersonaCombination(personaIds: string[]): {
  valid: boolean;
  warnings: string[];
  suggestions: string[];
};
