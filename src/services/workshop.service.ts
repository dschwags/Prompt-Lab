/**
 * Workshop Service - Session Storage & Retrieval
 */

import type {
  WorkshopSession,
  WorkshopIteration,
  WorkshopStorage,
  StarredItem,
} from '../types/Workshop';
import { getModelGroups, findModel } from '../utils/models';

const STORAGE_KEY = 'promptlab_workshop';
const MAX_SESSIONS = 20;
const MAX_ITERATIONS_PER_SESSION = 5;
const MAX_STARRED_PER_SESSION = 20;

export function getAllSessions(): WorkshopSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data: WorkshopStorage = JSON.parse(stored);
    return data.sessions || [];
  } catch (error) {
    console.error('Failed to load workshop sessions:', error);
    return [];
  }
}

export function getSession(sessionId: string): WorkshopSession | null {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

export function getLastSession(): WorkshopSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const data: WorkshopStorage = JSON.parse(stored);
    if (!data.lastSessionId) return null;
    return getSession(data.lastSessionId);
  } catch (error) {
    console.error('Failed to get last session:', error);
    return null;
  }
}

export function saveSession(session: WorkshopSession): void {
  try {
    const sessions = getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    const trimmedSessions = sessions.slice(0, MAX_SESSIONS);
    const data: WorkshopStorage = {
      sessions: trimmedSessions,
      lastSessionId: session.id,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save workshop session:', error);
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    const data: WorkshopStorage = {
      sessions: filtered,
      lastSessionId: filtered.length > 0 ? filtered[0].id : undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to delete workshop session:', error);
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear workshop sessions:', error);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createNewSession(
  systemPrompt: string,
  userPrompt: string,
  selectedModels: string[]
): WorkshopSession {
  const now = Date.now();
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    name: 'Session ' + new Date().toLocaleDateString(),
    systemPrompt,
    userPrompt,
    selectedModels,
    iterations: [],
    starredItems: [],
    currentIterationNumber: 0,
  };
}

export function addIterationToSession(
  session: WorkshopSession,
  iteration: WorkshopIteration
): WorkshopSession {
  if (session.iterations.length >= MAX_ITERATIONS_PER_SESSION) {
    session.iterations.shift();
  }
  return {
    ...session,
    updatedAt: Date.now(),
    iterations: [...session.iterations, iteration],
    currentIterationNumber: iteration.iterationNumber,
  };
}

export function addStarredItem(
  session: WorkshopSession,
  item: Omit<StarredItem, 'id' | 'createdAt'>
): WorkshopSession {
  const starredItem: StarredItem = {
    ...item,
    id: generateId(),
    createdAt: Date.now(),
  };
  if (session.starredItems.length >= MAX_STARRED_PER_SESSION) {
    session.starredItems.shift();
  }
  return {
    ...session,
    updatedAt: Date.now(),
    starredItems: [...session.starredItems, starredItem],
  };
}

export function removeStarredItem(
  session: WorkshopSession,
  starredItemId: string
): WorkshopSession {
  return {
    ...session,
    updatedAt: Date.now(),
    starredItems: session.starredItems.filter(s => s.id !== starredItemId),
  };
}

export function toggleResponseStar(
  session: WorkshopSession,
  iterationId: string,
  modelId: string
): WorkshopSession {
  const updatedIterations = session.iterations.map(iter => {
    if (iter.id !== iterationId) return iter;
    return {
      ...iter,
      responses: iter.responses.map(resp => {
        if (resp.modelId !== modelId) return resp;
        return { ...resp, starred: !resp.starred };
      }),
    };
  });
  return {
    ...session,
    updatedAt: Date.now(),
    iterations: updatedIterations,
  };
}

export function getModelsForPreset(presetId: string): string[] {
  const modelGroups = getModelGroups();
  const allModelIds = modelGroups.flatMap(g => g.models.map(m => m.id));
  switch (presetId) {
    case 'all-us':
      return allModelIds.filter(id => findModel(id)?.region === 'US');
    case 'all-eu':
      return allModelIds.filter(id => findModel(id)?.region === 'EU');
    case 'all-china':
      return allModelIds.filter(id => findModel(id)?.region === 'China');
    default:
      return [];
  }
}

export function exportSessionAsMarkdown(session: WorkshopSession): string {
  let md = '# Workshop Session: ' + session.name + '\n\n';
  md += '**Created:** ' + new Date(session.createdAt).toLocaleString() + '\n';
  md += '**Models:** ' + session.selectedModels.length + '\n';
  md += '**Iterations:** ' + session.iterations.length + '\n\n';
  md += '## System Prompt\n```\n' + session.systemPrompt + '\n```\n\n';
  md += '## User Prompt\n```\n' + session.userPrompt + '\n```\n\n';
  session.iterations.forEach(iter => {
    md += '\n---\n\n';
    md += '## Iteration ' + iter.iterationNumber + '\n';
    md += '**Models tested:** ' + iter.modelIds.length + '\n\n';
    iter.responses.forEach(resp => {
      md += '### ' + resp.modelName + '\n';
      md += '**Status:** ' + resp.status + '\n';
      if (resp.status === 'complete') {
        md += '**Time:** ' + resp.timeSeconds.toFixed(1) + 's | **Cost:** $' + resp.cost.toFixed(4) + '\n';
        md += '**Tokens:** ' + resp.inputTokens + '->' + resp.outputTokens + '\n\n';
        md += '```\n' + resp.text + '\n```\n';
      } else if (resp.errorMessage) {
        md += '**Error:** ' + resp.errorMessage + '\n';
      }
      md += '\n';
    });
  });
  if (session.starredItems.length > 0) {
    md += '\n---\n\n## Starred Items\n\n';
    session.starredItems.forEach(item => {
      md += '### ' + item.modelName + ' - ' + item.category + '\n';
      md += '*' + new Date(item.createdAt).toLocaleString() + '*\n\n';
      md += item.selectedText + '\n\n';
      if (item.notes) {
        md += '**Notes:** ' + item.notes + '\n\n';
      }
    });
  }
  return md;
}

export function exportStarredItemsAsMarkdown(session: WorkshopSession): string {
  if (session.starredItems.length === 0) {
    return '# No starred items\n';
  }
  let md = '# Starred Items - ' + session.name + '\n\n';
  session.starredItems.forEach(item => {
    md += '## ' + item.modelName + ' - ' + item.category + '\n';
    md += '*' + new Date(item.createdAt).toLocaleString() + '*\n\n';
    md += '```\n' + item.selectedText + '\n```\n\n';
    if (item.notes) {
      md += '**Notes:** ' + item.notes + '\n\n';
    }
    md += '---\n\n';
  });
  return md;
}
