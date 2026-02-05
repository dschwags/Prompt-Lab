// src/utils/sessionExport.js

import { getPersona } from '../data/personas'
import { getSynthesisMode } from '../data/synthesisStrategies'

export function createSessionExport(session) {
  const {
    sessionId,
    query,
    personaConfig,
    results,
    synthesis,
    winner,
    starred,
    userFeedback,
  } = session
  
  return {
    sessionId,
    timestamp: new Date().toISOString(),
    version: '2.0',
    
    query: {
      text: query,
      length: query.length,
      wordCount: query.split(/\s+/).length,
    },
    
    personaConfig: {
      globalPersona: personaConfig.globalPersona,
      globalCustomPersona: personaConfig.globalCustomPersona,
      activeTemplate: personaConfig.activeTemplate,
      synthesisMode: personaConfig.synthesisMode,
      models: personaConfig.models.map(m => ({
        modelId: m.id,
        modelName: m.name,
        personaId: m.persona,
        customPersona: m.customPersona,
      })),
    },
    
    results: results.map((result, index) => ({
      modelId: result.modelId,
      modelName: result.modelName,
      personaId: result.personaId,
      personaName: result.personaName,
      customPersona: result.customPersona,
      response: result.response,
      
      metrics: {
        responseTime: result.responseTime,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.inputTokens + result.outputTokens,
        cost: result.cost,
        wasViewed: result.wasViewed !== false,
        wasWinner: result.modelId === winner,
        wasStarred: starred?.includes(result.modelId) || false,
        userRating: result.userRating || null,
      },
      
      position: index,
    })),
    
    synthesis: synthesis ? {
      mode: synthesis.mode,
      modeName: getSynthesisMode(synthesis.mode).name,
      modelId: synthesis.modelId,
      modelName: synthesis.modelName,
      response: synthesis.response,
      responseTime: synthesis.responseTime,
      cost: synthesis.cost,
    } : null,
    
    insights: generateSessionInsights(results, winner, starred),
    
    classification: session.queryAnalysis || null,
    
    userFeedback: {
      comment: userFeedback?.comment || null,
      helpful: userFeedback?.helpful || null,
      wouldUseAgain: userFeedback?.wouldUseAgain || null,
    },
    
    totals: {
      models: results.length,
      totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0) + (synthesis?.cost || 0),
      totalTime: results.reduce((sum, r) => sum + (r.responseTime || 0), 0) + (synthesis?.responseTime || 0),
      totalTokens: results.reduce((sum, r) => sum + (r.inputTokens + r.outputTokens || 0), 0),
    },
  }
}

function generateSessionInsights(results, winner, starred) {
  if (!results || results.length === 0) {
    return null
  }
  
  const fastest = results.reduce((min, r) => 
    r.responseTime < min.responseTime ? r : min
  )
  
  const cheapest = results.reduce((min, r) => 
    r.cost < min.cost ? r : min
  )
  
  let mostHelpful = null
  if (winner) {
    mostHelpful = results.find(r => r.modelId === winner)
  } else if (starred && starred.length > 0) {
    const personaCounts = {}
    results.forEach(r => {
      if (starred.includes(r.modelId)) {
        personaCounts[r.personaId] = (personaCounts[r.personaId] || 0) + 1
      }
    })
    const topPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0]
    if (topPersona) {
      mostHelpful = results.find(r => r.personaId === topPersona[0])
    }
  }
  
  return {
    fastestModel: {
      modelId: fastest.modelId,
      modelName: fastest.modelName,
      personaId: fastest.personaId,
      personaName: fastest.personaName,
      time: fastest.responseTime,
    },
    
    cheapestModel: {
      modelId: cheapest.modelId,
      modelName: cheapest.modelName,
      personaId: cheapest.personaId,
      personaName: cheapest.personaName,
      cost: cheapest.cost,
    },
    
    mostHelpfulPersona: mostHelpful ? {
      modelId: mostHelpful.modelId,
      modelName: mostHelpful.modelName,
      personaId: mostHelpful.personaId,
      personaName: mostHelpful.personaName,
    } : null,
    
    diversityScore: calculateDiversityScore(results),
  }
}

function calculateDiversityScore(results) {
  const uniquePersonas = new Set(results.map(r => r.personaId).filter(Boolean))
  const uniqueCategories = new Set(
    Array.from(uniquePersonas)
      .map(id => getPersona(id)?.category)
      .filter(Boolean)
  )
  
  return uniqueCategories.size / 4
}

export function exportSessionToJSON(session) {
  const exportData = createSessionExport(session)
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  })
  
  const filename = `juree-session-${session.sessionId}-${Date.now()}.json`
  
  return {
    blob,
    filename,
    data: exportData,
  }
}

export function exportMultipleSessions(sessions) {
  const exportData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    sessionCount: sessions.length,
    sessions: sessions.map(createSessionExport),
    aggregateInsights: generateAggregateInsights(sessions),
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  })
  
  const filename = `juree-sessions-${sessions.length}-${Date.now()}.json`
  
  return {
    blob,
    filename,
    data: exportData,
  }
}

function generateAggregateInsights(sessions) {
  const allResults = sessions.flatMap(s => s.results || [])
  
  if (allResults.length === 0) {
    return null
  }
  
  const personaStats = {}
  allResults.forEach(r => {
    if (!r.personaId) return
    
    if (!personaStats[r.personaId]) {
      personaStats[r.personaId] = {
        personaId: r.personaId,
        personaName: r.personaName,
        usageCount: 0,
        totalCost: 0,
        totalTime: 0,
        winCount: 0,
        starCount: 0,
      }
    }
    
    const stats = personaStats[r.personaId]
    stats.usageCount++
    stats.totalCost += r.cost || 0
    stats.totalTime += r.responseTime || 0
    if (r.metrics?.wasWinner) stats.winCount++
    if (r.metrics?.wasStarred) stats.starCount++
  })
  
  Object.values(personaStats).forEach(stats => {
    stats.avgCost = stats.totalCost / stats.usageCount
    stats.avgTime = stats.totalTime / stats.usageCount
    stats.winRate = stats.winCount / stats.usageCount
    stats.starRate = stats.starCount / stats.usageCount
  })
  
  const rankedByWinRate = Object.values(personaStats)
    .sort((a, b) => b.winRate - a.winRate)
  
  const rankedByCost = Object.values(personaStats)
    .sort((a, b) => a.avgCost - b.avgCost)
  
  return {
    totalSessions: sessions.length,
    totalResults: allResults.length,
    personaStats: Object.values(personaStats),
    topPerformers: rankedByWinRate.slice(0, 5),
    mostCostEffective: rankedByCost.slice(0, 5),
  }
}
