# After Action Report: Prompt Lab Integration Into Rails

**Date:** February 3, 2026  
**Project:** Slyce (Rails 7.2.2.2) + Prompt Lab v2.0  
**Status:** ❌ Integration Failed → ✅ Lessons Learned

---

## Executive Summary

Attempted to integrate Prompt Lab v2.0 (React + Express.js) into an existing Rails 7.2.2.2 project. Integration failed due to architectural mismatches. This document captures lessons learned for future template projects.

**Key Takeaway:** Integrate Prompt Lab at project creation time, not retrofitted into existing apps.

---

## The Vision

Embed Prompt Lab workspace browser directly into Rails admin panel:
- Single-click access from admin sidebar
- No separate authentication (uses Rails session)
- iframe embedding within admin interface
- Access to all project files from workspace

---

## What We Built

### Files Created

**1. Controller: `app/controllers/prompt_lab_controller.rb`**
```ruby
class PromptLabController < ApplicationController
  layout false
  
  def index
    # Just render the HTML page - no layout
  end
end
```

**2. View: `app/views/prompt_lab/index.html.erb`**
```erb
<!DOCTYPE html>
<html>
<head>
  <title>Prompt Lab</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; overflow: hidden; }
    iframe { 
      width: 100%; 
      height: 100%; 
      border: none;
      background: white;
    }
  </style>
</head>
<body>
  <iframe src="http://localhost:3001"></iframe>
</body>
</html>
```

**3. Route: `config/routes.rb`**
```ruby
# Prompt Lab
get '/prompt-lab', to: 'prompt_lab#index'
```

**4. Menu Item: `app/views/shared/admin/_navigation.html.erb`**
```erb
<li>
  <a href="/prompt-lab" target="_self"
     class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-300 rounded-lg transition-colors">
    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
    Prompt Lab
  </a>
</li>
```

**5. Prompt Lab Files**
- `.prompt-lab/ui/` - React source files
- `.prompt-lab/server/` - Express API server  
- `.prompt-lab/dist/` - Built UI files

**6. Express Server Started**
```bash
cd .prompt-lab/server && node index.js &
# Running on port 3001
```

---

## What Went Wrong

### Issue 1: iframe + localhost = CORS Blocked

**Problem:** iframe at `https://*.clackypaas.com` can't load `http://localhost:3001`

**Cause:** Browser security blocks mixed content (HTTPS → HTTP) and cross-origin iframes

**Impact:** Blank screen when clicking Prompt Lab menu item

---

### Issue 2: Two Servers = Complexity

**Problem:** Rails (3000) + Express (3001) both needed

**Causes:**
- Two startup commands
- Two processes to manage
- Two ports to coordinate

**Impact:** Deployment complexity, debugging difficulty

---

### Issue 3: Retrofitting Existing Project

**Problem:** Adding Prompt Lab to already-built Rails app

**Causes:**
- Unknown dependencies
- Unclear file locations
- Existing auth system conflicts

**Impact:** Too many unknowns, integration failure

---

## Root Cause

```
iframe cannot load http://localhost:3001 from https://*.clackypaas.com
```

Browser security prevents this by design.

---

## Solutions Available

### Solution 1: Fix iframe (Same Domain)

Copy UI to Rails `public/` folder, serve from same domain.

```bash
# Copy built files
cp -r .prompt-lab/dist/* public/prompt-lab/

# Update iframe
# From: <iframe src="http://localhost:3001">
# To:   <iframe src="/prompt-lab/">
```

**Pros:** No CORS issues, single server
**Cons:** Still two servers needed (Express for API)

---

### Solution 2: Standalone Deployment (Interim)

Deploy Prompt Lab on separate domain/subdomain.

```yaml
# Example
www.slyce.com → Rails (main app)
promptlab.slyce.com → Express (Prompt Lab)
```

**Pros:** No CORS issues, independent scaling
**Cons:** Separate auth, context switching

---

### Solution 3: Rebuild in Rails

Convert React → Hotwire/Stimulus, Express → Rails.

**Pros:** Single server, unified auth, simpler architecture
**Cons:** Lose React's fast dev experience, file browser needs rebuilding

---

## Recommended Path Forward

### Phase 1: Interim (This Week)
1. Deploy Prompt Lab standalone on separate domain
2. Verify it works independently
3. Add link in Rails admin: "Open Prompt Lab" → new tab

### Phase 2: Template (This Month)
1. Create fresh Rails 7 project
2. Integrate Prompt Lab from day one
3. Document as `rails-7-with-prompt-lab-template`
4. Test on fresh clone

### Phase 3: Refinement (Future)
1. Add Rails authentication integration
2. Create startup scripts
3. Consider Gem packaging

---

## Master Template Requirements

### Must-Have Features

1. **Single command startup**
   ```bash
   ./bin/dev  # Starts Rails + Prompt Lab
   ```

2. **Pre-configured routes**
   - `/prompt-lab` → iframe page
   - `/api/*` → Express proxy

3. **Admin navigation**
   - Pre-added menu item (purple themed)
   - Lightbulb icon

4. **Documentation**
   - Setup instructions
   - Architecture diagram
   - Troubleshooting guide
   - Environment variables

