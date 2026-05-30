import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { AnimateInDirective, type AnimateInConfig } from '../shared/animate-in.directive';
import { SectionFadeDirective } from '../shared/section-fade.directive';

@Component({
  selector: 'app-skills',
  imports: [AnimateInDirective, SectionFadeDirective],
  template: `
    <section class="section" id="sec-skills" data-screen-label="03 Skills" sectionFade [animateIn]="anims">
      <div class="section__head">
        <span class="num">{{ s().num }}</span>
        <span class="ttl">{{ s().title }}</span>
      </div>
      <div class="skills">
        @for (g of s().groups; track g.cat; let i = $index) {
          <div class="skill">
            <div class="skill__idx">0{{ i + 1 }}</div>
            <div class="skill__cat">{{ g.cat }}</div>
            <div class="skill__list">
              @for (item of g.items; track item) {
                <span>{{ item }}</span>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsComponent {
  private readonly content = inject(ContentService);
  readonly s = () => this.content.dict().skills;

  readonly anims: AnimateInConfig[] = [
    { target: '.section__head > *' },
    { target: '.skill', from: { autoAlpha: 0, y: 40 }, stagger: 0.08, start: 'top 75%' },
  ];
}
