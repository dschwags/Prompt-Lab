# Prompt Lab - Complete Clacky Build Briefing

## Project Overview

Build "Prompt Lab" - a standalone React web app for testing prompts across multiple AI models with versioning, caching, rules validation, and export.

---

## ⚠️ CRITICAL CONSTRAINTS - READ FIRST

### This is a CLIENT-SIDE ONLY Application

```
❌ Do NOT install MySQL, PostgreSQL, Redis, MongoDB, or any database service
❌ Do NOT create backend API routes or server files
❌ Do NOT create a server or use SSR
❌ Do NOT use Next.js (use Vite instead)

✅ ALL persistence uses IndexedDB (via `idb` library) in the browser
✅ API calls go directly from browser to external APIs
✅ User's API keys stored in localStorage
```

### Stack (Explicit)

| Layer | Technology |
|-------|------------|
| Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Database | IndexedDB via `idb` library |
| Styling | Tailwind CSS |
| State | React Context + Hooks |
| Deployment | Vercel-ready static site |

---

## Visual Cue Requirements

Use these symbols in ALL responses:

| Symbol | Meaning | When to Use |
|--------|---------|-------------|
| ❓ QUESTION | Blocks coding until answered | Ambiguity, missing info, architectural decisions |
| ⚠️ WARNING | Cost/risk alert | Credit-heavy operations, technical limitations |
| ✅ SUCCESS | Confirmed working | Step completed, tests passing |

---

## Thread Strategy

Build in 4 separate threads (one per phase):

| Thread | Phase | Steps | Scope |
|--------|-------|-------|-------|
| `prompt-lab-foundation` | 1 | 1-3 | DB, types, settings/API keys |
| `prompt-lab-core-flow` | 2 | 4-7 | Editor, Claude, responses, versioning |
| `prompt-lab-intelligence` | 3 | 8-10 | Caching, rules, validation |
| `prompt-lab-polish` | 4 | 11-13 | Tags, export, backup, cost display |

Start a new thread for each phase. Commit at the end of each successful step.

---

## Implementation Order (13 Steps)

Complete each step fully before moving to the next. 

### Phase 1: Foundation (Thread: prompt-lab-foundation)

#### Step 1: Project Setup & Database

```
Create: Vite React TypeScript project
Install: idb, tailwindcss
Create: src/services/db.service.ts

IndexedDB Schema (6 stores):
├── prompts (keyPath: 'id', indexes: ['createdAt', 'updatedAt'])
├── promptVersions (keyPath: 'id', indexes: ['promptId', 'hash', 'createdAt'])
├── responses (keyPath: 'id', indexes: ['promptVersionId', 'provider', 'model'])
├── rules (keyPath: 'id', indexes: ['order', 'active'])
├── tagMeta (keyPath: 'name', indexes: ['usageCount', 'lastUsedAt'])
└── settings (keyPath: 'id')
```

❓ QUESTION before starting: Confirm Vite + idb setup approach?

**Success Criteria:**
- [ ] Vite dev server runs
- [ ] IndexedDB initializes without errors
- [ ] Can write/read test data to each store

---

#### Step 2: Type Definitions

```
Create: src/types/index.ts

Include ALL interfaces exactly as specified in Data Models section below.
```

**Success Criteria:**
- [ ] All interfaces compile without TypeScript errors
- [ ] Types are exported and importable

---

#### Step 3: Settings & API Key Management

```
Create:
├── src/services/settings.service.ts
├── src/components/Settings/Settings.tsx
├── src/components/Settings/ApiKeyManager.tsx
├── src/context/SettingsContext.tsx
└── src/hooks/useSettings.ts

Behavior:
- API keys stored in localStorage
- Key validation on entry (test call to API)
- getApiKey() checks: env var first → localStorage fallback
- Settings panel with tabs for API Keys, Rules (placeholder), Backup (placeholder)
```

**Success Criteria:**
- [ ] Can enter and save Claude API key
- [ ] Key persists across browser refresh
- [ ] Invalid key shows error message
- [ ] Settings panel opens/closes properly

---

### Phase 2: Core Flow (Thread: prompt-lab-core-flow)

#### Step 4: Prompt Editor with System/User Split

