import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-work',
  template: `
    <section class="section" id="sec-work" data-screen-label="04 Projetos">
      <div class="section__head">
        <span class="num">{{ w().num }}</span>
        <span class="ttl">{{ w().title }}</span>
      </div>
      <div class="projects">
        @for (p of w().items; track p.t; let i = $index) {
          <div class="project" (mousemove)="tilt($event)">
            <div class="project__head">
              <span>{{ pad(i + 1) }} · {{ p.k }}</span>
              <span class="yr">{{ p.y }}</span>
            </div>
            <div class="project__visual">
              <span class="blob"></span>
              <span class="ph">{{ p.ph }}</span>
            </div>
            <div>
              <div class="project__title"><span>{{ p.t }}</span><span class="arr">↗</span></div>
              <div class="project__tags">
                @for (tag of p.tags; track tag) {
                  <span>{{ tag }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkComponent {
  private readonly content = inject(ContentService);
  readonly w = () => this.content.dict().work;

  pad(n: number): string { return String(n).padStart(2, '0'); }

  tilt(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }
}
