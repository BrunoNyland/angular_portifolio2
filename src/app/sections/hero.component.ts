import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-hero',
  template: `
    <section class="section hero" id="sec-hero" data-screen-label="01 Hero">
      <div class="hero__meta-top">
        <div>{{ h().metaTitle }}</div>
        <b>{{ h().metaSub }}</b>
      </div>

      <div>
        <div class="eyebrow" style="margin-bottom:18px;">{{ h().eyebrow }}</div>
        <h1 class="hero__title">
          <span class="line"><i>{{ h().l1 }}</i></span>
          <span class="line"><i class="accent">{{ h().l2 }}</i></span>
          <span class="line"><i class="outline">{{ h().l3 }}</i></span>
          <span class="line"><i>{{ h().l4 }}</i></span>
        </h1>
      </div>

      <div class="hero__foot">
        <div><span>{{ h().foot1l }}</span><b>{{ h().foot1v }}</b></div>
        <div><span>{{ h().foot2l }}</span><b>{{ h().foot2v }}</b></div>
        <div><span>{{ h().foot3l }}</span><b>{{ h().foot3v }}</b></div>
        <div class="arrow">{{ h().foot4 }}</div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {
  private readonly content = inject(ContentService);
  readonly h = () => this.content.dict().hero;
}
