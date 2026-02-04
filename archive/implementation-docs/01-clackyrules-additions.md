# Clackyrules Additions for Prompt Lab Build

**IMPORTANT:** Start by reading `01A-clackyrules-auto-loader.md` - this contains the CRITICAL CONTEXT PROTOCOL that must be applied BEFORE answering any request.

Add these rules to your existing .clackyrules file before starting the build.

---

## 1. Visual Cue System (If Not Already Present)

```
## Visual Cue Requirements

Use these symbols in ALL responses:

❓ QUESTION: Must be answered before coding proceeds
   - Ambiguity in requirements
   - Missing information
   - Architectural decisions that need confirmation

⚠️ WARNING: Highlights cost risks or technical limitations
   - Operations estimated over 50 credits
   - Technical constraints or limitations
   - Potential breaking changes

✅ SUCCESS: Confirms completion
   - Step completed successfully
   - Tests passing
   - Deployment successful
```

---

## 2. Checkpoint Documentation Protocol

```
## Checkpoint Documentation Protocol

After completing each step or task, before moving to the next, provide a checkpoint summary:

✅ CHECKPOINT: [Step Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 SOURCE PROMPT: [First 50 chars or version identifier if from Prompt Lab]

📁 CHANGES FROM PREVIOUS
   + [file added] — [purpose]
   ~ [file modified] — [what changed]
   - [file deleted] — [why removed]
   📦 [dependency added/removed]

✅ ACHIEVEMENTS
   • [Capability now working]
   • [Test passing]
   • [Problem solved]

⚠️ GOTCHAS
   • [Workarounds applied]
   • [Things that took multiple attempts]
   • [Unexpected behaviors encountered]

💡 LEARNINGS (for future prompts)
   • [What should be specified next time]
   • [Prompt improvements discovered]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide this checkpoint summary:
- After each numbered step completes successfully
- Before committing via Git Agent
- When user asks "what changed?" or "what's the status?"
```

---

## 3. Failure & Rollback Documentation Protocol

```
## Failure & Rollback Documentation Protocol

When a checkpoint fails or rollback is needed:

### Before Rolling Back

❌ FAILURE: [Checkpoint Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 WHAT BROKE
   • [Specific thing that stopped working]
   • [Error messages or symptoms]

🤔 SUSPECTED CAUSE
   • [What change likely caused this]
   • [File(s) involved]

📎 SOURCE PROMPT: [Prompt that led to this failure]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### After Rolling Back

⏪ ROLLED BACK TO: [Checkpoint Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ DISCARDED CHECKPOINTS
   • [Checkpoint name] — [why it failed]

💡 PROMPT DEFICIENCIES (what should have been specified)
   • "[Exact text that was missing from prompt]"
   • "[Another missing instruction]"

🛡️ SUGGESTED RULES (to prevent recurrence)
   • "[Rule to add to Clackyrules]"

📋 FOR PROMPT LAB RETRY
   Add these instructions before retrying:
   • [Instruction 1]
   • [Instruction 2]

❓ QUESTION: Ready to create improved prompt version?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4. Thread-to-Prompt Lab Linking Protocol

```
## Thread-to-Prompt Lab Linking Protocol

When working from a prompt developed in Prompt Lab:

### On Execution Start
Note the source:
   📎 EXECUTING PROMPT: [Version identifier or first 50 chars]

### On Success
Format for Prompt Lab feedback:
   ✅ ACHIEVEMENTS (copy to Prompt Lab)
   • [What now works]
   
   📊 OUTCOME: ✅ SUCCESS
   
   💡 PROMPT WORKED WELL BECAUSE:
   • [What made this prompt effective]

### On Failure
Format for Prompt Lab improvement:
   ⚠️ GOTCHAS (copy to Prompt Lab)
   • [What the prompt should have specified]
   
   📊 OUTCOME: ❌ FAILED
   
   💡 PROMPT IMPROVEMENT NEEDED:
   • "[Exact text to add to future prompts]"
   
   ❓ QUESTION: Add this to Clacky rules? [Suggested rule text]

