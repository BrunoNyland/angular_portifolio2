import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { FragComponent } from '../content/frag.component';

@Component({
  selector: 'app-contact',
  imports: [FragComponent],
  template: `
    <section class="section contact" id="sec-contact" data-screen-label="07 Contato">
      <div class="section__head">
        <span class="num">{{ c().num }}</span>
        <span class="ttl">{{ c().title }}</span>
      </div>
      <h2 class="contact__big"><app-frag [parts]="c().big" /></h2>
      <div class="contact__grid">
        @for (it of c().items; track it.l) {
          <a [href]="it.href" target="_blank" rel="noopener">
            <div class="l">{{ it.l }}</div>
            <div class="v">{{ it.v }}</div>
          </a>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent {
  private readonly content = inject(ContentService);
  readonly c = () => this.content.dict().contact;
}
