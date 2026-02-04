🧠 CRITICAL CONTEXT PROTOCOL (Auto-Loader)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TRIGGER:** New Thread / New Task

When starting a NEW thread or NEW task, first assume context from:
• 02-clacky-build-briefing.md (Architecture & Build Steps)
• 04-project-outline.md (Current State & Checklist)
• src/types/index.ts (Data Models)

Do not ask me to provide these. Read them immediately if you lack context for the current task.

---

## 1. Visual Cue System

Use these symbols in ALL responses:

❓ **QUESTION**: Must be answered before coding proceeds
   • Ambiguity in requirements
   • Missing information
   • Architectural decisions that need confirmation

⚠️ **WARNING**: Highlights cost risks or technical limitations
   • Estimated effort is HIGH (Major operation)
   • Actual effort exceeded estimate (Self-Diagnostic)
   • Technical constraints or limitations
   • Potential breaking changes

✅ **SUCCESS**: Confirms completion
   • Step completed successfully
   • Tests passing
   • Deployment successful

---

## 2. Checkpoint Documentation Protocol

After completing each step or task, provide a checkpoint summary before moving to the next.

**For major milestones:** Use full format below.
**For minor fixes:** Simple bulleted summary is acceptable.

✅ CHECKPOINT: [Step Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 SOURCE PROMPT: [First 50 chars or version identifier if from Prompt Lab]

📁 CHANGES FROM PREVIOUS
   • [file added] — [purpose]
   ~ [file modified] — [what changed]
   • [file deleted] — [why removed]
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

Provide checkpoint summary:
   • After each numbered step completes successfully
   • Before committing via Git Agent
   • When user asks "what changed?" or "what's the status?"

---

## 3. Failure & Rollback Documentation Protocol

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

---

## 4. Thread-to-Prompt Lab Linking Protocol

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

---

## 5. Prompt Lab Project-Specific Rules

### Architecture Constraints
This is a CLIENT-SIDE ONLY application:
   • ❌ Do NOT install MySQL, PostgreSQL, Redis, MongoDB, or any database service
   • ❌ Do NOT create backend API routes or server files
   • ❌ Do NOT create a server
   • ❌ Do NOT use Next.js API routes or SSR
   • ✅ ALL data persistence uses IndexedDB (via `idb` library)
   • ✅ API calls go directly from browser to external APIs (Claude, OpenAI, Gemini)

### Stack (Explicit)
   • React 18+ with TypeScript
   • Vite (NOT Next.js)
   • IndexedDB via `idb` library
   • Tailwind CSS for styling
   • No backend, no server, no SSR

### Implementation Order
Follow the implementation order exactly. Do not:
   • Skip steps
   • Combine multiple steps
   • Add features not in the current step
   • Refactor working code without approval

### Before Each Step
❓ QUESTION: Confirm understanding of:
1. What files will be created/modified
2. What the success criteria is

### After Each Step
Provide checkpoint summary before proceeding to next step.

---

## 6. Complexity/Credit Warning Protocol

**TRIGGER:** Task involves significant changes

Request approval before:
   • Major refactoring
   • Multiple file changes
   • Adding new dependencies
   • Features outside current scope

### Format:
⚠️ **COMPLEXITY WARNING**

Estimated Effort: **HIGH / MEDIUM / LOW**

What will be done: [Brief description]
Files affected: [List]

Would you like me to proceed? (yes/no)

### After Completing:
Report actual effort:
   📊 EFFORT REPORT
   Estimated: [High/Med/Low]
   Actual: [High/Med/Low]
   Notes: [Any discrepancies]

---

## 7. A/B/C Choice Protocol

**TRIGGER:** Irreversible or MAJOR decisions only

When encountering a decision that:
   • Cannot be easily undone
   • Affects core architecture
   • Changes data flow
   • Impacts multiple components

Do NOT use for:
   • CSS tweaks
   • Simple formatting
   • Minor styling choices

### Format:
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

Do NOT proceed with implementation until choice is confirmed.

---

## 8. F12 Debug Protocol

**EXCEPTION:** If user already provided error text/screenshot, skip this protocol.

When UI bugs are reported and MORE information is needed:

1. 📸 Screenshot of the issue
2. 🔴 Console errors (F12 → Console tab, copy/paste)
3. 🌐 Network tab errors if API-related (F12 → Network tab)
4. 📋 Steps to reproduce:
   ◦ What did you click?
   ◦ What did you expect?
   ◦ What happened instead?

### Format Request As:
❓ QUESTION: Need more info to debug.

Please provide if available:
   • [ ] Screenshot
   • [ ] Console errors (F12 → Console)
   • [ ] Network errors (F12 → Network)
   • [ ] Steps to reproduce

If these are already provided, proceed with fix.
