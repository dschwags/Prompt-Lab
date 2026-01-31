#!/bin/bash

# Models Update - Adding Chinese Models with Clear Labeling
# FILE: INSTALL-CHINESE-MODELS-20250129-0400.sh
#
# ADDS:
# - 5 Chinese models (DeepSeek, Qwen)
# - Clear 🇨🇳 flags in names
# - Region metadata for transparency
# - Geographic diversity testing
#
# NEW TOTAL: 27 models across 7 providers

echo "🌍 Geographic Labeling - Equal Treatment for ALL Models"
echo "========================================================"
echo ""
echo "ALL MODELS NOW HAVE GEOGRAPHIC FLAGS:"
echo "  🇺🇸 US models: Anthropic, OpenAI, Google, Meta, Cohere"
echo "  🇪🇺 EU models: Mistral"
echo "  🇨🇳 Chinese models: DeepSeek, Qwen"
echo ""
echo "NEW MODELS ADDED:"
echo "  🇨🇳 DeepSeek V3.1 - Chinese flagship"
echo "  🇨🇳 DeepSeek R1 - Reasoning (rivals o1)"
echo "  🇨🇳 DeepSeek R1T Chimera - FREE reasoning"
echo "  🇨🇳 Qwen3 30B - Chinese MoE"
echo "  🇨🇳 QwQ 32B - Chinese reasoning"
echo ""
echo "PHILOSOPHY:"
echo "  ✅ Every model labeled equally"
echo "  ✅ No region is 'othered'"
echo "  ✅ Transparent for informed choice"
echo "  ✅ Fair & balanced"
echo ""
echo "Total: 27 models across 🇺🇸🇪🇺🇨🇳"
echo ""

# Get current timestamp for backups
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Check if running from correct directory
if [ ! -d "src" ]; then
    echo "❌ Error: Must run from project root directory (where src/ folder is)"
    exit 1
fi

echo "📦 Step 1: Backing up current models.ts..."
if [ -f "src/utils/models.ts" ]; then
    mkdir -p backups
    cp src/utils/models.ts backups/models-BACKUP-${BACKUP_TIMESTAMP}.ts
    echo "✅ Backup: backups/models-BACKUP-${BACKUP_TIMESTAMP}.ts"
else
    echo "⚠️  No existing models.ts found"
fi

echo ""
echo "📄 Step 2: Installing updated models.ts..."
echo ""

if [ -f "Claude_upload/models-20250129-0400-WITH-CHINESE.ts" ]; then
    cp Claude_upload/models-20250129-0400-WITH-CHINESE.ts src/utils/models.ts
    echo "✅ Installed: models-20250129-0400-WITH-CHINESE.ts → src/utils/models.ts"
else
    echo "❌ ERROR: Claude_upload/models-20250129-0400-WITH-CHINESE.ts not found"
    echo ""
    echo "Please upload the file first, then run this script again."
    exit 1
fi

echo ""
echo "🔧 Step 3: Verifying installation..."
if [ -f "src/utils/models.ts" ]; then
    echo "✅ Found: src/utils/models.ts"
else
    echo "❌ Missing: src/utils/models.ts"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 What's new:"
echo "   27 total models across 3 regions"
echo "   ALL models now have geographic flags:"
echo "     • 🇺🇸 20 US models"
echo "     • 🇪🇺 2 EU models"
echo "     • 🇨🇳 5 Chinese models"
echo ""
echo "🔍 Equal treatment features:"
echo "   • Every model shows its region"
echo "   • No model singled out"
echo "   • Fair & balanced labeling"
echo "   • Informed choice for users"
echo ""
echo "📦 Backup: backups/models-BACKUP-${BACKUP_TIMESTAMP}.ts"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run build"
echo "2. Refresh browser (Cmd+Shift+R)"
echo "3. Check dropdown - ALL models have flags"
echo "4. No region is treated differently"
echo ""
echo "🧪 Test the pet question across ALL regions:"
echo "   🇺🇸 US: Opus, o1, Gemini Pro, Sonnet, GPT-4"
echo "   🇪🇺 EU: Mistral Large"
echo "   🇨🇳 China: DeepSeek R1, QwQ 32B, DeepSeek V3.1"
echo ""
echo "Do reasoning models converge globally? Find out! 🌍"
