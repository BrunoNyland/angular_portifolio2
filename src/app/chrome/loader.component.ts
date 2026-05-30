import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-loader',
  template: `
    <div class="loader" #loaderEl>
      <div class="loader__top loader__meta">
        <div>{{ dict().loader.top1 }}</div>
        <div>{{ dict().loader.top2 }}</div>
      </div>

      <h2 class="loader__mark" [attr.aria-label]="dict().loader.top1">
        <span class="loader__word"
          ><i>{{ dict().hero.l1 }}</i></span
        >
        <span class="loader__word"
          ><i class="accent">{{ dict().hero.l2 }}</i></span
        >
      </h2>

      <div class="loader__meta">
        <div class="loader__bar"><i></i></div>
        <div class="loader__foot">
          <span>{{ dict().loader.foot1 }}</span>
          <span>{{ dict().loader.foot2 }}</span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  private readonly content = inject(ContentService);
  readonly dict = this.content.dict;
  readonly loaderEl = viewChild.required<ElementRef<HTMLDivElement>>('loaderEl');

  run(): Promise<HTMLDivElement> {
    return new Promise((resolve) => {
      const root = this.loaderEl().nativeElement;
      const words = root.querySelectorAll('.loader__word > i');
      const bar = root.querySelector('.loader__bar i');
      const meta = root.querySelectorAll('.loader__meta');

      // Estado inicial: wordmark fora da máscara e barra zerada.
      gsap.set(words, { autoAlpha: 0 });
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

      const tl = gsap.timeline({ onComplete: () => resolve(root) });
      // Metadados (topo/rodapé) aparecem com fade rápido.
      tl.from(meta, { autoAlpha: 0, y: 8, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
        // Wordmark sobe em cascata, igual à intro do hero.
        .to(words, { autoAlpha: 1, y: 0, x: 24, duration: 0.5, stagger: 0.06, ease: 'power2.out' })
        // Barra de acento varre da esquerda para a direita como indicador de loading.
        .to(bar, { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, 0.1)
        // Pequena pausa antes de a saída (slide up) ser disparada pelo App.
        .to({}, { duration: 0.2 });
    });
  }
}
