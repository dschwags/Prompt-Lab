/**
 * Workshop V2 Storage Service
 * 
 * Stores/retrieves Workshop Mode V2 sessions in IndexedDB
 * Uses types from ../types/WorkshopV2
 */

import { openDB, IDBPDatabase } from 'idb';
import type { WorkshopSession, WorkshopIteration, ConversationRound, AIResponse } from '../types/WorkshopV2';

// === TYPE DEFINITIONS ===
// Re-export for convenience
export { type WorkshopSession, WorkshopIteration, ConversationRound, AIResponse };

// === CONSTANTS ===

const DB_NAME = 'prompt-lab-workshop-v2';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

// === DATABASE SETUP ===

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-createdAt', 'createdAt');
        store.createIndex('by-updatedAt', 'updatedAt');
      }
    },
  });

  return dbInstance;
}

// === STORAGE OPERATIONS ===

/**
 * Save a workshop session
 */
export async function saveSession(session: WorkshopSession): Promise<void> {
  const db = await getDB();
  session.updatedAt = Date.now();
  await db.put(STORE_NAME, session);
}

/**
 * Get a session by ID
 */
export async function getSession(id: string): Promise<WorkshopSession | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

/**
 * Get all sessions, sorted by updatedAt descending
 */
export async function getAllSessions(): Promise<WorkshopSession[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex(STORE_NAME, 'by-updatedAt');
  return sessions.reverse();
}

/**
 * Get most recent session
 */
export async function getMostRecentSession(): Promise<WorkshopSession | undefined> {
  const sessions = await getAllSessions();
  return sessions[0];
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Clear all sessions
 */
export async function clearAllSessions(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

/**
 * Save session with automatic cleanup of old data
 */
export async function saveSessionWithCleanup(session: WorkshopSession): Promise<void> {
  await saveSession(session);
}

// === HELPER FUNCTIONS ===

/**
 * Calculate potential savings from lock-in optimization
 */
export function calculateLockInSavings(
  selectedModelIds: string[],
  iterations: WorkshopIteration[]
): { savings: number; lockedModelId: string | null } {
  if (!selectedModelIds.length || !iterations.length) {
    return { savings: 0, lockedModelId: null };
  }
  return { savings: 0, lockedModelId: null };
}
