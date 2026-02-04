# 🧪 Prompt Lab v2.0 - Embedded Edition

A powerful LLM testing and comparison tool embedded directly in your project.

## What This Is

Prompt Lab v2.0 is a **backdoor development tool** that:
- Lives inside each of your projects as `.prompt-lab/`
- Accesses your project files directly (no copying needed)
- Shares learning data externally so all projects benefit
- Provides multi-model comparison, iteration tracking, and synthesis

## Architecture

**Local Execution + Shared Intelligence:**
- **UI & Server**: Embedded in each project (this folder)
- **File Access**: Direct access to parent project files
- **Learning Data**: Stored externally (vector DB) - shared across all projects
- **Benefits**: Privacy, performance, and collective intelligence

## Installation in New Projects

### Option 1: Copy Entire Folder
```bash
# From your new project root:
cp -r /path/to/existing/project/.prompt-lab .
cd .prompt-lab
npm install
```

### Option 2: Symlink (within Clacky)
```bash
# From your new project root:
ln -s /home/runner/app/.prompt-lab .prompt-lab
```

### Option 3: Git Submodule (recommended for distribution)
```bash
# From your new project root:
git submodule add <prompt-lab-repo-url> .prompt-lab
git submodule update --init --recursive
```

## Configuration

1. **Copy environment template:**
```bash
cp .prompt-lab/.env.example .prompt-lab/.env
```

2. **Edit `.prompt-lab/.env`:**
```env
PROMPT_LAB_PASSWORD=your-shared-password
PORT=3001
WORKSPACE_DIR=/home/runner/workspace
ALLOWED_PROJECTS=project1,project2  # or leave empty for all
```

3. **Add to `.gitignore`:**
```
.prompt-lab/.env
.prompt-lab/threads/
```

## Usage

### Start Server + UI
```bash
# Terminal 1: Start Express backend
cd .prompt-lab/server
node index.js

# Terminal 2: Start Vite frontend (from project root)
npm run dev
```

### Access
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Login with password from `.env`

## Features

### 🔒 Password Protected
Share access with friends using a single shared password.

### 📁 File Browser
- Browse parent project files directly
- Insert code snippets into prompts
- No copying or syncing required

### 🧪 Multi-Model Testing
- Test prompts across multiple LLM providers
- Compare responses side-by-side
- Track iterations and improvements

### 📊 Workshop Mode
- Parallel response generation
- Iteration tracking with timeline
- Winner selection and pivoting
- Synthesis of best responses

### 💾 Thread History
- Sessions saved to `.prompt-lab/threads/`
- Resume previous work
- Export as markdown

### 🌐 Shared Intelligence (Planned)
- Learning data stored in external vector DB
- All projects benefit from collective knowledge
- Privacy maintained (code stays local)

## Project Structure

```
.prompt-lab/
├── server/              # Express backend
│   ├── index.js        # Main server
│   ├── auth.js         # Password auth
│   ├── project-files.js # File access API
│   └── thread-service.js # Thread storage
├── ui/                  # React frontend
│   ├── App.tsx
│   ├── components/
│   ├── services/
│   └── types/
├── threads/             # Session storage (gitignored)
├── .env                 # Configuration (gitignored)
└── .env.example         # Template

Parent Project/
├── .prompt-lab/         # This folder
├── src/                 # Your code (accessible)
├── package.json
└── ...
```

## Security

### Path Traversal Prevention
The server blocks access to:
- `.env` files
- `.ssh` directories  
- `node_modules`
- `.git` directories
- Paths outside allowed projects

### Blocked File Patterns
```javascript
['.env', '.ssh', 'node_modules', '.git', 'package-lock.json']
```

### Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents brute force attacks

## Future Enhancements

### External Learning Data (Next Phase)
```
Vector Database (Supabase/Pinecone)
├── Prompt patterns (successful prompts)
├── Response quality metrics
├── Model performance data
└── User feedback/ratings

All projects → Write to shared DB
All projects → Read from shared DB
Result: Collective intelligence
```

### Benefits of External Learning:
- All projects learn from each other
- Better prompt suggestions over time
- Model performance insights
- No duplicate learning

## Distribution

### For Personal Use
- Copy folder to each project
- Share password with team

### For GitHub Distribution
- Create separate repo for `.prompt-lab`
- Users add as git submodule
- Package on npm for `npx` installation

### Monetization Potential
- Free tier: Basic features
- Pro tier: Advanced analytics, custom models
- Enterprise: Shared team knowledge base

## Projects Using This

1. **slyce-beta** - Main app
2. **tapestrAI-copilot** - AI assistant
3. **Prompt-Lab** - This project (original)
4. **hallmark** - E-commerce
5. **tapestrai-v3** - Version 3
6. **tapestrAI-Artifact-id** - Artifact system

## Support

This is the embedded version of Prompt Lab v2.0. For updates, check the main repository.

Password: Share with trusted collaborators only.
