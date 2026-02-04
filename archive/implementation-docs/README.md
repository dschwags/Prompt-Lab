# Prompt Lab v2.0

AI prompt engineering workspace with multi-model comparison, color lineage, and project integration.

## Quick Start (3 Simple Steps)

```bash
# 1. Run setup (creates everything you need)
npm run setup

# 2. Start the app
npm run dev

# 3. Open http://localhost:5173
```

**Default password:** `promptlab2024`

---

## Features

- **Multi-Model Comparison**: Run prompts against multiple AI models simultaneously
- **Color Lineage**: Visual tracking of model contributions across iterations  
- **Project Integration**: Browse and reference code from your projects in `/home/runner/workspace/`
- **Session History**: Save and resume prompt sessions
- **Password Protection**: Shared password for friends/team collaboration

---

## Installation (Manual)

If you prefer to install manually:

```bash
# Install dependencies
npm install

# Create .env file with password
echo "PROMPT_LAB_PASSWORD=promptlab2024" > .env
echo "PORT=3001" >> .env
echo "WORKSPACE_DIR=/home/runner/workspace" >> .env

# Start development server
npm run dev
```

---

## Configuration

Edit `.env` to customize:

```env
# Password for workspace access (share with friends)
PROMPT_LAB_PASSWORD=promptlab2024

# Server port
PORT=3001

# Where your projects are located
WORKSPACE_DIR=/home/runner/workspace
```

---

## Project Integration

Prompt Lab reads files from `/home/runner/workspace/` (shared volume):

1. Add project folders to `/home/runner/workspace/` (e.g., `/home/runner/workspace/slyce`)
2. Click "Workspace" button in the nav bar
3. Browse project files and click any file to insert into your prompt
4. Sessions auto-save to `.prompt-lab/threads/` in each project

---

## Architecture

```
prompt-lab/
├── server/              # Express API (file access, auth, threads)
├── setup.sh             # One-time setup script
├── start.sh             # Combined server+client start script
├── src/v2/              # React frontend
│   ├── components/
│   │   ├── Workspace/   # Project browser & thread history
│   │   └── Auth/        # Login screen
│   └── services/
│       └── workspace-api.ts  # API client
└── .env                 # Configuration (created by setup.sh)
```

---

## License

MIT
