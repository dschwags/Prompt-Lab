// src/data/synthesisStrategies.js

export const SYNTHESIS_MODES = {
  consensus: {
    id: 'consensus',
    name: 'Consensus',
    icon: '🤝',
    description: 'Find common ground and areas of agreement across all perspectives',
    
    bestFor: [
      'Collaborative teams with similar goals',
      'Building alignment on a direction',
      'When you need unified recommendations',
    ],
    
    worstFor: [
      'Highly controversial decisions',
      'When you need to explore trade-offs',
      'Conflicting requirements',
    ],
    
    promptTemplate: `You are synthesizing multiple AI perspectives into a consensus view.

TASK: Identify common themes and agreements across these responses.

RESPONSES:
{responses}

SYNTHESIS INSTRUCTIONS:
1. Identify points where all/most perspectives agree
2. Highlight the strongest shared recommendations
3. Note any unanimous concerns or cautions
4. Downplay minor disagreements unless critical
5. Present a unified path forward

FORMAT:
## Key Agreements
[List main points of consensus]

## Recommended Action
[Unified recommendation based on consensus]

## Minor Variations
[Note any small differences, but don't emphasize]`,
  },

  contrast: {
    id: 'contrast',
    name: 'Contrast & Compare',
    icon: '⚖️',
    description: 'Highlight differences between perspectives to aid decision-making',
    
    bestFor: [
      'Decision-making between options',
      'Understanding trade-offs',
      'When perspectives are complementary',
    ],
    
    worstFor: [
      'When you need quick agreement',
      'Low-stakes decisions',
      'Time-sensitive situations',
    ],
    
    promptTemplate: `You are synthesizing multiple AI perspectives by contrasting their viewpoints.

TASK: Clearly compare and contrast these different perspectives.

RESPONSES:
{responses}

SYNTHESIS INSTRUCTIONS:
1. Identify key differences in approach or recommendation
2. Present trade-offs clearly (pros/cons of each view)
3. Explain WHY perspectives differ (different priorities/assumptions)
4. Help user understand which view fits which scenario
5. Don't force agreement - preserve nuance

FORMAT:
## Key Differences
[Main points of divergence]

## Perspective A: {persona1}
**Recommends:** [summary]
**Rationale:** [why]
**Best if:** [when this makes sense]

## Perspective B: {persona2}
**Recommends:** [summary]
**Rationale:** [why]
**Best if:** [when this makes sense]

## Decision Framework
[Guidance on choosing between perspectives]`,
  },

  debate: {
    id: 'debate',
    name: 'Debate',
    icon: '⚔️',
    description: 'Let perspectives argue and refine through dialectic process',
    
    bestFor: [
      'Critical decisions with high stakes',
      'When personas explicitly conflict',
      'Stress-testing arguments',
    ],
    
    worstFor: [
      'Routine decisions',
      'When consensus exists',
      'Low-conflict situations',
    ],
    
    promptTemplate: `You are moderating a debate between different AI perspectives.

TASK: Facilitate constructive argument to refine thinking.

RESPONSES:
{responses}

SYNTHESIS INSTRUCTIONS:
1. Present each perspective's strongest argument
2. Show how each perspective challenges the others
3. Identify points of genuine disagreement
4. Refine arguments through back-and-forth
5. Conclude with which argument is most compelling and why

FORMAT:
## Opening Positions
[Each perspective's initial stance]

## Key Points of Contention
[What they fundamentally disagree about]

## Rebuttals
**{persona1} challenges {persona2}:**
[Counterargument]

**{persona2} responds:**
[Defense and counter]

## Synthesis
[After debate, what emerges as the stronger position and why]`,
  },

  merge: {
    id: 'merge',
    name: 'Comprehensive Merge',
    icon: '🔄',
    description: 'Combine all insights into a holistic, multi-faceted recommendation',
    
    bestFor: [
      'Complex decisions with many factors',
      'When perspectives are complementary',
      'Comprehensive reviews',
    ],
    
    worstFor: [
      'Simple yes/no decisions',
      'When clarity is more important than completeness',
      'Time-sensitive situations',
    ],
    
    promptTemplate: `You are creating a comprehensive synthesis from multiple expert perspectives.

TASK: Merge all valuable insights into a complete picture.

RESPONSES:
{responses}

SYNTHESIS INSTRUCTIONS:
1. Extract unique value from each perspective
2. Organize by topic/concern, not by persona
3. Show how different viewpoints complement each other
4. Create a holistic recommendation that incorporates all angles
5. Note which perspective is most relevant for each aspect

FORMAT:
## Executive Summary
[High-level integrated recommendation]

## Detailed Analysis
### [Topic 1]
- {persona1} perspective: [insight]
- {persona2} perspective: [insight]
- **Integrated view:** [how they combine]

### [Topic 2]
[Same structure]

## Action Plan
[Step-by-step incorporating all perspectives]

## Considerations by Expertise
- **Technical ({engineer}):** [key points]
- **User Experience ({ux_designer}):** [key points]
- **Business ({product_manager}):** [key points]`,
  },

  rapid: {
    id: 'rapid',
    name: 'Rapid Summary',
    icon: '⚡',
    description: 'Quick, actionable summary for urgent decisions',
    
    bestFor: [
      'Urgent situations',
      'When you need fast answers',
      'Crisis response',
    ],
    
    worstFor: [
      'Complex strategic decisions',
      'When nuance is important',
      'Long-term planning',
    ],
    
    promptTemplate: `You are creating a RAPID synthesis for an urgent decision.

TASK: Provide immediate actionable guidance.

RESPONSES:
{responses}

SYNTHESIS INSTRUCTIONS:
1. Lead with the answer (what to do)
2. Keep it brief - max 3 paragraphs
3. Focus on action, not analysis
4. Note only critical risks
5. Skip nuance - give clear direction

FORMAT:
## Immediate Action
[What to do right now]

## Critical Risks
[Only show-stoppers]

## Quick Wins
[Fast, low-risk improvements]`,
  },
}

