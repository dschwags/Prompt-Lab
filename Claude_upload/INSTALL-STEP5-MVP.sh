#!/bin/bash

echo "🚀 Installing Step 5 MVP - Minimum Viable Send"
echo ""

# Create services directory if it doesn't exist
mkdir -p src/services

# Backup existing files
if [ -f "src/components/PromptEditor/PromptEditor.tsx" ]; then
  cp src/components/PromptEditor/PromptEditor.tsx src/components/PromptEditor/PromptEditor.tsx.before-step5
  echo "📋 Backed up PromptEditor.tsx"
fi

# Install new files
if [ -f "Claude_upload/STEP5-services-api.service.ts" ]; then
  mv Claude_upload/STEP5-services-api.service.ts src/services/api.service.ts
  echo "✅ Installed api.service.ts"
else
  echo "❌ STEP5-services-api.service.ts not found"
  exit 1
fi

if [ -f "Claude_upload/STEP5-components-ResponseViewer.tsx" ]; then
  mv Claude_upload/STEP5-components-ResponseViewer.tsx src/components/PromptEditor/ResponseViewer.tsx
  echo "✅ Installed ResponseViewer.tsx"
else
  echo "❌ STEP5-components-ResponseViewer.tsx not found"
  exit 1
fi

if [ -f "Claude_upload/STEP5-REPLACE-components-PromptEditor.tsx" ]; then
  mv Claude_upload/STEP5-REPLACE-components-PromptEditor.tsx src/components/PromptEditor/PromptEditor.tsx
  echo "✅ Replaced PromptEditor.tsx"
else
  echo "❌ STEP5-REPLACE-components-PromptEditor.tsx not found"
  exit 1
fi

echo ""
echo "✨ Step 5 MVP installed!"
echo ""
echo "🧪 Test it:"
echo "1. npm run dev"
echo "2. Make sure you have Claude API key in Settings"
echo "3. Type a prompt and click Send"
echo "4. Watch for Claude's response!"
echo ""
