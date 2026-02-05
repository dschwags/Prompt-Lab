// src/state/personaStore.d.ts

import type { Persona } from '../data/personas';
import type { IndustryTemplate } from '../data/industryTemplates';
import type { ModelPricing } from '../data/modelPricing';
import type { SynthesisMode } from '../data/synthesisStrategies';

export interface CustomPersona {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  instruction: string;
  createdAt: string;
}

export interface ModelState {
  id: string;
  name: string;
  persona: string | null;
  customPersona: string | null;
}

export interface Preferences {
  defaultSynthesisMode: string;
  costThreshold: number;
  autoApplyTemplates: boolean;
  showCostWarnings: boolean;
}

export interface PersonaStoreState {
  // Global settings
  globalPersona: string | null;
  globalCustomPersona: string | null;
  models: ModelState[];
  activeTemplate: string | null;
  synthesisMode: string;
  preferences: Preferences;
  
  // Actions
  setGlobalPersona: (personaId: string | null) => void;
  setGlobalCustomPersona: (customPersona: string | null) => void;
  clearGlobalPersona: () => void;
  setModelPersona: (modelId: string, personaId: string | null) => void;
  setModelCustomPersona: (modelId: string, customPersona: string | null) => void;
  clearModelPersona: (modelId: string) => void;
  addModel: (model: { id: string; name: string }) => void;
  removeModel: (modelId: string) => void;
  setSynthesisMode: (mode: string) => void;
  applyIndustryTemplate: (templateId: string, availableModels: Array<{id: string, name: string}>) => void;
  clearTemplate: () => void;
  getEffectivePersona: (modelId: string) => {
    type: 'preset' | 'custom' | null;
    personaId?: string;
    persona?: Persona;
    instruction?: string;
  } | null;
  getActivePersonas: () => string[];
  validateConfiguration: () => {
    valid: boolean;
    hasModels: boolean;
    hasPersonas: boolean;
    personaValidation: {
      valid: boolean;
      warnings: string[];
      suggestions: string[];
    };
  };
  updatePreferences: (newPreferences: Partial<Preferences>) => void;
  reset: () => void;
}

// Zustand hook type
type UsePersonaStore = () => PersonaStoreState;

declare const usePersonaStore: UsePersonaStore;

export { usePersonaStore };
