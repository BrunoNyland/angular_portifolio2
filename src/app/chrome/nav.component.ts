import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content/content.service';
import { Lang } from '../content/content.types';
import { TweaksService } from '../tweaks/tweaks.service';
import { LayoutService } from '../core/layout.service';

const ACCENT_OPTIONS = ['#00e6a8', '#7c5cff', '#ff5b3a', '#3aa0ff', '#fc5bff', '#ff3333'];

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  template: `
    <nav class="nav">
      <a class="nav__brand" href="/" (click)="goHome($event)">BN <b>///</b> NYLAND</a>
      <div class="nav__menu">
        <a
          href="#sec-about"
          (click)="scrollTo($event, 'sec-about')"
          [class.is-active]="active() === 'sec-about'"
          >{{ dict().nav.about }}</a
        >
        <a
          href="#sec-skills"
          (click)="scrollTo($event, 'sec-skills')"
          [class.is-active]="active() === 'sec-skills'"
          >{{ dict().nav.skills }}</a
        >
        <a
          href="#sec-xp"
          (click)="scrollTo($event, 'sec-xp')"
          [class.is-active]="active() === 'sec-xp'"
          >{{ dict().nav.xp }}</a
        >
        <a
          href="#sec-edu"
          (click)="scrollTo($event, 'sec-edu')"
          [class.is-active]="active() === 'sec-edu'"
          >{{ dict().nav.edu }}</a
        >
        <a
          href="#sec-blog"
          (click)="scrollTo($event, 'sec-blog')"
          [class.is-active]="active() === 'sec-blog'"
          >{{ dict().nav.blog }}</a
        >
        <a
          href="#sec-contact"
          (click)="scrollTo($event, 'sec-contact')"
          [class.is-active]="active() === 'sec-contact'"
          >{{ dict().nav.contact }}</a
        >
        <a [routerLink]="certsPath()" [class.is-active]="layout.onCertificates()">{{
          dict().nav.certs
        }}</a>
        <a [routerLink]="projectsPath()" [class.is-active]="layout.onProjects()">{{
          dict().nav.projects
        }}</a>
      </div>
      <div class="nav__right">
        <div class="accent-picker" #picker>
          <button
            type="button"
            class="accent-picker__trigger"
            aria-label="Escolher cor de destaque"
            [style.background]="tweaks.tweaks().accent"
            (click)="toggleOpen($event)"
          ></button>
          @if (open()) {
            <div class="accent-picker__menu">
              @for (c of options; track c) {
                <button
                  type="button"
                  class="accent-picker__dot"
                  [class.is-on]="tweaks.tweaks().accent === c"
                  [style.background]="c"
                  [attr.aria-label]="c"
                  (click)="pick(c)"
                ></button>
              }
            </div>
          }
        </div>
        <div class="lang">
          <button [class.is-on]="content.lang() === 'pt'" (click)="setLang('pt')">PT</button>
          <span>/</span>
          <button [class.is-on]="content.lang() === 'en'" (click)="setLang('en')">EN</button>
        </div>
        <button
          type="button"
          class="nav__burger"
          [class.is-open]="menuOpen()"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-menu"
          aria-label="Menu"
          (click)="toggleMenu()"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <div id="mobile-menu" class="mobile-menu" [class.is-open]="menuOpen()">
      <nav class="mobile-menu__nav">
        <a href="#sec-about" (click)="goSection($event, 'sec-about')">{{ dict().nav.about }}</a>
        <a href="#sec-skills" (click)="goSection($event, 'sec-skills')">{{ dict().nav.skills }}</a>
        <a href="#sec-xp" (click)="goSection($event, 'sec-xp')">{{ dict().nav.xp }}</a>
        <a href="#sec-edu" (click)="goSection($event, 'sec-edu')">{{ dict().nav.edu }}</a>
        <a href="#sec-blog" (click)="goSection($event, 'sec-blog')">{{ dict().nav.blog }}</a>
        <a href="#sec-contact" (click)="goSection($event, 'sec-contact')">{{
          dict().nav.contact
        }}</a>
        <a
          [routerLink]="certsPath()"
          [class.is-active]="layout.onCertificates()"
          (click)="closeMenu()"
          >{{ dict().nav.certs }}</a
        >
        <a
          [routerLink]="projectsPath()"
          [class.is-active]="layout.onProjects()"
          (click)="closeMenu()"
          >{{ dict().nav.projects }}</a
        >
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  readonly content = inject(ContentService);
  readonly tweaks = inject(TweaksService);
  readonly layout = inject(LayoutService);
  readonly dict = this.content.dict;
  /** Slug localizado da página de certificados conforme o idioma atual. */
  readonly certsPath = computed(() =>
    this.content.lang() === 'en' ? '/certificates' : '/certificados',
  );
  /** Slug localizado da página de projetos conforme o idioma atual. */
  readonly projectsPath = computed(() =>
    this.content.lang() === 'en' ? '/projects' : '/projetos',
  );
  /**
   * Seção ativa na home (publicada pela HomeComponent via LayoutService). Fora da
   * home — ex.: na página de certificados — nenhuma seção deve ficar destacada.
   */
  readonly active = computed(() =>
    this.layout.onCertificates() || this.layout.onProjects() ? '' : this.layout.activeSection(),
  );
  readonly navigate = output<string>();
  readonly langChange = output<Lang>();
  readonly home = output<void>();
  /** Avisa o shell para travar/liberar o scroll (Lenis) enquanto o menu móvel abre/fecha. */
  readonly menuOpenChange = output<boolean>();

  readonly options = ACCENT_OPTIONS;
  readonly open = signal(false);
  /** Estado do menu móvel em tela cheia (hambúrguer). */
  readonly menuOpen = signal(false);
  readonly picker = viewChild<ElementRef<HTMLDivElement>>('picker');

  scrollTo(event: MouseEvent, id: string): void {
    event.preventDefault();
    this.navigate.emit(id);
  }

  goHome(event: MouseEvent): void {
    event.preventDefault();
    this.closeMenu();
    this.home.emit();
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
    this.menuOpenChange.emit(this.menuOpen());
  }

  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuOpenChange.emit(false);
  }

  /** Item de seção no menu móvel: fecha o overlay e dispara o scroll suave. */
  goSection(event: MouseEvent, id: string): void {
    this.closeMenu();
    this.scrollTo(event, id);
  }

  setLang(lang: Lang): void {
    this.langChange.emit(lang);
  }

  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  pick(color: string): void {
    this.tweaks.set('accent', color);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const root = this.picker()?.nativeElement;
    if (root && !root.contains(event.target as Node)) this.open.set(false);
  }

  @HostListener('window:resize')
  onResize(): void {
    // Ao voltar para a largura de desktop, o overlay é escondido por CSS — então
    // garantimos que o estado feche e o scroll seja liberado.
    if (this.menuOpen() && window.innerWidth >= 1094) this.closeMenu();
  }
}
