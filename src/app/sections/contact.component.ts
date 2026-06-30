import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { FragComponent } from '../content/frag.component';
import { AnimateInDirective, type AnimateInConfig } from '../shared/animate-in.directive';
import { SectionFadeDirective } from '../shared/section-fade.directive';

@Component({
  selector: 'app-contact',
  imports: [FragComponent, AnimateInDirective, SectionFadeDirective],
  template: `
    <section
      class="section contact"
      id="sec-contact"
      data-screen-label="07 Contato"
      sectionFade
      [animateIn]="anims"
    >
      <div class="section__head">
        <span class="num">{{ c().num }}</span>
        <span class="ttl">{{ c().title }}</span>
      </div>
      <h2 class="contact__big"><app-frag [parts]="c().big" /></h2>
      <div class="contact__grid">
        @for (it of c().items; track it.l) {
          <a [href]="it.href" target="_blank" rel="noopener">
            <div class="l">{{ it.l }}</div>
            <div class="v">{{ it.v }}</div>
          </a>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly content = inject(ContentService);
  readonly c = () => this.content.dict().contact;

  readonly anims: AnimateInConfig[] = [
    { target: '.section__head > *' },
    {
      target: '.contact__big',
      from: { autoAlpha: 0, y: 60 },
      duration: 1,
      start: 'top 75%',
      ease: 'power3.out',
      toggle: 'play reverse play reverse',
    },
    {
      target: '.contact__grid > *',
      from: { autoAlpha: 0, y: 20 },
      stagger: 0.08,
      duration: 0.6,
      start: 'top 70%',
      toggle: 'play reverse play reverse',
    },
  ];
}
