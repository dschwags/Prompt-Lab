#!/bin/bash
# Prompt Lab v2.0 - One-Time Setup Script
# Run this once after cloning the repo

set -e

echo "🚀 Prompt Lab v2.0 Setup"
echo "========================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. You have: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "🔐 Creating .env file..."
    echo "# Prompt Lab v2.0 - Environment Configuration" > .env
    echo "" >> .env
    echo "# Password for workspace access (share with friends)" >> .env
    echo "PROMPT_LAB_PASSWORD=promptlab2024" >> .env
    echo "" >> .env
    echo "# Server port" >> .env
    echo "PORT=3001" >> .env
    echo "" >> .env
    echo "# Workspace directory (where your projects live)" >> .env
    echo "WORKSPACE_DIR=/home/runner/workspace" >> .env
    echo ""
    echo "✅ Created .env with default password: promptlab2024"
    echo "   ⚠️  IMPORTANT: Change this password before sharing!"
else
    echo ""
    echo "✅ .env file already exists (skipping)"
fi

# Create workspace directory if it doesn't exist
if [ ! -d /home/runner/workspace ]; then
    echo ""
    echo "📁 Creating workspace directory..."
    mkdir -p /home/runner/workspace
    echo "✅ Created /home/runner/workspace"
else
    echo ""
    echo "✅ Workspace directory exists"
fi

# Create sample project for testing
if [ ! -d /home/runner/workspace/slyce ]; then
    echo ""
    echo "🎯 Creating sample project 'slyce' for testing..."
    mkdir -p /home/runner/workspace/slyce/src
    mkdir -p /home/runner/workspace/slyce/.prompt-lab/threads
    
    cat > /home/runner/workspace/slyce/src/utils.ts << 'EOF'
// slyce/src/utils.ts - Sample file for testing

export function calculateTotal(items: { price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function parseJSONSafe<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
EOF

    cat > /home/runner/workspace/slyce/README.md << 'EOF'
# Slyce - Sample Project

This is a sample project for testing Prompt Lab's workspace integration.

## Structure
- `src/utils.ts` - Utility functions
- `.prompt-lab/threads/` - Saved Prompt Lab sessions

## Usage
Open Prompt Lab, click "Workspace", select "slyce" project,
browse files, and click any file to insert its contents into your prompt.
EOF

    echo "✅ Created sample project: /home/runner/workspace/slyce"
else
    echo ""
    echo "✅ Sample project 'slyce' already exists"
fi

echo ""
echo "========================"
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Open http://localhost:5173"
echo "   3. Login with password: promptlab2024"
echo "   4. Click 'Workspace' button to browse the slyce project"
echo ""
