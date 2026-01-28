#!/bin/bash

# Step 4 Installation Script
# This script moves all files from Claude_upload to their correct locations

echo "🚀 Starting Step 4 Installation..."
echo ""

# Create directories if they don't exist
echo "📁 Creating directories..."
mkdir -p src/utils
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/components/PromptEditor

echo "✅ Directories created"
echo ""

# Move files to correct locations
echo "📦 Moving files..."

# Utils
if [ -f "Claude_upload/STEP4-utils-uuid.ts" ]; then
  mv Claude_upload/STEP4-utils-uuid.ts src/utils/uuid.ts
  echo "✅ Moved uuid.ts to src/utils/"
else
  echo "⚠️  STEP4-utils-uuid.ts not found in Claude_upload/"
fi

# Context
if [ -f "Claude_upload/STEP4-context-PromptContext.tsx" ]; then
  mv Claude_upload/STEP4-context-PromptContext.tsx src/context/PromptContext.tsx
  echo "✅ Moved PromptContext.tsx to src/context/"
else
  echo "⚠️  STEP4-context-PromptContext.tsx not found in Claude_upload/"
fi

# Hooks
if [ -f "Claude_upload/STEP4-hooks-usePrompt.ts" ]; then
  mv Claude_upload/STEP4-hooks-usePrompt.ts src/hooks/usePrompt.ts
  echo "✅ Moved usePrompt.ts to src/hooks/"
else
  echo "⚠️  STEP4-hooks-usePrompt.ts not found in Claude_upload/"
fi

# Components
if [ -f "Claude_upload/STEP4-components-TokenCounter.tsx" ]; then
  mv Claude_upload/STEP4-components-TokenCounter.tsx src/components/PromptEditor/TokenCounter.tsx
  echo "✅ Moved TokenCounter.tsx to src/components/PromptEditor/"
else
  echo "⚠️  STEP4-components-TokenCounter.tsx not found in Claude_upload/"
fi

if [ -f "Claude_upload/STEP4-components-PromptEditor.tsx" ]; then
  mv Claude_upload/STEP4-components-PromptEditor.tsx src/components/PromptEditor/PromptEditor.tsx
  echo "✅ Moved PromptEditor.tsx to src/components/PromptEditor/"
else
  echo "⚠️  STEP4-components-PromptEditor.tsx not found in Claude_upload/"
fi

# App.tsx (REPLACE existing)
if [ -f "Claude_upload/STEP4-REPLACE-App.tsx" ]; then
  # Backup existing App.tsx first
  if [ -f "src/App.tsx" ]; then
    cp src/App.tsx src/App.tsx.backup
    echo "📋 Backed up existing App.tsx to App.tsx.backup"
  fi
  mv Claude_upload/STEP4-REPLACE-App.tsx src/App.tsx
  echo "✅ Replaced App.tsx"
else
  echo "⚠️  STEP4-REPLACE-App.tsx not found in Claude_upload/"
fi

echo ""
echo "✨ Installation complete!"
echo ""
echo "🧪 Test it by running: npm run dev"
echo ""
echo "Expected behavior:"
echo "  ✅ Two textareas (System & User Prompt)"
echo "  ✅ Real-time token counts"
echo "  ✅ Auto-save after 1 second"
echo "  ✅ Cmd+Enter logs to console"
echo ""
