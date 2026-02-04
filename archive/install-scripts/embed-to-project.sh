#!/bin/bash
# Simple script to copy Prompt Lab to another project

echo "📦 Embedding Prompt Lab..."

# Create target directory
mkdir -p .prompt-lab/ui
mkdir -p .prompt-lab/server

# Copy files
cp -r src/v2/* .prompt-lab/ui/
cp -r server/* .prompt-lab/server/
cp .env.example .prompt-lab/

echo "✅ Done! Prompt Lab embedded in .prompt-lab/"
echo ""
echo "Next steps:"
echo "1. Add import to your App.tsx"
echo "2. Start the API server: node .prompt-lab/server/index.js"
