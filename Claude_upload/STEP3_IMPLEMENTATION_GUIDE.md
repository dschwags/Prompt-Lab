# Step 3: Settings & API Key Management - Implementation Guide

## 📋 FILE PLACEMENT

Copy each file to the correct location in your Clacky project:

### Constants
- **providers.ts** → `src/constants/providers.ts`

### Services
- **settings.service.ts** → `src/services/settings.service.ts`

### Components
- **SettingsPanel.tsx** → `src/components/Settings/SettingsPanel.tsx`
- **ApiKeyInput.tsx** → `src/components/Settings/ApiKeyInput.tsx`
- **ProviderConfig.tsx** → `src/components/Settings/ProviderConfig.tsx`
- **ExportImport.tsx** → `src/components/Settings/ExportImport.tsx`

### Root Components (Replace Existing)
- **App.tsx** → `src/App.tsx` (REPLACE existing file)

---

## 🚀 IMPLEMENTATION STEPS

### 1. Create Directory Structure
```bash
mkdir -p src/constants
mkdir -p src/components/Settings
```

### 2. Copy Files in Order
Upload files to Clacky in this order:

1. **providers.ts** (constants)
2. **settings.service.ts** (service layer)
3. **ApiKeyInput.tsx** (component)
4. **ProviderConfig.tsx** (component)
5. **ExportImport.tsx** (component)
6. **SettingsPanel.tsx** (main component)
7. **App.tsx** (replace existing)

### 3. Verify File Structure
Your project should look like:
```
src/
├── constants/
│   └── providers.ts
├── services/
│   ├── db.service.ts (existing)
│   └── settings.service.ts (new)
├── components/
│   └── Settings/
│       ├── SettingsPanel.tsx
│       ├── ApiKeyInput.tsx
│       ├── ProviderConfig.tsx
│       └── ExportImport.tsx
├── types/
│   └── index.ts (existing)
├── App.tsx (replaced)
└── main.tsx (existing)
```

---

## ✅ VERIFICATION CHECKLIST

After uploading all files:

### Dev Server Check
1. Run `npm run dev`
2. Verify no TypeScript errors
3. Check browser console for errors

### UI Check
1. Click "⚙️ Settings" button in header
2. Verify modal opens
3. Check all 3 tabs are clickable

### API Keys Tab
1. See all 4 providers (OpenAI, Anthropic, Google, Cohere)
2. Click "Get API Key →" links (should open in new tab)
3. Enter a test key → click Save
4. Verify "✅ Configured" appears
5. Click show/hide toggle → verify it works
6. Click Clear → verify key removed

### Default Models Tab
1. Without API key → dropdown should be disabled
2. Add API key to a provider
3. Verify dropdown enables
4. Select a model → verify it saves
5. Reopen settings → verify selection persists

### Backup & Restore Tab
1. Click "📥 Export Settings" → verify JSON downloads
2. Check "Include API keys" → export again → verify keys in JSON
3. Click "📤 Import Settings" → upload exported file
4. Verify settings restored
5. Click "🔄 Reset to Defaults" → confirm dialog appears
6. Verify reset works

### IndexedDB Check
1. Open DevTools → Application → IndexedDB
2. Expand `prompt-lab-db` → `settings`
3. Verify `default` record exists
4. Check `apiKeys` and `defaultModels` objects

---

## 🎯 EXPECTED BEHAVIOR

### API Key Storage
- Keys stored in IndexedDB (not localStorage)
- Keys masked by default (password input)
- Show/hide toggle reveals actual key
- Clear button removes key completely

### Default Models
- Dropdowns disabled until API key configured
- Shows context window size for each model
- Persists across page reloads
- Used as default when creating prompts (Step 4+)

### Export/Import
- Export creates timestamped JSON file
- API keys optional in export (security)
- Import merges or replaces based on checkbox
- Reset clears everything

---

## ⚠️ COMMON GOTCHAS

### TypeScript Errors
- If you see "Cannot find module" errors, verify file paths match exactly
- Settings interface should already exist in `src/types/index.ts` from Step 1

### Import Paths
- All component imports use relative paths (`../../services/...`)
- Verify your folder structure matches the guide

### Modal Not Appearing
- Check that `z-50` isn't being overridden by other styles
- Verify `bg-black/50` backdrop is visible (semi-transparent black)

### API Keys Not Saving
- Check browser console for IndexedDB errors
- Verify `db.service.ts` has `settings` store defined
- Make sure `await` is used in all async operations

---

## 📦 CLACKY-SPECIFIC NOTES

### File Upload Order Matters
Upload constants → services → components in that order to avoid temporary errors while Clacky processes files.

### Watch for TypeScript Compilation
After each file upload, wait for Clacky to finish TypeScript compilation before uploading the next file.

### Hot Module Reload
Clacky's dev server should automatically reload after each file. If changes don't appear, try:
1. Hard refresh browser (Cmd/Ctrl + Shift + R)
2. Restart dev server in Clacky

---

## 🎨 UI FEATURES

### Visual Feedback
- ✅ Green checkmark when API key configured
- ⚠️ Warning when API key missing
- 👁️ Show/hide key toggle
- Color-coded buttons (blue=save, red=delete/reset)

### Accessibility
- Tab navigation works throughout
- Focus states on all inputs
- Disabled states clearly visible
- Confirmation dialog for destructive actions

### Responsive Design
- Modal is centered and scrollable
- Max width 3xl (768px)
- Max height 90vh
- Works on mobile/tablet

---

## 🔒 SECURITY NOTES

### Current Implementation
- API keys stored in browser IndexedDB (plain text)
- Keys not sent to any external server
- Keys only used for direct API calls
- Export option warns about API key inclusion

### Future Enhancements (Optional)
- Add Web Crypto API encryption at rest
- Add session timeout for sensitive operations
- Add master password option
- Add environment variable option for teams

---

## 📝 CHECKPOINT SUMMARY TEMPLATE

After successful implementation, commit with:

```
✅ CHECKPOINT: Step 3 - Settings & API Key Management

📎 SOURCE PROMPT: Step 3 Implementation Guide

📁 FILES CREATED:
- src/constants/providers.ts (4 providers, 11 models defined)
- src/services/settings.service.ts (CRUD operations)
- src/components/Settings/SettingsPanel.tsx (main modal)
- src/components/Settings/ApiKeyInput.tsx (reusable input)
- src/components/Settings/ProviderConfig.tsx (model selection)
- src/components/Settings/ExportImport.tsx (backup/restore)

📁 FILES MODIFIED:
- src/App.tsx (added settings button & modal)

✅ ACHIEVEMENTS:
- Settings modal with 3 tabs functional
- API key management for OpenAI, Anthropic, Google, Cohere
- Show/hide toggle for API keys working
- Default model selection per provider
- Export/import settings with optional API key inclusion
- Reset to defaults with confirmation
- All data persists in IndexedDB
- TypeScript compilation passes
- No console errors

⚠️ GOTCHAS ENCOUNTERED:
[Fill in based on your experience]

💡 LEARNINGS:
[Fill in insights for future prompts]
```

---

## 🎯 NEXT STEPS

After Step 3 is complete and committed:
- **Step 4**: Prompt Management UI (create, edit, version prompts)
- **Step 5**: API Integration (execute prompts against providers)
- **Step 6**: Response Management (display, compare results)
- **Step 7**: Rules Validation Engine
- **Step 8**: Export & Reporting

Settings are now ready to support the core prompt testing workflow! 🚀
