// src/utils/promptBuilder.ts

import { usePersonaStore } from '../state/personaStore';
import { getPersona } from '../data/personas';
import type { Persona } from '../data/personas';

interface EffectivePersonaResult {
  type: 'preset' | 'custom' | null;
  personaId?: string;
  persona?: Persona;
  instruction?: string;
}

/**
 * Build a prompt with persona instructions
 * @param modelId - The model to build the prompt for
 * @param userQuery - The user's query/prompt
 * @returns Object containing system prompt (if any) and user query
 */
export function buildPromptWithPersona(modelId: string, userQuery: string): {
  system: string | null;
  user: string;
} {
  const store = usePersonaStore();
  const effectivePersona = store.getEffectivePersona(modelId);
  
  let systemPrompt: string | null = null;
  
  if (effectivePersona?.type === 'preset' && effectivePersona.persona) {
    systemPrompt = effectivePersona.persona.instruction;
  } else if (effectivePersona?.type === 'custom' && effectivePersona.instruction) {
    systemPrompt = effectivePersona.instruction;
  }
  
  return {
    system: systemPrompt,
    user: userQuery,
  };
}

/**
 * Get the effective persona for a model (global override or model-specific)
 */
export function getEffectivePersonaForModel(modelId: string): Persona | null {
  const store = usePersonaStore();
  const effective = store.getEffectivePersona(modelId);
  
  if (effective?.type === 'preset' && effective.persona) {
    return effective.persona;
  }
  
  return null;
}

/**
 * Build an API request payload with persona context
 */
export function buildAPIRequest(
  modelId: string,
  userQuery: string,
  options: {
    includeSystemPrompt?: boolean;
    additionalContext?: Record<string, unknown>;
  } = {}
): {
  system: string | null;
  user: string;
  persona?: {
    id: string;
    name: string;
    type: 'preset' | 'custom';
  };
  metadata: {
    modelId: string;
    hasPersona: boolean;
    timestamp: string;
  };
} {
  const { system, user } = buildPromptWithPersona(modelId, userQuery);
  const store = usePersonaStore();
  const effectivePersona = store.getEffectivePersona(modelId);
  
  const result: {
    system: string | null;
    user: string;
    persona?: {
      id: string;
      name: string;
      type: 'preset' | 'custom';
    };
    metadata: {
      modelId: string;
      hasPersona: boolean;
      timestamp: string;
    };
  } = {
    system: options.includeSystemPrompt ? system : null,
    user,
    metadata: {
      modelId,
      hasPersona: !!effectivePersona,
      timestamp: new Date().toISOString(),
    },
  };
  
  if (effectivePersona) {
    if (effectivePersona.type === 'preset' && effectivePersona.persona) {
      result.persona = {
        id: effectivePersona.personaId || 'unknown',
        name: effectivePersona.persona.name,
        type: 'preset',
      };
    } else {
      result.persona = {
        id: 'custom',
        name: 'Custom Persona',
        type: 'custom',
      };
    }
  }
  
  return result;
}

export default {
  buildPromptWithPersona,
  getEffectivePersonaForModel,
  buildAPIRequest,
};
