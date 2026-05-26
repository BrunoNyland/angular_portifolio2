import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-skills',
  template: `
    <section class="section" id="sec-skills" data-screen-label="03 Skills">
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
}
