# 4-Mode Integration Architecture Guide

## 🎯 OVERVIEW

Your Prompt Lab now supports **4 integration modes** to accommodate different user needs and monetization strategies:

1. **Managed Keys** 🌟 - Pro tier, zero setup
2. **OpenRouter** 🔑 - One key, 100+ models (RECOMMENDED for free tier)
3. **Multi-Provider** 🔐 - Direct API keys, maximum control
4. **Single-Provider** 🎯 - Workshop mode, focused refinement

---

## 🏗️ ARCHITECTURE BREAKDOWN

### Mode 1: Managed Keys (Pro Tier)
```
User → Your App → Clacky LLM → Provider APIs
              ↑
         Pooled keys
```

**How it works:**
- You maintain API keys for all providers
- Users subscribe to Pro ($29/month)
- Includes monthly quota (e.g., 500 prompts)
- Zero setup for users

**Business Model:**
- Revenue: $29/month subscription
- Cost: ~$5.50/month for 500 mixed prompts
- Margin: ~$23.50 (81%)

**Implementation:**
- Uses Clacky's built-in `anthropic_complete()`, etc.
- Quota tracking in Settings
- Billing via Stripe (future phase)

---

### Mode 2: OpenRouter (One Key, Many Models) ⭐ RECOMMENDED

```
User → Your App → OpenRouter API → All Provider APIs
              ↑
         User's OpenRouter key
```

**How it works:**
- User creates ONE OpenRouter account
- Single API key accesses 100+ models
- User pays OpenRouter directly
- You charge $0 for API costs

**Why this is brilliant:**
- ✅ Lowest friction (1 key vs 4)
- ✅ Cheaper than direct APIs (OpenRouter volume discounts)
- ✅ More models available (Llama, Mistral, etc.)
- ✅ Unified billing dashboard for user
- ✅ Zero API cost absorption for you
- ✅ Best free tier experience

**Available Models via OpenRouter:**
- Claude: Opus 4.5, Sonnet 4.5, Haiku 4.5
- GPT: 4o, 4o-mini, 4-turbo, 3.5-turbo
- Gemini: 2.0 Flash, 1.5 Pro, 1.5 Flash
- BONUS: Llama 3.3, Mistral Large, DeepSeek, Mixtral, etc.

**Cost Comparison:**
| Model | Direct API | OpenRouter | Savings |
|-------|-----------|-----------|---------|
| Claude Sonnet 4.5 | $15/M out | $14/M out | 7% |
| GPT-4o | $10/M out | $9/M out | 10% |
| Gemini 1.5 Pro | $5/M out | $4.50/M out | 10% |

**Implementation:**
```typescript
// Single fetch call to OpenRouter
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openRouterKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-sonnet-4-5',
    messages: [...],
  }),
});
```

---

### Mode 3: Multi-Provider (Direct API Keys)

```
User → Your App → Direct Provider APIs
              ↑
    User's 3-4 API keys (OpenAI, Anthropic, Google)
```

**How it works:**
- User creates accounts with each provider
- Configures 3+ API keys
- Direct API calls to each provider
- User pays providers directly

**Who uses this:**
- Power users who want full control
- Teams with existing API accounts
- Users who need specific features
- High-volume users optimizing costs

**Implementation:**
- Uses Clacky's built-in functions with user keys
- OR direct fetch() calls if Clacky doesn't support custom keys
- Fallback to Mode 2 (OpenRouter) if complexity too high

---

### Mode 4: Single-Provider (Workshop Mode) 🎯

```
User → Your App → Single Provider API
              ↑
         User's ONE key (e.g., Google only)
```

**How it works:**
- User only has ONE provider key
- Still get full prompt testing features
- Compare different models from same provider
- Compare prompt variations, temperatures

**Use Cases:**
- "I only have a Google account" → Compare Gemini Pro vs Flash vs 2.0
- "Testing before scaling" → Perfect prompts with Claude before adding GPT
- "Budget constraints" → Focus on one provider's models
- "Learning mode" → Master one provider before expanding

**What users can still do:**
- ✅ Test prompt variations
- ✅ Compare temperatures (0.3 vs 0.7 vs 1.0)
- ✅ Compare models (GPT-4o vs 4o-mini vs 3.5)
- ✅ Version prompts
- ✅ Export to Clacky format
- ✅ Rules validation
- ⚠️ Can't compare across providers

**Implementation:**
- Same as Multi-Provider, just 1 key configured
- UI adapts to show single provider's models
- Still valuable for prompt refinement

---

## 💰 MONETIZATION STRATEGY

### Free Tier
- Integration: OpenRouter or Single-Provider
- Limit: 10 prompts/day
- Features: Basic comparison, export
- Goal: Get users hooked, validate PMF

