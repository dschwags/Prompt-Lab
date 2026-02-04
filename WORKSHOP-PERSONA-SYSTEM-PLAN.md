# Persona System Implementation Plan

**Date:** February 3, 2026  
**Project:** Workshop - Multi-Model Persona System  
**Status:** Ready for Development

---

## Overview

This document provides a complete implementation plan for adding a flexible persona system to Workshop, enabling users to assign unique personas to each AI model for diverse perspective generation.

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSONA SYSTEM                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Persona Configuration UI                            │  │
│  │  - Global persona field (optional)                  │  │
│  │  - Per-model persona dropdowns                      │  │
│  │  - Custom persona input option                      │  │
│  │  - Preset library                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  State Management                                  │  │
│  │  {                                                 │  │
│  │    globalPersona: null | string,                   │  │
│  │    models: [{ id, name, persona, customPersona }]   │  │
│  │  }                                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Prompt Builder                                    │  │
│  │  - Merge persona with user query                   │  │
│  │  - Apply global + per-model priorities             │  │
│  │  - Format for API                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Global Persona
- Single persona that applies to ALL models
- Can be overridden per-model
- Optional (can be disabled)

### 2. Per-Model Personas
- Each model can have its own persona
- Can use preset or custom
- Can fall back to global

### 3. Same Model, Different Personas
- Multiple instances of same AI model
- Each with different persona
- Maximum perspective diversity

### 4. Preset Library
- Common personas (Creative, Analyst, Skeptic, etc.)
- Easy to select
- Custom option available

### 5. Custom Personas
- User-defined instructions
- Saved per-model
- Reusable across sessions

---

## Use Cases

### Use Case 1: Same Model, Different Personas
```
Claude (Creative):     "Think boldly, innovatively..."
Claude (Skeptic):     "What could go wrong?"
Claude (Socratic):    "What do you mean by...?"

Result: Same model, completely different perspectives
```

### Use Case 2: Different Models, Same Persona
```
Claude (Analyst):  "Consider data and metrics..."
GPT-4 (Analyst):   "What do the numbers tell us?"
Gemini (Analyst):  "Systematically analyzing evidence..."

Result: Compare how different AIs approach same role
```

### Use Case 3: Mix and Match
```
Claude (Creative):  "Bold ideas!"
GPT-4 (Skeptic):  "Risk assessment..."
Gemini (Devil's):  "I disagree!"

Result: Maximum perspective diversity
```

---

## Data Structures

### Persona Presets Library

```javascript
// src/data/personas.js

export const PERSONA_PRESETS = {
  none: {
    id: 'none',
    name: 'None',
    description: 'No persona instruction',
    instruction: '',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Think boldly and innovatively',
    instruction: 'You are a creative genius who thinks outside the box. Generate bold, innovative ideas that challenge assumptions. Focus on possibilities and novel approaches.',
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    description: 'Data-driven and systematic',
    instruction: 'You are a data-driven analyst. Focus on metrics, evidence, and systematic reasoning. Consider constraints, trade-offs, and practical implications.',
  },
  skeptic: {
    id: 'skeptic',
    name: 'Skeptic',
    description: 'Question everything',
    instruction: 'You are a critical skeptic. Question assumptions, find flaws, and identify risks. Challenge the validity of claims and highlight potential problems.',
  },
  devil_advocate: {
    id: 'devil_advocate',
    name: "Devil's Advocate",
    description: 'Argue against every point',
    instruction: 'You are a devil\'s advocate. Argue against every idea and perspective presented. Find counterexamples and alternative viewpoints. Stress-test all proposals.',
  },
  socratic: {
    id: 'socratic',
    name: 'Socratic',
    description: 'Ask probing questions',
    instruction: 'You are a Socratic questioner. Respond with probing questions that encourage deeper thinking. Challenge assumptions through inquiry rather than statements.',
  },
  optimist: {
    id: 'optimist',
    name: 'Optimist',
    description: 'Focus on opportunities',
    instruction: 'You are an eternal optimist. Focus on possibilities, opportunities, and positive outcomes. Emphasize what can go right and how to maximize success.',
  },
  pragmatist: {
    id: 'pragmatist',
    name: 'Pragmatist',
    description: 'Realistic and practical',
    instruction: 'You are a pragmatic realist. Focus on what is achievable given real-world constraints. Consider budget, timeline, and resource limitations.',
  },
  historian: {
    id: 'historian',
    name: 'Historian',
    description: 'Learn from the past',
    instruction: 'You are a historian who draws parallels to historical events and patterns. Consider lessons from history and how past experiences inform current situations.',
  },
  futurist: {
    id: 'futurist',
    name: 'Futurist',
    description: 'Long-term implications',
    instruction: 'You are a futurist who thinks in long time horizons. Consider the implications of decisions over years and decades. Anticipate future developments and trends.',
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    description: 'Technical feasibility',
    instruction: 'You are a systems engineer. Focus on technical feasibility, implementation details, and practical constraints. Break down complex problems into components.',
  },
  artist: {
    id: 'artist',
    name: 'Artist',
    description: 'Aesthetic perspective',
    instruction: 'You are an artist who values beauty, elegance, and aesthetics. Consider the emotional and visual impact of ideas. Emphasize creativity and expression.',
  },
  lawyer: {
    id: 'lawyer',
    name: 'Lawyer',
    description: 'Legal implications',
    instruction: 'You are a lawyer who considers legal implications and precedents. Think about liability, compliance, and regulatory concerns. Structure arguments logically.',
  },
}

// Helper function to get preset by ID
export function getPersonaPreset(id) {
  return PERSONA_PRESETS[id] || PERSONA_PRESETS.none
}

// Helper to get all presets as array
export function getAllPersonas() {
  return Object.values(PERSONA_PRESETS)
}
```

