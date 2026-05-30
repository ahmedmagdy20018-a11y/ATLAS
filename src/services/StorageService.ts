/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { openDB, IDBPDatabase } from 'idb';
import { NetworkMetrics, Fault, Baseline, UserSettings } from '../types';

const DB_NAME = 'ATLAS_DB';
const DB_VERSION = 5;

export class StorageService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics', { keyPath: 'timestamp' });
        }
        if (!db.objectStoreNames.contains('faults')) {
          db.createObjectStore('faults', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('baselines')) {
          db.createObjectStore('baselines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }

  async saveMetrics(metrics: NetworkMetrics) {
    const db = await this.db;
    return db.put('metrics', metrics);
  }

  async getRecentMetrics(limit = 100): Promise<NetworkMetrics[]> {
    const db = await this.db;
    const tx = db.transaction('metrics', 'readonly');
    const store = tx.objectStore('metrics');
    let cursor = await store.openCursor(null, 'prev');
    const results: NetworkMetrics[] = [];
    while (cursor && results.length < limit) {
      results.push(cursor.value);
      cursor = await cursor.continue();
    }
    return results;
  }

  async saveFault(fault: Fault) {
    const db = await this.db;
    return db.put('faults', fault);
  }

  async getActiveFaults(): Promise<Fault[]> {
    const db = await this.db;
    const faults = await db.getAll('faults');
    return faults.filter(f => f.status === 'ACTIVE');
  }

  async saveSettings(settings: UserSettings) {
    const db = await this.db;
    for (const [key, value] of Object.entries(settings)) {
      await db.put('settings', { key, value });
    }
  }

  async getSettings(): Promise<Partial<UserSettings>> {
    const db = await this.db;
    const all = await db.getAll('settings');
    const settings: any = {};
    all.forEach(item => {
      settings[item.key] = item.value;
    });
    return settings;
  }
}

export const storageService = new StorageService();
