import { Injectable, computed, signal } from '@angular/core';
import { CONTENT } from './content.data';
import { Lang } from './content.types';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _lang = signal<Lang>(this.readInitial());
  readonly lang = this._lang.asReadonly();
  readonly dict = computed(() => CONTENT[this._lang()]);

  setLang(lang: Lang): void {
    this._lang.set(lang);
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }

  toggleLang(): void {
    this.setLang(this._lang() === 'pt' ? 'en' : 'pt');
  }

  private readInitial(): Lang {
    try {
      const s = localStorage.getItem('lang');
      if (s === 'pt' || s === 'en') return s;
    } catch {
      /* ignore */
    }
    return 'pt';
  }
}
