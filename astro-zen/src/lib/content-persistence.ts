/**
 * Content Persistence Utilities
 * Handles auto-save, backup, and recovery for blog and project editors
 */

export interface AutoSaveData<T = any> {
  data: T;
  timestamp: string;
  version: string;
}

export class ContentPersistence {
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_AGE_HOURS = 24;

  /**
   * Save data to localStorage with timestamp
   */
  static save<T>(key: string, data: T): boolean {
    try {
      const autoSaveData: AutoSaveData<T> = {
        data,
        timestamp: new Date().toISOString(),
        version: this.VERSION,
      };
      localStorage.setItem(key, JSON.stringify(autoSaveData));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Load data from localStorage with age validation
   */
  static load<T>(key: string): T | null {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed: AutoSaveData<T> = JSON.parse(saved);
      
      // Check if data is too old
      const savedTime = new Date(parsed.timestamp);
      const ageHours = (Date.now() - savedTime.getTime()) / 1000 / 60 / 60;
      
      if (ageHours > this.MAX_AGE_HOURS) {
        this.clear(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      this.clear(key);
      return null;
    }
  }

  /**
   * Get the age of saved data in minutes
   */
  static getAge(key: string): number | null {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed: AutoSaveData = JSON.parse(saved);
      const savedTime = new Date(parsed.timestamp);
      return (Date.now() - savedTime.getTime()) / 1000 / 60;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear saved data
   */
  static clear(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Check if there's saved data available
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Create a backup of current data before major operations
   */
  static createBackup<T>(key: string, data: T): boolean {
    return this.save(`${key}-backup`, data);
  }

  /**
   * Restore from backup
   */
  static restoreBackup<T>(key: string): T | null {
    const backup = this.load<T>(`${key}-backup`);
    if (backup) {
      this.save(key, backup);
      this.clear(`${key}-backup`);
    }
    return backup;
  }

  /**
   * List all auto-save keys in localStorage
   */
  static listAutoSaves(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('autosave') || key.includes('editor'))) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Clean up old auto-saves
   */
  static cleanupOldSaves(): number {
    let cleaned = 0;
    const keys = this.listAutoSaves();
    
    for (const key of keys) {
      const age = this.getAge(key);
      if (age !== null && age > this.MAX_AGE_HOURS * 60) {
        this.clear(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

/**
 * Hook for periodic cleanup of old auto-saves
 */
export function initAutoSaveCleanup(): void {
  // Run cleanup on page load
  ContentPersistence.cleanupOldSaves();
  
  // Run cleanup every hour
  setInterval(() => {
    ContentPersistence.cleanupOldSaves();
  }, 60 * 60 * 1000);
}
