import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-totop',
  template: `
    <button class="totop" [class.is-on]="visible()" aria-label="Voltar ao topo" (click)="click.emit()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotopComponent {
  readonly visible = input(false);
  readonly click = output<void>();
}
