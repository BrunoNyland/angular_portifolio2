import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { ContentService } from './content/content.service';
import { Lang } from './content/content.types';
import { SceneService } from './scene/scene.service';
import { TweaksService } from './tweaks/tweaks.service';

import { LoaderComponent } from './chrome/loader.component';
import { NavComponent } from './chrome/nav.component';
import { TotopComponent } from './chrome/totop.component';
import { FooterComponent } from './chrome/footer.component';
import { HeroComponent } from './sections/hero.component';
import { AboutComponent } from './sections/about.component';
import { SkillsComponent } from './sections/skills.component';
import { WorkComponent } from './sections/work.component';
import { ExperienceComponent } from './sections/experience.component';
import { EducationComponent } from './sections/education.component';
import { BlogComponent } from './sections/blog.component';
import { ContactComponent } from './sections/contact.component';

gsap.registerPlugin(ScrollTrigger);

const HUE_MAP: Array<{ id: string; h: number }> = [
  { id: '#sec-hero', h: 0.72 },
  { id: '#sec-about', h: 0.78 },
  { id: '#sec-skills', h: 0.55 },
  { id: '#sec-work', h: 0.85 },
  { id: '#sec-xp', h: 0.68 },
  { id: '#sec-edu', h: 0.5 },
  { id: '#sec-blog', h: 0.92 },
  { id: '#sec-contact', h: 0.72 },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    LoaderComponent,
    NavComponent,
    TotopComponent,
    FooterComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    WorkComponent,
    ExperienceComponent,
    EducationComponent,
    BlogComponent,
    ContactComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly content = inject(ContentService);
  private readonly scene = inject(SceneService);
  private readonly tweaks = inject(TweaksService);

  readonly bgCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('bgCanvas');
  readonly cursorEl = viewChild.required<ElementRef<HTMLDivElement>>('cursor');
  readonly loader = viewChild<LoaderComponent>('loader');

  readonly showLoader = signal(true);
  readonly progress = signal(0);
  readonly totopVisible = signal(false);
  readonly activeSection = signal('sec-hero');

  private lenis?: Lenis;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private resizeHandler?: () => void;

  // Métricas de layout cacheadas para evitar leituras (forced reflow) a cada evento de scroll.
  private winH = window.innerHeight;
  private maxScroll = 1;

  ngAfterViewInit(): void {
    this.scene.init(this.bgCanvas().nativeElement);
    document.documentElement.lang = this.content.lang();

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
              res();
            },
          });
        });
      }

      this.initLenis();
      this.initIntro();
      this.initScroll();
      this.initInteractions();
    });

    document.body.classList.add('is-loading');
  }

  ngOnDestroy(): void {
    this.lenis?.destroy();
    if (this.mouseMoveHandler) window.removeEventListener('mousemove', this.mouseMoveHandler);
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

  setLang(lang: Lang): void {
    this.content.setLang(lang);
    this.scene.pulse();
    queueMicrotask(() => {
      const lines = document.querySelectorAll<HTMLElement>('.hero__title .line > i');
      gsap.fromTo(
        lines,
        { y: 0, yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 },
      );
      ScrollTrigger.refresh();
    });
  }

  goTo(id: string): void {
    const target = document.getElementById(id);
    if (!target || !this.lenis) return;
    this.scene.pulse();
    this.lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  }

  goTop(): void {
    this.scene.pulse();
    this.lenis?.scrollTo(0, { duration: 1.6 });
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
      gsap.ticker.add((t) => this.lenis?.raf(t * 1000));
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

  private initIntro(): void {
    const lines = document.querySelectorAll('.hero__title .line > i');
    const tl = gsap.timeline();
    tl.fromTo(
      lines,
      { y: 0, yPercent: 110 },
      { yPercent: 0, duration: 1.0, ease: 'expo.out', stagger: 0.2 },
      '-=0.2',
    )
      .to('.hero__meta-top', { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.8')
      .to('.hero__foot > *', { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.8')
      .to('.nav', { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.8')
      .to('.hero .eyebrow', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  }

  private initScroll(): void {
    // As animações de entrada e o fade por scrub de cada seção agora vivem dentro
    // dos componentes (diretivas animateIn / sectionFade). Aqui ficam apenas as
    // orquestrações globais: troca de matiz da cena e seção ativa do menu.
    HUE_MAP.forEach((m) => {
      const el = document.querySelector(m.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          if (!this.tweaks.tweaks().lockAccent) this.scene.setHue(m.h);
        },
        onEnterBack: () => {
          if (!this.tweaks.tweaks().lockAccent) this.scene.setHue(m.h);
        },
      });
    });

    document.querySelectorAll<HTMLElement>('section.section').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) this.activeSection.set(sec.id);
        },
      });
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

    document.querySelectorAll('a, button, .project, .post').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }
}
