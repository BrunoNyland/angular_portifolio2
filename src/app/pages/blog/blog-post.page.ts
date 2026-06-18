import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';

import { ContentService } from '../../content/content.service';
import { SeoService } from '../../core/seo.service';
import { BlogService } from './blog.service';
import { BlogPost } from './blog.types';
import { formatMonthYear } from './format-date';

/** `undefined` = carregando · `null` = não encontrado · objeto = post carregado. */
interface PostState {
  post: BlogPost | null | undefined;
  error: boolean;
}

@Component({
  selector: 'app-blog-post',
  imports: [RouterLink],
  templateUrl: './blog-post.page.html',
  styleUrl: './blog-post.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostPage {
  private readonly content = inject(ContentService);
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly t = computed(() => this.content.dict().blogPage);
  readonly lang = this.content.lang;

  // Re-busca o post sempre que o slug (rota) ou o idioma mudam.
  private readonly state$ = combineLatest([
    this.route.paramMap,
    toObservable(this.content.lang),
  ]).pipe(
    switchMap(([params, lang]) => {
      const currentSlug = params.get('slug') ?? '';
      return this.blog.getPost(currentSlug, lang).pipe(
        tap((post) => {
          if (post) {
            const expectedSlug = post.meta.slug[lang];
            if (currentSlug !== expectedSlug) {
              this.router.navigate(['/blog', expectedSlug], { replaceUrl: true });
            }
          }
        }),
        map((post) => ({ post, error: false }) as PostState),
        startWith({ post: undefined, error: false } as PostState),
        catchError(() => of({ post: null, error: true } as PostState)),
      );
    }),
  );
  readonly state = toSignal(this.state$, {
    initialValue: { post: undefined, error: false } as PostState,
  });

  constructor() {
    // Getter reativo: a tag/descrição do post no idioma atual. O effect do
    // SeoService o reexecuta quando o post carrega ou o idioma muda; o canonical
    // sai do caminho atual da URL (o slug é o mesmo nos dois idiomas).
    this.seo.setMeta(() => {
      const post = this.state().post;
      const lang = this.content.lang();
      if (!post) return this.content.dict().seo.blog;
      return { title: `${post.meta.title[lang]} — Bruno Nyland`, desc: post.meta.excerpt[lang] };
    });
  }

  date(d: string): string {
    return formatMonthYear(d, this.lang());
  }
}
