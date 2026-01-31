#!/bin/bash

# Metrics System Installation
# FILE: INSTALL-METRICS-20250129-0345.sh
#
# Adds "The Big 3" metrics tracking:
# ⏱️ Time - "Is this too slow?"
# 💰 Cost - "Is this too expensive?"
# 📊 Tokens - "Why is it expensive?"
# 📋 Copy - "Save this to my notes"
#
# Philosophy: "Lean UI, Rich Storage"
# - Display only what helps decide now
# - Store everything for future analysis

echo "📊 Metrics System - Installation"
echo "================================="
echo ""
echo "Adding: The Big 3 + Copy Button"
echo "  ⏱️ Response time tracking"
echo "  💰 Prominent cost display"
echo "  📊 Token counts (in→out)"
echo "  📋 Copy button"
echo "  💾 Background storage for future"
echo ""

# Get current timestamp for backups
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Check if running from correct directory
if [ ! -d "src" ]; then
    echo "❌ Error: Must run from project root directory (where src/ folder is)"
    exit 1
fi

echo "📦 Step 1: Creating backups..."
mkdir -p backups/pre-metrics-${BACKUP_TIMESTAMP}

# Backup existing files if they exist
BACKED_UP=0

if [ -f "src/components/PromptEditor/PromptEditor.tsx" ]; then
    cp src/components/PromptEditor/PromptEditor.tsx backups/pre-metrics-${BACKUP_TIMESTAMP}/PromptEditor-BACKUP-${BACKUP_TIMESTAMP}.tsx
    echo "✅ Backed up: PromptEditor.tsx"
    BACKED_UP=$((BACKED_UP + 1))
fi

if [ -f "src/components/PromptEditor/ResponseViewer.tsx" ]; then
    cp src/components/PromptEditor/ResponseViewer.tsx backups/pre-metrics-${BACKUP_TIMESTAMP}/ResponseViewer-BACKUP-${BACKUP_TIMESTAMP}.tsx
    echo "✅ Backed up: ResponseViewer.tsx (old version)"
    BACKED_UP=$((BACKED_UP + 1))
fi

if [ $BACKED_UP -eq 0 ]; then
    echo "ℹ️  No existing files to backup"
else
    echo "✅ Backed up $BACKED_UP file(s)"
fi

echo ""
echo "📁 Step 2: Creating directories..."
mkdir -p src/types
mkdir -p src/components/PromptEditor
echo "✅ Directories ready"

echo ""
echo "📄 Step 3: Installing files..."
echo ""

# Install ResponseMetrics types
echo "Installing: ResponseMetrics-20250129-0345.ts"
if [ -f "Claude_upload/ResponseMetrics-20250129-0345.ts" ]; then
    cp Claude_upload/ResponseMetrics-20250129-0345.ts src/types/ResponseMetrics.ts
    echo "  ✅ Claude_upload/ResponseMetrics-20250129-0345.ts"
    echo "  → src/types/ResponseMetrics.ts"
else
    echo "  ❌ MISSING: Claude_upload/ResponseMetrics-20250129-0345.ts"
fi
echo ""

# Install ResponseViewer component
echo "Installing: ResponseViewer-20250129-0345.tsx"
if [ -f "Claude_upload/ResponseViewer-20250129-0345.tsx" ]; then
    cp Claude_upload/ResponseViewer-20250129-0345.tsx src/components/PromptEditor/ResponseViewer.tsx
    echo "  ✅ Claude_upload/ResponseViewer-20250129-0345.tsx"
    echo "  → src/components/PromptEditor/ResponseViewer.tsx"
else
    echo "  ❌ MISSING: Claude_upload/ResponseViewer-20250129-0345.tsx"
fi
echo ""

# Install updated PromptEditor
echo "Installing: PromptEditor-20250129-0345.tsx"
if [ -f "Claude_upload/PromptEditor-20250129-0345.tsx" ]; then
    cp Claude_upload/PromptEditor-20250129-0345.tsx src/components/PromptEditor/PromptEditor.tsx
    echo "  ✅ Claude_upload/PromptEditor-20250129-0345.tsx"
    echo "  → src/components/PromptEditor/PromptEditor.tsx"
else
    echo "  ❌ MISSING: Claude_upload/PromptEditor-20250129-0345.tsx"
fi
echo ""

echo "🔧 Step 4: Verifying installation..."
ERRORS=0

echo ""
echo "Checking installed files:"

if [ ! -f "src/types/ResponseMetrics.ts" ]; then
    echo "❌ Missing: src/types/ResponseMetrics.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/types/ResponseMetrics.ts"
fi

if [ ! -f "src/components/PromptEditor/ResponseViewer.tsx" ]; then
    echo "❌ Missing: src/components/PromptEditor/ResponseViewer.tsx"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/components/PromptEditor/ResponseViewer.tsx"
fi

if [ ! -f "src/components/PromptEditor/PromptEditor.tsx" ]; then
    echo "❌ Missing: src/components/PromptEditor/PromptEditor.tsx"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found: src/components/PromptEditor/PromptEditor.tsx"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ Installation complete!"
    echo ""
    echo "📋 Files installed:"
    echo "   ResponseMetrics-20250129-0345.ts → ResponseMetrics.ts"
    echo "   ResponseViewer-20250129-0345.tsx → ResponseViewer.tsx"
    echo "   PromptEditor-20250129-0345.tsx → PromptEditor.tsx"
    echo ""
    echo "📦 Backups: backups/pre-metrics-${BACKUP_TIMESTAMP}/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run: npm run build"
    echo "2. Fix any TypeScript errors if they appear"
    echo "3. Refresh browser (Cmd+Shift+R)"
    echo "4. Test the new metrics display!"
    echo ""
    echo "🎉 You now have The Big 3 + Copy!"
    echo ""
    echo "What's new:"
    echo "  ⏱️ Response time (how long it took)"
    echo "  💰 Cost (more prominent)"
    echo "  📊 Tokens (input → output)"
    echo "  📋 Copy button (save to notes)"
    echo "  💾 All responses saved for future analysis"
else
    echo "❌ Installation incomplete - $ERRORS file(s) missing"
    echo ""
    echo "Make sure these files are in Claude_upload/:"
    echo "  - ResponseMetrics-20250129-0345.ts"
    echo "  - ResponseViewer-20250129-0345.tsx"
    echo "  - PromptEditor-20250129-0345.tsx"
    echo ""
    echo "Then run this script again."
    exit 1
fi
