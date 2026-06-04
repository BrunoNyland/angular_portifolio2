import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentService } from '../../content/content.service';
import { Lang } from '../../content/content.types';
import { LayoutService } from '../../core/layout.service';
import { SeoService } from '../../core/seo.service';
import { AnimateInDirective, type AnimateInConfig } from '../../shared/animate-in.directive';
import { CertificatesService } from './certificates.service';
import { Certificate, parseWorkload } from './certificate.types';

const MONTHS: Record<'pt' | 'en', string[]> = {
  pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Slug da URL por idioma (links localizados e compartilháveis). */
const CERT_SLUG: Record<Lang, string> = { pt: '/certificados', en: '/certificates' };

@Component({
  selector: 'app-certificates',
  imports: [RouterLink, AnimateInDirective],
  templateUrl: './certificates.page.html',
  styleUrl: './certificates.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesPage implements OnDestroy {
  private readonly content = inject(ContentService);
  private readonly service = inject(CertificatesService);
  private readonly seo = inject(SeoService);
  private readonly layout = inject(LayoutService);
  private readonly location = inject(Location);

  readonly t = computed(() => this.content.dict().certs);
  readonly lang = this.content.lang;
  readonly loaded = this.service.loaded;

  private readonly courses = this.service.courses;

  // Filtros (signals controlados pelos inputs do template).
  readonly searchTerm = signal('');
  readonly selectedPlatform = signal('');
  readonly selectedTopic = signal('');
  readonly selectedLanguage = signal('');

  // Opções derivadas dos dados (sem hardcode).
  readonly platforms = computed(() =>
    [...new Set(this.courses().map((c) => c.platform))].sort(),
  );
  readonly topics = computed(() =>
    [...new Set(this.courses().flatMap((c) => c.topics))].sort(),
  );
  readonly languages = computed(() =>
    [...new Set(this.courses().map((c) => c.language))].sort(),
  );

  // Estatísticas (sobre o conjunto completo).
  readonly totalCourses = computed(() => this.courses().length);
  readonly totalHours = computed(() =>
    this.courses().reduce((sum, c) => sum + parseWorkload(c.workload), 0),
  );
  readonly totalTopics = computed(() => this.topics().length);

  /** Horas cheias atribuídas a cada tópico (um curso conta em todos os seus temas). */
  readonly hoursByTopic = computed(() => {
    const map = new Map<string, number>();
    for (const c of this.courses()) {
      const hours = parseWorkload(c.workload);
      for (const topic of c.topics) {
        map.set(topic, (map.get(topic) ?? 0) + hours);
      }
    }
    return [...map.entries()]
      .map(([topic, hours]) => ({ topic, hours }))
      .sort((a, b) => b.hours - a.hours);
  });
  readonly topTopics = computed(() => this.hoursByTopic().slice(0, 10));
  readonly maxTopicHours = computed(() => this.topTopics()[0]?.hours ?? 1);

  // Lista filtrada em tempo real.
  readonly filtered = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const platform = this.selectedPlatform();
    const topic = this.selectedTopic();
    const language = this.selectedLanguage();

    return this.courses().filter((c) => {
      if (platform && c.platform !== platform) return false;
      if (language && c.language !== language) return false;
      if (topic && !c.topics.includes(topic)) return false;
      if (q) {
        const haystack = `${c.name} ${c.nameEn} ${c.platform} ${c.topics.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  });

  readonly anims: AnimateInConfig[] = [
    { target: '.certs__intro > *', from: { autoAlpha: 0, y: 24 }, stagger: 0.08, start: 'top 90%' },
  ];

  constructor() {
    // Define o idioma a partir do slug pelo qual a página foi aberta, para que
    // links localizados/compartilhados (/certificates → EN, /certificados → PT)
    // mostrem o conteúdo na língua certa. Como os links do menu já apontam para o
    // slug do idioma atual, navegações internas chegam com o slug coerente.
    const entry = this.currentPath();
    if (entry === CERT_SLUG.en) this.content.setLang('en');
    else if (entry === CERT_SLUG.pt) this.content.setLang('pt');

    this.layout.onCertificates.set(true);

    // Mantém a URL do navegador refletindo o idioma selecionado: ao trocar a
    // língua, troca o slug (/certificados ⇄ /certificates). Usa replaceState para
    // não renavegar — preserva filtros e posição de scroll da página.
    effect(() => {
      const target = CERT_SLUG[this.content.lang()];
      if (this.currentPath() !== target) this.location.replaceState(target);
    });

    this.seo.setMeta(() => this.content.dict().seo.certs, {
      pt: CERT_SLUG.pt,
      en: CERT_SLUG.en,
    });
  }

  displayName(c: Certificate): string {
    return this.lang() === 'en' && c.nameEn ? c.nameEn : c.name;
  }

  pdfHref(c: Certificate): string {
    return `certificates/${encodeURIComponent(c.pdf)}`;
  }

  formatDate(date: string): string {
    const m = date.match(/^(\d{2})-(\d{4})$/);
    if (!m) return date;
    return `${MONTHS[this.lang()][parseInt(m[1], 10) - 1]} ${m[2]}`;
  }

  ngOnDestroy(): void {
    this.layout.onCertificates.set(false);
  }

  /** Caminho atual sem query string nem fragmento (ex.: '/certificados'). */
  private currentPath(): string {
    return this.location.path().split('?')[0].split('#')[0];
  }

  /** Lê o valor de um input/select para alimentar os signals de filtro. */
  val(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
