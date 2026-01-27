import { openDB, IDBPDatabase } from 'idb';

// Type definitions for our data models
export interface Prompt {
  id: string;
  createdAt: number;
  updatedAt: number;
  currentVersionId: string;
  tags: string[];
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  systemPrompt: string;
  userPrompt: string;
  createdAt: number;
  characterCount: number;
  tokenEstimate: number;
  hash: string;
}

export interface Response {
  id: string;
  promptVersionId: string;
  promptHash: string;
  provider: 'claude' | 'openai' | 'gemini';
  model: string;
  content: string;
  tokensIn: number;
  tokensOut: number;
  estimatedCost: number;
  createdAt: number;
  responseTimeMs: number;
  fromCache: boolean;
}

export interface Rule {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  order: number;
  active: boolean;
}

export interface TagMeta {
  name: string;
  usageCount: number;
  lastUsedAt: number;
}

export interface Settings {
  id: string;
  apiKeys: {
    claude?: string;
    openai?: string;
    gemini?: string;
  };
  defaultModels: {
    claude: string;
    openai: string;
    gemini: string;
  };
  lastBackupAt?: number;
}

const DB_NAME = 'prompt-lab';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

/**
 * Initialize and return the IndexedDB database instance
 */
export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create prompts store
      if (!db.objectStoreNames.contains('prompts')) {
        const promptsStore = db.createObjectStore('prompts', { keyPath: 'id' });
        promptsStore.createIndex('by-createdAt', 'createdAt');
        promptsStore.createIndex('by-updatedAt', 'updatedAt');
      }

      // Create promptVersions store
      if (!db.objectStoreNames.contains('promptVersions')) {
        const versionsStore = db.createObjectStore('promptVersions', { keyPath: 'id' });
        versionsStore.createIndex('by-promptId', 'promptId');
        versionsStore.createIndex('by-hash', 'hash');
        versionsStore.createIndex('by-createdAt', 'createdAt');
      }

      // Create responses store
      if (!db.objectStoreNames.contains('responses')) {
        const responsesStore = db.createObjectStore('responses', { keyPath: 'id' });
        responsesStore.createIndex('by-promptVersionId', 'promptVersionId');
        responsesStore.createIndex('by-provider', 'provider');
        responsesStore.createIndex('by-model', 'model');
      }

      // Create rules store
      if (!db.objectStoreNames.contains('rules')) {
        const rulesStore = db.createObjectStore('rules', { keyPath: 'id' });
        rulesStore.createIndex('by-order', 'order');
        rulesStore.createIndex('by-active', 'active');
      }

      // Create tagMeta store
      if (!db.objectStoreNames.contains('tagMeta')) {
        const tagMetaStore = db.createObjectStore('tagMeta', { keyPath: 'name' });
        tagMetaStore.createIndex('by-usageCount', 'usageCount');
        tagMetaStore.createIndex('by-lastUsedAt', 'lastUsedAt');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

/**
 * Get the database instance (must call initDB first)
 */
export async function getDB(): Promise<IDBPDatabase> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

/**
 * Database promise for convenient access
 */
export const db = getDB();

/**
 * Close the database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
