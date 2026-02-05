// src/state/personaStore.js
// Note: Requires zustand - install with: npm install zustand

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPersona, validatePersonaCombination } from '../data/personas'
import { getTemplate, applyTemplate } from '../data/industryTemplates'

export const usePersonaStore = create(
  persist(
    (set, get) => ({
      globalPersona: null,
      globalCustomPersona: null,
      models: [],
      activeTemplate: null,
      synthesisMode: 'consensus',
      
      preferences: {
        defaultSynthesisMode: 'consensus',
        costThreshold: 0.50,
        autoApplyTemplates: true,
        showCostWarnings: true,
      },
      
      setGlobalPersona: (personaId) => {
        set({ globalPersona: personaId, globalCustomPersona: null })
      },
      
      setGlobalCustomPersona: (customPersona) => {
        set({ globalCustomPersona, globalPersona: null })
      },
      
      clearGlobalPersona: () => {
        set({ globalPersona: null, globalCustomPersona: null })
      },
      
      setModelPersona: (modelId, personaId) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? { ...m, persona: personaId, customPersona: null }
              : m
          ),
        }))
      },
      
      setModelCustomPersona: (modelId, customPersona) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? { ...m, customPersona, persona: null }
              : m
          ),
        }))
      },
      
      clearModelPersona: (modelId) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? { ...m, persona: null, customPersona: null }
              : m
          ),
        }))
      },
      
      addModel: (model) => {
        set((state) => ({
          models: [...state.models, {
            id: model.id,
            name: model.name,
            persona: null,
            customPersona: null,
          }],
        }))
      },
      
      removeModel: (modelId) => {
        set((state) => ({
          models: state.models.filter((m) => m.id !== modelId),
        }))
      },
      
      setSynthesisMode: (mode) => {
        set({ synthesisMode: mode })
      },
      
      applyIndustryTemplate: (templateId, availableModels) => {
        const config = applyTemplate(templateId, availableModels)
        if (config) {
          set({
            models: config.models,
            globalPersona: config.globalPersona,
            synthesisMode: config.synthesisMode,
            activeTemplate: templateId,
          })
        }
      },
      
      clearTemplate: () => {
        set({ activeTemplate: null })
      },
      
      getEffectivePersona: (modelId) => {
        const state = get()
        const model = state.models.find((m) => m.id === modelId)
        
        if (!model) return null
        
        if (model.customPersona) {
          return {
            type: 'custom',
            instruction: model.customPersona,
          }
        }
        
        if (model.persona) {
          return {
            type: 'preset',
            personaId: model.persona,
            persona: getPersona(model.persona),
          }
        }
        
        if (state.globalCustomPersona) {
          return {
            type: 'custom',
            instruction: state.globalCustomPersona,
          }
        }
        
        if (state.globalPersona) {
          return {
            type: 'preset',
            personaId: state.globalPersona,
            persona: getPersona(state.globalPersona),
          }
        }
        
        return null
      },
      
      getActivePersonas: () => {
        const state = get()
        const personas = []
        
        state.models.forEach((model) => {
          const effective = get().getEffectivePersona(model.id)
          if (effective && effective.type === 'preset') {
            personas.push(effective.personaId)
          }
        })
        
        return [...new Set(personas)]
      },
      
      validateConfiguration: () => {
        const state = get()
        const activePersonas = get().getActivePersonas()
        
        const personaValidation = validatePersonaCombination(activePersonas)
        
        const hasModels = state.models.length > 0
        const hasPersonas = activePersonas.length > 0 || state.globalPersona || state.globalCustomPersona
        
        return {
          valid: hasModels && personaValidation.valid,
          hasModels,
          hasPersonas,
          personaValidation,
        }
      },
      
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }))
      },
      
      reset: () => {
        set({
          globalPersona: null,
          globalCustomPersona: null,
          models: [],
          activeTemplate: null,
          synthesisMode: 'consensus',
        })
      },
    }),
    {
      name: 'persona-configuration',
      partialUpdate: true,
    }
  )
)
