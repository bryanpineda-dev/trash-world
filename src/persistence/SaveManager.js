import { SAVE_KEY, SAVE_VERSION } from '../core/Config.js';
import { normalizeSave } from './SaveSchema.js';

export class SaveManager {
  constructor(storage, now = Date.now) {
    this.storage = storage;
    this.now = now;
    this.writable = true;
    this.status = 'local';
  }

  load() {
    let raw;
    try { raw = this.storage?.getItem(SAVE_KEY); }
    catch { this.status = 'memory'; return null; }
    if (!raw) { if (!this.storage) this.status = 'memory'; return null; }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.version > SAVE_VERSION) {
        this.writable = false;
        this.status = 'future';
        return null;
      }
      return normalizeSave(parsed, this.now());
    } catch {
      try {
        this.storage.setItem(`${SAVE_KEY}.backup.${this.now()}`, raw);
        this.status = 'recovered';
      } catch {
        this.writable = false;
        this.status = 'memory';
      }
      return null;
    }
  }

  save(data) {
    if (!this.writable || !this.storage) return false;
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(normalizeSave(data, this.now())));
      this.status = 'local';
      return true;
    } catch { this.status = 'memory'; return false; }
  }

  reset() {
    try {
      this.storage?.removeItem(SAVE_KEY);
      this.writable = true;
      return true;
    } catch { this.status = 'memory'; return false; }
  }
}
