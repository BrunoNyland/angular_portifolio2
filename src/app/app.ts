import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
  viewChild
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
  { id: '#sec-contact', h: 0.72 }
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
    ContactComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  ngAfterViewInit(): void {
    this.scene.init(this.bgCanvas().nativeElement);
    document.documentElement.lang = this.content.lang();

    queueMicrotask(async () => {
      const loaderEl = await this.loader()?.run();
      if (loaderEl) {
        await new Promise<void>((res) => {
          gsap.to(loaderEl, {
            yPercent: -100,
            duration: 1.1,
            ease: 'expo.inOut',
            onComplete: () => {
              loaderEl.style.display = 'none';
              this.showLoader.set(false);
              document.body.classList.add('is-loaded');
              res();
            }
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
    ScrollTrigger.killAll();
  }

  setLang(lang: Lang): void {
    this.content.setLang(lang);
    this.scene.pulse();
    queueMicrotask(() => {
      const lines = document.querySelectorAll<HTMLElement>('.hero__title .line > i');
      gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 });
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
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
      this.lenis.on('scroll', (e: { scroll: number }) => {
        this.scene.setScroll(e.scroll);
        ScrollTrigger.update();
        const pct = e.scroll / (document.documentElement.scrollHeight - window.innerHeight);
        this.progress.set(pct * 100);
        this.totopVisible.set(e.scroll > window.innerHeight * 0.6);
      });
      gsap.ticker.add((t) => this.lenis?.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    });
  }

  private initIntro(): void {
    const lines = document.querySelectorAll('.hero__title .line > i');
    gsap.set(lines, { yPercent: 110 });
    const tl = gsap.timeline();
    tl.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
      .from('.hero__meta-top', { autoAlpha: 0, y: 10, duration: 0.6 }, '-=0.6')
      .from('.hero__foot > *', { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.06 }, '-=0.6')
      .from('.nav', { autoAlpha: 0, y: -10, duration: 0.5 }, '-=0.8');
  }

  private initScroll(): void {
    document.querySelectorAll<HTMLElement>('.section').forEach((sec) => {
      const head = sec.querySelector('.section__head');
      if (head) {
        gsap.from((head as HTMLElement).children, {
          scrollTrigger: { trigger: sec, start: 'top 80%' },
          autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.1, ease: 'power2.out'
        });
      }
    });

    gsap.from('#sec-about .about__lead', {
      scrollTrigger: { trigger: '#sec-about', start: 'top 70%' },
      autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out'
    });
    gsap.from('#sec-about .about__col > *', {
      scrollTrigger: { trigger: '#sec-about', start: 'top 65%' },
      autoAlpha: 0, y: 30, duration: 0.7, stagger: 0.1, ease: 'power2.out'
    });

    gsap.from('#sec-skills .skill', {
      scrollTrigger: { trigger: '#sec-skills', start: 'top 75%' },
      autoAlpha: 0, y: 40, duration: 0.7, stagger: 0.08, ease: 'power2.out'
    });

    gsap.from('#sec-work .project', {
      scrollTrigger: { trigger: '#sec-work', start: 'top 80%' },
      autoAlpha: 0, y: 50, duration: 0.8, stagger: 0.1, ease: 'power2.out'
    });

    gsap.utils.toArray<HTMLElement>('#sec-xp .xp-co').forEach((item) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%' },
        autoAlpha: 0, x: -30, duration: 0.8, ease: 'power2.out'
      });
    });

    gsap.from('#sec-edu .edu-item', {
      scrollTrigger: { trigger: '#sec-edu', start: 'top 80%' },
      autoAlpha: 0, y: 40, duration: 0.8, stagger: 0.12, ease: 'power2.out'
    });

    gsap.from('#sec-blog .post', {
      scrollTrigger: { trigger: '#sec-blog', start: 'top 80%' },
      autoAlpha: 0, y: 40, duration: 0.8, stagger: 0.1, ease: 'power2.out'
    });

    gsap.from('#sec-contact .contact__big', {
      scrollTrigger: { trigger: '#sec-contact', start: 'top 75%' },
      autoAlpha: 0, y: 60, duration: 1, ease: 'power3.out'
    });
    gsap.from('#sec-contact .contact__grid > *', {
      scrollTrigger: { trigger: '#sec-contact', start: 'top 70%' },
      autoAlpha: 0, y: 20, duration: 0.6, stagger: 0.08, ease: 'power2.out'
    });

    document.querySelectorAll<HTMLElement>('section.section').forEach((sec) => {
      const blurMax = this.tweaks.tweaks().sectionBlur || 8;
      gsap.fromTo(
        sec,
        { filter: `blur(${blurMax}px)`, opacity: 0 },
        {
          filter: 'blur(0px)', opacity: 1,
          scrollTrigger: { trigger: sec, start: 'top 92%', end: 'top 60%', scrub: 0.6 }
        }
      );
      gsap.to(sec, {
        filter: `blur(${Math.max(0, blurMax - 2)}px)`, opacity: 0.5,
        scrollTrigger: { trigger: sec, start: 'bottom 40%', end: 'bottom 5%', scrub: 0.6 }
      });
    });

    HUE_MAP.forEach((m) => {
      const el = document.querySelector(m.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el, start: 'top 60%', end: 'bottom 40%',
        onEnter: () => { if (!this.tweaks.tweaks().lockAccent) this.scene.setHue(m.h); },
        onEnterBack: () => { if (!this.tweaks.tweaks().lockAccent) this.scene.setHue(m.h); }
      });
    });

    document.querySelectorAll<HTMLElement>('section.section').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 40%', end: 'bottom 40%',
        onToggle: (self) => { if (self.isActive) this.activeSection.set(sec.id); }
      });
    });
  }

  private initInteractions(): void {
    const cursor = this.cursorEl().nativeElement;
    this.mouseMoveHandler = (e: MouseEvent) => {
      cursor.classList.add('is-on');
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out', overwrite: true });
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);

    document.querySelectorAll('a, button, .project, .post').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }
}
