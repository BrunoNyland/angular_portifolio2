import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * SSR-safe wrapper around `localStorage`.
 *
 * On the server (or when storage is unavailable, e.g. private mode or
 * disabled cookies) every operation degrades to a no-op instead of throwing,
 * so callers never need their own try/catch or platform guards.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore: quota exceeded, private mode, etc. */
    }
  }
}
