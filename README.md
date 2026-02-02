# Prompt Lab v2.0

AI prompt engineering workspace with multi-model comparison, color lineage, and project integration.

## Features

- **Multi-Model Comparison**: Run prompts against multiple AI models simultaneously
- **Color Lineage**: Visual tracking of model contributions across iterations
- **Project Integration**: Browse and reference code from your projects
- **Session History**: Save and resume prompt sessions
- **Export**: Generate markdown reports of your work

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/dschwags/Prompt-Lab.git
cd Prompt-Lab

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Configuration

Edit `.env` to configure:

```env
# Password for access (shared password for collaborators)
PROMPT_LAB_PASSWORD=your-password

# Projects to allow (folder names in /home/runner/workspace/)
ALLOWED_PROJECTS=your-project-1,your-project-2
```

### Running

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Integration

Prompt Lab can access your projects in `/home/runner/workspace/`:

1. Add your project folders to `/home/runner/workspace/`
2. Configure `ALLOWED_PROJECTS` in `.env`
3. Use the "Workspace" panel to browse files
4. Click "Insert" to add code to your prompts

## Architecture

```
prompt-lab/
├── server/              # Express backend (future)
├── src/v2/              # React frontend
│   ├── components/      # UI components
│   ├── services/        # API clients
│   └── App.tsx          # Main application
└── package.json
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
