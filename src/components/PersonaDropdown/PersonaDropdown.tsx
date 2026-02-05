// src/components/PersonaDropdown/PersonaDropdown.tsx

import { useMemo } from 'react';
import { PERSONA_PRESETS, PERSONA_CATEGORIES, type Persona } from '../../data/personas';

interface PersonaDropdownProps {
  value: string | null;
  onChange: (personaId: string | null) => void;
  label?: string;
  placeholder?: string;
  showCustomOption?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  [PERSONA_CATEGORIES.THINKING]: 'Thinking Styles',
  [PERSONA_CATEGORIES.CRITIQUE]: 'Critique Roles',
  [PERSONA_CATEGORIES.EXPERTISE]: 'Expertise Roles',
  [PERSONA_CATEGORIES.PERSPECTIVE]: 'Perspective Roles',
};

const CATEGORY_ICONS: Record<string, string> = {
  [PERSONA_CATEGORIES.THINKING]: '💭',
  [PERSONA_CATEGORIES.CRITIQUE]: '🔍',
  [PERSONA_CATEGORIES.EXPERTISE]: '🎯',
  [PERSONA_CATEGORIES.PERSPECTIVE]: '🌐',
};

export function PersonaDropdown({
  value,
  onChange,
  label = 'Persona',
  placeholder = 'No persona (default behavior)',
  showCustomOption = true,
  className = '',
}: PersonaDropdownProps) {
  const personasByCategory = useMemo(() => {
    const grouped: Record<string, Persona[]> = {};
    
    Object.values(PERSONA_PRESETS).forEach((persona) => {
      if (!grouped[persona.category]) {
        grouped[persona.category] = [];
      }
      grouped[persona.category].push(persona);
    });
    
    return grouped;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange(null);
    } else if (selectedValue === '__custom__') {
      // Custom persona will be handled by parent component
      onChange('__custom__');
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div className={`persona-dropdown ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-zinc-200 mb-1">
          {label}
        </label>
      )}
      <select
        value={value || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        
        {Object.entries(personasByCategory).map(([category, personas]) => (
          <optgroup key={category} label={`${CATEGORY_ICONS[category]} ${CATEGORY_LABELS[category]}`}>
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.icon} {persona.name}
              </option>
            ))}
          </optgroup>
        ))}
        
        {showCustomOption && (
          <option value="__custom__">✏️ Custom persona...</option>
        )}
      </select>
      
      {/* Persona description preview */}
      {value && value !== '__custom__' && PERSONA_PRESETS[value as keyof typeof PERSONA_PRESETS] && (
        <div className="mt-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
          <p className="text-xs text-zinc-400 mb-1">
            {PERSONA_PRESETS[value as keyof typeof PERSONA_PRESETS].description}
          </p>
        </div>
      )}
    </div>
  );
}

export default PersonaDropdown;
