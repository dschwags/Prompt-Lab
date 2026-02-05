// src/utils/costEstimator.js

import { getModelPricing, estimateTokens, calculateCost } from '../data/modelPricing.js'
import { getPersona } from '../data/personas.js'

export function estimateModelCost(modelId, personaId, userQuery, expectedResponseTokens = 1500) {
  const pricing = getModelPricing(modelId)
  const persona = getPersona(personaId)
  
  const personaTokens = estimateTokens(persona.instruction)
  const queryTokens = estimateTokens(userQuery)
  const totalInputTokens = personaTokens + queryTokens
  
  const result = calculateCost(modelId, totalInputTokens, expectedResponseTokens)
  
  return {
    modelId,
    modelName: pricing.name,
    personaId,
    personaName: persona.name,
    tokens: {
      personaInstruction: personaTokens,
      userQuery: queryTokens,
      totalInput: totalInputTokens,
      expectedOutput: expectedResponseTokens,
    },
    cost: result,
  }
}

export function estimateWorkshopCost(models, userQuery, config = {}) {
  const {
    expectedResponseTokens = 1500,
    includeSynthesis = true,
    synthesisTokens = 2000,
    synthesisModel = 'claude-sonnet-4',
  } = config
  
  const modelEstimates = models.map(model => 
    estimateModelCost(
      model.id,
      model.persona || 'analyst',
      userQuery,
      expectedResponseTokens
    )
  )
  
  let synthesisEstimate = null
  if (includeSynthesis) {
    const allResponses = models.map(m => 'A'.repeat(expectedResponseTokens)).join('\n\n')
    const synthesisInput = `${userQuery}\n\n${allResponses}`
    
    synthesisEstimate = {
      modelId: synthesisModel,
      modelName: getModelPricing(synthesisModel).name,
      cost: calculateCost(
        synthesisModel,
        estimateTokens(synthesisInput),
        synthesisTokens
      ),
    }
  }
  
  const modelTotal = modelEstimates.reduce((sum, est) => sum + est.cost.totalCost, 0)
  const synthesisTotal = synthesisEstimate ? synthesisEstimate.cost.totalCost : 0
  const grandTotal = modelTotal + synthesisTotal
  
  return {
    models: modelEstimates,
    synthesis: synthesisEstimate,
    totals: {
      models: modelTotal,
      synthesis: synthesisTotal,
      total: grandTotal,
    },
    breakdown: {
      cheapest: findCheapest(modelEstimates),
      mostExpensive: findMostExpensive(modelEstimates),
      averageCost: modelTotal / modelEstimates.length,
    },
  }
}

function findCheapest(estimates) {
  return estimates.reduce((min, est) => 
    est.cost.totalCost < min.cost.totalCost ? est : min
  )
}

function findMostExpensive(estimates) {
  return estimates.reduce((max, est) => 
    est.cost.totalCost > max.cost.totalCost ? est : max
  )
}

export function checkCostThreshold(estimatedCost, userThreshold = 0.50) {
  const exceeds = estimatedCost > userThreshold
  
  return {
    exceedsThreshold: exceeds,
    threshold: userThreshold,
    actual: estimatedCost,
    difference: estimatedCost - userThreshold,
    message: exceeds
      ? `Estimated cost ($${estimatedCost.toFixed(3)}) exceeds your threshold ($${userThreshold.toFixed(2)})`
      : `Estimated cost ($${estimatedCost.toFixed(3)}) is within budget`,
  }
}

export function suggestCostOptimizations(estimates) {
  const suggestions = []
  
  const expensive = estimates.models.filter(m => 
    getModelPricing(m.modelId).outputPer1M > 10
  )
  
  if (expensive.length > 0) {
    suggestions.push({
      type: 'model_swap',
      severity: 'medium',
      message: `Consider using cheaper models for ${expensive.map(e => e.personaName).join(', ')}`,
      potentialSavings: expensive.reduce((sum, e) => {
        const current = e.cost.totalCost
        const cheaper = calculateCost('claude-haiku-4', e.tokens.totalInput, e.tokens.expectedOutput).totalCost
        return sum + (current - cheaper)
      }, 0),
    })
  }
  
  const personaCounts = {}
  estimates.models.forEach(m => {
    personaCounts[m.personaId] = (personaCounts[m.personaId] || 0) + 1
  })
  
  const duplicates = Object.entries(personaCounts).filter(([_, count]) => count > 1)
  if (duplicates.length > 0) {
    suggestions.push({
      type: 'duplicate_persona',
      severity: 'low',
      message: `You have duplicate personas: ${duplicates.map(([p]) => getPersona(p).name).join(', ')}`,
      potentialSavings: 0,
    })
  }
  
  if (estimates.synthesis && estimates.synthesis.cost.totalCost > estimates.totals.models * 0.3) {
    suggestions.push({
      type: 'synthesis_cost',
      severity: 'low',
      message: 'Synthesis cost is significant. Consider using a cheaper model for synthesis.',
      potentialSavings: estimates.synthesis.cost.totalCost * 0.5,
    })
  }
  
  return suggestions
}

export function formatCost(cost) {
  if (cost < 0.001) {
    return '<$0.001'
  }
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`
  }
  if (cost < 1) {
    return `$${cost.toFixed(3)}`
  }
  return `$${cost.toFixed(2)}`
}

export function costByPersona(sessionResults) {
  const personaCosts = {}
  
  sessionResults.forEach(result => {
    const persona = result.personaId
    if (!personaCosts[persona]) {
      personaCosts[persona] = {
        personaId: persona,
        personaName: getPersona(persona).name,
        totalCost: 0,
        count: 0,
        avgCost: 0,
      }
    }
    
    personaCosts[persona].totalCost += result.cost
    personaCosts[persona].count += 1
  })
  
  Object.values(personaCosts).forEach(p => {
    p.avgCost = p.totalCost / p.count
  })
  
  return Object.values(personaCosts).sort((a, b) => b.totalCost - a.totalCost)
}
