// src/components/PersonaDropdown/GlobalPersonaSection.tsx

import { usePersonaStore } from '../../state/personaStore';
import { PersonaDropdown } from './PersonaDropdown';

interface GlobalPersonaSectionProps {
  className?: string;
}

export function GlobalPersonaSection({ className = '' }: GlobalPersonaSectionProps) {
  const {
    globalPersona,
    setGlobalPersona,
    clearGlobalPersona,
  } = usePersonaStore();

  return (
    <div className={`global-persona-section ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-zinc-200">
          Global Persona
        </label>
        {globalPersona && (
          <button
            onClick={clearGlobalPersona}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Clear global
          </button>
        )}
      </div>
      <PersonaDropdown
        value={globalPersona}
        onChange={setGlobalPersona}
        placeholder="No global persona (per-model default)"
        label=""
      />
      <p className="mt-1 text-xs text-zinc-500">
        Applies to all models without their own persona
      </p>
    </div>
  );
}

export default GlobalPersonaSection;
