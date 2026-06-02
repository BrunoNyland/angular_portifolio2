import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentService } from '../../content/content.service';
import { SeoService } from '../../core/seo.service';
import { AnimateInDirective, type AnimateInConfig } from '../../shared/animate-in.directive';
import { CertificatesService } from './certificates.service';
import { Certificate, parseWorkload } from './certificate.types';

const MONTHS: Record<'pt' | 'en', string[]> = {
  pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

@Component({
  selector: 'app-certificates',
  imports: [RouterLink, AnimateInDirective],
  templateUrl: './certificates.page.html',
  styleUrl: './certificates.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesPage {
  private readonly content = inject(ContentService);
  private readonly service = inject(CertificatesService);
  private readonly seo = inject(SeoService);

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
    this.seo.setMeta({
      titlePt: 'Certificados — Bruno Nyland',
      titleEn: 'Certificates — Bruno Nyland',
      descPt:
        'Banco de certificados de Bruno Nyland: cursos e especializações em desenvolvimento, dados e automação, com horas estudadas por tema.',
      descEn:
        'Bruno Nyland’s certificates: courses and specializations in development, data and automation, with hours studied per topic.',
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

  /** Lê o valor de um input/select para alimentar os signals de filtro. */
  val(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
