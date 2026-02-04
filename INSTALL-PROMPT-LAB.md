# 🚀 Install Prompt Lab v2.0 in Your Projects

Follow these steps to embed Prompt Lab in each of your 5 projects.

## Prerequisites

✅ You're working in Clacky environment  
✅ Projects are in `/home/runner/workspace/` or `/home/runner/app/`  
✅ You have access to the Prompt-Lab project with `.prompt-lab/` folder

---

## Installation Steps

### For Each Project: slyce-beta, tapestrAI-copilot, hallmark, tapestrai-v3, tapestrAI-Artifact-id

#### 1️⃣ Navigate to Project
```bash
# Open the project in Clacky or navigate via terminal
cd /home/runner/app  # or wherever your project lives
```

#### 2️⃣ Copy Prompt Lab Folder
```bash
# Copy the entire .prompt-lab folder from Prompt-Lab project
cp -r /home/runner/workspace/Prompt-Lab/.prompt-lab .

# Or if Prompt-Lab is at /home/runner/app/
cp -r /path/to/Prompt-Lab/.prompt-lab .
```

#### 3️⃣ Install Dependencies (if needed)
```bash
cd .prompt-lab
npm install  # Only needed if you're not symlinking node_modules
cd ..
```

#### 4️⃣ Configure Environment
```bash
# Copy environment template
cp .prompt-lab/.env.example .prompt-lab/.env

# Edit with your settings (use nano or Clacky editor)
nano .prompt-lab/.env
```

**Set these values:**
```env
PROMPT_LAB_PASSWORD=promptlab2024
PORT=3001
WORKSPACE_DIR=/home/runner/workspace
ALLOWED_PROJECTS=slyce-beta,tapestrAI-copilot,hallmark,tapestrai-v3,tapestrAI-Artifact-id
```

#### 5️⃣ Update .gitignore
```bash
# Add to your project's .gitignore
echo "" >> .gitignore
echo "# Prompt Lab" >> .gitignore
echo ".prompt-lab/.env" >> .gitignore
echo ".prompt-lab/threads/" >> .gitignore
echo ".prompt-lab/node_modules/" >> .gitignore
```

#### 6️⃣ Create Threads Directory
```bash
mkdir -p .prompt-lab/threads
```

#### 7️⃣ Test Installation
```bash
# Start the backend
cd .prompt-lab/server
node index.js &
cd ../..

# Note: You'll start the UI using your project's normal dev server
# The Vite proxy (already configured) will route /api/* to Express
```

#### 8️⃣ Access Prompt Lab
- Start your project normally (npm run dev, etc.)
- Navigate to the Prompt Lab v2.0 tab/route
- Login with password: `promptlab2024`
- Browse files from workspace panel

---

## Alternative: Symlink Approach (Experimental)

Instead of copying, you can symlink **within the same container**:

```bash
cd /home/runner/app  # Your project
ln -s /path/to/Prompt-Lab/.prompt-lab .prompt-lab
```

**⚠️ Limitation:** Symlinks don't work across Clacky projects (different containers).  
**✅ Works:** Within same project for shared components.

---

## Quick Copy-Paste Commands

### For slyce-beta:
```bash
cd /home/runner/workspace/slyce-beta
cp -r /home/runner/workspace/Prompt-Lab/.prompt-lab .
cp .prompt-lab/.env.example .prompt-lab/.env
mkdir -p .prompt-lab/threads
echo -e "\n# Prompt Lab\n.prompt-lab/.env\n.prompt-lab/threads/\n.prompt-lab/node_modules/" >> .gitignore
```

### For tapestrAI-copilot:
```bash
cd /home/runner/workspace/tapestrAI-copilot
cp -r /home/runner/workspace/Prompt-Lab/.prompt-lab .
cp .prompt-lab/.env.example .prompt-lab/.env
mkdir -p .prompt-lab/threads
echo -e "\n# Prompt Lab\n.prompt-lab/.env\n.prompt-lab/threads/\n.prompt-lab/node_modules/" >> .gitignore
```

### For hallmark:
```bash
cd /home/runner/workspace/hallmark
cp -r /home/runner/workspace/Prompt-Lab/.prompt-lab .
cp .prompt-lab/.env.example .prompt-lab/.env
mkdir -p .prompt-lab/threads
echo -e "\n# Prompt Lab\n.prompt-lab/.env\n.prompt-lab/threads/\n.prompt-lab/node_modules/" >> .gitignore
```

### For tapestrai-v3:
```bash
cd /home/runner/workspace/tapestrai-v3
cp -r /home/runner/workspace/Prompt-Lab/.prompt-lab .
cp .prompt-lab/.env.example .prompt-lab/.env
mkdir -p .prompt-lab/threads
echo -e "\n# Prompt Lab\n.prompt-lab/.env\n.prompt-lab/threads/\n.prompt-lab/node_modules/" >> .gitignore
```

### For tapestrAI-Artifact-id:
```bash
cd /home/runner/workspace/tapestrAI-Artifact-id
cp -r /home/runner/workspace/Prompt-Lab/.prompt-lab .
cp .prompt-lab/.env.example .prompt-lab/.env
mkdir -p .prompt-lab/threads
echo -e "\n# Prompt Lab\n.prompt-lab/.env\n.prompt-lab/threads/\n.prompt-lab/node_modules/" >> .gitignore
```

---

## Verification

After installation in each project:

```bash
# Check folder exists
ls -la .prompt-lab/

# Check server files
ls .prompt-lab/server/

# Check UI files
ls .prompt-lab/ui/

# Check environment
cat .prompt-lab/.env
```

Expected output:
```
.prompt-lab/
├── server/
├── ui/
├── .env
└── .env.example
```

---

## Usage After Installation

### Start Prompt Lab Backend (in each project)
```bash
cd .prompt-lab/server
node index.js
```

### Access Frontend
- Your project's dev server already routes `/api/*` to Express
- Navigate to Prompt Lab v2.0 section
- Login with password

### Browse Project Files
- Open Workspace panel
- Select your project from dropdown
- Browse file tree
- Click files to insert into prompts

---

## Troubleshooting

### "Failed to load projects"
- Check `.prompt-lab/server/index.js` is running
- Verify `.env` has correct `WORKSPACE_DIR` and `ALLOWED_PROJECTS`
- Check browser console for errors

### "Login not showing"
- Check `checkAuth()` in workspace-api.ts
- Verify Express server is on port 3001
- Check Vite proxy in vite.config.ts

### "Cannot access files"
- Verify project name in `ALLOWED_PROJECTS`
- Check path traversal security (no `..` in paths)
- Ensure project exists in `WORKSPACE_DIR`

---

## Next Steps: Shared Learning Data

**Phase 2 (Planned):**
- Set up Supabase or Pinecone vector database
- Store prompt patterns, model performance data
- All projects write to / read from shared DB
- Collective intelligence across all projects

**Benefits:**
- Learn from successful prompts across projects
- Model performance insights
- Better suggestions over time
- No duplicate learning

---

## Support

Questions? Issues? Check the main Prompt-Lab project README or the `.prompt-lab/README.md` in each installation.

**Password:** Keep it secure. Share only with trusted team members.

**GitHub:** Consider creating a private repo for `.prompt-lab` and using git submodules for easier updates.
