#!/bin/bash
# 🚀 Quick Start: Install Prompt Lab in All 5 Projects
# Run this from Prompt-Lab project directory

echo "🎯 Installing Prompt Lab v2.0 in all projects..."
echo ""

PROJECTS=(
  "slyce-beta"
  "tapestrAI-copilot"
  "hallmark"
  "tapestrai-v3"
  "tapestrAI-Artifact-id"
)

SUCCESS=()
FAILED=()

for PROJECT in "${PROJECTS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Installing in: $PROJECT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if bash install-prompt-lab.sh "$PROJECT"; then
    SUCCESS+=("$PROJECT")
    echo "✅ $PROJECT - SUCCESS"
  else
    FAILED+=("$PROJECT")
    echo "❌ $PROJECT - FAILED"
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Installation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Successful: ${#SUCCESS[@]}"
for proj in "${SUCCESS[@]}"; do
  echo "   - $proj"
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "❌ Failed: ${#FAILED[@]}"
  for proj in "${FAILED[@]}"; do
    echo "   - $proj"
  done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Installation Complete!"
echo ""
echo "To start Prompt Lab in any project:"
echo "  cd /home/runner/workspace/{project}/.prompt-lab/server"
echo "  node index.js"
echo ""
echo "🔐 Password: promptlab2024"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
