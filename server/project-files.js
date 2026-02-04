import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = '/home/runner/workspace';

// Configuration
const ALLOWED_PROJECTS = (process.env.ALLOWED_PROJECTS || 'slyce,tapestr-ai').split(',');
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Rate limiting store
const rateLimitStore = new Map();

// Blocked patterns for sensitive files
const BLOCKED_PATTERNS = [
  /^\./,                    // Hidden files (starts with dot)
  /node_modules\//,
  /\.git\//,
  /\.env/,
  /\.aws\//,
  /\.ssh\//,
  /\.docker\//,
  /secrets?\./,
  /\.DS_Store/,
  /\.log$/,
  /\.lock$/,
  /dist\//,
  /build\//,
  /\.cache\//
];

// Allowed file extensions for code display
const ALLOWED_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'py', 'json', 
  'md', 'yaml', 'yml', 'css', 'scss', 'html',
  'vue', 'svelte', 'go', 'rs', 'java', 'c', 
  'cpp', 'h', 'hpp', 'sql', 'graphql', 'proto',
  'sh', 'bash', 'zsh', 'toml', 'ini', 'cfg'
]);

// Rate limiter
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  const userHistory = rateLimitStore.get(ip) || [];
  const recentRequests = userHistory.filter(time => time > windowStart);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - recentRequests.length };
}

// Check if path is blocked
function isBlockedPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return BLOCKED_PATTERNS.some(pattern => pattern.test(normalizedPath));
}

// Clean rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of rateLimitStore) {
    const recent = times.filter(t => t > now - RATE_LIMIT_WINDOW);
    if (recent.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, recent);
    }
  }
}, 60000);

// Get all available projects
export async function getProjects() {
  try {
    const entries = await fs.readdir(WORKSPACE_ROOT, { withFileTypes: true });
    const projects = entries
      .filter(e => e.isDirectory())
      .filter(e => !e.name.startsWith('.'))
      .filter(e => ALLOWED_PROJECTS.includes(e.name))
      .map(e => e.name);
    
    return projects;
  } catch (err) {
    console.error('Error reading projects:', err);
    return [];
  }
}

// Walk directory and build tree
async function walkDir(dir, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const items = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Security: Skip blocked patterns
    if (isBlockedPath(relativePath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      const children = await walkDir(fullPath, baseDir);
      if (children.length > 0) {
        items.push({
          name: entry.name,
          path: relativePath,
          type: 'directory',
          children
        });
      }
    } else {
      const ext = path.extname(entry.name).slice(1).toLowerCase();
      
      // Only include allowed extensions
      if (ALLOWED_EXTENSIONS.has(ext)) {
        items.push({
          name: entry.name,
          path: relativePath,
          type: 'file',
          language: ext
        });
      }
    }
  }
  
  return items;
}

// Get file tree for a project
export async function getProjectTree(projectName) {
  if (!ALLOWED_PROJECTS.includes(projectName)) {
    return null;
  }
  
  const projectPath = path.join(WORKSPACE_ROOT, projectName);
  
  try {
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      return null;
    }
    
    const tree = await walkDir(projectPath, projectPath);
    return { tree, path: projectPath };
  } catch (err) {
    console.error('Error getting project tree:', err);
    return null;
  }
}

// Read file content
export async function readProjectFile(projectName, filePath) {
  if (!ALLOWED_PROJECTS.includes(projectName)) {
    return null;
  }
  
  const projectPath = path.join(WORKSPACE_ROOT, projectName);
  const fullPath = path.join(projectPath, filePath);
  
  // Security: Prevent path traversal
  if (!fullPath.startsWith(projectPath)) {
    return null;
  }
  
  // Security: Check blocked paths
  if (isBlockedPath(filePath)) {
    return null;
  }
  
  try {
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      return null;
    }
    
    // File size limit
    if (stats.size > MAX_FILE_SIZE) {
      return { content: `// File too large to display (${stats.size} bytes)\n// Maximum allowed size: ${MAX_FILE_SIZE} bytes` };
    }
    
    const content = await fs.readFile(fullPath, 'utf-8');
    return { content };
  } catch (err) {
    return null;
  }
}

// Search files in a project
export async function searchProjectFiles(projectName, query) {
  if (!ALLOWED_PROJECTS.includes(projectName)) {
    return [];
  }
  
  const projectPath = path.join(WORKSPACE_ROOT, projectName);
  const results = [];
  
  async function searchDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(projectPath, fullPath);
      
      // Security: Skip blocked patterns
      if (isBlockedPath(relativePath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await searchDir(fullPath);
      } else if (entry.name.includes(query)) {
        const ext = path.extname(entry.name).slice(1).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext)) {
          results.push({
            name: entry.name,
            path: relativePath,
            language: ext
          });
        }
      }
    }
  }
  
  try {
    await searchDir(projectPath);
  } catch (err) {
    console.error('Error searching files:', err);
  }
  
  return results.slice(0, 50); // Limit results
}

export function setupProjectRoutes(app) {
  // Get all available projects
  app.get('/api/projects', async (req, res) => {
    const rateLimit = checkRateLimit(req.ip);
    res.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    const projects = await getProjects();
    res.json({ projects });
  });
  
  // Get project tree
  app.get('/api/projects/:project/tree', async (req, res) => {
    const rateLimit = checkRateLimit(req.ip);
    res.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    const { project } = req.params;
    const result = await getProjectTree(project);
    
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result);
  });
  
  // Read file content
  app.get('/api/projects/:project/file', async (req, res) => {
    const rateLimit = checkRateLimit(req.ip);
    res.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    const { project } = req.params;
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }
    
    const result = await readProjectFile(project, filePath);
    
    if (!result) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json(result);
  });
  
  // Search files
  app.get('/api/projects/:project/search', async (req, res) => {
    const rateLimit = checkRateLimit(req.ip);
    res.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    const { project } = req.params;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }
    
    const results = await searchProjectFiles(project, q);
    res.json({ results });
  });
}
