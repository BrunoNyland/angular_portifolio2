import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { FragComponent } from '../content/frag.component';
import { AnimateInDirective, type AnimateInConfig } from '../shared/animate-in.directive';
import { SectionFadeDirective } from '../shared/section-fade.directive';

@Component({
  selector: 'app-about',
  imports: [FragComponent, AnimateInDirective, SectionFadeDirective],
  template: `
    <section
      class="section"
      id="sec-about"
      data-screen-label="02 Sobre"
      sectionFade
      [animateIn]="anims"
    >
      <div class="section__head">
        <span class="num">{{ a().num }}</span>
        <span class="ttl">{{ a().title }}</span>
      </div>
      <div class="about">
        <div class="about__lead"><app-frag [parts]="a().lead" /></div>
        <div class="about__col">
          <p class="body">{{ a().p1 }}</p>
          <p class="body dim">{{ a().p2 }}</p>
          <div class="about__stats">
            @for (s of a().stats; track s.l) {
              <div>
                <div class="n">
                  {{ s.n }}<sup>{{ s.sup }}</sup>
                </div>
                <div class="l">{{ s.l }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly content = inject(ContentService);
  readonly a = () => this.content.dict().about;

  readonly anims: AnimateInConfig[] = [
    { target: '.section__head > *' },
    { target: '.about__lead', from: { autoAlpha: 0, y: 40 }, duration: 1, ease: 'power3.out' },
    { target: '.about__col > *', from: { autoAlpha: 0, y: 30 }, stagger: 0.2, start: 'top 65%' },
  ];
}
