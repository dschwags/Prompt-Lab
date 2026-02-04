// Workspace API client for Prompt Lab
// Handles communication with server endpoints for project files and threads

const API_BASE = '/api';

// === Types ===

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  children?: FileNode[];
}

export interface ThreadSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  modelCount: number;
  iterationCount: number;
  winnerCount: number;
  costTotal: number;
}

export interface Thread {
  id: string;
  project: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  systemPersona: string;
  userTask: string;
  modelIds: string[];
  iterations: Iteration[];
  metadata: {
    costTotal: number;
    modelCount: number;
    winnerCount: number;
  };
}

export interface Iteration {
  id: string;
  roundIndex: number;
  responses: Response[];
  winnerResponseId?: string;
  createdAt: string;
}

export interface Response {
  id: string;
  modelId: string;
  modelName: string;
  content: string;
  status: 'pending' | 'complete' | 'error';
  error?: string;
  metrics?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

// === Auth ===

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (err) {
    return { success: false, error: 'Connection error' };
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
}

export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/status`);
    return res.ok;
  } catch {
    return false;
  }
}

// === Projects ===

export async function listProjects(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects || [];
}

export async function getProjectTree(projectName: string): Promise<FileNode[]> {
  const res = await fetch(`${API_BASE}/projects/${projectName}/tree`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.tree || [];
}

export async function readProjectFile(projectName: string, filePath: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectName}/file?path=${encodeURIComponent(filePath)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.content;
  } catch {
    return null;
  }
}

export async function searchProjectFiles(projectName: string, query: string): Promise<{ name: string; path: string; language: string }[]> {
  const res = await fetch(`${API_BASE}/projects/${projectName}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// === Threads ===

export async function listThreads(projectName: string): Promise<ThreadSummary[]> {
  const res = await fetch(`${API_BASE}/projects/${projectName}/threads`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.threads || [];
}

export async function getThread(projectName: string, threadId: string): Promise<Thread | null> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectName}/threads/${threadId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.thread;
  } catch {
    return null;
  }
}

export async function createThread(projectName: string, data: {
  title?: string;
  systemPersona?: string;
  userTask?: string;
  modelIds?: string[];
}): Promise<Thread | null> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectName}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) return null;
    const result = await res.json();
    return result.thread;
  } catch {
    return null;
  }
}

export async function updateThread(projectName: string, threadId: string, updates: Partial<Thread>): Promise<Thread | null> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectName}/threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!res.ok) return null;
    const result = await res.json();
    return result.thread;
  } catch {
    return null;
  }
}

export async function deleteThread(projectName: string, threadId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectName}/threads/${threadId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addIteration(projectName: string, threadId: string, iteration: Omit<Iteration, 'id' | 'createdAt'>): Promise<Iteration | null> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectName}/threads/${threadId}/iterations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(iteration)
    });
    
    if (!res.ok) return null;
    const result = await res.json();
    return result.iteration;
  } catch {
    return null;
  }
}
