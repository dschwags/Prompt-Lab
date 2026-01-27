# Step 3 UPDATED: 4-Mode Integration Implementation

## 🎯 QUICK START

You now have a **4-mode integration strategy** instead of just BYOK:
1. Managed Keys (Pro)
2. **OpenRouter** ⭐ (ONE key for 100+ models - RECOMMENDED)
3. Multi-Provider (3+ keys)
4. Single-Provider (Workshop mode)

---

## 📦 FILES TO UPLOAD TO CLACKY

Upload these files in order:

### 1. Update Constants
**File:** `providers-with-openrouter.ts`
**Location:** `src/constants/providers.ts`
**What it does:** Adds OpenRouter support + integration mode definitions

### 2. Update Types
**File:** `types-updated.ts`
**Location:** `src/types/index.ts` (UPDATE existing)
**What it does:** Adds `integrationMode`, `membershipTier`, quota fields

### 3. Create Integration Mode Selector
**File:** `IntegrationModeSelector.tsx`
**Location:** `src/components/Settings/IntegrationModeSelector.tsx`
**What it does:** Visual selector for 4 modes with descriptions

### 4. Update Settings Panel
**File:** `SettingsPanel-updated.tsx`
**Location:** `src/components/Settings/SettingsPanel.tsx` (REPLACE existing)
**What it does:** Integrates mode selector + adapts UI per mode

### 5. Create LLM Service
**File:** `llm.service.ts`
**Location:** `src/services/llm.service.ts`
**What it does:** Unified service that routes to appropriate integration

---

## ✅ IMPLEMENTATION STEPS

### Step 1: Backup Current Work
```bash
git add -A
git commit -m "Checkpoint: Step 3 base implementation complete"
```

### Step 2: Update Files in Clacky

**In this order:**

1. **constants/providers.ts**
   - Copy content from `providers-with-openrouter.ts`
   - Adds OpenRouter provider
   - Adds integration mode definitions

2. **types/index.ts**
   - Update Settings interface
   - Add: `integrationMode`, `membershipTier`, `monthlyQuota`, `usageThisMonth`

3. **components/Settings/IntegrationModeSelector.tsx**
   - Create new file
   - Copy from `IntegrationModeSelector.tsx`

4. **components/Settings/SettingsPanel.tsx**
   - REPLACE with `SettingsPanel-updated.tsx`
   - Now includes mode selector

5. **services/llm.service.ts**
   - Create new file
   - Copy from `llm.service.ts`
   - Handles all 4 modes

### Step 3: Update Settings Service

Add these methods to `settings.service.ts`:

```typescript
/**
 * Update integration mode
 */
async setIntegrationMode(mode: IntegrationMode): Promise<void> {
  await this.updateSettings({ integrationMode: mode });
}

/**
 * Get current mode
 */
async getIntegrationMode(): Promise<IntegrationMode> {
  const settings = await this.getSettings();
  return settings.integrationMode || 'openrouter';
}

/**
 * Check if user is Pro
 */
async isPro(): Promise<boolean> {
  const settings = await this.getSettings();
  return settings.membershipTier === 'pro' || settings.membershipTier === 'team';
}
```

### Step 4: Test Each Mode

**Test OpenRouter Mode:**
```bash
# In Settings:
1. Select "OpenRouter" mode
2. Add OpenRouter key: sk-or-v1-...
3. Select default model: anthropic/claude-sonnet-4-5
4. Create test prompt
5. Send to Claude via OpenRouter
6. Verify response received
```

**Test Single-Provider Mode:**
```bash
# In Settings:
1. Remove OpenRouter key
2. Add only Google key
3. Should auto-switch to Single-Provider
4. Verify only Gemini models available
5. Test prompt with Gemini
```

**Test Multi-Provider Mode:**
```bash
# In Settings:
1. Add OpenAI, Anthropic, Google keys
2. Should auto-switch to Multi-Provider
3. Verify all models available
4. Test prompts across providers
```

---

## 🎯 DEFAULT CONFIGURATION

Set these defaults in `providers.ts`:

