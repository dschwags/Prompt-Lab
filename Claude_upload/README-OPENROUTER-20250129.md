# 🚀 OpenRouter Integration - Installation Guide
**Version:** 20250129-0252

## 📦 What You're Getting

**4 Code Files (Timestamped):**
1. `openrouter.service-20250129-0252.ts` → Will become `openrouter.service.ts`
2. `models-20250129-0252.ts` → Will become `models.ts`
3. `PromptEditor-20250129-0252.tsx` → Will become `PromptEditor.tsx`
4. `SettingsModal-20250129-0252.tsx` → Will become `SettingsModal.tsx`

**Installation Script:**
5. `INSTALL-OPENROUTER-20250129-0252.sh` - Handles all backups and renames

**Documentation:**
6. `README-OPENROUTER-20250129.md` - This file
7. `QUICK-CHECKLIST-20250129.md` - Quick reference

**What This Unlocks:**
- ✅ 200+ models from multiple providers
- ✅ GPT-4, Claude, Gemini, Llama, Mistral, Cohere
- ✅ Single OpenRouter API key for all
- ✅ Test your "pet question" across 10+ models
- ✅ **Discover model personality patterns at scale!**

---

## 📋 Installation Steps

### Step 1: Download All 7 Files

Download all files listed above (they're provided as downloadable files by Claude).

### Step 2: Upload to Clacky

Upload all 7 files to `Claude_upload/` folder in your Clacky project.

**Important:** Keep the timestamped names! The install script will rename them.

### Step 3: Run Installation Script

**Copy this to Clacky Lite:**

```bash
# Make script executable
chmod +x Claude_upload/INSTALL-OPENROUTER-20250129-0252.sh

# Run installation (automatically backs up old files and renames new ones)
./Claude_upload/INSTALL-OPENROUTER-20250129-0252.sh

# Build project
npm run build
```

### Step 4: Verify Build

Check that build passes. You should see:
```
✓ built in XXXms
```

**What the install script does:**
1. ✅ Creates timestamped backups of your old files
2. ✅ Copies timestamped files from Claude_upload/
3. ✅ Renames them to correct final names
4. ✅ Shows exactly what was moved where

**Example output:**
```
Installing: openrouter.service-20250129-0252.ts
  ✅ Claude_upload/openrouter.service-20250129-0252.ts
  → src/services/openrouter.service.ts
```

### Step 5: Refresh Browser

Hard refresh to load new code:
- **Mac:** Cmd + Shift + R
- **Windows:** Ctrl + Shift + R

---

## 🔑 Getting Your OpenRouter API Key

### Step 1: Create Account

1. Go to: https://openrouter.ai
2. Sign up (free account)
3. You get $1 free credit to test

### Step 2: Get API Key

1. Go to: https://openrouter.ai/keys
2. Click "Create Key"
3. Copy your key (starts with `sk-or-v1-...`)

### Step 3: Add to Prompt Lab

1. Open Prompt Lab in browser
2. Click Settings (⚙️ button)
3. Go to "API Keys" tab
4. Find "OpenRouter" section (should be second)
5. Paste your key
6. Click "Test Key" button
7. Should show: "✓ Key is valid and working"

---

## 🧪 Testing OpenRouter

### Test 1: Select OpenRouter Model

1. Look at model dropdown (near Send button)
2. Should now show **15+ models** grouped by provider:
   - Anthropic (Claude)
   - OpenAI (GPT)
   - Google (Gemini)
   - Meta (Llama)
   - Mistral
   - Cohere

3. Select: **GPT-4 Turbo (OpenAI)**
4. Notice it shows "(OR)" indicating OpenRouter

### Test 2: Send to GPT-4

1. Type prompt: "Say hello in exactly 5 words"
2. Click Send
3. Should get response from GPT-4
4. Check response shows model: `openai/gpt-4-turbo`

### Test 3: The Pet Question (Your Discovery!)

Send this to 5 different models:
```
If you were human, and you lived near the equator and could have one pet, what would it be?
```

**Test with:**
1. Claude Opus 4.5 (Anthropic Direct)
2. Claude Sonnet 4.5 (Anthropic Direct)
3. GPT-4 Turbo (OpenRouter)
4. Gemini 1.5 Pro (OpenRouter)
5. Llama 3.1 70B (OpenRouter)

**Document the responses!** See if patterns emerge:
- Which models say parrot?
- Which models choose dog?
- Do GPT-4 and Claude think differently?
- Do open-source models cluster together?

---

## 📊 Available Models

### Anthropic (Claude) - Direct API
- Opus 4.5 (Most capable)
- Sonnet 4.5 (Balanced)
- Haiku 4.5 (Fast & cheap)

### Anthropic (Claude) - Via OpenRouter
- Opus 4.5 (OR)
- Sonnet 4.5 (OR)
- Claude 3.5 Sonnet (OR)

### OpenAI (GPT) - Via OpenRouter
- GPT-4 Turbo
- GPT-4o
- o1 (Reasoning model)
- GPT-4o Mini
- GPT-3.5 Turbo

### Google (Gemini) - Via OpenRouter
- Gemini 1.5 Pro
- Gemini 1.5 Flash

### Meta (Llama) - Via OpenRouter
- Llama 3.1 70B
- Llama 3.1 8B

### Mistral - Via OpenRouter
- Mistral Large
- Mistral Medium

### Cohere - Via OpenRouter
- Command R+

---

## 🔧 How It Works

### Smart API Routing

The app automatically detects which API to use:

**Direct Anthropic models:**
- Model ID format: `claude-opus-4-20251101`
- Uses Anthropic API directly
- Requires: Anthropic API key

**OpenRouter models:**
- Model ID format: `provider/model-name` (has a `/`)
- Uses OpenRouter API
- Requires: OpenRouter API key

**You can use both!** Just add both API keys in Settings.

### Timestamped File System

All code files are delivered with timestamps (`-20250129-0252`) to:
- ✅ Prevent accidental overwrites
- ✅ Track versions clearly
- ✅ Enable easy rollback
- ✅ Show which version is loaded

The install script automatically renames them to correct final names.

---

## ✅ Success Checklist

After installation, verify:

- [ ] Model dropdown shows 15+ models
- [ ] Models grouped by provider
- [ ] OpenRouter section in Settings
- [ ] Can add OpenRouter key
- [ ] Test Key works
- [ ] Can select GPT-4 Turbo
- [ ] Can send prompt to GPT-4
- [ ] Response displays correctly
- [ ] Token counts show
- [ ] Can switch between models
- [ ] Both Anthropic direct and OpenRouter work

---

## 🐛 Troubleshooting

### Build Errors

**If you get TypeScript errors:**
1. Copy the full error message
2. Paste to Claude
3. We'll create a fix

**Common issues:**
- Missing imports: Add them to the files
- Type mismatches: Usually easy fixes
- Path issues: Check file locations

### Runtime Errors

**"OpenRouter API key required"**
→ Add your OpenRouter key in Settings

**"Invalid API key"**
→ Check your key on openrouter.ai/keys

**"Model not found"**
→ Model might be unavailable, try another

**"Rate limit exceeded"**
→ Wait a minute and try again

---

## 💰 Cost Estimates

OpenRouter costs vary by model:

**Cheap models ($0.001 per 1K tokens):**
- GPT-3.5 Turbo
- Llama 3.1 8B
- Haiku 4.5

**Medium models ($0.01 per 1K tokens):**
- GPT-4o Mini
- Gemini 1.5 Flash
- Mistral Medium

**Expensive models ($0.05+ per 1K tokens):**
- GPT-4 Turbo
- Opus 4.5
- o1 (Reasoning)

**Your $1 free credit = ~1000 cheap model responses or ~20 expensive model responses**

---

## 🎯 What To Do Next

### Immediate:
1. ✅ Install OpenRouter integration
2. ✅ Get OpenRouter API key
3. ✅ Test with GPT-4
4. ✅ Run the pet question across 5+ models
5. ✅ Document personality patterns

### Soon:
1. Build side-by-side comparison view
2. Add response tagging ("creative" vs "conventional")
3. Build model personality profiles
4. Add response history
5. Ship to users!

---

## 🎉 You're About To Validate Your Product!

**You discovered:** Models have different personalities

**You hypothesized:** 
- Opus diverges from Sonnet/Haiku
- Models cluster by provider
- Creative vs conventional thinking styles

**Now you can test it:** Across 200+ models!

**This is your product differentiation.**

**This is what people will pay for.**

---

## 📸 After Testing, Send Claude:

Screenshot showing:
1. Expanded model dropdown (15+ models)
2. Responses from 5 different models
3. Your observations about personality patterns

**Let's see if your discovery holds at scale!** 🚀

---

## 🔄 Rollback Instructions

If you need to rollback:

1. Your old files are saved in: `backups/pre-openrouter-TIMESTAMP/`
2. Each backup has a timestamp showing when it was created
3. To restore:
   ```bash
   # Find your backup
   ls backups/
   
   # Restore from backup (replace TIMESTAMP with your backup's timestamp)
   cp backups/pre-openrouter-TIMESTAMP/PromptEditor-BACKUP-TIMESTAMP.tsx src/components/PromptEditor/PromptEditor.tsx
   
   # Rebuild
   npm run build
   ```

---

**Installation Version:** 20250129-0252
**Questions?** Screenshot + send to Claude!
