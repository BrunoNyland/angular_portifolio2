import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-experience',
  template: `
    <section class="section" id="sec-xp" data-screen-label="05 Experiência">
      <div class="section__head">
        <span class="num">{{ x().num }}</span>
        <span class="ttl">{{ x().title }}</span>
      </div>
      <div class="timeline">
        @for (it of x().items; track it.co + it.from; let i = $index) {
          <div class="tl-item">
            <div class="tl-item__when">
              {{ it.from }} — {{ it.to }}<b>{{ pad(i + 1) }} / {{ x().items.length }}</b>
            </div>
            <div class="tl-item__role">{{ it.role }}<b>{{ it.co }}</b></div>
            <div class="tl-item__desc">{{ it.desc }}</div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceComponent {
  private readonly content = inject(ContentService);
  readonly x = () => this.content.dict().xp;
  pad(n: number): string { return String(n).padStart(2, '0'); }
}