```
Create:
├── src/components/PromptEditor/PromptEditor.tsx
├── src/components/PromptEditor/TokenCounter.tsx
├── src/hooks/usePrompt.ts
└── src/context/PromptContext.tsx

Features:
- TWO textareas: System Prompt (optional) + User Prompt
- Real-time character count for each
- Real-time token estimate (chars ÷ 4, displayed as "~X tokens")
- Combined token estimate with cost preview
- Auto-save to IndexedDB (debounced 1000ms)
- Keyboard shortcut: Cmd+Enter to send
```

**Success Criteria:**
- [ ] Both textareas render and accept input
- [ ] Token estimates update in real-time
- [ ] Auto-save works (refresh preserves content)
- [ ] Cmd+Enter triggers send (wired up in Step 5)

---

#### Step 5: Claude Integration

```
Create:
├── src/services/api.service.ts
├── src/utils/hash.ts
└── src/constants/models.ts

Implement:
- callClaude() with streaming support
- SHA-256 hash function for cache keys
- Non-streaming fallback

Required header for browser calls:
'anthropic-dangerous-direct-browser-access': 'true'

Hardcoded Claude models (in constants/models.ts):
- claude-opus-4-5-20251101 (Opus 4.5)
- claude-sonnet-4-5-20250929 (Sonnet 4.5)
- claude-haiku-4-5-20251001 (Haiku 4.5)
```

⚠️ WARNING: Implement non-streaming first. Add streaming after basic flow works.

**Success Criteria:**
- [ ] Can send prompt to Claude API
- [ ] Response displays in UI
- [ ] Token counts returned from API
- [ ] Errors handled gracefully

---

#### Step 6: Response Display with Streaming

```
Create:
├── src/components/ResponseViewer/ResponseViewer.tsx
├── src/components/ResponseViewer/ResponseCard.tsx
├── src/components/ResponseViewer/StreamingText.tsx
└── src/components/ResponseViewer/CostBadge.tsx

Features:
- Display response with streaming text effect
- Show: model used, tokens in, tokens out, estimated cost
- Cache status indicator: "Cached" badge or "Fresh" badge
- Loading state while waiting for response
- Error state for failed requests
```

**Success Criteria:**
- [ ] Streaming text appears word-by-word
- [ ] Cost badge shows accurate estimate
- [ ] Cache status displays correctly
- [ ] Loading and error states work

---

#### Step 7: Version History

```
Create:
├── src/components/PromptEditor/VersionHistory.tsx
├── src/components/PromptEditor/VersionDiff.tsx
└── src/hooks/useVersionHistory.ts

Behavior:
- New version created when content changes meaningfully (debounced)
- Display: v1, v2, v3... with timestamps
- Click version to load that content
- Current version highlighted
- Hover to see quick diff (what changed)
- Click to expand full diff view

Version triggers on:
- System prompt change
- User prompt change
- NOT on whitespace-only changes
```

**Success Criteria:**
- [ ] Versions auto-create on meaningful edits
- [ ] Can click to restore previous version
- [ ] Diff shows what changed between versions
- [ ] Version list scrollable if many versions

---

### Phase 3: Intelligence (Thread: prompt-lab-intelligence)

#### Step 8: Caching System

```
Create:
├── src/services/cache.service.ts
└── Update ResponseViewer to show cache status

Cache Key: SHA-256(systemPrompt + userPrompt) + provider + model

Behavior:
- Check cache before API call
- Store response after API call (with hash)
- Manual refresh button bypasses cache
- Cache status shown in UI ("Cached 2 hours ago" or "Fresh")
```

**Success Criteria:**
- [ ] Second identical request returns cached response
- [ ] Cache indicator shows correctly
- [ ] Refresh button fetches fresh response
- [ ] Different prompts don't hit cache

---

#### Step 9: Rules Management

```
Create:
├── src/components/Settings/RulesManager.tsx
├── src/services/rules.service.ts (CRUD operations)
└── Update Settings.tsx to include Rules tab

Features:
- Editable list of rules
- [+ Add Rule] button
- Inline edit per rule (click to edit)
- Toggle active/inactive per rule
- Drag to reorder (or up/down buttons)
- [Import Rules] - paste JSON or upload file
- [Export Rules] - download as JSON

No validation logic yet - just CRUD.
```

