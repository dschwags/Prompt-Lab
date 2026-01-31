#!/bin/bash

# OpenRouter Integration - Installation Script
# FILE: INSTALL-OPENROUTER-20250129-0252.sh
#
# This script installs all OpenRouter files with proper backups and explicit renames
# All timestamped files will be renamed to their correct final names

echo "🚀 OpenRouter Integration - Installation"
echo "=========================================="
echo ""
echo "Timestamp: 20250129-0252"
echo ""

# Get current timestamp for backups
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Check if running from correct directory
if [ ! -d "src" ]; then
    echo "❌ Error: Must run from project root directory (where src/ folder is)"
    exit 1
fi

echo "📦 Step 1: Creating backups with timestamp: ${BACKUP_TIMESTAMP}"
mkdir -p backups/pre-openrouter-${BACKUP_TIMESTAMP}

# Backup existing files if they exist
BACKED_UP=0

if [ -f "src/components/PromptEditor/PromptEditor.tsx" ]; then
    cp src/components/PromptEditor/PromptEditor.tsx backups/pre-openrouter-${BACKUP_TIMESTAMP}/PromptEditor-BACKUP-${BACKUP_TIMESTAMP}.tsx
    echo "✅ Backed up: PromptEditor.tsx → backups/pre-openrouter-${BACKUP_TIMESTAMP}/PromptEditor-BACKUP-${BACKUP_TIMESTAMP}.tsx"
    BACKED_UP=$((BACKED_UP + 1))
fi

if [ -f "src/components/Settings/SettingsModal.tsx" ]; then
    cp src/components/Settings/SettingsModal.tsx backups/pre-openrouter-${BACKUP_TIMESTAMP}/SettingsModal-BACKUP-${BACKUP_TIMESTAMP}.tsx
    echo "✅ Backed up: SettingsModal.tsx → backups/pre-openrouter-${BACKUP_TIMESTAMP}/SettingsModal-BACKUP-${BACKUP_TIMESTAMP}.tsx"
    BACKED_UP=$((BACKED_UP + 1))
fi

if [ -f "src/components/Settings/SettingsPanel.tsx" ]; then
    cp src/components/Settings/SettingsPanel.tsx backups/pre-openrouter-${BACKUP_TIMESTAMP}/SettingsPanel-BACKUP-${BACKUP_TIMESTAMP}.tsx
    echo "✅ Backed up: SettingsPanel.tsx → backups/pre-openrouter-${BACKUP_TIMESTAMP}/SettingsPanel-BACKUP-${BACKUP_TIMESTAMP}.tsx"
    BACKED_UP=$((BACKED_UP + 1))
fi

if [ $BACKED_UP -eq 0 ]; then
    echo "ℹ️  No existing files to backup"
else
    echo "✅ Backed up $BACKED_UP file(s)"
fi

echo ""
echo "📁 Step 2: Creating directories..."
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/components/PromptEditor
mkdir -p src/components/Settings
echo "✅ Directories ready"

echo ""
echo "📄 Step 3: Installing and renaming timestamped files..."
echo ""

# Install OpenRouter service
echo "Installing: openrouter.service-20250129-0252.ts"
if [ -f "Claude_upload/openrouter.service-20250129-0252.ts" ]; then
    cp Claude_upload/openrouter.service-20250129-0252.ts src/services/openrouter.service.ts
    echo "  ✅ Claude_upload/openrouter.service-20250129-0252.ts"
    echo "  → src/services/openrouter.service.ts"
else
    echo "  ❌ MISSING: Claude_upload/openrouter.service-20250129-0252.ts"
fi
echo ""

# Install models definitions
echo "Installing: models-20250129-0252.ts"
if [ -f "Claude_upload/models-20250129-0252.ts" ]; then
    cp Claude_upload/models-20250129-0252.ts src/utils/models.ts
    echo "  ✅ Claude_upload/models-20250129-0252.ts"
    echo "  → src/utils/models.ts"
else
    echo "  ❌ MISSING: Claude_upload/models-20250129-0252.ts"
