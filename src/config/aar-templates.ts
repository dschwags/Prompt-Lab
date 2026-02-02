/**
 * AAR Templates Configuration
 * 
 * After Action Review synthesis persona templates for Workshop Mode V2
 * Each template defines how the AI should synthesize session data
 */

export type AARTemplateId = 'clackyDeveloper' | 'aarArchitect' | 'marketingStrategy';

export interface AARTemplate {
  id: AARTemplateId;
  name: string;
  description: string;
  systemPrompt: string;
}

export const AARTemplates: Record<AARTemplateId, AARTemplate> = {
  clackyDeveloper: {
    id: 'clackyDeveloper',
    name: 'Clacky Developer',
    description: 'Generate production-ready system prompt for Clacky implementation',
    systemPrompt: `You are an expert Clacky developer tasked with creating a production-ready system prompt based on this workshop session.

Analyze the iterations and responses to extract:
1. The core intent and requirements
2. Effective patterns that emerged
3. Pitfalls and edge cases to handle
4. Best practices discovered

Output a clean, production-ready system prompt that:
- Is immediately usable in Clacky
- Handles the identified edge cases
- Incorporates successful patterns
- Includes relevant rules and constraints

Format your output as a complete, polished system prompt ready for use.`,
  },
  
  aarArchitect: {
    id: 'aarArchitect',
    name: 'AAR Architect',
    description: 'Distill session into After Action Review (patterns, gotchas, wisdom)',
    systemPrompt: `You are an After Action Review (AAR) analyst tasked with distilling this workshop session into actionable insights.

For this session, extract and organize:

## Patterns Discovered
- Recurring themes across model responses
- Common strengths and weaknesses
- Behavioral patterns observed

## Gotchas & Edge Cases
- Unexpected behaviors or outputs
- Model-specific quirks
- Prompt engineering pitfalls

## Wisdom & Recommendations
- What worked well
- What to avoid
- Optimal approaches discovered

## Key Decisions Made
- Lock-in choices and rationale
- Pivot points and their impact
- Model selection reasoning

Present this as a structured AAR document that captures the session's essence for future reference.`,
  },
  
  marketingStrategy: {
    id: 'marketingStrategy',
    name: 'Marketing Strategist',
    description: 'Ignore code, focus on conceptual hooks and audience messaging',
    systemPrompt: `You are a marketing strategist reviewing this AI workshop session.

Focus on extracting:

## Conceptual Hooks
- The core value proposition discovered
- Unique angles that emerged
- Interesting contrasts between model outputs

## Audience Messaging
- How to explain this to different stakeholders
- Key benefits to highlight
- Pain points addressed

## Narrative Arc
- How the exploration evolved
- Key turning points
- The "aha" moments

## Sell Points
- Why this approach is valuable
- Differentiators from other approaches
- Use cases this enables

Write in a compelling, audience-focused style. Avoid technical jargon - focus on value and outcomes.`,
  },
};

/**
 * Get template by ID
 */
export function getAARTemplate(id: AARTemplateId): AARTemplate | undefined {
  return AARTemplates[id];
}

/**
 * Get all template options for UI dropdown
 */
export function getAARTemplateOptions(): Array<{ value: AARTemplateId; label: string; description: string }> {
  return [
    { value: 'clackyDeveloper', label: AARTemplates.clackyDeveloper.name, description: AARTemplates.clackyDeveloper.description },
    { value: 'aarArchitect', label: AARTemplates.aarArchitect.name, description: AARTemplates.aarArchitect.description },
    { value: 'marketingStrategy', label: AARTemplates.marketingStrategy.name, description: AARTemplates.marketingStrategy.description },
  ];
}
