import { Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContentService } from '../content/content.service';

export interface SeoMeta {
  titlePt: string;
  titleEn: string;
  descPt: string;
  descEn: string;
}

/**
 * Atualiza dinamicamente `<title>` e `<meta name="description">` (+ Open Graph /
 * Twitter) conforme a página ativa e o idioma selecionado. Cada página chama
 * `setMeta()`; um effect reaplica as tags sempre que o idioma muda.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly content = inject(ContentService);

  private readonly current = signal<SeoMeta | null>(null);

  constructor() {
    effect(() => {
      const m = this.current();
      const lang = this.content.lang();
      if (!m) return;
      const title = lang === 'en' ? m.titleEn : m.titlePt;
      const desc = lang === 'en' ? m.descEn : m.descPt;

      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: desc });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: desc });
    });
  }

  setMeta(meta: SeoMeta): void {
    this.current.set(meta);
  }
}
