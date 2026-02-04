# Prompt Lab - Conditional Logic Flow & Decision Trees

## 1. Application State Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION STARTUP                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Initialize IndexedDB        │
                    │   (db.service.ts)             │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                    DB EXISTS              DB NOT EXISTS
                         │                     │
                         ▼                     ▼
                    Load existing         Create stores
                    settings              with schema
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check for API Keys          │
                    │   (settings.service.ts)       │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                  KEYS EXIST              NO KEYS
                         │                     │
                         ▼                     ▼
                  Load PromptContext      Show Settings
                  Show Editor             Panel First
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   APPLICATION READY           │
                    └───────────────────────────────┘
```

---

## 2. API Key Management Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GET API KEY                                      │
│                      (api.service.ts)                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check Environment Variable  │
                    │   process.env.CLAUDE_API_KEY  │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                    ENV EXISTS            ENV NOT SET
                         │                     │
                         ▼                     ▼
                    Return env key       Check localStorage
                                              │
                                   ┌──────────┴──────────┐
                                   │                     │
                                   ▼                     ▼
                            LOCAL EXISTS          LOCAL NOT SET
                                   │                     │
                                   ▼                     ▼
                            Return local key      Return null
                                                  (prompt user)
```

---

## 3. Send Prompt Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "SEND" (or Cmd+Enter)                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Validate Inputs             │
                    └───────────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
        NO API KEY           EMPTY PROMPT           ALL VALID
              │                     │                     │
              ▼                     ▼                     ▼
        Show "Add API        Show "Enter a          Continue
        key in settings"     prompt first"               │
              │                     │                     │
              └─────────────────────┴─────────────────────┘
                                    │
                                    ▼ (if valid)
                    ┌───────────────────────────────┐
                    │   Create/Update Version       │
                    │   (if content changed)        │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Generate Hash               │
                    │   SHA-256(system + user)      │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check Cache                 │
                    │   (cache.service.ts)          │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                   CACHE HIT              CACHE MISS
                         │                     │
                         ▼                     ▼
                   Return cached         Call API
                   (fromCache: true)     (see API Flow)
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Display Response            │
                    │   Update Session Cost         │
                    └───────────────────────────────┘
```

---

## 4. API Call Flow (Claude)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CALL CLAUDE API                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Build Request               │
                    │   - model: selected model     │
                    │   - messages: [{role, content}]│
                    │   - stream: true              │
                    │   - max_tokens: 4096          │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Send Request                │
                    │   POST /v1/messages           │
                    │   Headers:                    │
                    │   - x-api-key                 │
                    │   - anthropic-version         │
                    │   - anthropic-dangerous-      │
                    │     direct-browser-access     │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                    SUCCESS                 ERROR
                         │                     │
                         ▼                     ▼
                    Process Stream       ┌─────────────────┐
                         │               │ Error Type?     │
                         │               └────────┬────────┘
                         │                        │
                         │         ┌──────────────┼──────────────┐
                         │         │              │              │
                         │         ▼              ▼              ▼
                         │     401/403         429            OTHER
                         │    Invalid key    Rate limit      API error
                         │         │              │              │
                         │         ▼              ▼              ▼
                         │    "Check your    "Rate limit    "API error:
                         │     API key"       exceeded"      [message]"
                         │
                         ▼
                    ┌───────────────────────────────┐
                    │   For each SSE chunk:         │
                    │   - Parse JSON                │
                    │   - Extract text delta        │
                    │   - Append to response        │
                    │   - Update UI (streaming)     │
                    │   - Capture token counts      │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Stream Complete             │
                    │   - Calculate cost            │
                    │   - Store in cache            │
                    │   - Save Response to DB       │
                    │   - Update session total      │
                    └───────────────────────────────┘
```

---

## 5. Version Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTENT CHANGED                                  │
│                    (detected by usePrompt hook)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Debounce (1000ms)           │
                    │   Wait for typing to stop     │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Compare to Last Version     │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                   MEANINGFUL             WHITESPACE ONLY
                    CHANGE                  CHANGE
                         │                     │
                         ▼                     ▼
                   Create New             Do nothing
                   Version                     │
                         │                     │
                         ▼                     │
         ┌───────────────────────────────┐    │
         │   New PromptVersion:          │    │
         │   - versionNumber++           │    │
         │   - systemPrompt              │    │
         │   - userPrompt                │    │
         │   - hash = SHA-256(combined)  │    │
         │   - characterCount            │    │
         │   - tokenEstimate             │    │
         └───────────────┬───────────────┘    │
                         │                     │
                         ▼                     │
         ┌───────────────────────────────┐    │
         │   Update Prompt:              │    │
         │   - currentVersionId = new ID │    │
         │   - updatedAt = now           │    │
         └───────────────┬───────────────┘    │
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Update Version History UI   │
                    └───────────────────────────────┘


