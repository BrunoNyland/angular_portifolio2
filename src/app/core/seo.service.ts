import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContentService } from '../content/content.service';
import { Lang, SeoEntry } from '../content/content.types';

/** Caminhos localizados (hreflang/canonical) que uma página declara por idioma. */
export type SeoAlternates = Partial<Record<Lang, string>>;

const OG_LOCALE: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' };
const SITE_NAME = 'Bruno Nyland';

/**
 * Atualiza dinamicamente `<title>`, `<meta name="description">`, Open Graph,
 * Twitter Cards, `<link rel="canonical">` e `<link rel="alternate" hreflang>`
 * conforme a página ativa e o idioma selecionado. Cada página chama `setMeta()`
 * passando um getter reativo (que lê o dicionário do idioma) — um único effect
 * reaplica todas as tags sempre que a página ou o idioma muda.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly content = inject(ContentService);
  private readonly doc = inject(DOCUMENT);

  private readonly source = signal<(() => SeoEntry) | null>(null);
  private readonly alternates = signal<SeoAlternates>({});

  constructor() {
    effect(() => {
      const get = this.source();
      if (!get) return;
      // Ler o idioma e o getter (que consome o dicionário) torna o effect
      // reativo a ambos: troca de página e troca de idioma reaplicam as tags.
      const lang = this.content.lang();
      const { title, desc } = get();

      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: desc });

      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[lang] });

      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: desc });

      this.applyUrls(lang);
    });
  }

  /**
   * Define a fonte reativa dos metadados da página atual.
   * @param source getter que retorna o `SeoEntry` do idioma vigente
   *   (ex.: `() => content.dict().seo.home`).
   * @param alternates caminhos localizados por idioma para canonical/hreflang
   *   (ex.: `{ pt: '/certificados', en: '/certificates' }`).
   */
  setMeta(source: () => SeoEntry, alternates: SeoAlternates = {}): void {
    this.alternates.set(alternates);
    this.source.set(source);
  }

  /** Atualiza canonical, og:url e os alternates hreflang para o idioma atual. */
  private applyUrls(lang: Lang): void {
    const origin = this.doc.location?.origin ?? '';
    const alts = this.alternates();
    const currentPath = alts[lang] ?? this.doc.location?.pathname ?? '/';
    const canonical = origin + currentPath;

    this.setLink('canonical', canonical);
    this.meta.updateTag({ property: 'og:url', content: canonical });

    // Alternates por idioma + x-default (aponta para o PT, idioma padrão).
    const entries = Object.entries(alts) as Array<[Lang, string]>;
    for (const [code, path] of entries) {
      this.setAlternate(code, origin + path);
    }
    const fallback = alts.pt ?? alts.en;
    if (fallback) this.setAlternate('x-default', origin + fallback);
  }

  private setLink(rel: string, href: string): void {
    let el = this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', rel);
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  private setAlternate(hreflang: string, href: string): void {
    let el = this.doc.head.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang}"]`,
    );
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', 'alternate');
      el.setAttribute('hreflang', hreflang);
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }
}
