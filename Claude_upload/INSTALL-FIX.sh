#!/bin/bash

echo "🔧 Installing Step 4 FIX - Persistence Bug"
echo ""

# Backup the current file
if [ -f "src/context/PromptContext.tsx" ]; then
  cp src/context/PromptContext.tsx src/context/PromptContext.tsx.before-fix
  echo "📋 Backed up old file to PromptContext.tsx.before-fix"
fi

# Replace with fixed version
if [ -f "Claude_upload/STEP4-FIX-context-PromptContext.tsx" ]; then
  mv Claude_upload/STEP4-FIX-context-PromptContext.tsx src/context/PromptContext.tsx
  echo "✅ Installed fixed PromptContext.tsx"
else
  echo "❌ Fix file not found in Claude_upload/"
  exit 1
fi

echo ""
echo "✨ Fix installed!"
echo ""
echo "Test it:"
echo "1. npm run dev"
echo "2. Type something in both textareas"
echo "3. Wait for 'Saved [time]'"
echo "4. Refresh the page (F5)"
echo "5. Your text should still be there! ✅"
echo ""