"Meaningful Change" Detection:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Trim both old and new content
- Compare trimmed strings
- If different → meaningful change
- If same → whitespace only
```

---

## 6. Cache Decision Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHECK CACHE                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Build Cache Key             │
                    │   key = hash + provider +     │
                    │         model                 │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Query IndexedDB             │
                    │   responses.where(hash,       │
                    │   provider, model)            │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                     FOUND                 NOT FOUND
                         │                     │
                         ▼                     ▼
         ┌───────────────────────────┐   Return null
         │   Check: User requested   │   (cache miss)
         │   force refresh?          │
         └───────────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
         REFRESH             NORMAL
         REQUESTED           REQUEST
              │                     │
              ▼                     ▼
         Delete cached       Return cached
         entry, return       response with
         null (miss)         fromCache: true
```

---

## 7. Rules Validation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "VALIDATE FOR CLACKY"                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Load Active Rules           │
                    │   from IndexedDB              │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                    NO RULES              HAS RULES
                         │                     │
                         ▼                     ▼
                    Show "Add rules      Build validation
                    first" message       prompt
                         │                     │
                         │                     ▼
                         │     ┌───────────────────────────────┐
                         │     │   VALIDATION_PROMPT +         │
                         │     │   - Numbered rules list       │
                         │     │   - System prompt             │
                         │     │   - User prompt               │
                         │     └───────────────┬───────────────┘
                         │                     │
                         │                     ▼
                         │     ┌───────────────────────────────┐
                         │     │   Call Haiku (cheap/fast)     │
                         │     │   model: claude-haiku-4-5-... │
                         │     │   skipCache: true             │
                         │     └───────────────┬───────────────┘
                         │                     │
                         │          ┌──────────┴──────────┐
                         │          │                     │
                         │          ▼                     ▼
                         │     API SUCCESS           API ERROR
                         │          │                     │
                         │          ▼                     ▼
                         │     Parse JSON            Show error
                         │     response              "Validation
                         │          │                failed"
                         │          │
                         │          ▼
                         │     ┌───────────────────────────────┐
                         │     │   Count Results               │
                         │     │   covered = results.filter(   │
                         │     │     r => r.covered).length    │
                         │     │   gaps = results.filter(      │
                         │     │     r => !r.covered)          │
                         │     └───────────────┬───────────────┘
                         │                     │
                         │          ┌──────────┴──────────┐
                         │          │                     │
                         │          ▼                     ▼
                         │     ALL COVERED           HAS GAPS
                         │          │                     │
                         │          ▼                     ▼
                         │     Show ✅ "All         Show ⚠️ with
                         │     X rules covered"    gap cards
                         │                              │
                         │                              ▼
                         │                    For each gap:
                         │                    ┌─────────────────────┐
                         │                    │ • Rule content      │
                         │                    │ • AI suggestion     │
                         │                    │ [Add to Prompt]     │
                         │                    │ [Add to Rules]      │
                         │                    └─────────────────────┘
                         │
                         └─────────────────────────────────────────────
```

---

## 8. Export Decision Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER WANTS TO EXPORT                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check Character Count       │
                    │   combined = system + user    │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                   < 3000 chars           >= 3000 chars
                         │                     │
                         ▼                     ▼
              ┌─────────────────────┐  ┌─────────────────────┐
              │ Primary: Copy       │  │ Show nudge:         │
              │ Secondary: Export   │  │ "This prompt is     │
              │                     │  │  long—consider      │
              │ [Copy to Clipboard] │  │  exporting"         │
              │ [Export .md]        │  │                     │
              └─────────────────────┘  │ Primary: Export     │
                                       │ Secondary: Copy     │
                                       │                     │
                                       │ [Export .md]        │
                                       │ [Copy to Clipboard] │
                                       └─────────────────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
              COPY CLICKED                   EXPORT CLICKED
                    │                               │
                    ▼                               ▼
         ┌─────────────────────┐       ┌─────────────────────┐
         │ Build combined text │       │ Build markdown:     │
         │ system + "\n\n" +   │       │ - Header with meta  │
         │ user                │       │ - System section    │
         │                     │       │ - User section      │
         │ navigator.clipboard │       │ - Metadata footer   │
         │ .writeText()        │       │                     │
         │                     │       │ Download as .md     │
         │ Show toast:         │       │ filename: prompt-   │
         │ "Copied!"           │       │ lab-export-DATE.md  │
         └─────────────────────┘       └─────────────────────┘
```

---

## 9. Backup/Restore Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXPORT BACKUP                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Gather All Data             │
                    │   - All prompts               │
                    │   - All promptVersions        │
                    │   - All responses             │
                    │   - All rules                 │
                    │   - All tagMeta               │
                    │   - Settings (excl API keys)  │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Build JSON                  │
                    │   {                           │
                    │     version: "1.0",           │
                    │     exportedAt: timestamp,    │
                    │     data: { ... }             │
                    │   }                           │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Download File               │
                    │   prompt-lab-backup-          │
                    │   YYYY-MM-DD.json             │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Update lastBackupAt         │
                    │   in settings                 │
                    └───────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         IMPORT BACKUP                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   User Selects File           │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Parse JSON                  │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                    VALID JSON            INVALID JSON
                         │                     │
                         ▼                     ▼
                    Check schema          Show error:
                         │                "Invalid backup
                         │                 file format"
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Confirm Overwrite?          │
         │   "This will replace X        │
         │    prompts, Y responses..."   │
         │   [Cancel] [Import]           │
         └───────────────┬───────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
          CANCEL               CONFIRMED
              │                     │
              ▼                     ▼
          Do nothing         Clear existing data
                                   │
                                   ▼
                    ┌───────────────────────────────┐
                    │   Insert imported data        │
                    │   to each IndexedDB store     │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Show success:               │
                    │   "Imported X prompts,        │
                    │    Y responses, Z rules"      │
                    └───────────────────────────────┘
