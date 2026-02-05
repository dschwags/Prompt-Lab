// quick-start-test.js
// Run this to verify everything is wired up correctly
// Usage: node quick-start-test.js

import { PERSONA_PRESETS } from './personas.js'
import { INDUSTRY_TEMPLATES } from './industryTemplates.js'
import { MODEL_PRICING } from './modelPricing.js'
import { estimateWorkshopCost } from './costEstimator.js'
import { analyzeQuery } from './queryAnalyzer.js'

console.log('🧪 JUREE Persona System - Quick Start Test')
console.log('==========================================\n')

// Test 1: Personas loaded
console.log('✅ Test 1: Personas')
const personaCount = Object.keys(PERSONA_PRESETS).length
console.log(`   Loaded ${personaCount} personas`)
console.log(`   Sample: ${PERSONA_PRESETS.creative.icon} ${PERSONA_PRESETS.creative.name}`)
console.log(`   Categories: ${Object.keys(PERSONA_PRESETS).map(k => PERSONA_PRESETS[k].category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}\n`)

if (personaCount !== 16) {
  console.error('❌ ERROR: Expected 16 personas, got', personaCount)
  process.exit(1)
}

// Test 2: Templates loaded
console.log('✅ Test 2: Templates')
const templateCount = Object.keys(INDUSTRY_TEMPLATES).length
console.log(`   Loaded ${templateCount} templates`)
console.log(`   Sample: ${INDUSTRY_TEMPLATES.software_architecture.icon} ${INDUSTRY_TEMPLATES.software_architecture.name}`)
console.log(`   Categories: ${Object.keys(INDUSTRY_TEMPLATES).map(k => INDUSTRY_TEMPLATES[k].category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}\n`)

if (templateCount !== 10) {
  console.error('❌ ERROR: Expected 10 templates, got', templateCount)
  process.exit(1)
}

// Test 3: Model pricing loaded
console.log('✅ Test 3: Model Pricing')
const modelCount = Object.keys(MODEL_PRICING).length
console.log(`   Loaded ${modelCount} model pricing entries`)
console.log(`   Sample: ${MODEL_PRICING['claude-sonnet-4'].name} - $${MODEL_PRICING['claude-sonnet-4'].outputPer1M}/1M output tokens\n`)

if (modelCount < 10) {
  console.error('❌ ERROR: Expected at least 10 models, got', modelCount)
  process.exit(1)
}

// Test 4: Cost estimation
console.log('✅ Test 4: Cost Estimation')
const testQuery = "Design a secure authentication system for our mobile app"
const testModels = [
  { id: 'claude-sonnet-4', persona: 'engineer' },
  { id: 'gpt-4o', persona: 'security_expert' },
  { id: 'deepseek-chat', persona: 'analyst' },
]

try {
  const costEstimate = estimateWorkshopCost(testModels, testQuery)
  console.log(`   Query: "${testQuery.slice(0, 50)}..."`)
  console.log(`   Models: ${testModels.length}`)
  console.log(`   Estimated total cost: $${costEstimate.totals.total.toFixed(3)}`)
  console.log(`   Breakdown:`)
  costEstimate.models.forEach(m => {
    console.log(`     - ${m.personaName} (${m.modelName}): $${m.cost.totalCost.toFixed(3)}`)
  })
  console.log()
  
  if (costEstimate.totals.total === 0) {
    console.error('❌ ERROR: Cost estimation returned $0')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ ERROR in cost estimation:', error.message)
  process.exit(1)
}

// Test 5: Query analysis
console.log('✅ Test 5: Query Analysis')
try {
  const analysis = analyzeQuery(testQuery)
  console.log(`   Detected types: ${analysis.queryTypes.join(', ')}`)
  console.log(`   Suggested personas:`)
  analysis.suggestedPersonas.slice(0, 3).forEach(p => {
    console.log(`     - ${p.persona.icon} ${p.persona.name} (score: ${p.score})`)
  })
  console.log(`   Confidence: ${Math.round(analysis.confidence * 100)}%`)
  console.log(`   Urgency: ${analysis.urgency}`)
  console.log(`   Complexity: ${analysis.complexity}\n`)
  
  if (analysis.queryTypes.length === 0) {
    console.error('❌ ERROR: Query analysis detected no types')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ ERROR in query analysis:', error.message)
  process.exit(1)
}

// Test 6: Persona pairing validation
console.log('✅ Test 6: Persona Pairing')
const creativePairings = PERSONA_PRESETS.creative.pairsWellWith || []
console.log(`   Creative pairs well with: ${creativePairings.join(', ')}`)
const skepticConflicts = PERSONA_PRESETS.skeptic.conflicts || []
console.log(`   Skeptic conflicts with: ${skepticConflicts.join(', ')}\n`)

// Summary
console.log('🎉 All tests passed! System is operational.\n')
console.log('📋 Summary:')
console.log(`   ✅ ${personaCount} personas loaded`)
console.log(`   ✅ ${templateCount} templates ready`)
console.log(`   ✅ ${modelCount} models priced`)
console.log(`   ✅ Cost estimation working`)
console.log(`   ✅ Query analysis functional`)
console.log(`   ✅ Persona pairing logic active\n`)
console.log('🚀 Ready to implement! See IMPLEMENTATION_PLAN.md for next steps.\n')
