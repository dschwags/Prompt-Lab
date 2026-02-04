import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = '/home/runner/workspace';

// Configuration
const THREADS_DIR = '.prompt-lab/threads';

// Get thread paths for a project
function getThreadPaths(projectName, threadId) {
  const projectPath = path.join(WORKSPACE_ROOT, projectName);
  const threadsDir = path.join(projectPath, THREADS_DIR);
  const threadFile = threadId ? path.join(threadsDir, `${threadId}.json`) : null;
  
  return { projectPath, threadsDir, threadFile };
}

// Ensure thread directory exists
async function ensureThreadDir(projectName) {
  const { threadsDir } = getThreadPaths(projectName);
  try {
    await fs.mkdir(threadsDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  return threadsDir;
}

// Get all thread summaries for a project
export async function getThreadList(projectName) {
  const { threadsDir } = getThreadPaths(projectName);
  
  try {
    const entries = await fs.readdir(threadsDir, { withFileTypes: true });
    const threads = [];
    
    for (const entry of entries) {
      if (entry.name.endsWith('.json') && entry.name !== 'threads.json') {
        try {
          const content = await fs.readFile(path.join(threadsDir, entry.name), 'utf-8');
          const thread = JSON.parse(content);
          
          threads.push({
            id: thread.id,
            title: thread.title || 'Untitled Session',
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
            modelCount: thread.modelIds?.length || 0,
            iterationCount: thread.iterations?.length || 0,
            winnerCount: thread.iterations?.filter(i => i.winnerResponseId).length || 0,
            costTotal: thread.metadata?.costTotal || 0
          });
        } catch (err) {
          console.error('Error reading thread:', entry.name, err);
        }
      }
    }
    
    threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return threads;
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Get full thread data
export async function getThread(projectName, threadId) {
  const { threadsDir, threadFile } = getThreadPaths(projectName, threadId);
  if (!threadFile) return null;
  
  try {
    const content = await fs.readFile(threadFile, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

// Create a new thread
export async function createThread(projectName, data) {
  await ensureThreadDir(projectName);
  
  const threadId = `thread_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const { threadsDir, threadFile } = getThreadPaths(projectName, threadId);
  
  const thread = {
    id: threadId,
    project: projectName,
    title: data.title || 'Untitled Session',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    systemPersona: data.systemPersona || '',
    userTask: data.userTask || '',
    modelIds: data.modelIds || ['claude-sonnet-4'],
    iterations: [],
    metadata: { costTotal: 0, modelCount: data.modelIds?.length || 1, winnerCount: 0 }
  };
  
  await fs.writeFile(threadFile, JSON.stringify(thread, null, 2));
  return thread;
}

// Update a thread
export async function updateThread(projectName, threadId, updates) {
  const thread = await getThread(projectName, threadId);
  if (!thread) return null;
  
  const updated = {
    ...thread,
    ...updates,
    id: threadId,
    project: projectName,
    updatedAt: new Date().toISOString()
  };
  
  const { threadFile } = getThreadPaths(projectName, threadId);
  await fs.writeFile(threadFile, JSON.stringify(updated, null, 2));
  return updated;
}

// Delete a thread
export async function deleteThread(projectName, threadId) {
  const { threadFile } = getThreadPaths(projectName, threadId);
  try {
    await fs.unlink(threadFile);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

// Add an iteration to a thread
export async function addIteration(projectName, threadId, iteration) {
  const thread = await getThread(projectName, threadId);
  if (!thread) throw new Error('Thread not found');
  
  const newIteration = {
    id: `iter_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...iteration,
    createdAt: new Date().toISOString()
  };
  
  thread.iterations = thread.iterations || [];
  thread.iterations.push(newIteration);
  thread.updatedAt = new Date().toISOString();
  
  const { threadFile } = getThreadPaths(projectName, threadId);
  await fs.writeFile(threadFile, JSON.stringify(thread, null, 2));
  return newIteration;
}

export function setupThreadRoutes(app) {
  // Get all threads for a project
  app.get('/api/projects/:name/threads', async (req, res) => {
    const { name } = req.params;
    try {
      const threads = await getThreadList(name);
      res.json({ project: name, threads });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a specific thread
  app.get('/api/projects/:name/threads/:id', async (req, res) => {
    const { name, id } = req.params;
    const thread = await getThread(name, id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json({ thread });
  });
  
  // Create a new thread
  app.post('/api/projects/:name/threads', async (req, res) => {
    const { name } = req.params;
    try {
      const thread = await createThread(name, req.body);
      res.status(201).json({ thread });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update a thread
  app.put('/api/projects/:name/threads/:id', async (req, res) => {
    const { name, id } = req.params;
    const thread = await updateThread(name, id, req.body);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json({ thread });
  });
  
  // Delete a thread
  app.delete('/api/projects/:name/threads/:id', async (req, res) => {
    const { name, id } = req.params;
    const deleted = await deleteThread(name, id);
    if (!deleted) return res.status(404).json({ error: 'Thread not found' });
    res.json({ deleted: true });
  });
  
  // Add iteration to thread
  app.post('/api/projects/:name/threads/:id/iterations', async (req, res) => {
    const { name, id } = req.params;
    try {
      const iteration = await addIteration(name, id, req.body);
      res.status(201).json({ iteration });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
