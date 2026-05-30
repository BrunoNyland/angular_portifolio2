import { Directive, ElementRef, DestroyRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface AnimateInConfig {
  /** Seletor de descendentes a animar. Omitido = o próprio elemento host. */
  target?: string;
  /** Estado inicial passado ao gsap.from(). Padrão: { autoAlpha: 0, y: 20 }. */
  from?: gsap.TweenVars;
  /** Duração em segundos. Padrão: 0.7. */
  duration?: number;
  /** Espaçamento entre elementos (ignorado quando perItem). Padrão: 0.1. */
  stagger?: number;
  /** ScrollTrigger start. Padrão: 'top 70%'. */
  start?: string;
  /** ScrollTrigger toggleActions. Padrão: 'play none none none'. */
  toggle?: string;
  /** Easing. Padrão: 'power2.out'. */
  ease?: string;
  /** Se true, cada alvo recebe seu próprio ScrollTrigger (sem stagger). */
  perItem?: boolean;
}

/**
 * Anima elementos com gsap.from() quando a seção entra no viewport (ScrollTrigger).
 *
 * Cada componente declara suas próprias animações de entrada, mantendo-as "dentro
 * do componente" em vez de centralizadas no App. Aceita uma config ou uma lista;
 * o elemento host (onde a diretiva é aplicada) é o trigger padrão.
 *
 *   <section [animateIn]="anims"> ... </section>
 */
@Directive({
  selector: '[animateIn]',
  standalone: true,
})
export class AnimateInDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly animateIn = input<AnimateInConfig | AnimateInConfig[]>();

  constructor() {
    afterNextRender(() => {
      const value = this.animateIn();
      if (!value) {
        return;
      }
      const configs = Array.isArray(value) ? value : [value];
      const root = this.host.nativeElement;

      const ctx = gsap.context(() => {
        for (const cfg of configs) {
          const targets = cfg.target
            ? Array.from(root.querySelectorAll<HTMLElement>(cfg.target))
            : [root];
          if (!targets.length) {
            continue;
          }

          const base: gsap.TweenVars = {
            ...(cfg.from ?? { autoAlpha: 0, y: 20 }),
            duration: cfg.duration ?? 0.7,
            ease: cfg.ease ?? 'power2.out',
          };
          const start = cfg.start ?? 'top 70%';
          const toggleActions = cfg.toggle ?? 'play none none none';

          if (cfg.perItem) {
            for (const el of targets) {
              gsap.from(el, {
                ...base,
                scrollTrigger: { trigger: el, start, toggleActions },
              });
            }
          } else {
            gsap.from(targets, {
              ...base,
              stagger: cfg.stagger ?? 0.1,
              scrollTrigger: { trigger: root, start, toggleActions },
            });
          }
        }
      }, root);

      this.destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
