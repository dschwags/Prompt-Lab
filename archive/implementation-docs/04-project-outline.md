# Prompt Lab - Project Outline & Quick Reference

## Executive Summary

**What:** A client-side React application for developing, testing, and validating prompts before implementation in Clacky or other AI tools.

**Why:** Better prompt validation upfront = fewer failed builds, less credit waste, more confidence tackling ambitious projects.

**How:** Test prompts against multiple AI models, track versions, validate against rules, learn from failures.

---

## Core Value Propositions

| Problem | Solution |
|---------|----------|
| "Will this prompt even work?" | Test before committing credits |
| "Why did v2 work but v3 broke everything?" | Version history with diff view |
| "Clacky keeps ignoring my rules" | Pre-flight validation against rules |
| "I keep making the same mistakes" | Gotcha-to-rule feedback loop |
| "I lost my good prompts" | Persistent storage with backup |

---

## Feature Summary (v1)

### Must Have
- [x] Prompt editor with system/user split
- [x] Claude API integration (Haiku, Sonnet, Opus)
- [x] Real-time token counting and cost estimates
- [x] Version history with diff view
- [x] Response caching (per prompt hash + model)
- [x] Clacky rules management (CRUD)
- [x] Rules validation (AI-powered)
- [x] One-click "Add to Rules" from validation gaps
- [x] Tags/notes system
- [x] Export (copy or .md file)
- [x] Backup/restore
- [x] Session cost tracking

### v1.1 (After Claude works)
- [ ] OpenAI integration (dynamic model list)
- [ ] Side-by-side comparison view

### v1.2
- [ ] Gemini integration
- [ ] Three-column comparison
- [ ] Synthesis AI ("Analyze" button)

### v2+
- [ ] Clacky execution logging
- [ ] Automatic gotcha-to-rule pipeline
- [ ] Browser extension wrapper

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PROMPT LAB                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 UI COMPONENTS                        │    │
│  │  PromptEditor │ ResponseViewer │ Settings │ Export  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              REACT CONTEXT + HOOKS                   │    │
│  │         PromptContext │ SettingsContext              │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  SERVICES                            │    │
│  │  api │ cache │ db │ rules │ cost │ export │ settings│    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 INDEXEDDB                            │    │
│  │  prompts │ versions │ responses │ rules │ tags      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │     EXTERNAL APIs       │
              │  Claude │ OpenAI │ Gemini│
              └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | React 18 + TypeScript | Industry standard, good DX |
| Build | Vite | Fast, simple, no SSR complexity |
| Database | IndexedDB (via `idb`) | Client-side, persistent, large storage |
| API Keys | localStorage | Simple, survives refresh |
| Styling | Tailwind CSS | Rapid UI development |
| State | React Context + Hooks | Sufficient for this scale |

---

## Data Model Quick Reference

```
Prompt (1) ──────< PromptVersion (many)
    │                    │
    │                    └──────< Response (many per version)
    │
    └── tags[] ──────> TagMeta (usage tracking)

Rule (independent)
Settings (singleton)
```

### Key Entities

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Prompt | Parent container | id, tags[], currentVersionId |
| PromptVersion | Each edit creates one | systemPrompt, userPrompt, hash |
| Response | Cached AI response | content, tokens, cost, fromCache |
| Rule | Clacky validation rule | content, active, order |
| TagMeta | Tag usage stats | name, usageCount |
| Settings | API keys, defaults | apiKeys, defaultModels |

---

## Implementation Phases

### Phase 1: Foundation (Thread: prompt-lab-foundation)
| Step | What | Files Created |
|------|------|---------------|
| 1 | Project setup + IndexedDB | db.service.ts |
| 2 | Type definitions | types/index.ts |
| 3 | Settings + API keys | Settings/, SettingsContext |

