# Prompt Lab - Round 2/3 Discussion Feature

## Overview

**Current State:** 
- Round 1: Two models respond to same prompt ✅ Working
- Synthesis: Analyze responses and generate recommendations ✅ Working

**What to Build:**
- Round 2: Models react to each other's responses
- Round 3+: User interjects with follow-up questions, models respond
- Conversation flows into existing Synthesis

---

## Before You Start

❓ **QUESTIONS (answer before implementing):**

1. **Where is conversation state currently managed?**
   - Is there a context/hook for the comparison responses?
   - Where do the Round 1 responses live (state variable name)?

2. **How does Synthesis currently receive the responses?**
   - Does it read from state?
   - Does it get passed as props?
   - What format does it expect?

3. **What's the current component structure?**
   - Is comparison mode in PromptEditor.tsx or separate component?
   - Where would Round 2/3 UI logically live?

4. **Is there a message/conversation history structure already?**
   - Or are responses stored as single strings?

5. **Model recommendation:**
   - Is this task better suited for Premium (Sonnet) or Lite (Haiku)?
   - Complex state management suggests Premium, but confirm based on codebase complexity.

**Please read the codebase and answer these questions before implementing.**

---

## Feature Requirements

### Round 2: "Discuss" Button

**Trigger:** User clicks "Discuss" after Round 1 responses are displayed

**What Happens:**

Each model receives a new prompt containing:
```
Original prompt from user:
"""
[user's original system + user prompt]
"""

Your previous response:
"""
[this model's Round 1 response]
"""

The other model's response:
"""
[other model's Round 1 response]
"""

Instructions:
Review the other model's response and provide your reaction:
1. What did they get right that you might have missed?
2. What did they miss or get wrong?
3. What would you add or change based on seeing their approach?
4. How would you combine the best of both responses?

Be specific and constructive.
```

**Output:** Two new responses displayed below Round 1 (labeled "Round 2" or "Discussion")

---

### Round 3+: User Follow-up

**Trigger:** User types in a follow-up input field and clicks "Send"

**What Happens:**

Each model receives:
```
[Full conversation history so far]

User's follow-up question:
"""
[user's new input]
"""

Respond to the user's follow-up, taking into account:
- Your previous responses
- The other model's responses
- Any points of agreement or disagreement that emerged
```

**Output:** Two new responses (Round 3)

**Repeat:** User can continue adding rounds until satisfied

---

### Conversation History Structure

```typescript
interface ConversationRound {
  roundNumber: number;
  type: 'initial' | 'discussion' | 'followup';
  userInput?: string;  // For followup rounds
  responses: {
    left: {
      model: string;
      content: string;
      metrics: ResponseMetrics;
    };
    right: {
      model: string;
      content: string;
      metrics: ResponseMetrics;
    };
  };
  timestamp: number;
}

interface WorkshopConversation {
  id: string;
  systemPrompt: string;
  initialUserPrompt: string;
  rounds: ConversationRound[];
  leftModel: string;
  rightModel: string;
}
```

---

### UI Changes

**After Round 1 responses, add:**

```
┌─────────────────────────────────────────────────────────────┐
│  [🔄 Discuss] ← Models react to each other                  │
└─────────────────────────────────────────────────────────────┘
```

**After Round 2 (or any round), add:**

```
┌─────────────────────────────────────────────────────────────┐
│  Your follow-up (optional):                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [Send Follow-up]  [✨ Generate Prompt] [🗑️ Start Over]    │
└─────────────────────────────────────────────────────────────┘
```

**Round Labels:**

```
Round 1: Initial Responses
├── Gemini response
└── GPT-4o response

Round 2: Discussion
├── Gemini reacts to GPT-4o
└── GPT-4o reacts to Gemini

Round 3: Follow-up - "What about cheating?"
├── Gemini responds
└── GPT-4o responds
```

---

### Integration with Existing Synthesis

When user clicks "Generate Prompt" (or existing Analyze button):

Synthesis model receives the FULL conversation:
```
Workshop conversation for prompt generation:

Original request:
System: [system prompt]
User: [user prompt]

Round 1 - Initial Responses:
Model A (Gemini): [response]
Model B (GPT-4o): [response]

Round 2 - Discussion:
Model A reacted: [response]
Model B reacted: [response]

Round 3 - User asked: "What about cheating?"
Model A: [response]
Model B: [response]

Based on this entire workshop conversation, generate a production-ready 
system prompt that incorporates the best insights from both models and 
addresses all the considerations discussed.

Output the final prompt in a code block, ready to copy.
```