5. **Unified authentication**
   - Prompt Lab password disabled
   - Uses Rails `before_action :authenticate_user!`
   - Single sign-on

---

## Integration Checklist (For Template Project)

### Phase 1: Project Setup
- [ ] Create new Rails 7.2+ project
- [ ] Extract `.prompt-lab/` directory from tar.gz
- [ ] Install: `cd .prompt-lab/ui && npm install`
- [ ] Build: `npm run build`
- [ ] Copy: `cp -r .prompt-lab/dist/* public/prompt-lab/`

### Phase 2: Rails Integration
- [ ] Create `app/controllers/prompt_lab_controller.rb`
- [ ] Create `app/controllers/prompt_lab_api_controller.rb`
- [ ] Create `app/views/prompt_lab/index.html.erb`
- [ ] Add routes to `config/routes.rb`
- [ ] Add menu item to admin navigation
- [ ] Add `skip_before_action` for API callbacks

### Phase 3: Configuration
- [ ] Create `.env` for Prompt Lab settings
- [ ] Set `AUTH_ENABLED=false`
- [ ] Configure `WORKSPACE_DIR` path
- [ ] Set `PORT=3001` for Express

### Phase 4: Startup Scripts
- [ ] Create `bin/start-prompt-lab` helper
- [ ] Add to `Procfile` or `Procfile.dev`
- [ ] Document startup sequence in README

### Phase 5: Testing
- [ ] Express: `curl http://localhost:3001/api/health`
- [ ] Rails: `curl http://localhost:3000/prompt-lab/`
- [ ] iframe: visit `/prompt-lab`
- [ ] Menu: click "Prompt Lab" in admin

---

## Key Lessons

### What Worked
| What Worked | Why |
|-------------|-----|
| Express server | Easy to start/stop |
| Rails routing | Clean, familiar pattern |
| Static file serving | `public/` directory works |
| Menu integration | ERB modification clean |
| Vite build | Fast, reliable |

### What Didn't Work
| What Failed | Why | Fix |
|-------------|-----|-----|
| iframe + localhost | Browser CORS | Serve from same domain |
| Retrofit existing app | Too many unknowns | Integrate at start |
| API proxying | Controller callbacks | `skip_before_action` |
| Mixed auth | User confusion | Unified auth |
| Port management | Two servers | Single server or proxy |

---

## The Fork in the Road

```
START PROJECT
    │
    ▼
┌────────────────────────────────────────────────────────┐
│  Choose Your Stack                                     │
│                                                        │
│  A) Rails + Hotwire (server-rendered)                 │
│     → Simpler, less JS, single server                 │
│     → Harder to add complex client interactions       │
│                                                        │
│  B) React/Vue + API (separate frontend)               │
│     → More complex, two servers                       │
│     → Perfect for complex UIs (file browser)          │
│                                                        │
│  C) Rails + React (importmap/react-rails)            │
│     → Hybrid approach                                 │
│     → React in Rails, single server                   │
│                                                        │
└────────────────────────────────────────────────────────┘
    │
    │ Once you build File Browser, Auth, API...
    │ Switching paths = LOTS OF WORK
    ▼
LOTS OF CODE
    │
    ▼
"Should we rebuild?" ← PAINFUL QUESTION
```

---

## When to Use Each Stack

| Project Type | Recommended Stack |
|-------------|------------------|
| Admin panel, internal tools | Rails + Hotwire |
| File browser, IDE-like UI | React/Vue + API |
| Blog, e-commerce, CRUD | Rails server-rendered |
| Real-time collaboration | React/Vue + API + ActionCable |

---

## Workshop Questions (Before Starting)

Ask before any major build:

1. "Will this need complex state management?" → React
2. "Is this mostly forms and lists?" → Rails
3. "Does it need offline capability?" → React
4. "Single deployment target?" → Rails
5. "File browser or code editor?" → React
6. "Team is Ruby-heavy?" → Rails
7. "Team is JS-heavy?" → React

**Remember:** You can always add React to Rails later (importmap, react-rails). Much harder to go the other direction.

---

## Testing Commands

```bash
# Express server health
curl http://localhost:3001/api/health

# Rails proxy health
curl http://localhost:3000/api/health

# Test POST through proxy
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# Check static files
curl http://localhost:3000/prompt-lab/ | grep "Prompt Lab"
```

---

## Conclusion

### What We Learned

1. **Prompt Lab works best as greenfield integration** - Don't retrofit
2. **Template project is the correct approach** - Build once, reuse forever
3. **Standalone deployment is interim solution** - Works today, template for tomorrow
4. **Single server architecture is simplest** - But React + Express is already built

### Success Criteria for Template

- [ ] Single command startup
- [ ] No CORS issues
- [ ] Unified authentication
- [ ] Clear documentation
- [ ] Tested on fresh Rails project

### Next Milestones

1. ✅ Document lessons (this file)
2. ⏭️ Deploy Prompt Lab standalone
3. ⏭️ Build fresh Rails template
4. ⏭️ Document template thoroughly

---

## References

- **Slyce:** `https://3000-b67aa8f983f9-web.clackypaas.com/admin`
- **Prompt Lab:** `/home/runner/app/` (Prompt-Lab workspace)

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2026  
**Status:** ✅ Ready for Template Project Phase
