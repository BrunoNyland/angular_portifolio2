import { Location } from '@angular/common';
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
import { Lang } from '../../content/content.types';
import { LayoutService } from '../../core/layout.service';
import { SeoService } from '../../core/seo.service';
import { AnimateInDirective, type AnimateInConfig } from '../../shared/animate-in.directive';
import { ProjectsService } from './projects.service';
import { Project } from './project.types';

const PAGE_SIZE = 6;

/** Slug da URL por idioma (links localizados e compartilháveis). */
const PROJECT_SLUG: Record<Lang, string> = { pt: '/projetos', en: '/projects' };

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink, AnimateInDirective],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage implements OnDestroy {
  private readonly content = inject(ContentService);
  private readonly service = inject(ProjectsService);
  private readonly seo = inject(SeoService);
  private readonly layout = inject(LayoutService);
  private readonly location = inject(Location);

  readonly t = computed(() => this.content.dict().projectsPage);
  readonly lang = this.content.lang;
  readonly loaded = this.service.loaded;
  readonly error = this.service.error;
  private readonly projects = this.service.projects;

  // Filtros reativos (signals controlados pelos inputs do template).
  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly selectedTag = signal('');

  readonly categories = computed(() =>
    [...new Set(this.projects().map((p) => p.category[this.lang()]))].sort(),
  );
  readonly tags = computed(() => [...new Set(this.projects().flatMap((p) => p.tags))].sort());

  readonly filtered = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const cat = this.selectedCategory();
    const tag = this.selectedTag();
    const lang = this.lang();
    return this.projects().filter((p) => {
      if (cat && p.category[lang] !== cat) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (q) {
        const hay =
          `${p.title[lang]} ${p.excerpt[lang]} ${p.description[lang]} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  readonly visible = computed(() => this.filtered().slice(0, this.visibleCount()));
  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  // Scroll infinito: quantos itens estão visíveis no momento.
  readonly visibleCount = signal(PAGE_SIZE);
  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;

  readonly anims: AnimateInConfig[] = [
    {
      target: '.projects__intro > *',
      from: { autoAlpha: 0, y: 24 },
      stagger: 0.08,
      start: 'top 90%',
    },
  ];

  constructor() {
    // Define o idioma a partir do slug pelo qual a página foi aberta.
    const entry = this.currentPath();
    if (entry === PROJECT_SLUG.en) this.content.setLang('en');
    else if (entry === PROJECT_SLUG.pt) this.content.setLang('pt');

    this.layout.onProjects.set(true);

    // Mantém a URL do navegador refletindo o idioma selecionado.
    effect(() => {
      const target = PROJECT_SLUG[this.content.lang()];
      if (this.currentPath() !== target) this.location.replaceState(target);
    });

    this.seo.setMeta(() => this.content.dict().seo.projects, {
      pt: PROJECT_SLUG.pt,
      en: PROJECT_SLUG.en,
    });

    // Liga o IntersectionObserver assim que o sentinela existir no DOM.
    effect(() => {
      const el = this.sentinel()?.nativeElement;
      if (el && !this.observer) this.attachObserver(el);
    });
  }

  ngOnDestroy(): void {
    this.layout.onProjects.set(false);
    this.observer?.disconnect();
  }

  /** Caminho atual sem query string nem fragmento. */
  private currentPath(): string {
    return this.location.path().split('?')[0].split('#')[0];
  }

  imageHref(p: Project): string {
    return `projects-content/${encodeURIComponent(p.image)}`;
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.visibleCount.set(PAGE_SIZE);
  }

  onCategory(value: string): void {
    this.selectedCategory.set(value);
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
}
