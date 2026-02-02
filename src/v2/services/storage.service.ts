import { WorkshopSession, Settings } from '../types';

interface StorageRecord {
  id: string;
  [key: string]: any;
}

class StorageService {
  private readonly KEYS = {
    CURRENT_SESSION: 'prompt_lab_current_session',
    SETTINGS: 'prompt_lab_settings'
  };

  // Generic store methods
  save(storeName: string, record: StorageRecord): void {
    try {
      const key = `prompt_lab_${storeName}`;
      const existing = this.getAll(storeName);
      const filtered = existing.filter((r: StorageRecord) => r.id !== record.id);
      filtered.push(record);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error(`Failed to save to ${storeName}:`, error);
    }
  }

  getAll<T extends StorageRecord>(storeName: string): T[] {
    try {
      const key = `prompt_lab_${storeName}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(`Failed to load from ${storeName}:`, error);
      return [];
    }
  }

  clear(storeName: string): void {
    try {
      const key = `prompt_lab_${storeName}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to clear ${storeName}:`, error);
    }
  }

  // Session methods
  saveSession(session: WorkshopSession): void {
    try {
      localStorage.setItem(this.KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  loadSession(): WorkshopSession | null {
    try {
      const saved = localStorage.getItem(this.KEYS.CURRENT_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.KEYS.CURRENT_SESSION);
  }

  // Settings methods
  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  loadSettings(): Settings | null {
    try {
      const saved = localStorage.getItem(this.KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }
}

export const storageService = new StorageService();
