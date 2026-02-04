#!/bin/bash
# Prompt Lab v2.0 - Combined Start Script
# Starts both Express server and Vite dev server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Prompt Lab v2.0...${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Run 'bash setup.sh' first!${NC}"
    exit 1
fi

# Load environment variables
source .env

# Set defaults if not specified
export PORT=${PORT:-3001}
export WORKSPACE_DIR=${WORKSPACE_DIR:-/home/runner/workspace}

# Check workspace directory
if [ ! -d "$WORKSPACE_DIR" ]; then
    echo -e "${YELLOW}⚠️  Workspace directory ($WORKSPACE_DIR) does not exist.${NC}"
    echo -e "${YELLOW}   Creating it now...${NC}"
    mkdir -p "$WORKSPACE_DIR"
fi

# Start Express API server in background
echo -e "${GREEN}📡 Starting API server on port $PORT...${NC}"
node server/index.js &
API_PID=$!

# Give server time to start
sleep 2

# Check if server started successfully
if ! kill -0 $API_PID 2>/dev/null; then
    echo -e "${RED}❌ Failed to start API server${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API server running (PID: $API_PID)${NC}"

# Start Vite dev server
echo ""
echo -e "${GREEN}🎨 Starting Vite dev server...${NC}"
echo ""
echo -e "${YELLOW}   Open: http://localhost:5173${NC}"
echo -e "${YELLOW}   Login: password from .env${NC}"
echo ""

# Trap Ctrl+C to kill both servers
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    kill $API_PID 2>/dev/null || true
    exit 0
}
trap cleanup INT

# Run vite
npm run dev

# If vite exits, cleanup
cleanup