```

---

## 10. Session Cost Tracking Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ON EACH API RESPONSE                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Calculate Response Cost     │
                    │   inputCost = (tokensIn /     │
                    │     1,000,000) * inputRate    │
                    │   outputCost = (tokensOut /   │
                    │     1,000,000) * outputRate   │
                    │   total = input + output      │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check: fromCache?           │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                   FROM CACHE             FRESH CALL
                         │                     │
                         ▼                     ▼
                   Don't add to          Add to session:
                   session total         sessionTokens +=
                   (show $0.00)          tokensIn + tokensOut
                         │               sessionCost += total
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Update UI                   │
                    │   Per-response: badge         │
                    │   Session: header display     │
                    └───────────────────────────────┘


ON PAGE REFRESH:
━━━━━━━━━━━━━━━━
Session cost resets to $0.00
(Session is in-memory only, not persisted)
```

---

## 11. Tag Autocomplete Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER TYPES IN TAG INPUT                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Get Current Input Value     │
                    │   (after last comma/space)    │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                   EMPTY INPUT            HAS TEXT
                         │                     │
                         ▼                     ▼
                   Hide dropdown         Query tagMeta
                                         where name
                                         startsWith(input)
                                              │
                                              ▼
                                   ┌──────────┴──────────┐
                                   │                     │
                                   ▼                     ▼
                              MATCHES              NO MATCHES
                                   │                     │
                                   ▼                     ▼
                              Sort by              Hide dropdown
                              usageCount DESC           │
                              Show dropdown             │
                                   │                    │
                                   ▼                    │
                    ┌───────────────────────────────┐   │
                    │   User selects suggestion     │   │
                    │   - OR -                      │   │
                    │   User presses Enter/comma    │   │
                    └───────────────┬───────────────┘   │
                                    │                   │
                                    ▼                   │
                    ┌───────────────────────────────┐   │
                    │   Add tag to prompt.tags[]    │   │
                    │   Update/create tagMeta:      │   │
                    │   - usageCount++              │   │
                    │   - lastUsedAt = now          │   │
                    └───────────────────────────────┘   │
                                    │                   │
                                    └───────────────────┘


QUICK-ADD CHIPS (top 5 frequent):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On component mount:
1. Query tagMeta, sort by usageCount DESC, limit 5
2. Display as clickable chips above input
3. Click chip → add to tags (same flow as autocomplete select)
```

---

## 12. Main Application State Machine

```
                         ┌─────────────────┐
                         │     INITIAL     │
                         │   (loading DB)  │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │      DB_READY           │
                    │   (checking settings)   │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         ┌─────────────────┐         ┌─────────────────┐
         │   NEEDS_SETUP   │         │     READY       │
         │  (no API keys)  │         │  (keys exist)   │
         └────────┬────────┘         └────────┬────────┘
                  │                           │
                  │    ┌──────────────────────┤
                  │    │                      │
                  ▼    ▼                      ▼
         ┌─────────────────┐         ┌─────────────────┐
         │ SETTINGS_OPEN   │◄────────│    EDITING      │
         │ (modal visible) │────────►│  (main view)    │
         └─────────────────┘         └────────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │    SENDING      │
                                    │  (API in flight)│
                                    └────────┬────────┘
                                              │
                                   ┌──────────┴──────────┐
                                   │                     │
                                   ▼                     ▼
                         ┌─────────────────┐   ┌─────────────────┐
                         │    STREAMING    │   │     ERROR       │
                         │ (response coming│   │  (API failed)   │
                         └────────┬────────┘   └────────┬────────┘
                                  │                     │
                                  ▼                     │
                         ┌─────────────────┐           │
                         │   DISPLAYING    │◄──────────┘
                         │(response shown) │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    EDITING      │ (back to main)
                         └─────────────────┘
```

---

## Summary: Key Decision Points

| Decision Point | Options | Logic |
|----------------|---------|-------|
| API key source | env → localStorage → null | Waterfall check |
| Cache hit/miss | cached → fresh call | Hash lookup |
| Version create | meaningful change → skip | Trimmed string compare |
| Export format | copy → .md file | Character count threshold |
| Validation result | all covered → show gaps | Count covered rules |
| Cost tracking | add to session → skip | fromCache check |
| Tag suggestion | show dropdown → hide | Prefix match exists |