**Success Criteria:**
- [ ] Can add, edit, delete rules
- [ ] Can toggle rules active/inactive
- [ ] Can reorder rules
- [ ] Import/export works
- [ ] Rules persist across refresh

---

#### Step 10: Rules Validation

```
Create:
├── src/components/Validation/ValidationPanel.tsx
├── src/components/Validation/GapCard.tsx
└── Extend src/services/rules.service.ts with validation

Behavior:
- "Validate for Clacky" button in editor
- Sends prompt + active rules to Haiku (cheap/fast)
- Displays validation result:
  - ✅ All rules covered
  - ⚠️ Gaps found (with list)
- Each gap shows:
  - Rule that's not covered
  - AI suggestion for what to add
  - [Add to Prompt] button (appends suggestion)
  - [Add to Rules] button (creates new rule from learning)

Uses Haiku model for cost efficiency.
Validation prompt template included in Data section.
```

**Success Criteria:**
- [ ] Validation button triggers check
- [ ] Results display correctly
- [ ] Can add suggestion to prompt with one click
- [ ] Can add learning to rules with one click
- [ ] Handles API errors gracefully

---

### Phase 4: Polish (Thread: prompt-lab-polish)

#### Step 11: Unified Tags System

```
Create:
├── src/components/PromptEditor/TagInput.tsx
└── src/hooks/useTags.ts

Behavior:
- Single input field below prompt editor
- Comma or Enter to separate entries
- Autocomplete suggests existing tags (sorted by usage count)
- Frequent tags (top 5) shown as quick-add chips above input
- Tags stored with Prompt entity
- Usage count tracked in TagMeta store
- Search/filter by tag in prompt list
```

**Success Criteria:**
- [ ] Can add multiple tags
- [ ] Autocomplete works
- [ ] Quick-add chips appear for frequent tags
- [ ] Tags persist with prompt
- [ ] Can filter prompt list by tag

---

#### Step 12: Export System

```
Create:
├── src/services/export.service.ts
├── src/components/Export/ExportButton.tsx
└── src/components/Export/CopyButton.tsx

Behavior:
- Character count always visible
- Under 3000 chars: [Copy to Clipboard] is primary button
- Over 3000 chars: Visual nudge + [Export as .md] promoted
- Both buttons always available regardless of length

Export .md format:
---
# Prompt: [First 50 chars...]
Generated: [Date]
Version: [vN]
Tags: [tag1, tag2]

## System Prompt
[content]

## User Prompt
[content]

## Metadata
- Tokens: ~[estimate]
- Validated: [Yes/No]
- Rules covered: [X/Y]
---

Keyboard shortcut: Cmd+Shift+C to copy combined prompt
```

**Success Criteria:**
- [ ] Copy button copies to clipboard with confirmation
- [ ] Export downloads .md file
- [ ] Nudge appears at 3000+ chars
- [ ] Keyboard shortcut works

---

#### Step 13: Backup/Restore & Cost Display

```
Create:
├── src/components/Settings/BackupRestore.tsx
├── src/services/cost.service.ts
└── src/components/ResponseViewer/SessionCost.tsx

Backup Features:
- [Export Backup] → downloads prompt-lab-backup-YYYY-MM-DD.json
- [Import Backup] → file picker, validates JSON, restores data
- "Last backup: [date]" or "Last backup: Never"
- Warning text: "Your data is stored locally. Export a backup before clearing browser data."
- Confirmation after import: "Imported X prompts, Y responses, Z rules"

Cost Display:
- Per-response: "847 in / 1,203 out (~$0.008)"
- Session total in header: "Session: 14,230 tokens (~$0.12)"
- Resets on page refresh (session-only)
- Uses pricing table in constants/pricing.ts
```

**Success Criteria:**
- [ ] Export creates valid JSON backup
- [ ] Import restores all data correctly
- [ ] Last backup date updates
- [ ] Warning text displays
- [ ] Session cost accumulates correctly
- [ ] Per-response cost shows on each response

---

## Data Models (Use Exactly)

