import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-experience',
  template: `
    <section class="section" id="sec-xp" data-screen-label="05 Experiência">
      <div class="section__head">
        <span class="num">{{ x().num }}</span>
        <span class="ttl">{{ x().title }}</span>
      </div>

      <div class="xp">
        @for (co of x().companies; track co.cnpj; let ci = $index) {
          <article class="xp-co">
            <header class="xp-co__head">
              <div class="xp-co__idx">{{ pad(ci + 1) }} / {{ pad(x().companies.length) }}</div>
              <h3 class="xp-co__name">{{ co.name }}</h3>
              <dl class="xp-co__meta">
                <div>
                  <dt>{{ x().cnpjLabel }}</dt>
                  <dd>{{ co.cnpj }}</dd>
                </div>
                <div>
                  <dt>{{ formatDate(co.from) }} — {{ formatTo(co.to) }}</dt>
                  <dd>{{ x().totalLabel }} · {{ duration(co.from, co.to) }}</dd>
                </div>
              </dl>
            </header>

            <ol class="xp-co__tl">
              @for (r of co.roles; track r.from + r.to + r.role; let ri = $index) {
                <li class="xp-role">
                  <div class="xp-role__when">
                    <span class="xp-role__range">{{ formatDate(r.from) }} — {{ formatTo(r.to) }}</span>
                    <b>{{ duration(r.from, r.to) }}</b>
                  </div>
                  <div class="xp-role__name">
                    <span class="xp-role__num">{{ pad(ri + 1) }}</span>
                    <span>{{ r.role }}</span>
                  </div>
                </li>
              }
            </ol>
          </article>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  private readonly content = inject(ContentService);
  readonly x = () => this.content.dict().xp;

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  formatDate(s: string): string {
    return this.isOpen(s) ? this.x().presentLabel : s;
  }

  formatTo(s: string): string {
    return this.isOpen(s) ? this.x().presentLabel : s;
  }

  duration(from: string, to: string): string {
    const a = this.parseDate(from);
    const b = this.isOpen(to) ? new Date() : this.parseDate(to);
    if (!a || !b) return '';

    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();

    if (days < 0) {
      months--;
      const prev = new Date(b.getFullYear(), b.getMonth(), 0);
      days += prev.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const pt = this.content.lang() === 'pt';
    const parts: string[] = [];
    if (years > 0) parts.push(years + ' ' + (pt ? (years === 1 ? 'ano' : 'anos') : years === 1 ? 'year' : 'years'));
    if (months > 0) parts.push(months + ' ' + (pt ? (months === 1 ? 'mês' : 'meses') : months === 1 ? 'month' : 'months'));
    if (days > 0 || parts.length === 0) parts.push(days + ' ' + (pt ? (days === 1 ? 'dia' : 'dias') : days === 1 ? 'day' : 'days'));

    if (parts.length === 1) return parts[0];
    const last = parts.pop() as string;
    return parts.join(', ') + (pt ? ' e ' : ' and ') + last;
  }

  private isOpen(s: string): boolean {
    return !s.includes('/');
  }

  private parseDate(s: string): Date | null {
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    return new Date(+m[3], +m[2] - 1, +m[1]);
  }
}
