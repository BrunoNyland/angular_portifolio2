import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-education',
  template: `
    <section class="section" id="sec-edu" data-screen-label="06 Educação">
      <div class="section__head">
        <span class="num">{{ e().num }}</span>
        <span class="ttl">{{ e().title }}</span>
      </div>

      <div class="edu">
        @for (it of e().items; track it.title; let i = $index) {
          <article class="edu-item" [class.is-ongoing]="it.status === 'ongoing'" [class.is-done]="it.status === 'done'">
            <aside class="edu-item__side">
              <div class="edu-item__idx">{{ pad(i + 1) }} / {{ pad(e().items.length) }}</div>
              <div class="edu-item__status">
                <span class="edu-item__dot"></span>
                <span>{{ it.status === 'ongoing' ? e().statusOngoing : e().statusDone }}</span>
              </div>
              <dl class="edu-item__meta">
                <div>
                  <dt>{{ e().kindLabel }}</dt>
                  <dd>{{ it.kind }}</dd>
                </div>
                <div>
                  <dt>{{ it.status === 'ongoing' ? e().dateOngoingLabel : e().dateDoneLabel }}</dt>
                  <dd>{{ it.date }}</dd>
                </div>
                <div>
                  <dt>{{ e().workloadLabel }}</dt>
                  <dd>{{ it.workload }}</dd>
                </div>
              </dl>
            </aside>

            <div class="edu-item__body">
              <h3 class="edu-item__title">{{ it.title }}</h3>
              <div class="edu-item__inst">
                <span class="edu-item__inst-name">{{ it.institution }}</span>
                <span class="edu-item__inst-cnpj">{{ e().cnpjLabel }} {{ it.cnpj }}</span>
              </div>

              @if (it.validation || it.url) {
                <div class="edu-item__links">
                  @if (it.url) {
                    <a class="edu-item__link" [href]="it.url" target="_blank" rel="noopener">
                      <span class="edu-item__link-l">{{ e().documentLabel }}</span>
                      <span class="edu-item__link-v">PDF ↗</span>
                    </a>
                  }
                  @if (it.validation) {
                    <a class="edu-item__link" [href]="it.validation" target="_blank" rel="noopener">
                      <span class="edu-item__link-l">{{ e().validationLabel }}</span>
                      <span class="edu-item__link-v">{{ shortHost(it.validation) }} ↗</span>
                    </a>
                  }
                </div>
              }
            </div>
          </article>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  private readonly content = inject(ContentService);
  readonly e = () => this.content.dict().edu;

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  shortHost(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }
}