fi
echo ""

# Install updated PromptEditor
echo "Installing: PromptEditor-20250129-0252.tsx"
if [ -f "Claude_upload/PromptEditor-20250129-0252.tsx" ]; then
    cp Claude_upload/PromptEditor-20250129-0252.tsx src/components/PromptEditor/PromptEditor.tsx
    echo "  ✅ Claude_upload/PromptEditor-20250129-0252.tsx"
    echo "  → src/components/PromptEditor/PromptEditor.tsx"
else
    echo "  ❌ MISSING: Claude_upload/PromptEditor-20250129-0252.tsx"
fi
echo ""

# Install updated Settings
echo "Installing: SettingsModal-20250129-0252.tsx"
if [ -f "Claude_upload/SettingsModal-20250129-0252.tsx" ]; then
    # Check if SettingsPanel exists (might need to rename to SettingsModal)
    if [ -f "src/components/Settings/SettingsPanel.tsx" ] && [ ! -f "src/components/Settings/SettingsModal.tsx" ]; then
        echo "  ℹ️  Renaming SettingsPanel → SettingsModal"
    fi
    
    cp Claude_upload/SettingsModal-20250129-0252.tsx src/components/Settings/SettingsModal.tsx
    echo "  ✅ Claude_upload/SettingsModal-20250129-0252.tsx"
    echo "  → src/components/Settings/SettingsModal.tsx"
    
    # Remove old SettingsPanel if it exists
    if [ -f "src/components/Settings/SettingsPanel.tsx" ]; then
        rm src/components/Settings/SettingsPanel.tsx
        echo "  🗑️  Removed old: src/components/Settings/SettingsPanel.tsx"
    fi
else
    echo "  ❌ MISSING: Claude_upload/SettingsModal-20250129-0252.tsx"
fi
echo ""

echo "🔧 Step 4: Verifying installation..."
ERRORS=0

echo ""
echo "Checking installed files:"

if [ ! -f "src/services/openrouter.service.ts" ]; then
    echo "❌ Missing: src/services/openrouter.service.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/services/openrouter.service.ts"
fi

if [ ! -f "src/utils/models.ts" ]; then
    echo "❌ Missing: src/utils/models.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/utils/models.ts"
fi

if [ ! -f "src/components/PromptEditor/PromptEditor.tsx" ]; then
    echo "❌ Missing: src/components/PromptEditor/PromptEditor.tsx"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/components/PromptEditor/PromptEditor.tsx"
fi

if [ ! -f "src/components/Settings/SettingsModal.tsx" ]; then
    echo "❌ Missing: src/components/Settings/SettingsModal.tsx"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/components/Settings/SettingsModal.tsx"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ Installation complete!"
    echo ""
    echo "📋 Files installed from timestamped originals:"
    echo "   openrouter.service-20250129-0252.ts → openrouter.service.ts"
    echo "   models-20250129-0252.ts → models.ts"
    echo "   PromptEditor-20250129-0252.tsx → PromptEditor.tsx"
    echo "   SettingsModal-20250129-0252.tsx → SettingsModal.tsx"
    echo ""
    echo "📦 Backups saved to: backups/pre-openrouter-${BACKUP_TIMESTAMP}/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run: npm run build"
    echo "2. Fix any TypeScript errors if they appear"
    echo "3. Refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)"
    echo "4. Open Settings and add OpenRouter API key"
    echo "5. Test with multiple models!"
    echo ""
    echo "🎉 You now have access to 200+ models!"
    echo ""
    echo "Get your free OpenRouter API key:"
    echo "→ https://openrouter.ai"
else
    echo "❌ Installation incomplete - $ERRORS file(s) missing"
    echo ""
    echo "Make sure these files are in Claude_upload/:"
    echo "  - openrouter.service-20250129-0252.ts"
    echo "  - models-20250129-0252.ts"
    echo "  - PromptEditor-20250129-0252.tsx"
    echo "  - SettingsModal-20250129-0252.tsx"
    echo ""
    echo "Then run this script again."
    exit 1
fi
