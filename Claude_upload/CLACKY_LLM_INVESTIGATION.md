# Clacky LLM Integration Investigation

## 🎯 OBJECTIVE
Determine if Clacky's built-in LLM integration can replace our planned custom API layer for the Prompt Lab project, potentially saving 250-325 credits (~15% of project cost).

---

## 📋 INVESTIGATION PROMPT FOR CLACKY

Copy and paste this into Clacky:

```
I'm building a Prompt Lab tool to test prompts across multiple AI models. 
I see Clacky offers an LLM integration that supports OpenAI, Gemini, Anthropic, 
and DeepSeek.

Please provide comprehensive documentation on how to use this integration:

1. **Setup & Configuration**
   - How do I enable/configure the LLM integration in my project?
   - Do I need to install any packages?
   - Do I need API keys, or does Clacky handle authentication?

2. **Supported Models**
   - List all available models for each provider (OpenAI, Anthropic, Gemini, DeepSeek)
   - Can I use specific models like:
     - OpenAI: gpt-4o, gpt-4o-mini, gpt-4-turbo
     - Anthropic: claude-sonnet-4-5-20250929, claude-opus-4-5-20251101, claude-haiku-4-5-20251001
     - Google: gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash
     - Cohere: command-r-plus, command-r

3. **API Usage**
   - Show me code examples of sending a prompt to:
     a) Claude Sonnet 4.5
     b) GPT-4o
     c) Gemini 1.5 Pro
   - What's the request format?
   - What's the response format?
   - How do I specify system prompts vs user messages?

4. **Streaming Support**
   - Does the integration support streaming responses?
   - If yes, show me code examples
   - How do I handle partial responses?

5. **Advanced Features**
   - Can I set temperature, max_tokens, top_p, etc.?
   - Does it support function calling/tool use?
   - Can I send images or files?
   - Context window limits per model?

6. **Error Handling**
   - How are API errors returned?
   - What error codes/types should I handle?
   - Are there automatic retries?

7. **Rate Limits & Costs**
   - Are there rate limits?
   - Does Clacky charge for API calls, or is it pass-through billing?
   - Any usage quotas or restrictions?

8. **Response Metadata**
   - Do responses include token counts?
   - Do responses include latency/timing info?
   - Any other metadata available?

Please provide working code examples I can test immediately.
```

---

## ✅ EVALUATION CRITERIA

After Clacky responds, evaluate based on:

### Must-Have Features (Deal Breakers)
- [ ] Supports Claude Sonnet 4.5, Opus 4.5, Haiku 4.5
- [ ] Supports GPT-4o, GPT-4o-mini
- [ ] Supports Gemini 1.5 Pro, 2.0 Flash
- [ ] Can specify system prompts
- [ ] Returns full text responses
- [ ] Includes basic error handling

### High-Value Features (Strongly Preferred)
- [ ] Streaming support
- [ ] Token count in responses
- [ ] Configurable parameters (temperature, max_tokens)
- [ ] No API keys needed (Clacky handles auth)
- [ ] Consistent response format across providers

### Nice-to-Have Features (Bonus)
- [ ] Automatic retries on failures
- [ ] Response timing/latency metadata
- [ ] Function calling support
- [ ] Image/file support
- [ ] Detailed error messages

---

## 🎯 DECISION MATRIX

### ✅ USE CLACKY LLM IF:
- All "Must-Have" criteria met (6/6)
- At least 3/5 "High-Value" features present
- No major limitations discovered
- **Result:** Save 250-325 credits, simpler architecture

### ⚖️ DUAL-MODE ARCHITECTURE IF:
- All "Must-Have" criteria met (6/6)
- Only 1-2 "High-Value" features present
- Some limitations but workarounds exist
- **Result:** Save 100-150 credits, moderate complexity

### ❌ STICK WITH ORIGINAL PLAN IF:
- Missing critical "Must-Have" features
- Clacky LLM too limited for requirements
- Unclear documentation or too complex
- **Result:** Use full custom API layer (~200 credits for Step 5)

---

## 📊 IMPACT ON PROJECT ARCHITECTURE

### If Clacky LLM Works Well:

