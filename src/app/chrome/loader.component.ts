import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-loader',
  template: `
    <div class="loader" #loaderEl>
      <div class="loader__top">
        <div>{{ dict().loader.top1 }}</div>
        <div>{{ dict().loader.top2 }}</div>
      </div>
      <div>
        <div class="loader__num">{{ display() }}<span class="pct">%</span></div>
        <div class="loader__bar"><i [style.right.%]="100 - p()"></i></div>
        <div class="loader__foot">
          <span>{{ dict().loader.foot1 }}</span>
          <span>{{ dict().loader.foot2 }}</span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  private readonly content = inject(ContentService);
  readonly dict = this.content.dict;
  readonly loaderEl = viewChild.required<ElementRef<HTMLDivElement>>('loaderEl');
  readonly p = signal(0);
  readonly display = signal('000');

  run(): Promise<HTMLDivElement> {
    return new Promise((resolve) => {
      const tick = () => {
        const value = this.p();
        const inc = Math.max(0.4, (100 - value) * 0.04);
        const next = value + inc;
        if (next >= 100) {
          this.p.set(100);
          this.display.set('100');
          setTimeout(() => resolve(this.loaderEl().nativeElement), 350);
          return;
        }
        this.p.set(next);
        this.display.set(String(Math.floor(next)).padStart(3, '0'));
        setTimeout(tick, 30 + Math.random() * 30);
      };
      tick();
    });
  }
}
