#!/bin/bash
# Quick Installation Script for Prompt Lab v2.0
# Usage: bash install-prompt-lab.sh <project-name>

PROJECT_NAME="${1:-}"
SOURCE_PATH="/home/runner/workspace/Prompt-Lab/.prompt-lab"
PASSWORD="promptlab2024"

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Error: Please provide project name"
  echo "Usage: bash install-prompt-lab.sh <project-name>"
  echo ""
  echo "Available projects:"
  ls -1 /home/runner/workspace/ | grep -v "^Prompt-Lab$"
  exit 1
fi

PROJECT_PATH="/home/runner/workspace/$PROJECT_NAME"

if [ ! -d "$PROJECT_PATH" ]; then
  echo "❌ Error: Project directory not found: $PROJECT_PATH"
  exit 1
fi

echo "🚀 Installing Prompt Lab v2.0 in $PROJECT_NAME..."

# Step 1: Copy .prompt-lab folder
echo "📁 Copying .prompt-lab folder..."
cp -r "$SOURCE_PATH" "$PROJECT_PATH/"
if [ $? -ne 0 ]; then
  echo "❌ Failed to copy .prompt-lab folder"
  exit 1
fi

# Step 2: Create .env from template
echo "⚙️  Creating .env configuration..."
cd "$PROJECT_PATH/.prompt-lab"
cp .env.example .env

# Update .env with password
sed -i "s/PROMPT_LAB_PASSWORD=.*/PROMPT_LAB_PASSWORD=$PASSWORD/" .env

# Step 3: Create threads directory
echo "📂 Creating threads directory..."
mkdir -p threads

# Step 4: Update .gitignore
echo "🔒 Updating .gitignore..."
cd "$PROJECT_PATH"
if [ -f .gitignore ]; then
  if ! grep -q ".prompt-lab/.env" .gitignore; then
    echo "" >> .gitignore
    echo "# Prompt Lab" >> .gitignore
    echo ".prompt-lab/.env" >> .gitignore
    echo ".prompt-lab/threads/" >> .gitignore
    echo ".prompt-lab/node_modules/" >> .gitignore
  fi
else
  echo "# Prompt Lab" > .gitignore
  echo ".prompt-lab/.env" >> .gitignore
  echo ".prompt-lab/threads/" >> .gitignore
  echo ".prompt-lab/node_modules/" >> .gitignore
fi

# Step 5: Install dependencies (optional - shared node_modules)
echo "📦 Installing dependencies..."
cd .prompt-lab
npm install --silent

echo ""
echo "✅ Prompt Lab v2.0 installed successfully in $PROJECT_NAME!"
echo ""
echo "📍 Location: $PROJECT_PATH/.prompt-lab"
echo "🔐 Password: $PASSWORD"
echo ""
echo "To start the server:"
echo "  cd $PROJECT_PATH/.prompt-lab/server"
echo "  node index.js"
echo ""
echo "To access:"
echo "  - Login with password: $PASSWORD"
echo "  - Browse files from Workspace panel"
echo "  - Select '$PROJECT_NAME' from project dropdown"