---

## Component State Structure

```javascript
// src/state/personaState.js

const initialPersonaState = {
  // Global persona applies to all models
  globalPersona: null, // null | 'creative' | 'analyst' | etc.
  globalCustomPersona: null, // string if custom
  
  // Per-model personas override global
  models: [
    {
      id: 'claude',
      name: 'Claude 3.5',
      persona: null, // null = use global
      customPersona: null, // string if custom selected
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      persona: null,
      customPersona: null,
    },
    {
      id: 'gemini',
      name: 'Gemini Pro',
      persona: null,
      customPersona: null,
    },
  ],
  
  // UI state
  expandedModel: null, // which model's dropdown is open
  customModalOpen: false, // is custom persona modal visible
  customModalModel: null, // which model is being edited
}
```

---

## Export Data Structure

```javascript
// When exporting session

{
  sessionId: 'abc123',
  timestamp: '2026-02-03T17:00:00Z',
  
  personaConfig: {
    globalPersona: 'analyst',
    models: [
      {
        id: 'claude',
        name: 'Claude 3.5',
        persona: 'creative',
        customPersona: null,
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        persona: null, // using global
        customPersona: null,
      },
    ],
  },
  
  query: 'Design a marketing campaign',
  
  // ... responses and synthesis
}
```

---

## Implementation Tasks

### Task 1: Create Persona Presets Library
- Create `src/data/personas.js`
- Define preset personas
- Export helper functions

### Task 2: Create State Management
- Create `src/state/personaStore.js`
- Implement Zustand store
- Define actions (setGlobalPersona, updateModelPersona, etc.)

### Task 3: Create PersonaDropdown Component
- Dropdown with presets + custom option
- Handle selection
- Emit change events

### Task 4: Create GlobalPersonaSection
- Display global persona config
- Connect to store
- Show selected persona

### Task 5: Create ModelPersonaItem
- Per-model persona config
- Override indicator
- Connect to store

### Task 6: Create CustomPersonaModal
- Modal for custom input
- Preview functionality
- Save/Cancel actions

### Task 7: Create PersonaActions
- Quick action buttons
- Set all to same persona
- Clear/Reset options

### Task 8: Create Main Configuration Panel
- Compose all components
- Handle layout
- Connect to store

### Task 9: Create Prompt Builder
- Merge persona with query
- Handle priorities
- Format for API

### Task 10: Testing
- Unit tests for state
- Component tests
- Integration tests

---

## Effort Estimate

| Task | Difficulty | Time |
|------|------------|------|
| Persona Presets Library | ⭐ | 1 hour |
| State Management | ⭐⭐ | 2 hours |
| PersonaDropdown | ⭐ | 1 hour |
| GlobalPersonaSection | ⭐ | 1 hour |
| ModelPersonaItem | ⭐⭐ | 2 hours |
| CustomPersonaModal | ⭐⭐ | 2 hours |
| PersonaActions | ⭐ | 1 hour |
| Configuration Panel | ⭐⭐ | 2 hours |
| Prompt Builder | ⭐⭐ | 2 hours |
| Testing | ⭐⭐ | 4 hours |
| **TOTAL** | | **~2 days** |

---

## Dependencies

- React
- Zustand (state management)
- Tailwind CSS (styling)

---

## Next Steps

1. Create `src/data/personas.js`
2. Create `src/state/personaStore.js`
3. Create component files
4. Integrate with Workshop main component
5. Test persona functionality

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2026  
**Status:** Ready for Implementation