```typescript
// === CORE ENTITIES ===

interface Prompt {
  id: string;                    // UUID
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
  currentVersionId: string;      // Points to active version
  tags: string[];                // Unified tags/notes array
}

interface PromptVersion {
  id: string;                    // UUID
  promptId: string;              // Parent prompt reference
  versionNumber: number;         // 1, 2, 3, etc.
  systemPrompt: string;          // System prompt content (can be empty)
  userPrompt: string;            // User prompt content
  createdAt: number;             // Unix timestamp
  characterCount: number;        // Combined character count
  tokenEstimate: number;         // Estimated tokens (chars ÷ 4)
  hash: string;                  // SHA-256 for cache lookup
}

interface Response {
  id: string;                    // UUID
  promptVersionId: string;       // Which version generated this
  promptHash: string;            // For cache lookup
  provider: Provider;            // 'claude' | 'openai' | 'gemini'
  model: string;                 // e.g., 'claude-sonnet-4-5-20250929'
  content: string;               // Full response text
  tokensIn: number;              // Input tokens (from API)
  tokensOut: number;             // Output tokens (from API)
  estimatedCost: number;         // In USD
  createdAt: number;             // Unix timestamp
  responseTimeMs: number;        // Latency tracking
  fromCache: boolean;            // Was this served from cache?
}

interface Rule {
  id: string;                    // UUID
  content: string;               // The rule text
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
  order: number;                 // Display order
  active: boolean;               // Can disable without deleting
}

interface TagMeta {
  name: string;                  // The tag text (also primary key)
  usageCount: number;            // How many prompts use this
  lastUsedAt: number;            // For sorting suggestions
}

interface Settings {
  id: string;                    // Always 'settings' (singleton)
  apiKeys: {
    claude?: string;
    openai?: string;
    gemini?: string;
  };
  defaultModels: {
    claude: string;
    openai: string;
    gemini: string;
  };
  lastBackupAt?: number;
}

// === VALIDATION ===

interface ValidationResult {
  passed: boolean;
  gaps: ValidationGap[];
  checkedAt: number;
  rulesChecked: number;
  rulesCovered: number;
}

interface ValidationGap {
  ruleId: string;
  ruleContent: string;
  suggestion: string;            // AI-generated fix suggestion
}

// === CLACKY EXECUTION TRACKING ===

interface ClackyExecution {
  id: string;
  promptVersionId: string;
  threadId: string;              // Clacky thread name
  threadUrl?: string;            // Link to Clacky thread
  checkpointName: string;        // "Step 3 - Settings & API Keys"
  executedAt: number;
  outcome: 'success' | 'partial' | 'failed' | 'rolled-back';
  
  achievements: string[];
  filesChanged: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
  
  gotchas: string[];
  learnings: string[];
  suggestedRules: string[];
  
  // If rolled back
  rollbackData?: {
    rolledBackTo: string;
    promptDeficiencies: string[];
  };
}

// === TYPES ===

type Provider = 'claude' | 'openai' | 'gemini';

interface ModelInfo {
  id: string;                    // API model string
  name: string;                  // Display name
  provider: Provider;
  inputCostPer1M: number;        // $ per 1M input tokens
  outputCostPer1M: number;       // $ per 1M output tokens
}
```

---

## Pricing Table

```typescript
// src/constants/pricing.ts

export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Claude (per 1M tokens)
  'claude-opus-4-5-20251101': { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4 },
  
  // OpenAI (per 1M tokens) - for v1.1
  'gpt-4o': { input: 2.50, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'o1': { input: 15, output: 60 },
  
  // Gemini (per 1M tokens) - for v1.2
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
};
```

---

## Validation Prompt Template

```typescript
// Used in rules.service.ts for validation

const VALIDATION_PROMPT = `You are a prompt validator. Check if the following prompt explicitly addresses each rule listed below.

<rules>
{RULES_LIST}
</rules>

<system_prompt>
{SYSTEM_PROMPT}
</system_prompt>

<user_prompt>
{USER_PROMPT}
</user_prompt>

For each rule, determine if the prompt explicitly addresses it. Respond ONLY with this exact JSON format, no other text:

