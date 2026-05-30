import { Directive, ElementRef, DestroyRef, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Faz a seção surgir e desaparecer (opacidade) conforme entra e sai do viewport,
 * com scrub ligado ao scroll. Reproduz o comportamento antes centralizado no App,
 * mas agora declarado dentro de cada componente de seção.
 *
 *   <section class="section" sectionFade> ... </section>
 */
@Directive({
  selector: '[sectionFade]',
  standalone: true,
})
export class SectionFadeDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const sec = this.host.nativeElement;

      const ctx = gsap.context(() => {
        // Estado inicial invisível.
        gsap.set(sec, { opacity: 0 });

        // Aumenta a opacidade quando a seção entra no viewport.
        gsap.fromTo(
          sec,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 95%',
              end: 'top 60%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );

        // Faz a seção desaparecer quando ela está saindo do viewport.
        gsap.fromTo(
          sec,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'bottom 30%',
              end: 'bottom 0%',
              scrub: 0.2,
              invalidateOnRefresh: true,
            },
          },
        );
      }, sec);

      this.destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
