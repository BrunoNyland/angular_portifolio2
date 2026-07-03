import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content/content.service';
import { ProjectsService } from '../pages/projects/projects.service';
import { Project } from '../pages/projects/project.types';
import { AnimateInDirective, type AnimateInConfig } from '../shared/animate-in.directive';
import { SectionFadeDirective } from '../shared/section-fade.directive';

@Component({
  selector: 'app-work',
  imports: [RouterLink, AnimateInDirective, SectionFadeDirective],
  template: `
    <section
      class="section"
      id="sec-work"
      data-screen-label="04 Projetos"
      sectionFade
      [animateIn]="anims"
    >
      <div class="section__head">
        <span class="num">{{ w().num }}</span>
        <span class="ttl">{{ w().title }}</span>
      </div>

      @if (featured().length) {
        <div class="projects">
          @for (p of featured(); track p.slug.pt) {
            <a
              class="project"
              [href]="p.url"
              target="_blank"
              rel="noopener"
              (mouseenter)="cacheRect($event)"
              (mousemove)="tilt($event)"
            >
              <div class="project__head">
                <span>{{ pad(index(p) + 1) }} · {{ p.category[lang()] }}</span>
                <span class="yr">{{ p.year }}</span>
              </div>
              <div class="project__visual">
                <img
                  [src]="imgHref(p)"
                  [alt]="p.imageAlt[lang()]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <div class="project__title">
                  <span>{{ p.title[lang()] }}</span
                  ><span class="arr">↗</span>
                </div>
                <div class="project__excerpt">{{ p.excerpt[lang()] }}</div>
                <div class="project__tags">
                  @for (tag of p.tags; track tag) {
                    <span>{{ tag }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
        <div class="projects__all">
          <a routerLink="/projetos">{{ w().all }} <span class="arr">→</span></a>
        </div>
      } @else if (loaded()) {
        <p class="projects__empty">{{ w().empty }}</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent {
  private readonly content = inject(ContentService);
  private readonly projectsService = inject(ProjectsService);

  readonly w = () => this.content.dict().work;
  readonly lang = this.content.lang;
  readonly featured = this.projectsService.featured;
  readonly loaded = this.projectsService.loaded;

  readonly anims: AnimateInConfig[] = [
    { target: '.section__head > *' },
    {
      target: '.project',
      from: { autoAlpha: 0, y: 50 },
      stagger: 0.1,
      duration: 0.8,
      start: 'top 80%',
    },
  ];

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  index(p: Project): number {
    return this.featured().indexOf(p);
  }

  imgHref(p: Project): string {
    return `projects-content/${encodeURIComponent(p.image)}`;
  }

  private rect?: DOMRect;

  cacheRect(e: MouseEvent): void {
    this.rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  }

  tilt(e: MouseEvent): void {
    const r = this.rect;
    if (!r) return;
    const el = e.currentTarget as HTMLElement;
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  }
}
