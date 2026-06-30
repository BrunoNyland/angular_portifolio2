import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content/content.service';
import { BlogService } from '../pages/blog/blog.service';
import { formatMonthYear } from '../pages/blog/format-date';
import { AnimateInDirective, type AnimateInConfig } from '../shared/animate-in.directive';
import { SectionFadeDirective } from '../shared/section-fade.directive';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, AnimateInDirective, SectionFadeDirective],
  template: `
    <section
      class="section"
      id="sec-blog"
      data-screen-label="06 Blog"
      sectionFade
      [animateIn]="anims"
    >
      <div class="section__head">
        <span class="num">{{ b().num }}</span>
        <span class="ttl">{{ b().title }}</span>
      </div>

      @if (featured().length) {
        <div class="blog">
          @for (p of featured(); track p.slug.pt) {
            <a class="post" [routerLink]="['/blog', p.slug[lang()]]">
              <div class="post__meta">
                <span class="tag">{{ p.tag[lang()] }}</span>
                <span>{{ date(p.date) }}</span>
              </div>
              <div class="post__title">{{ p.title[lang()] }}</div>
              <div class="post__excerpt">{{ p.excerpt[lang()] }}</div>
              <div class="post__cta">
                <span>{{ b().cta }}</span>
                <span class="arr">→</span>
              </div>
            </a>
          }
        </div>
        <div class="blog__all">
          <a routerLink="/blog">{{ b().all }} <span class="arr">→</span></a>
        </div>
      } @else if (loaded()) {
        <p class="blog__empty">{{ b().empty }}</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogComponent {
  private readonly content = inject(ContentService);
  private readonly blog = inject(BlogService);

  readonly b = () => this.content.dict().blog;
  readonly lang = this.content.lang;
  readonly featured = this.blog.featured;
  readonly loaded = this.blog.loaded;

  date(d: string): string {
    return formatMonthYear(d, this.lang());
  }

  readonly anims: AnimateInConfig[] = [
    { target: '.section__head > *' },
    {
      target: '.post',
      from: { autoAlpha: 0, y: 40 },
      stagger: 0.1,
      duration: 0.8,
      start: 'top 80%',
      toggle: 'play reverse play reverse',
    },
  ];
}
