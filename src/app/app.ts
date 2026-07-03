import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { ContentService } from './content/content.service';
import { Lang } from './content/content.types';
import { SceneService } from './scene/scene.service';
import { TweaksService } from './tweaks/tweaks.service';
import { LayoutService } from './core/layout.service';

import { LoaderComponent } from './chrome/loader.component';
import { NavComponent } from './chrome/nav.component';
import { TotopComponent } from './chrome/totop.component';
import { FooterComponent } from './chrome/footer.component';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet, LoaderComponent, NavComponent, TotopComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly content = inject(ContentService);
  private readonly scene = inject(SceneService);
  private readonly tweaks = inject(TweaksService);
  private readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly cursorEl = viewChild.required<ElementRef<HTMLDivElement>>('cursor');
  readonly loader = viewChild<LoaderComponent>('loader');

  readonly showLoader = signal(true);
  readonly progress = signal(0);
  readonly totopVisible = signal(false);

  private lenis?: Lenis;
  private tickerHandler?: (time: number) => void;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseOverHandler?: (e: MouseEvent) => void;
  private mouseOutHandler?: (e: MouseEvent) => void;
  private resizeHandler?: () => void;

  // Métricas de layout cacheadas para evitar leituras (forced reflow) a cada evento de scroll.
  private winH = window.innerHeight;
  private maxScroll = 1;

  ngAfterViewInit(): void {
    document.documentElement.lang = this.content.lang();

    // Reage a mudanças de rota: reseta o scroll, atualiza os gatilhos do GSAP e,
    // se houver uma seção pendente (volta cross-route à home), rola até ela.
    // `takeUntilDestroyed` limpa a assinatura junto com o componente, sem OnDestroy manual.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => this.onRouteChange(e.urlAfterRedirects));

    queueMicrotask(async () => {
      const loaderEl = await this.loader()?.run();
      if (loaderEl) {
        await new Promise<void>((res) => {
          // Anima o loader para cima e faz o elemento desaparecer quando a animação termina.
          // O easing 'expo.inOut' garante uma transição suave no início e no final.
          gsap.to(loaderEl, {
            yPercent: -100,
            duration: 1.1,
            ease: 'expo.inOut',
            onComplete: () => {
              loaderEl.style.display = 'none';
              this.showLoader.set(false);
              document.body.classList.add('is-loaded');
              document.body.classList.remove('is-loading');
              res();
            },
          });
        });
      }

      // Revela o nav: ele vive no shell, então deve aparecer em qualquer rota
      // (inclusive acesso direto a /certificados), não só na intro da Home.
      gsap.to('.nav', { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });

      this.initLenis();
      this.initInteractions();
      // Libera as animações específicas da página (Home) agora que o shell está pronto.
      this.layout.appReady.set(true);
    });

    document.body.classList.add('is-loading');
  }

  ngOnDestroy(): void {
    this.lenis?.destroy();
    if (this.tickerHandler) gsap.ticker.remove(this.tickerHandler);
    if (this.mouseMoveHandler) window.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.mouseOverHandler) document.removeEventListener('mouseover', this.mouseOverHandler);
    if (this.mouseOutHandler) document.removeEventListener('mouseout', this.mouseOutHandler);
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      ScrollTrigger.removeEventListener('refresh', this.resizeHandler);
    }
    ScrollTrigger.killAll();
  }

  // Lê o layout uma única vez e guarda os valores usados no handler de scroll.
  private recomputeMetrics(): void {
    this.winH = window.innerHeight;
    this.maxScroll = document.documentElement.scrollHeight - this.winH || 1;
  }

  private onRouteChange(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const frag = this.layout.pendingFragment();
    // Aguarda a nova view renderizar antes de medir/rolar — sem "timeout mágico".
    // `afterNextRender` dispara após o próximo render, robusto em dispositivos lentos.
    afterNextRender(
      () => {
        this.recomputeMetrics();
        ScrollTrigger.refresh();
        if (frag && path === '/') {
          const target = document.getElementById(frag);
          if (target && this.lenis) this.lenis.scrollTo(target, { offset: 0, duration: 1.2 });
          this.layout.pendingFragment.set(null);
        } else {
          this.lenis?.scrollTo(0, { immediate: true });
        }
      },
      { injector: this.injector },
    );
  }

  setLang(lang: Lang): void {
    this.content.setLang(lang);
    this.scene.pulse();
    queueMicrotask(() => {
      const lines = document.querySelectorAll<HTMLElement>('.hero__title .line > i');
      if (lines.length) {
        gsap.fromTo(
          lines,
          { y: 0, yPercent: 110 },
          { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 },
        );
      }
      ScrollTrigger.refresh();
    });
  }

  goTo(id: string): void {
    const onHome = this.router.url.split('?')[0].split('#')[0] === '/';
    if (onHome) {
      const target = document.getElementById(id);
      if (!target || !this.lenis) return;
      this.scene.pulse();
      this.lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    } else {
      // Em outra rota: navega para a home e deixa o handler de rota rolar até a seção.
      this.layout.pendingFragment.set(id);
      this.router.navigateByUrl('/');
    }
  }

  goTop(): void {
    this.scene.pulse();
    this.lenis?.scrollTo(0, { duration: 1.6 });
  }

  onMenuToggle(open: boolean): void {
    // Trava o scroll suave de fundo enquanto o menu móvel em tela cheia está aberto.
    if (open) this.lenis?.stop();
    else this.lenis?.start();
  }

  goHome(): void {
    const onHome = this.router.url.split('?')[0].split('#')[0] === '/';
    if (onHome) {
      // Já na home: apenas rola suavemente até o topo.
      this.goTop();
    } else {
      // Em outra rota (ex.: certificados): volta para a home; o handler de rota
      // posiciona no topo.
      this.router.navigateByUrl('/');
    }
  }

  private initLenis(): void {
    this.zone.runOutsideAngular(() => {
      const speed = this.tweaks.tweaks().scrollSpeed || 1.1;
      this.lenis = new Lenis({
        duration: speed,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      this.lenis.on('scroll', (e: { scroll: number }) => {
        this.scene.setScroll(e.scroll);
        ScrollTrigger.update();
        // Usa métricas cacheadas em vez de ler scrollHeight/innerHeight a cada frame (evita forced reflow).
        const pct = e.scroll / this.maxScroll;
        this.progress.set(pct * 100);
        this.totopVisible.set(e.scroll > this.winH * 0.6);
      });
      // Sincroniza o loop do Lenis com o ticker de frames do GSAP para manter o scroll suave.
      // Guarda o handler para removê-lo no destroy (evita listeners duplicados em hot reload).
      this.tickerHandler = (t: number) => this.lenis?.raf(t * 1000);
      gsap.ticker.add(this.tickerHandler);
      // Desativa o ajuste automático de lag do ticker para evitar comportamentos estranhos na animação de scroll.
      gsap.ticker.lagSmoothing(0);

      // Mede o layout uma vez agora e só recalcula quando ele realmente muda.
      this.recomputeMetrics();
      this.resizeHandler = () => this.recomputeMetrics();
      window.addEventListener('resize', this.resizeHandler);
      // O refresh do ScrollTrigger acontece após mudanças de layout — bom momento para reler as métricas.
      ScrollTrigger.addEventListener('refresh', this.resizeHandler);
    });
  }

  private initInteractions(): void {
    const cursor = this.cursorEl().nativeElement;
    this.mouseMoveHandler = (e: MouseEvent) => {
      cursor.classList.add('is-on');
      // Move o cursor personalizado com uma animação suave de toque, evitando pulos bruscos.
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: true,
      });
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);

    // Delegação de eventos: funciona para conteúdo de qualquer rota (home, certificados),
    // inclusive elementos adicionados após a navegação.
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && t.closest('a, button, .project, .project-card, .post, .cert-card');
    this.mouseOverHandler = (e) => {
      if (isInteractive(e.target)) cursor.classList.add('is-hover');
    };
    this.mouseOutHandler = (e) => {
      if (isInteractive(e.target)) cursor.classList.remove('is-hover');
    };
    document.addEventListener('mouseover', this.mouseOverHandler);
    document.addEventListener('mouseout', this.mouseOutHandler);
  }
}