**Settings Changes:**
```typescript
interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  
  // Integration mode
  llmMode: 'clacky' | 'direct-api';
  
  // Only needed for direct-api mode
  apiKeys?: Record<string, string>;
  
  // Works for both modes
  defaultModels: Record<string, string>;
  
  createdAt: number;
  updatedAt: number;
}
```

**New Service:**
```typescript
// src/services/llm.service.ts
export class LLMService {
  async sendPrompt(provider, model, prompt, options) {
    if (settings.llmMode === 'clacky') {
      return this.sendViaClacky(provider, model, prompt, options);
    } else {
      return this.sendDirectAPI(provider, model, prompt, options);
    }
  }
}
```

**Credit Savings:**
- Step 5 (API Layer): 200 → 50-75 credits
- Step 6 (Response Display): 150 → 100 credits (simpler unified format)
- **Total Savings:** ~175-200 credits

---

## 🔍 TEST PLAN

Once Clacky provides documentation:

### 1. Simple Test (5 minutes)
```typescript
// Test basic call to Claude Sonnet 4.5
const response = await clackyLLM.send({
  provider: 'anthropic',
  model: 'claude-sonnet-4-5-20250929',
  messages: [
    { role: 'user', content: 'Say "Hello from Clacky LLM!"' }
  ]
});
console.log(response);
```

### 2. Multi-Provider Test (10 minutes)
- Send same prompt to Claude, GPT-4o, and Gemini
- Compare response formats
- Verify all return successfully

### 3. Parameter Test (5 minutes)
- Test temperature, max_tokens settings
- Verify parameters work as expected

### 4. Error Test (5 minutes)
- Send invalid request
- Verify error handling works
- Check error message quality

**Total Investigation Time:** ~25 minutes (~5-10 credits)

---

## 📝 RESPONSE TEMPLATE

After investigation, document findings:

```
✅ CLACKY LLM INVESTIGATION RESULTS

📊 MUST-HAVE FEATURES:
- [ ] Claude Sonnet/Opus/Haiku support: [YES/NO]
- [ ] GPT-4o support: [YES/NO]
- [ ] Gemini support: [YES/NO]
- [ ] System prompts: [YES/NO]
- [ ] Full text responses: [YES/NO]
- [ ] Error handling: [YES/NO]

📊 HIGH-VALUE FEATURES:
- [ ] Streaming: [YES/NO/PARTIAL]
- [ ] Token counts: [YES/NO]
- [ ] Configurable params: [YES/NO]
- [ ] No API keys needed: [YES/NO]
- [ ] Consistent format: [YES/NO]

⚠️ LIMITATIONS DISCOVERED:
[List any dealbreakers or concerns]

💡 RECOMMENDATION:
[ ] Use Clacky LLM exclusively
[ ] Build dual-mode architecture
[ ] Stick with original direct API plan

🎯 REASON:
[Brief explanation]

📉 CREDIT IMPACT:
Original estimate: 1,735 credits
With Clacky LLM: [new estimate] credits
Savings: [amount] credits ([percentage]%)
```

---

## 🚀 NEXT STEPS BASED ON OUTCOME

### Outcome A: Clacky LLM is Perfect ✅
1. Simplify Step 3 settings (remove API key inputs for now)
2. Proceed with Step 4 (Prompt UI)
3. Build Step 5 using Clacky LLM (~50 credits instead of 200)
4. Add direct API option later if needed

### Outcome B: Dual-Mode Approach ⚖️
1. Keep current Step 3 settings as-is
2. Add "Integration Mode" toggle in settings
3. Build abstraction layer that works with both
4. Start with Clacky LLM, add direct API in Phase 3

### Outcome C: Original Plan ❌
1. Keep everything as planned
2. Proceed with custom API layer (Step 5 ~200 credits)
3. Full control, higher complexity

---

## 💬 QUESTIONS FOR CLACKY

If the documentation is unclear, follow up with:

1. "Can you show me a complete working example in TypeScript?"
2. "What's the difference between using Clacky LLM vs direct API calls?"
3. "Are there any rate limits or costs I should know about?"
4. "How do I handle streaming responses?"
5. "What models are available right now, with their exact IDs?"

---

Ready to investigate! Copy the investigation prompt above and paste it into Clacky. 🚀
