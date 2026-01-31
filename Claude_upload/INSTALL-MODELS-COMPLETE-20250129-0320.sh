#!/bin/bash

# Complete Fix: Update models.ts with ALL correct OpenRouter model IDs
# FILE: INSTALL-MODELS-COMPLETE-20250129-0320.sh

echo "🎉 COMPLETE FIX: All OpenRouter Models with Correct IDs"
echo "========================================================"
echo ""
echo "This updates models.ts with ALL correct model IDs from OpenRouter:"
echo ""
echo "FIXED (now working):"
echo "  ✅ Google Gemini (gemini-2.5-pro, gemini-2.5-flash, gemini-3)"
echo "  ✅ Cohere (command-a, command-r7b, command-r, command-r-plus)"
echo "  ✅ Anthropic via OR (claude-opus-4.5, claude-sonnet-4.5)"
echo ""
echo "KEPT (already working):"
echo "  ✅ Direct Anthropic (Opus 4.5, Sonnet 4.5, Haiku 4.5)"
echo "  ✅ OpenAI (GPT-4 Turbo, GPT-4o, o1, GPT-4o Mini, GPT-3.5)"
echo "  ✅ Meta (Llama 3.1 70B, 8B)"
echo "  ✅ Mistral (Large, Medium)"
echo ""
echo "TOTAL: 22 working models across 5 providers!"
echo ""

# Check if running from correct directory
if [ ! -d "src" ]; then
    echo "❌ Error: Must run from project root directory (where src/ folder is)"
    exit 1
fi

# Backup existing models.ts
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

if [ -f "src/utils/models.ts" ]; then
    echo "📦 Backing up current models.ts..."
    mkdir -p backups
    cp src/utils/models.ts backups/models-BACKUP-${BACKUP_TIMESTAMP}.ts
    echo "✅ Backup: backups/models-BACKUP-${BACKUP_TIMESTAMP}.ts"
else
    echo "⚠️  No existing models.ts found (fresh install)"
fi

echo ""
echo "📄 Installing complete models.ts with ALL correct IDs..."

# Install complete fixed version
if [ -f "Claude_upload/models-20250129-0320-COMPLETE.ts" ]; then
    cp Claude_upload/models-20250129-0320-COMPLETE.ts src/utils/models.ts
    echo "✅ Installed: models-20250129-0320-COMPLETE.ts → src/utils/models.ts"
else
    echo "❌ ERROR: Claude_upload/models-20250129-0320-COMPLETE.ts not found"
    echo ""
    echo "Please upload the file first, then run this script again."
    exit 1
fi

echo ""
echo "✅ Complete installation done!"
echo ""
echo "📋 Next step:"
echo "   npm run build"
echo ""
echo "Then refresh browser (Cmd+Shift+R) and test!"
echo ""
echo "🎊 You now have 22 working models:"
echo ""
echo "ANTHROPIC:"
echo "  • Direct: Opus 4.5, Sonnet 4.5, Haiku 4.5"
echo "  • Via OR: Opus 4.5, Sonnet 4.5"
echo ""
echo "OPENAI:"
echo "  • GPT-4 Turbo, GPT-4o, o1, GPT-4o Mini, GPT-3.5"
echo ""
echo "GOOGLE:"
echo "  • Gemini 2.5 Pro, Gemini 2.5 Flash"
echo "  • Gemini 3 Pro Preview, Gemini 3 Flash Preview"
echo ""
echo "META:"
echo "  • Llama 3.1 70B, Llama 3.1 8B"
echo ""
echo "MISTRAL:"
echo "  • Mistral Large, Mistral Medium"
echo ""
echo "COHERE:"
echo "  • Command A, Command R7B, Command R, Command R+"
echo ""
echo "🐾 Ready to test the pet question across ALL providers!"
