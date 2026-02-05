#!/bin/bash
echo "Starting Prompt Lab server..."

# Build for production if dist directory is empty
if [ ! "$(ls -A dist 2>/dev/null)" ]; then
  echo "Building application..."
  npm run build
fi

# Run the server
node server/index.js
