import { db } from './db.service';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants/providers';

export class SettingsService {
  /**
   * Get current settings (creates default if none exist)
   */
  async getSettings(): Promise<Settings> {
    try {
      const database = await db;
      const settings = await database.get('settings', 'default');
      
      if (!settings) {
        // Initialize with defaults
        await database.put('settings', DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      
      return settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update settings (partial update)
   */
  async updateSettings(updates: Partial<Omit<Settings, 'id' | 'createdAt'>>): Promise<Settings> {
    try {
      const database = await db;
      const current = await this.getSettings();
      
      const updated: Settings = {
        ...current,
        ...updates,
        id: 'default', // Ensure ID stays constant
        createdAt: current.createdAt, // Preserve creation time
        updatedAt: Date.now(),
      };
      
      await database.put('settings', updated);
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Set API key for a provider
   */
  async setApiKey(provider: string, apiKey: string): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings({
      apiKeys: {
        ...current.apiKeys,
        [provider]: apiKey,
      },
    });
  }

  /**
   * Remove API key for a provider
   */
  async removeApiKey(provider: string): Promise<void> {
    const current = await this.getSettings();
    const { [provider]: removed, ...remaining } = current.apiKeys;
    await this.updateSettings({ apiKeys: remaining });
  }

  /**
   * Set default model for a provider
   */
  async setDefaultModel(provider: string, modelId: string): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings({
      defaultModels: {
        ...current.defaultModels,
        [provider]: modelId,
      },
    });
  }

  /**
   * Export settings as JSON (excludes API keys for security)
   */
  async exportSettings(includeApiKeys: boolean = false): Promise<string> {
    const settings = await this.getSettings();
    const exportData = includeApiKeys
      ? settings
      : { ...settings, apiKeys: {} };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(json: string, mergeApiKeys: boolean = false): Promise<Settings> {
    try {
      const imported = JSON.parse(json) as Settings;
      const current = await this.getSettings();
      
      const merged: Settings = {
        ...imported,
        id: 'default',
        apiKeys: mergeApiKeys
          ? { ...current.apiKeys, ...imported.apiKeys }
          : imported.apiKeys || {},
        updatedAt: Date.now(),
      };
      
      const database = await db;
      await database.put('settings', merged);
      return merged;
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings file');
    }
  }

  /**
   * Reset to defaults (with confirmation)
   */
  async resetToDefaults(): Promise<Settings> {
    const database = await db;
    await database.put('settings', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

export const settingsService = new SettingsService();
