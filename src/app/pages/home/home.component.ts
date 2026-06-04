import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ContentService } from '../../content/content.service';
import { SceneService } from '../../scene/scene.service';
import { TweaksService } from '../../tweaks/tweaks.service';
import { LayoutService } from '../../core/layout.service';
import { SeoService } from '../../core/seo.service';

import { HeroComponent } from '../../sections/hero.component';
import { AboutComponent } from '../../sections/about.component';
import { SkillsComponent } from '../../sections/skills.component';
import { WorkComponent } from '../../sections/work.component';
import { ExperienceComponent } from '../../sections/experience.component';
import { EducationComponent } from '../../sections/education.component';
import { BlogComponent } from '../../sections/blog.component';
import { ContactComponent } from '../../sections/contact.component';

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
  selector: 'app-home',
  imports: [
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    WorkComponent,
    ExperienceComponent,
    EducationComponent,
    BlogComponent,
    ContactComponent,
  ],
  template: `
    <app-hero />
    <app-about />
    <app-skills />
    <app-work />
    <app-experience />
    <app-education />
    <app-blog />
    <app-contact />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly content = inject(ContentService);
  private readonly scene = inject(SceneService);
  private readonly tweaks = inject(TweaksService);
  private readonly layout = inject(LayoutService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly viewReady = signal(false);
  private started = false;
  private ctx?: gsap.Context;

  constructor() {
    this.seo.setMeta(() => this.content.dict().seo.home, { pt: '/', en: '/' });

    afterNextRender(() => this.viewReady.set(true));

    // As animações da home só começam quando o DOM existe e o loader inicial
    // (controlado pelo App shell) terminou. Roda uma vez por montagem.
    effect(() => {
      if (this.viewReady() && this.layout.appReady() && !this.started) {
        this.started = true;
        this.initHome();
      }
    });

    this.destroyRef.onDestroy(() => this.ctx?.revert());
  }

  private initHome(): void {
    this.initIntro();
    this.ctx = gsap.context(() => this.initScroll());
    ScrollTrigger.refresh();

    // Se viemos de outra rota pedindo uma seção específica, o App fará o scroll
    // suave (ele detém o Lenis); aqui só garantimos os gatilhos atualizados.
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
      // O nav é revelado pelo shell (App) após o loader, pois é compartilhado
      // entre todas as rotas; aqui só animamos os elementos da Home.
      .to('.hero .eyebrow', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  }

  private initScroll(): void {
    // Orquestrações globais da home: troca de matiz da cena e seção ativa do menu.
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
          if (self.isActive) this.layout.activeSection.set(sec.id);
        },
      });
    });
  }
}
