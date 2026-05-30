import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { CONTENT } from './content.data';
import { Lang } from './content.types';
import { StorageService } from '../core/storage.service';

const LANG_KEY = 'lang';
const DEFAULT_LANG: Lang = 'pt';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);
  private readonly _lang = signal<Lang>(this.readInitial());
  readonly lang = this._lang.asReadonly();
  readonly dict = computed(() => CONTENT[this._lang()]);

  setLang(lang: Lang): void {
    this._lang.set(lang);
    this.storage.set(LANG_KEY, lang);
    this.document.documentElement.lang = lang;
  }

  toggleLang(): void {
    this.setLang(this._lang() === 'pt' ? 'en' : 'pt');
  }

  private readInitial(): Lang {
    const stored = this.storage.get(LANG_KEY);
    return stored === 'pt' || stored === 'en' ? stored : DEFAULT_LANG;
  }
}
