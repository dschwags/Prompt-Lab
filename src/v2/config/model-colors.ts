/**
 * Color system for model lineage tracking
 */
export const MODEL_COLORS = {
  blue: {
    hex: '#3B82F6',
    name: 'Indigo Blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  yellow: {
    hex: '#FBBF24',
    name: 'Amber Yellow',
    gradient: 'from-yellow-400 to-yellow-500'
  },
  cyan: {
    hex: '#06B6D4',
    name: 'Cyan',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  emerald: {
    hex: '#10B981',
    name: 'Emerald',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  purple: {
    hex: '#8B5CF6',
    name: 'Purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  orange: {
    hex: '#F97316',
    name: 'Orange',
    gradient: 'from-orange-500 to-orange-600'
  }
} as const;

export type ModelColorKey = keyof typeof MODEL_COLORS;

const COLOR_KEYS: ModelColorKey[] = ['blue', 'yellow', 'cyan', 'emerald', 'purple', 'orange'];

/**
 * Assign a color to a model
 */
export function assignModelColor(
  modelId: string,
  existingAssignments: Record<string, string>
): string {
  // If already assigned, return existing color
  if (existingAssignments[modelId]) {
    return existingAssignments[modelId];
  }

  // Find first available color
  const usedColors = Object.values(existingAssignments);
  const availableColor = COLOR_KEYS.find(color => !usedColors.includes(color));

  return availableColor || 'blue'; // Fallback to blue if all colors used
}

/**
 * Get synthesis border style
 */
export function getSynthesisBorderStyle(modelColors: string[]): string {
  if (modelColors.length === 0) {
    return `8px solid ${MODEL_COLORS.purple.hex}`;
  }

  if (modelColors.length === 1) {
    const colorKey = modelColors[0] as ModelColorKey;
    return `8px solid ${MODEL_COLORS[colorKey]?.hex || MODEL_COLORS.blue.hex}`;
  }

  if (modelColors.length === 3) {
    // Use third color for 3-model synthesis
    const color3Key = modelColors[2] as ModelColorKey;
    return `8px solid ${MODEL_COLORS[color3Key]?.hex || MODEL_COLORS.emerald.hex}`;
  }

  // 4+ models: purple multi-source indicator
  return `8px solid ${MODEL_COLORS.purple.hex}`;
}

/**
 * Get gradient CSS for 2-model synthesis
 */
export function getTwoModelGradient(color1: string, color2: string): string {
  const c1 = (MODEL_COLORS as any)[color1]?.hex || MODEL_COLORS.blue.hex;
  const c2 = (MODEL_COLORS as any)[color2]?.hex || MODEL_COLORS.yellow.hex;

  return `linear-gradient(to bottom, ${c1} 0%, ${c1} 50%, ${c2} 50%, ${c2} 100%)`;
}

/**
 * Get color hex from color key
 */
export function getColorHex(colorKey: string): string {
  return (MODEL_COLORS as any)[colorKey]?.hex || MODEL_COLORS.blue.hex;
}
