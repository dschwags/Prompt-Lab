// src/components/PersonaDropdown/ModelPersonaItem.tsx

import { useState } from 'react';
import { usePersonaStore } from '../../state/personaStore';
import { PERSONA_PRESETS } from '../../data/personas';
import { PersonaDropdown } from './PersonaDropdown';
import { CustomPersonaModal } from './CustomPersonaModal';

interface ModelPersonaItemProps {
  modelId: string;
  modelName: string;
  className?: string;
}

export function ModelPersonaItem({
  modelId,
  modelName,
  className = '',
}: ModelPersonaItemProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const {
    models,
    setModelPersona,
    setModelCustomPersona,
    clearModelPersona,
    getEffectivePersona,
  } = usePersonaStore();

  const model = models.find((m) => m.id === modelId);
  const effectivePersona = getEffectivePersona(modelId);
  const currentPersonaId = model?.persona || null;
  const currentCustomPersona = model?.customPersona || null;

  const handlePersonaChange = (personaId: string | null) => {
    if (personaId === '__custom__') {
      setShowCustomModal(true);
      return;
    }
    setModelPersona(modelId, personaId);
  };

  const handleCustomSave = (instruction: string, name: string) => {
    setModelCustomPersona(modelId, instruction);
  };

  const handleClear = () => {
    clearModelPersona(modelId);
  };

  return (
    <div className={`model-persona-item ${className}`}>
      <PersonaDropdown
        value={currentPersonaId}
        onChange={handlePersonaChange}
        label={modelName}
        placeholder="No persona"
        showCustomOption={true}
      />
      
      {/* Show current persona indicator */}
      {(currentPersonaId || currentCustomPersona) && (
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center gap-2">
            {currentPersonaId && PERSONA_PRESETS[currentPersonaId as keyof typeof PERSONA_PRESETS] && (
              <span className="text-sm">
                {PERSONA_PRESETS[currentPersonaId as keyof typeof PERSONA_PRESETS].icon}{' '}
                {PERSONA_PRESETS[currentPersonaId as keyof typeof PERSONA_PRESETS].name}
              </span>
            )}
            {currentCustomPersona && (
              <span className="text-sm text-purple-400">
                ✏️ Custom
              </span>
            )}
          </div>
          <button
            onClick={handleClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
      
      {/* Custom persona modal */}
      <CustomPersonaModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleCustomSave}
        modelName={modelName}
      />
    </div>
  );
}

export default ModelPersonaItem;
