# Prompt Lab

A client-side React application for developing, testing, and validating prompts before implementation in Clacky or other AI tools.

## Environment Initialized ✅

The development environment has been successfully initialized with the following:

### Core Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB via `idb` library
- **State Management**: React Context + Hooks

### Project Structure
```
prompt-lab/
├── src/
│   ├── services/
│   │   └── db.service.ts      # IndexedDB with 6 stores
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind CSS directives
├── vite.config.ts             # Vite configuration with Clacky support
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies and scripts
```

### IndexedDB Stores (6 total)
1. **prompts** - Parent container for prompt versions
2. **promptVersions** - Each edit creates a new version
3. **responses** - Cached AI responses
4. **rules** - Clacky validation rules
5. **tagMeta** - Tag usage statistics
6. **settings** - API keys and preferences

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Clacky Environment
- Configured in `/home/runner/.clackyai/.environments.yaml`
- Runs on port 5173
- Allowed hosts configured for `.clackypaas.com`

### Next Steps
Ready to proceed with Phase 1 implementation:
- Step 2: Create type definitions ✅ (Already completed)
- Step 3: Settings & API key management
- Step 4: Prompt editor with system/user split
- And beyond...

## Project Guidelines

### Architecture Constraints
- ✅ Client-side only (no backend)
- ✅ IndexedDB for all persistent data
- ✅ API calls directly from browser
- ✅ localStorage for API keys only

### What NOT to Do
- ❌ Don't create a backend/server
- ❌ Don't use localStorage for prompts/responses
- ❌ Don't add features not in the 13-step plan
- ❌ Don't skip steps or combine them

## License
ISC
