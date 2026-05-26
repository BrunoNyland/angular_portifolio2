import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Lang } from '../content/content.types';
import { TweaksService } from '../tweaks/tweaks.service';

const ACCENT_OPTIONS = ['#7c5cff', '#00e6a8', '#ff5b3a', '#3aa0ff', '#f0f0f0'];

@Component({
  selector: 'app-nav',
  template: `
    <nav class="nav">
      <div class="nav__brand">BN <b>///</b> NYLAND</div>
      <div class="nav__menu">
        <a href="#sec-about" (click)="scrollTo($event, 'sec-about')" [class.is-active]="active() === 'sec-about'">{{ dict().nav.about }}</a>
        <a href="#sec-skills" (click)="scrollTo($event, 'sec-skills')" [class.is-active]="active() === 'sec-skills'">{{ dict().nav.skills }}</a>
        <a href="#sec-work" (click)="scrollTo($event, 'sec-work')" [class.is-active]="active() === 'sec-work'">{{ dict().nav.work }}</a>
        <a href="#sec-xp" (click)="scrollTo($event, 'sec-xp')" [class.is-active]="active() === 'sec-xp'">{{ dict().nav.xp }}</a>
        <a href="#sec-blog" (click)="scrollTo($event, 'sec-blog')" [class.is-active]="active() === 'sec-blog'">{{ dict().nav.blog }}</a>
        <a href="#sec-contact" (click)="scrollTo($event, 'sec-contact')" [class.is-active]="active() === 'sec-contact'">{{ dict().nav.contact }}</a>
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
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent {
  readonly content = inject(ContentService);
  readonly tweaks = inject(TweaksService);
  readonly dict = this.content.dict;
  readonly active = input('');
  readonly navigate = output<string>();
  readonly langChange = output<Lang>();

  readonly options = ACCENT_OPTIONS;
  readonly open = signal(false);
  readonly picker = viewChild<ElementRef<HTMLDivElement>>('picker');

  scrollTo(event: MouseEvent, id: string): void {
    event.preventDefault();
    this.navigate.emit(id);
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
}
