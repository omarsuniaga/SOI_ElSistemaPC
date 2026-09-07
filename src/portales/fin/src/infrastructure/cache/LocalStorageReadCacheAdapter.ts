import { ICacheStoragePort } from '../../application/ports/ICacheStoragePort';
import { checkSupabaseConnection } from '../supabase/SupabaseClient';

export class LocalStorageReadCacheAdapter implements ICacheStoragePort {
  private readonly prefix: string;

  constructor(prefix: string = 'SOI_CACHE_') {
    this.prefix = prefix;
  }

  public get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[LocalStorageReadCacheAdapter] Read error for key "${key}":`, e);
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[LocalStorageReadCacheAdapter] Cache write error for key "${key}":`, e);
    }
  }

  public remove(key: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(this.prefix + key);
    } catch (e) {
      console.warn(`[LocalStorageReadCacheAdapter] Remove error for key "${key}":`, e);
    }
  }

  public async isBackendReachable(): Promise<boolean> {
    return await checkSupabaseConnection();
  }
}