### Phase 2: Core Flow (Thread: prompt-lab-core-flow)
| Step | What | Files Created |
|------|------|---------------|
| 4 | Prompt editor + tokens | PromptEditor/, PromptContext |
| 5 | Claude integration | api.service.ts, hash.ts |
| 6 | Response display | ResponseViewer/ |
| 7 | Version history | VersionHistory.tsx, VersionDiff.tsx |

### Phase 3: Intelligence (Thread: prompt-lab-intelligence)
| Step | What | Files Created |
|------|------|---------------|
| 8 | Caching system | cache.service.ts |
| 9 | Rules management | RulesManager.tsx, rules.service.ts |
| 10 | Rules validation | ValidationPanel.tsx, GapCard.tsx |

### Phase 4: Polish (Thread: prompt-lab-polish)
| Step | What | Files Created |
|------|------|---------------|
| 11 | Tags system | TagInput.tsx, useTags.ts |
| 12 | Export | ExportButton.tsx, CopyButton.tsx |
| 13 | Backup + cost display | BackupRestore.tsx, cost.service.ts |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` | Send to selected model |
| `Cmd+S` | Force new version |
| `Cmd+Shift+C` | Copy combined prompt |
| `Cmd+K` | Focus model selector |
| `Escape` | Close modal |

---

## Critical Constraints

### DO
✅ Use IndexedDB for all persistent data
✅ Store API keys in localStorage
✅ Call external APIs directly from browser
✅ Follow the 13-step implementation order
✅ Document checkpoints after each step
✅ Commit via Git Agent after each step

### DON'T
❌ Create a backend server
❌ Use Next.js or SSR
❌ Install database services (MySQL, etc.)
❌ Skip steps or combine them
❌ Add features not in current step
❌ Proceed without checkpoint documentation

---

## Clackyrules Summary

| Rule | Purpose |
|------|---------|
| Visual Cues (❓⚠️✅) | Clear communication |
| Checkpoint Protocol | Track progress + learnings |
| Failure Protocol | Document rollbacks for learning |
| Thread Linking | Connect prompts to outcomes |
| Project Constraints | Client-side only, exact stack |
| A/B/C Protocol | Handle ambiguity |
| F12 Protocol | Debug with evidence |
| Credit Checkpoints | Control spend |

---

## Success Metrics

### For This Build
- [ ] All 13 steps complete
- [ ] Can send prompt to Claude and see response
- [ ] Versions track automatically
- [ ] Rules validation works
- [ ] Backup/restore functional
- [ ] Deployed to Vercel

### For Using Prompt Lab
- Fewer failed Clacky builds
- Faster prompt iteration
- Rules accumulate over time
- Clear prompt → outcome lineage

---

## Quick Start Checklist

1. [ ] Add Clackyrules additions to your .clackyrules
2. [ ] Create new Clacky project
3. [ ] Start Thread: `prompt-lab-foundation`
4. [ ] Paste briefing document
5. [ ] Let Clacky generate Spec, review, approve
6. [ ] Build Step 1
7. [ ] Document checkpoint
8. [ ] Commit via Git Agent
9. [ ] Repeat for Steps 2-3
10. [ ] Start new Thread for Phase 2
11. [ ] Continue through all phases
12. [ ] Deploy to Vercel
13. [ ] Start using for TapestrAI and future projects!

---

## Files in This Package

| File | Purpose |
|------|---------|
| `01-clackyrules-additions.md` | Rules to add before building |
| `02-clacky-build-briefing.md` | Complete build instructions for Clacky |
| `03-conditional-logic-flow.md` | Decision trees and flow diagrams |
| `04-project-outline.md` | This file - quick reference |

---

## Next Steps After v1

1. **Use it** - Build TapestrAI Essay CoPilot using Prompt Lab
2. **Learn** - See which rules catch problems, add more
3. **Expand** - Add OpenAI/Gemini (v1.1, v1.2)
4. **Analyze** - Add synthesis AI for cross-model comparison
5. **Share** - If valuable, share with Clacky community
