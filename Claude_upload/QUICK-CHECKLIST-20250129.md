# ✅ QUICK CHECKLIST - OpenRouter Integration
**Version:** 20250129-0252

## 📥 DOWNLOAD (7 files - all timestamped)
```
□ openrouter.service-20250129-0252.ts
□ models-20250129-0252.ts
□ PromptEditor-20250129-0252.tsx
□ SettingsModal-20250129-0252.tsx
□ INSTALL-OPENROUTER-20250129-0252.sh
□ README-OPENROUTER-20250129.md
□ QUICK-CHECKLIST-20250129.md
```

**Important:** Keep timestamped names! Install script will rename them.

## 📤 UPLOAD TO CLACKY
```
□ Upload all 7 files to Claude_upload/ folder
□ Keep the timestamps in filenames
```

## 🔧 INSTALL (Copy to Clacky Lite)
```bash
chmod +x Claude_upload/INSTALL-OPENROUTER-20250129-0252.sh
./Claude_upload/INSTALL-OPENROUTER-20250129-0252.sh
npm run build
```

## ✅ VERIFY
```
□ Build passes (no errors)
□ See "✅ Installation complete!"
□ Script shows: "Files installed from timestamped originals"
□ Old files backed up to: backups/pre-openrouter-TIMESTAMP/
```

## 🌐 GET OPENROUTER KEY
```
□ Go to: https://openrouter.ai
□ Sign up (free $1 credit)
□ Go to: https://openrouter.ai/keys
□ Create key (starts with sk-or-v1-...)
□ Copy key
```

## ⚙️ ADD KEY TO APP
```
□ Hard refresh browser (Cmd+Shift+R)
□ Click Settings ⚙️
□ Go to API Keys tab
□ Find "OpenRouter" section
□ Paste key
□ Click "Test Key"
□ See "✓ Key is valid and working"
```

## 🧪 TEST IT
```
□ Look at model dropdown
□ Should show 15+ models now (grouped by provider)
□ Select "GPT-4 Turbo (OpenAI)"
□ Type: "Say hello in 5 words"
□ Click Send
□ Get response from GPT-4 ✅
```

## 🐾 THE PET QUESTION
```
Test with 5 models:
□ Claude Opus 4.5
□ Claude Sonnet 4.5  
□ GPT-4 Turbo
□ Gemini 1.5 Pro
□ Llama 3.1 70B

Prompt: "If you were human near equator, what pet?"

Document responses!
Which say parrot?
Which say dog?
Any patterns?
```

## 🎉 SUCCESS = 
```
✅ 15+ models in dropdown
✅ Can send to GPT-4
✅ Can send to Gemini
✅ Can send to Llama
✅ Responses display correctly
✅ Timestamped files renamed correctly
✅ Old files backed up
✅ Ready to discover personality patterns!
```

---

## 🔄 IF SOMETHING GOES WRONG

**To rollback:**
```bash
# Your old files are in: backups/pre-openrouter-TIMESTAMP/
ls backups/

# Restore from backup (use your backup's timestamp)
cp backups/pre-openrouter-TIMESTAMP/*.tsx src/components/...
npm run build
```

---

**Version:** 20250129-0252
**If stuck: Screenshot + send to Claude**
