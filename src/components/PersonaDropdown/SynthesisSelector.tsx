// src/components/PersonaDropdown/SynthesisSelector.tsx

import { usePersonaStore } from '../../state/personaStore';
import { SYNTHESIS_MODES, getSynthesisMode } from '../../data/synthesisStrategies';

interface SynthesisSelectorProps {
  className?: string;
}

export function SynthesisSelector({ className = '' }: SynthesisSelectorProps) {
  const { synthesisMode, setSynthesisMode } = usePersonaStore();
  
  const modes = Object.values(SYNTHESIS_MODES);
  
  return (
    <div className={`synthesis-selector ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-zinc-200">
          Synthesis Mode
        </h4>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSynthesisMode(mode.id)}
            className={`flex flex-col items-start p-3 rounded-lg border transition-colors ${
              synthesisMode === mode.id
                ? 'bg-purple-900/30 border-purple-600'
                : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{mode.icon}</span>
              <span className={`text-sm font-medium ${
                synthesisMode === mode.id ? 'text-purple-300' : 'text-zinc-300'
              }`}>
                {mode.name}
              </span>
            </div>
            <p className="text-xs text-zinc-500 line-clamp-2">
              {mode.description}
            </p>
          </button>
        ))}
      </div>
      
      {/* Selected mode details */}
      {synthesisMode && (
        <div className="mt-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
          <p className="text-xs text-zinc-400">
            <strong className="text-zinc-300">Best for:</strong>{' '}
            {getSynthesisMode(synthesisMode).bestFor.slice(0, 2).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default SynthesisSelector;