{
  "results": [
    {
      "ruleNumber": 1,
      "covered": true,
      "suggestion": ""
    },
    {
      "ruleNumber": 2,
      "covered": false,
      "suggestion": "Add this text to cover the rule: '[specific suggestion]'"
    }
  ]
}

Rules for evaluation:
- Mark "covered": true ONLY if the prompt EXPLICITLY addresses the rule
- Implicit or assumed coverage counts as NOT covered
- Suggestions should be specific, actionable text to add
- Keep suggestions concise (under 100 characters)`;
```

---

## File Structure

```
prompt-lab/
├── src/
│   ├── components/
│   │   ├── PromptEditor/
│   │   │   ├── PromptEditor.tsx
│   │   │   ├── TokenCounter.tsx
│   │   │   ├── VersionHistory.tsx
│   │   │   ├── VersionDiff.tsx
│   │   │   └── TagInput.tsx
│   │   ├── ResponseViewer/
│   │   │   ├── ResponseViewer.tsx
│   │   │   ├── ResponseCard.tsx
│   │   │   ├── StreamingText.tsx
│   │   │   ├── CostBadge.tsx
│   │   │   └── SessionCost.tsx
│   │   ├── Settings/
│   │   │   ├── Settings.tsx
│   │   │   ├── ApiKeyManager.tsx
│   │   │   ├── RulesManager.tsx
│   │   │   └── BackupRestore.tsx
│   │   ├── Validation/
│   │   │   ├── ValidationPanel.tsx
│   │   │   └── GapCard.tsx
│   │   └── Export/
│   │       ├── ExportButton.tsx
│   │       └── CopyButton.tsx
│   │
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── cache.service.ts
│   │   ├── cost.service.ts
│   │   ├── db.service.ts
│   │   ├── export.service.ts
│   │   ├── rules.service.ts
│   │   └── settings.service.ts
│   │
│   ├── hooks/
│   │   ├── usePrompt.ts
│   │   ├── useSettings.ts
│   │   ├── useTags.ts
│   │   └── useVersionHistory.ts
│   │
│   ├── context/
│   │   ├── PromptContext.tsx
│   │   └── SettingsContext.tsx
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── hash.ts
│   │   ├── uuid.ts
│   │   └── format.ts
│   │
│   ├── constants/
│   │   ├── models.ts
│   │   └── pricing.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Keyboard Shortcuts (Implement in Step 4+)

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` | Send prompt to selected model |
| `Cmd+S` | Force create new version |
| `Cmd+Shift+C` | Copy combined prompt to clipboard |
| `Cmd+K` | Focus model selector |
| `Escape` | Close any open modal/panel |

---

## What NOT To Do

```
❌ Don't create a backend/server - this is client-side only
❌ Don't use localStorage for prompts/responses - use IndexedDB
❌ Don't modify the data model interfaces without asking
❌ Don't add OpenAI/Gemini until Claude works completely (v1.1)
❌ Don't add features not in the 13 steps
❌ Don't combine multiple steps into one
❌ Don't skip the checkpoint documentation after each step
❌ Don't proceed to next step without ✅ SUCCESS confirmation
```

---

## Starting Prompt for Thread 1

Copy this to begin Phase 1:

---

I'm building Prompt Lab, a client-side React app for testing prompts.

**Start with Step 1: Project Setup & Database**

Create:
1. New Vite + React + TypeScript project
2. Install dependencies: `idb`, `tailwindcss`, `postcss`, `autoprefixer`
3. Configure Tailwind
4. Create `src/services/db.service.ts` with IndexedDB setup using `idb`

IndexedDB Schema (6 stores):
- prompts (keyPath: 'id', indexes: ['createdAt', 'updatedAt'])
- promptVersions (keyPath: 'id', indexes: ['promptId', 'hash', 'createdAt'])
- responses (keyPath: 'id', indexes: ['promptVersionId', 'provider', 'model'])
- rules (keyPath: 'id', indexes: ['order', 'active'])
- tagMeta (keyPath: 'name', indexes: ['usageCount', 'lastUsedAt'])
- settings (keyPath: 'id')

❓ QUESTION: Before you write any code, confirm you understand:
1. This is client-side only (no backend)
2. Using Vite, not Next.js
3. The 6 IndexedDB stores needed

[FULL BRIEFING ATTACHED]

---
