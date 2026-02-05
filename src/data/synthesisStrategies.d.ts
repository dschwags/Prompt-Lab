// src/data/synthesisStrategies.d.ts

export interface SynthesisMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  bestFor: string[];
  worstFor: string[];
  promptTemplate: string;
}

export const SYNTHESIS_MODES: {
  consensus: SynthesisMode;
  contrast: SynthesisMode;
  debate: SynthesisMode;
  merge: SynthesisMode;
  rapid: SynthesisMode;
};

export function getSynthesisMode(id: string): SynthesisMode;

export function getAllSynthesisModes(): SynthesisMode[];
