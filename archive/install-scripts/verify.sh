#!/bin/bash
# Quick verification script
# Run this to verify everything compiles

echo "🔍 Verifying Prompt Lab v2.0..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# Check TypeScript compilation
echo ""
echo "📝 Checking TypeScript..."
cd /home/runner/app
if npx tsc --noEmit 2>&1 | grep -q "error"; then
    echo "❌ TypeScript errors found:"
    npx tsc --noEmit 2>&1 | head -10
    exit 1
else
    echo "✅ TypeScript compiles successfully"
fi

# Check required files
echo ""
echo "📁 Checking required files..."
for file in "setup.sh" "start.sh" "server/index.js" "src/v2/App.tsx" ".env.example"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

echo ""
echo "✅ Verification complete!"
echo ""
echo "📌 To start:"
echo "   1. npm run setup   (first time only)"
echo "   2. npm run dev"
echo "   3. Open http://localhost:5173"