### Pro Tier ($29/month)
- Integration: ALL modes available
- Managed Keys: 500 prompts included
- OR BYOK: Unlimited (user's costs)
- Features: Advanced comparison, rules, export
- Goal: Recurring revenue

### Team Tier ($99/month)
- Integration: BYOK recommended
- Features: Shared library, collaboration
- Goal: B2B revenue

---

## 📊 CREDIT IMPACT

### Original Plan (Custom API Layer)
- Step 5: 200 credits
- Files: 8 files, ~1,250 lines
- Complexity: High (4 providers, streaming, errors)

### With 4-Mode Architecture
- Step 5: **100 credits**
- Files: 5 files, ~600 lines
- Complexity: Medium (unified service, mode routing)

### Breakdown:
| Component | Credits |
|-----------|---------|
| Base LLM service | 30 |
| OpenRouter integration | 20 |
| Managed mode stub | 15 |
| Direct API support | 20 |
| Mode switching logic | 15 |
| **Total** | **100** |

**Savings: ~100 credits (50% reduction from original plan)**

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: MVP (Current Sprint)
**Default to OpenRouter mode**

1. ✅ Add integration mode to Settings
2. ✅ Create IntegrationModeSelector component
3. ✅ Add OpenRouter API key input
4. ✅ Build unified LLM service with OpenRouter
5. ✅ Test with Claude, GPT, Gemini via OpenRouter

**Credits: ~100 for Step 5**
**Timeline: 2-3 hours**

### Phase 2: Multi-Provider Support (Week 2)
**Add direct API option**

1. Add Multi-Provider mode
2. Support direct API keys
3. Add Single-Provider detection
4. Test all 4 modes

**Credits: +25 for multi-provider**
**Timeline: 1 hour**

### Phase 3: Managed Keys (After PMF)
**Enable Pro tier**

1. Add Stripe billing
2. Implement quota tracking
3. Enable managed mode
4. Add usage dashboard

**Credits: ~150 (separate project)**
**Timeline: 1 week**

---

## 🎨 USER EXPERIENCE

### Onboarding Flow (New User)

```
Step 1: Choose Integration
┌─────────────────────────────────┐
│ How do you want to get started? │
├─────────────────────────────────┤
│ 🔑 OpenRouter (Recommended)     │
│ One key for all models          │
│ ✓ Easy setup                    │
│ ✓ 100+ models                   │
│ ✓ Cheapest option               │
└─────────────────────────────────┘

Step 2: Get OpenRouter Key
→ Redirect to openrouter.ai/keys
→ User creates account
→ Add $5 credit
→ Copy API key

Step 3: Configure in App
→ Paste key in Settings
→ Start testing immediately!
```

### Mode Switching

Users can change modes anytime:
- Start with OpenRouter (easy)
- Switch to Single-Provider (cost control)
- Upgrade to Managed (convenience)
- Move to Multi-Provider (power user)

---

## 🔍 MODE DETECTION

The app auto-detects mode based on configured keys:

```typescript
function detectMode(apiKeys: Record<string, string>): IntegrationMode {
  const keys = Object.keys(apiKeys).filter(k => apiKeys[k]);
  
  if (keys.length === 0) return 'managed'; // No keys = needs Pro
  if (keys.includes('openrouter')) return 'openrouter'; // Has OpenRouter
  if (keys.length === 1) return 'single-provider'; // One key only
  if (keys.length >= 3) return 'multi-provider'; // 3+ keys
  
  return 'single-provider'; // Fallback
}
```

**Smart transitions:**
- User adds OpenRouter key → Switches to OpenRouter mode
- User removes OpenRouter, adds Anthropic → Switches to Single-Provider
- User adds 3rd key → Switches to Multi-Provider
- User removes all keys → Prompts to add key or upgrade to Pro

---

## 🎯 FILE STRUCTURE

```
src/
├── constants/
│   └── providers.ts (with OPENROUTER_PROVIDER)
├── types/
│   └── index.ts (with integrationMode field)
├── services/
│   ├── settings.service.ts
│   └── llm.service.ts (4-mode routing)
├── components/
│   └── Settings/
│       ├── SettingsPanel.tsx (updated)
│       ├── IntegrationModeSelector.tsx (NEW)
│       ├── ApiKeyInput.tsx (existing)
│       ├── ProviderConfig.tsx (existing)
│       └── ExportImport.tsx (existing)
└── App.tsx
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Files to Update:
- [ ] `src/constants/providers.ts` - Add OpenRouter, integration modes
- [ ] `src/types/index.ts` - Add integrationMode, membership fields
- [ ] `src/services/llm.service.ts` - Create unified service
- [ ] `src/components/Settings/IntegrationModeSelector.tsx` - NEW
- [ ] `src/components/Settings/SettingsPanel.tsx` - Update with mode selector
- [ ] `src/services/settings.service.ts` - Add mode management

### Testing Checklist:
- [ ] OpenRouter mode with Claude
- [ ] OpenRouter mode with GPT
- [ ] OpenRouter mode with Gemini
- [ ] Single-Provider mode (Google only)
- [ ] Multi-Provider mode (all 3)
- [ ] Mode switching
- [ ] Quota tracking (managed stub)
- [ ] Error handling

---

## 💡 KEY INSIGHTS

### Why OpenRouter First?
1. **Lowest friction** - 1 key vs 4
2. **Best free tier** - Users can start immediately
3. **Zero cost for you** - Users pay OpenRouter
4. **More models** - Bonus models like Llama, Mistral
5. **Better pricing** - 7-10% cheaper than direct

### Why Single-Provider Mode?
1. **Empathy** - "Who am I to judge?" philosophy
2. **Realistic** - Many users only have one account
3. **Still valuable** - Prompt refinement doesn't need multiple providers
4. **Gateway** - Users can upgrade to multi-provider later

### Why Keep Multi-Provider?
1. **Power users** - Some want full control
2. **Enterprise** - Teams have existing accounts
3. **Specific features** - Some providers have unique features
4. **Cost optimization** - High-volume users optimize per-provider

---

## 🎉 SUMMARY

**You now have a flexible, user-friendly architecture that:**

✅ Reduces friction (OpenRouter = 1 key)
✅ Supports all user types (free → pro → power)
✅ Enables monetization (managed keys for Pro)
✅ Stays pragmatic (single-provider mode)
✅ Saves credits (100 vs 200)
✅ Future-proof (easy to add modes)

**Next Steps:**
1. Implement OpenRouter mode first (highest ROI)
2. Add mode selector to Settings
3. Test with all 3 providers via OpenRouter
4. Ship MVP with OpenRouter as default
5. Add other modes as users request them

Ready to build? 🚀
