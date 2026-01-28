# 🎬 STEP 5 MVP: MINIMUM VIABLE SEND

---

## 🤔 What We're Doing (Plain English):

Build the **smallest thing that proves the loop works:**
- Type a prompt
- Click Send
- Claude responds
- See the response on screen

**That's it. No fancy features yet.**

Following Clacky CEO's advice: "Small verifiable end-to-end loop first"

---

## 📦 What You're Installing:

**3 Files:**
1. ✅ **api.service.ts** - Talks to Claude API (one simple function)
2. ✅ **ResponseViewer.tsx** - Shows Claude's response (basic display)
3. ✅ **PromptEditor.tsx** - Updated to call the API when you click Send

**What This Does:**
- Sends your prompt to Claude Sonnet 4.5
- Gets the response back
- Shows it on screen with token counts and cost

**What This Doesn't Do (Yet):**
- ❌ No streaming (text appears all at once)
- ❌ No model selection (hardcoded to Sonnet 4.5)
- ❌ No caching
- ❌ No fancy error handling

**We'll add those in Phase B after we prove this works!**

---

## 📥 STEP 1: Download Files

Download these **4 files**:
- ✅ STEP5-services-api.service.ts
- ✅ STEP5-components-ResponseViewer.tsx
- ✅ STEP5-REPLACE-components-PromptEditor.tsx
- ✅ INSTALL-STEP5-MVP.sh

---

## 📂 STEP 2: Dump Into Claude_upload

Drag all 4 files into your `Claude_upload` folder.

---

## 🎬 STEP 3: INSTALL WITH CLACKY

### 🤔 What We're Doing:
Run a script that moves the new files to the right places automatically.

### 📝 The Commands:
```bash
chmod +x Claude_upload/INSTALL-STEP5-MVP.sh
./Claude_upload/INSTALL-STEP5-MVP.sh
```

### 🔍 Breaking It Down:

**Command 1:** `chmod +x Claude_upload/INSTALL-STEP5-MVP.sh`
- **chmod** = change mode (change file permissions)
- **+x** = add execute permission (make it runnable)
- **Translation:** "Computer, unlock this script so I can run it"

**Command 2:** `./Claude_upload/INSTALL-STEP5-MVP.sh`
- **./** = run this file from here
- **Translation:** "Computer, run the install script now"

### 📋 COPY THIS TO CLACKY LITE:
```
Install Step 5 MVP files:

First, make the script runnable:
chmod +x Claude_upload/INSTALL-STEP5-MVP.sh

Then run the install:
./Claude_upload/INSTALL-STEP5-MVP.sh

What this does:
- Creates src/services/ directory if needed
- Backs up your old PromptEditor.tsx (saved as .before-step5)
- Installs api.service.ts in src/services/
- Installs ResponseViewer.tsx in src/components/PromptEditor/
- Replaces PromptEditor.tsx with the updated version
```

### ✅ How To Know It Worked:
You'll see:
- ✅ "Backed up PromptEditor.tsx"
- ✅ "Installed api.service.ts"
- ✅ "Installed ResponseViewer.tsx"  
- ✅ "Replaced PromptEditor.tsx"
- ✨ "Step 5 MVP installed!"

### ⚠️ If Something Goes Wrong:
If it says "file not found", the files aren't in Claude_upload. Re-download and try again.

---

## 🧪 STEP 4: TEST IT

### 📝 The Command:
```bash
npm run dev
```

### 📋 COPY THIS TO CLACKY LITE:
```
Start the dev server to test:
npm run dev

This will start your app at http://localhost:5173
```

### ✅ How To Test:

1. **Open Settings** (click ⚙️ Settings button)
2. **Add Your Claude API Key** (if you haven't already)
   - Get one at: https://console.anthropic.com/settings/keys
3. **Close Settings**
4. **Type a simple prompt** in the User Prompt box:
   ```
   Say hello and tell me what you can do
   ```
5. **Click "Send" button** (or press Cmd+Enter)
6. **Wait 2-3 seconds**
7. **See Claude's response appear!** ✨

### ✅ Success Looks Like:
- Loading spinner appears briefly
- Response shows up with:
  - Claude's answer to your prompt
  - Token counts (In: XXX tokens | Out: XXX tokens)
  - Cost (Cost: $0.XXXX)

### ⚠️ Common Errors:

**"Please add your Claude API key in Settings"**
- Solution: Add your API key in Settings first

**"Claude API error: ..."**
- Check your API key is correct
- Make sure you have credits in your Anthropic account

**Nothing happens when you click Send**
- Check browser console (F12) for errors
- Make sure you typed something in User Prompt

---

## 🎉 WHEN IT WORKS:

**You just built your first working loop!** 🚀

Type prompt → Click send → See response

This is exactly what the Clacky CEO meant by "small verifiable end-to-end loop first."

---

## 📊 COMMIT TO GIT

### 📝 The Commands:
```bash
git add .
git commit -m "Step 5 MVP: Minimum Viable Send - WORKING ✅"
git push
```

### 📋 COPY THIS TO CLACKY LITE:
```
Save Step 5 MVP to Git:

Stage all changes:
git add .

Commit with message:
git commit -m "Step 5 MVP: Minimum Viable Send - WORKING ✅"

Push to GitHub:
git push
```

---

## 🚀 WHAT'S NEXT: PHASE B

After this works, we'll add:
- 📡 **Streaming** (see text appear word by word)
- 🎯 **Model selection** (choose between Opus, Sonnet, Haiku)
- ⚡ **Better error handling**
- 💾 **Save responses to IndexedDB**

But first: **Prove the loop works!**

---

## 💡 WHY THIS APPROACH?

Following Clacky CEO's wisdom:
> "Small verifiable end-to-end loop first, then continuously refining as implementation reveals real constraints"

Instead of planning all features upfront:
1. ✅ Build simplest working version
2. ✅ Test it. Break it. Learn.
3. ✅ Then add features based on real needs

**Credits saved:** ~50 credits by doing MVP first instead of full architecture!

---

## 📞 NEED HELP?

If anything breaks or doesn't work, just tell me:
- What step you're on
- What error you're seeing
- Screenshot if helpful

We'll figure it out! 🤝
