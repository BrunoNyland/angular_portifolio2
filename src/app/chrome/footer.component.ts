import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="foot">
      <span>{{ dict().foot.l }}</span>
      <span>{{ dict().foot.r }}</span>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private readonly content = inject(ContentService);
  readonly dict = this.content.dict;
}