---

## Files to Create/Modify

```
LIKELY MODIFY:
- src/components/PromptEditor/PromptEditor.tsx (or comparison component)
  - Add Discuss button
  - Add follow-up input
  - Add round labels/display

LIKELY CREATE:
- src/hooks/useWorkshopConversation.ts
  - Manage conversation rounds
  - Build prompts for each round
  - Track history

- src/types/Workshop.ts (or add to index.ts)
  - ConversationRound interface
  - WorkshopConversation interface

LIKELY MODIFY:
- Synthesis component/function
  - Accept full conversation history
  - Updated prompt template
```

---

## Implementation Order

1. **Add ConversationRound types**
2. **Create useWorkshopConversation hook**
   - Store rounds in state
   - Function: addDiscussionRound()
   - Function: addFollowupRound(userInput)
   - Function: getFullHistory()
3. **Add "Discuss" button to UI**
   - Appears after Round 1 completes
   - Calls addDiscussionRound()
   - Displays Round 2 responses
4. **Add follow-up input to UI**
   - Appears after Round 2+
   - Calls addFollowupRound()
   - Displays new round
5. **Update Synthesis to use full history**
   - Pass getFullHistory() to synthesis
   - Update synthesis prompt template

---

## Success Criteria

- [ ] Round 1 works as before (no regression)
- [ ] "Discuss" button appears after Round 1 completes
- [ ] Clicking "Discuss" sends both models the cross-reaction prompt
- [ ] Round 2 responses display with clear labeling
- [ ] Follow-up input appears after Round 2
- [ ] User can type follow-up and send
- [ ] Round 3+ responses display
- [ ] User can do multiple follow-up rounds
- [ ] "Generate Prompt" / Synthesis uses full conversation history
- [ ] "Start Over" clears conversation and returns to Round 1 input

---

## Edge Cases to Handle

- [ ] User clicks "Discuss" while Round 2 is loading (disable button)
- [ ] API error during Round 2 or 3 (show error, allow retry)
- [ ] Very long conversations (scroll behavior, maybe collapse old rounds)
- [ ] User wants to change models mid-conversation (probably disallow, or warn)
- [ ] Empty follow-up input (disable Send button)

---

## Prompts for Each Round Type

### Round 2: Discussion Prompt Template

```typescript
const buildDiscussionPrompt = (
  originalSystem: string,
  originalUser: string,
  thisModelResponse: string,
  otherModelResponse: string,
  otherModelName: string
): string => {
  return `Original request from user:
${originalSystem ? `System context: ${originalSystem}\n` : ''}
User prompt: ${originalUser}

Your previous response:
"""
${thisModelResponse}
"""

${otherModelName}'s response to the same prompt:
"""
${otherModelResponse}
"""

Please react to ${otherModelName}'s response:
1. What did they get right that you might have missed?
2. What did they miss or get wrong?
3. What would you add or change based on seeing their approach?
4. How might you combine the best elements of both responses?

Be specific and constructive in your analysis.`;
};
```

### Round 3+: Follow-up Prompt Template

```typescript
const buildFollowupPrompt = (
  conversationHistory: string,
  userFollowup: string
): string => {
  return `${conversationHistory}

The user has a follow-up question:
"""
${userFollowup}
"""

Respond to this follow-up, taking into account:
- The original request
- Your previous responses
- The other model's perspectives
- Any points of agreement or disagreement

Provide a helpful, specific response.`;
};
```

### Synthesis Prompt Template (Updated)

```typescript
const buildSynthesisPrompt = (
  fullConversation: string
): string => {
  return `You are a prompt engineering expert. Based on the following workshop conversation between AI models and a user, generate a production-ready system prompt.

${fullConversation}

Your task:
1. Identify the key insights from both models
2. Incorporate the user's specific concerns and requirements
3. Create a clear, effective system prompt that addresses everything discussed

Output the final system prompt in a code block, ready for production use.

Also provide:
- A brief summary of what the prompt does
- Key guardrails/rules included
- Suggested test queries to validate it works`;
};
```

---

## Questions for You (Clacky)

Before implementing, please answer:

1. What is the current component structure for Comparison Mode?
2. Where is response state managed?
3. How does Synthesis currently receive responses?
4. Is there existing conversation/history infrastructure to build on?
5. Premium or Lite model recommendation for this task?

**Read the codebase, answer questions, then propose implementation plan.**
