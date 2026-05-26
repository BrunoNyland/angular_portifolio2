import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-blog',
  template: `
    <section class="section" id="sec-blog" data-screen-label="06 Blog">
      <div class="section__head">
        <span class="num">{{ b().num }}</span>
        <span class="ttl">{{ b().title }}</span>
      </div>
      <div class="blog">
        @for (p of b().items; track p.t) {
          <div class="post">
            <div class="post__meta">
              <span class="tag">{{ p.tag }}</span>
              <span>{{ p.date }}</span>
            </div>
            <div class="post__title">{{ p.t }}</div>
            <div class="post__excerpt">{{ p.x }}</div>
            <div class="post__cta">
              <span>{{ b().cta }}</span>
              <span class="arr">→</span>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogComponent {
  private readonly content = inject(ContentService);
  readonly b = () => this.content.dict().blog;
}