```typescript
export const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  theme: 'system',
  
  // ⭐ Default to OpenRouter (best free tier UX)
  integrationMode: 'openrouter',
  
  // BYOK by default
  apiKeys: {},
  defaultModels: {},
  
  // Free tier (managed mode disabled)
  membershipTier: 'free',
  monthlyQuota: 0,
  usageThisMonth: 0,
  
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

---

## 📊 UPDATED CREDIT ESTIMATE

| Step | Original | With 4-Mode | Change |
|------|----------|-------------|--------|
| Step 3 (Settings) | 100 | 125 | +25 |
| Step 5 (API Layer) | 200 | 100 | -100 |
| **Total Impact** | 300 | 225 | **-75 credits saved** |

---

## 🚀 TESTING CHECKLIST

### OpenRouter Mode (Primary)
- [ ] Add OpenRouter key
- [ ] Select `anthropic/claude-sonnet-4-5`
- [ ] Send test prompt
- [ ] Verify response received
- [ ] Check token counts
- [ ] Test error handling (invalid key)

### Single-Provider Mode
- [ ] Add only Google key
- [ ] Mode auto-switches to Single-Provider
- [ ] Only Gemini models shown
- [ ] Can compare Gemini Pro vs Flash
- [ ] Can test different temperatures
- [ ] Workshop mode message displayed

### Multi-Provider Mode
- [ ] Add 3+ provider keys
- [ ] Mode auto-switches to Multi-Provider
- [ ] All models available
- [ ] Can test across providers
- [ ] Each provider works independently

### Managed Mode (Stub)
- [ ] Select Managed mode
- [ ] Shows "Pro required" if not Pro
- [ ] Quota display shown
- [ ] Can't test without Pro

---

## ⚠️ POTENTIAL GOTCHAS

### 1. OpenRouter Model IDs
OpenRouter uses `provider/model` format:
- ✅ `anthropic/claude-sonnet-4-5`
- ❌ `claude-sonnet-4-5-20250929`

**Fix:** Update model IDs in providers.ts for OpenRouter

### 2. Clacky Functions May Not Support Custom Keys
If Clacky's `anthropic_complete()` doesn't accept custom API keys:
- **Fallback:** Use direct fetch() calls
- **Or:** Default to OpenRouter for BYOK modes

### 3. Mode Detection Edge Cases
- User has OpenRouter + Google keys → Defaults to OpenRouter
- User removes OpenRouter → Switches to Single-Provider (Google)
- Empty keys → Should prompt for OpenRouter, not default to Managed

### 4. TypeScript Errors
If you see errors about `IntegrationMode`:
```typescript
// Add to types/index.ts
export type IntegrationMode = 'managed' | 'openrouter' | 'multi-provider' | 'single-provider';
```

---

## 💡 USER MESSAGING

### Free Tier (OpenRouter)
```
🎉 Welcome to Prompt Lab!

Get started in 2 minutes:
1. Create free OpenRouter account (openrouter.ai)
2. Add $5 credit
3. Copy your API key
4. Paste here and start testing!

Why OpenRouter?
✓ One key for 100+ models
✓ Cheaper than direct APIs
✓ Includes Claude, GPT, Gemini, Llama & more
```

### Single-Provider (Workshop)
```
🎯 Workshop Mode Active

You're testing with Google AI only. Perfect for:
• Comparing Gemini models (Pro vs Flash)
• Refining prompts before scaling
• Learning one provider deeply

Want to test across providers?
→ Add OpenRouter key for 100+ models
```

### Pro Tier (Managed)
```
🌟 Pro Tier Active

We handle all API keys for you!
• 500 prompts/month included
• Zero setup required
• Access to all providers

Usage: 127 / 500 prompts this month
```

---

## 🎯 COMMIT MESSAGE TEMPLATE

```
Step 3 Updated: 4-Mode Integration Architecture

Add support for 4 integration modes:
- Managed Keys (Pro tier, zero setup)
- OpenRouter (one key, 100+ models) ⭐ DEFAULT
- Multi-Provider (direct API keys, 3+)
- Single-Provider (workshop mode, 1 key)

Changes:
- Add IntegrationModeSelector component
- Update SettingsPanel with mode selection
- Create unified LLM service with mode routing
- Add OpenRouter provider support
- Update Settings interface with mode fields
- Add membership tier and quota fields

Benefits:
- Lower friction (1 key vs 4)
- Support all user types (free → pro → power)
- Enable monetization (managed keys)
- Future-proof architecture
- Save ~75 credits vs original plan

Files:
+ src/constants/providers.ts (OpenRouter support)
+ src/types/index.ts (integration mode fields)
+ src/services/llm.service.ts (unified routing)
+ src/components/Settings/IntegrationModeSelector.tsx
~ src/components/Settings/SettingsPanel.tsx (mode selector)
~ src/services/settings.service.ts (mode methods)

Tested: OpenRouter, Single-Provider, Multi-Provider modes
Default: OpenRouter (best free tier UX)
```

---

## 📚 DOCUMENTATION FILES INCLUDED

1. **4-MODE-ARCHITECTURE-GUIDE.md** - Complete architectural overview
2. **providers-with-openrouter.ts** - Updated providers with OpenRouter
3. **types-updated.ts** - Updated Settings interface
4. **IntegrationModeSelector.tsx** - Mode selection UI
5. **SettingsPanel-updated.tsx** - Updated settings panel
6. **llm.service.ts** - Unified LLM service
7. **THIS FILE** - Implementation checklist

---

## 🎉 WHAT YOU'VE GAINED

✅ **Flexibility** - 4 modes for different users
✅ **Lower friction** - OpenRouter = 1 key vs 4
✅ **Cost savings** - 75 credits saved
✅ **Monetization** - Path to Pro tier
✅ **Empathy** - Single-provider mode
✅ **Future-proof** - Easy to add more modes

Ready to implement? Start with updating providers.ts! 🚀
