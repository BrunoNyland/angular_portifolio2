import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, catchError, from, map, of, shareReplay, switchMap } from 'rxjs';

import { Lang } from '../../content/content.types';
import { BlogIndexFile, BlogPost, BlogPostMeta } from './blog.types';

/**
 * Carrega o índice leve de posts (`/blog/posts.json`) uma única vez e baixa o
 * corpo `.md` de cada post sob demanda, renderizando-o para HTML seguro.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly _posts = signal<BlogPostMeta[]>([]);
  readonly posts = this._posts.asReadonly();
  readonly loaded = signal(false);
  readonly error = signal(false);

  /** Posts marcados como destaque (exibidos na home). */
  readonly featured = computed(() => this._posts().filter((p) => p.featured));

  private index$?: Observable<BlogPostMeta[]>;

  constructor() {
    this.loadIndex().subscribe();
  }

  /** Índice de posts, ordenado do mais recente ao mais antigo (cacheado). */
  loadIndex(): Observable<BlogPostMeta[]> {
    if (!this.index$) {
      this.index$ = this.http.get<BlogIndexFile>('/blog-content/posts.json').pipe(
        map((file) => [...(file?.posts ?? [])].sort((a, b) => b.date.localeCompare(a.date))),
        catchError(() => {
          this.error.set(true);
          this.loaded.set(true);
          return of<BlogPostMeta[]>([]);
        }),
        shareReplay(1),
      );
      this.index$.subscribe((posts) => {
        if (posts.length || !this.error()) {
          this._posts.set(posts);
          this.loaded.set(true);
        }
      });
    }
    return this.index$;
  }

  getPost(slug: string, lang: Lang): Observable<BlogPost | null> {
    return this.loadIndex().pipe(
      switchMap((posts) => {
        const meta = posts.find((p) => p.slug.pt === slug || p.slug.en === slug);
        if (!meta) return of(null);
        return this.fetchMarkdown(meta, lang).pipe(
          // Importa o renderizador (marked + highlight.js) sob demanda: ele só é
          // baixado ao abrir um post, ficando fora do bundle inicial da home.
          switchMap((md) =>
            from(import('./markdown')).pipe(
              map(({ renderMarkdown }) => ({
                meta,
                html: this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(md)),
              })),
            ),
          ),
        );
      }),
    );
  }

  /** Baixa o `.md` do idioma; se faltar a versão EN, cai para a PT. */
  private fetchMarkdown(meta: BlogPostMeta, lang: Lang): Observable<string> {
    const currentSlug = meta.slug[lang];
    return this.http.get(`/blog-content/${currentSlug}.${lang}.md`, { responseType: 'text' }).pipe(
      catchError(() =>
        lang === 'pt'
          ? of('')
          : this.http
              .get(`/blog-content/${meta.slug.pt}.pt.md`, { responseType: 'text' })
              .pipe(catchError(() => of(''))),
      ),
    );
  }
}