export function getSynthesisMode(id) {
  return SYNTHESIS_MODES[id] || SYNTHESIS_MODES.consensus
}

export function getAllSynthesisModes() {
  return Object.values(SYNTHESIS_MODES)
}

export function suggestSynthesisMode(config) {
  const {
    personas = [],
    urgency = 'medium',
    queryTypes = [],
    complexity = 'medium',
  } = config
  
  if (urgency === 'high') {
    return {
      modeId: 'rapid',
      reason: 'High urgency requires fast, actionable guidance',
      confidence: 0.9,
    }
  }
  
  const hasConflicts = personas.some((p1, i) => 
    personas.slice(i + 1).some(p2 => {
      const persona1 = PERSONA_PRESETS[p1]
      const persona2 = PERSONA_PRESETS[p2]
      return persona1?.conflicts?.includes(p2) || persona2?.conflicts?.includes(p1)
    })
  )
  
  if (hasConflicts) {
    return {
      modeId: 'debate',
      reason: 'Conflicting personas benefit from structured debate',
      confidence: 0.85,
    }
  }
  
  if (queryTypes.includes('decision')) {
    return {
      modeId: 'contrast',
      reason: 'Decision queries need clear comparison of options',
      confidence: 0.8,
    }
  }
  
  if (complexity === 'complex' || personas.length >= 4) {
    return {
      modeId: 'merge',
      reason: 'Complex analysis benefits from comprehensive integration',
      confidence: 0.75,
    }
  }
  
  return {
    modeId: 'consensus',
    reason: 'Standard collaborative synthesis',
    confidence: 0.6,
  }
}

export function buildSynthesisPrompt(mode, responses, metadata = {}) {
  const synthesisMode = getSynthesisMode(mode)
  let prompt = synthesisMode.promptTemplate
  
  const formattedResponses = responses.map((r, i) => 
    `### Response ${i + 1}: ${r.personaName} (${r.modelName})
${r.response}

---`
  ).join('\n\n')
  
  prompt = prompt.replace('{responses}', formattedResponses)
  
  responses.forEach((r, i) => {
    const regex = new RegExp(`\\{persona${i + 1}\\}`, 'g')
    prompt = prompt.replace(regex, r.personaName)
  })
  
  if (metadata.originalQuery) {
    prompt = `ORIGINAL QUERY: ${metadata.originalQuery}\n\n${prompt}`
  }
  
  return prompt
}