### On Partial Success
   📊 OUTCOME: ⚠️ PARTIAL
   
   ✅ WHAT WORKED:
   • [Successful parts]
   
   ⚠️ WHAT NEEDS FIXING:
   • [Parts that failed]
   • [Manual intervention required]
```

---

## 5. Prompt Lab Project-Specific Rules

```
## Prompt Lab Build Rules

### Architecture Constraints
This is a CLIENT-SIDE ONLY application:
- ❌ Do NOT install MySQL, PostgreSQL, Redis, MongoDB, or any database service
- ❌ Do NOT create backend API routes or server files
- ❌ Do NOT create a server
- ❌ Do NOT use Next.js API routes or SSR
- ✅ ALL data persistence uses IndexedDB (via `idb` library)
- ✅ API calls go directly from browser to external APIs (Claude, OpenAI, Gemini)

### Stack (Explicit)
- React 18+ with TypeScript
- Vite (NOT Next.js)
- IndexedDB via `idb` library
- Tailwind CSS for styling
- No backend, no server, no SSR

### Implementation Order
Follow the 13-step implementation order exactly. Do not:
- Skip steps
- Combine multiple steps
- Add features not in the current step
- Refactor working code without approval

### Before Each Step
❓ QUESTION: Confirm understanding of:
1. What files will be created/modified
2. What the success criteria is
3. Estimated credits for this step

### After Each Step
Provide checkpoint summary before proceeding to next step.
```

---

## 6. A/B/C Protocol Triggers (Enhanced)

```
## A/B/C Choice Protocol

When encountering ambiguity, present options before proceeding:

### Trigger Situations
- UI layout decisions
- Styling approach choices
- State management scaling
- Error handling patterns
- Any "it depends" situation

### Format
❓ QUESTION: [Decision needed]

   A) [Option A description]
      Pro: [benefit]
      Con: [drawback]
   
   B) [Option B description]
      Pro: [benefit]
      Con: [drawback]
   
   C) [Option C description]
      Pro: [benefit]
      Con: [drawback]

   Recommendation: [Your suggestion and why]
   
   Which approach do you prefer?

### Do NOT proceed with implementation until choice is confirmed.
```

---

## 7. F12 Protocol (Enhanced)

```
## F12 Debug Protocol

When UI bugs are reported, request before attempting fix:

1. 📸 Screenshot of the issue
2. 🔴 Console errors (F12 → Console tab, copy/paste)
3. 🌐 Network tab errors if API-related (F12 → Network tab)
4. 📋 Steps to reproduce:
   - What did you click?
   - What did you expect?
   - What happened instead?

### Format Request As:
❓ QUESTION: Need debug info before fixing.

Please provide:
- [ ] Screenshot
- [ ] Console errors (F12 → Console)
- [ ] Network errors if applicable (F12 → Network)
- [ ] Steps to reproduce

### Do NOT guess at fixes without this information.
```

---

## 8. Credit Checkpoint Protocol

```
## Credit Checkpoint Protocol

### Request Approval Before:
- Any step estimated over 50 credits
- Adding dependencies not in the original spec
- Refactoring existing working code
- Building features not in the 13 steps
- Multiple file changes that could be broken into smaller commits

### Format:
⚠️ WARNING: Credit checkpoint

Estimated cost: [X] credits
What will be done: [Description]
Files affected: [List]

Approve to proceed? (yes/no)

### After High-Cost Operations:
Report actual vs estimated:
   📊 CREDIT REPORT
   Estimated: [X] credits
   Actual: [Y] credits
   Variance: [+/- Z]
```

---

## Summary Checklist

Before starting Prompt Lab build, confirm these rules are in .clackyrules:

- [ ] Visual Cue System (❓⚠️✅)
- [ ] Checkpoint Documentation Protocol
- [ ] Failure & Rollback Documentation Protocol
- [ ] Thread-to-Prompt Lab Linking Protocol
- [ ] Prompt Lab Project-Specific Rules (client-side only, stack)
- [ ] A/B/C Choice Protocol
- [ ] F12 Debug Protocol
- [ ] Credit Checkpoint Protocol
