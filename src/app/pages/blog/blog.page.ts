import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentService } from '../../content/content.service';
import { SeoService } from '../../core/seo.service';
import { AnimateInDirective, type AnimateInConfig } from '../../shared/animate-in.directive';
import { BlogService } from './blog.service';
import { formatMonthYear } from './format-date';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink, AnimateInDirective],
  templateUrl: './blog.page.html',
  styleUrl: './blog.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage implements OnDestroy {
  private readonly content = inject(ContentService);
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);

  readonly t = computed(() => this.content.dict().blogPage);
  readonly lang = this.content.lang;
  readonly loaded = this.blog.loaded;
  readonly error = this.blog.error;
  private readonly posts = this.blog.posts;

  // Filtros reativos (Angular Signals).
  readonly searchTerm = signal('');
  readonly selectedTag = signal('');

  // Scroll infinito: quantos itens estão visíveis no momento.
  readonly visibleCount = signal(PAGE_SIZE);

  /** Temas disponíveis no idioma atual (derivados dos posts). */
  readonly tags = computed(() => [...new Set(this.posts().map((p) => p.tag[this.lang()]))].sort());

  readonly filtered = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const tag = this.selectedTag();
    const lang = this.lang();
    return this.posts().filter((p) => {
      if (tag && p.tag[lang] !== tag) return false;
      if (q) {
        const hay = `${p.title[lang]} ${p.excerpt[lang]} ${p.tag[lang]}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  readonly visible = computed(() => this.filtered().slice(0, this.visibleCount()));
  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;

  readonly anims: AnimateInConfig[] = [
    { target: '.blog-page__intro > *', from: { autoAlpha: 0, y: 24 }, stagger: 0.08, start: 'top 90%' },
  ];

  constructor() {
    this.seo.setMeta(() => this.content.dict().seo.blog, { pt: '/blog', en: '/blog' });

    // Liga o IntersectionObserver assim que o sentinela existir no DOM (ele só é
    // renderizado depois que o índice carrega). O viewChild é um signal, então o
    // effect reage quando o elemento aparece.
    effect(() => {
      const el = this.sentinel()?.nativeElement;
      if (el && !this.observer) this.attachObserver(el);
    });
  }

  private attachObserver(el: HTMLElement): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && this.hasMore()) {
          this.visibleCount.update((n) => n + PAGE_SIZE);
        }
      },
      { rootMargin: '300px' },
    );
    this.observer.observe(el);
  }

  date(d: string): string {
    return formatMonthYear(d, this.lang());
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.visibleCount.set(PAGE_SIZE);
  }

  onTag(value: string): void {
    this.selectedTag.set(value);
    this.visibleCount.set(PAGE_SIZE);
  }

  /** Lê o valor de um input/select. */
  val(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
