# ✅ QUICK CHECKLIST - TIMESTAMPED INSTALL

**Version:** 20260128-201717

---

## 📋 DO THESE IN ORDER:

### 1. Download
```
□ Download: SettingsModal-20260128-201717.tsx
□ Verify filename has timestamp: 20260128-201717
```

### 2. Upload to Clacky
```
□ Upload to Claude_upload/ folder
```

### 3. DELETE Old File (Copy to Clacky Lite)
```bash
ls -lh Claude_upload/SettingsModal-20260128-201717.tsx
rm -f src/components/Settings/SettingsModal.tsx
ls -lh src/components/Settings/
```
**Verify:** Old file is GONE

### 4. RENAME New File (Copy to Clacky Lite)
```bash
cp Claude_upload/SettingsModal-20260128-201717.tsx src/components/Settings/SettingsModal.tsx
ls -lh src/components/Settings/SettingsModal.tsx
head -n 5 src/components/Settings/SettingsModal.tsx
```
**Verify:** See "TIMESTAMP: 20260128-201717"

### 5. Build (Copy to Clacky Lite)
```bash
npm run build
```
**Verify:** Build succeeds

### 6. Hard Refresh Browser
```
□ Mac: Cmd + Shift + R
□ Windows: Ctrl + Shift + R
```

### 7. Test
```
□ Open Settings
□ See version: (v20260128-201717) in header
□ Modal is CENTERED on screen
□ Test Key buttons visible
□ Click Test Key → Works!
```

---

## ✅ SUCCESS = Version Number Visible

**Screenshot showing:** `⚙️ Settings (v20260128-201717)`

**That's proof you have the right file!**
