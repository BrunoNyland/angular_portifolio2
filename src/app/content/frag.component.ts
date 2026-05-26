import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FragPart } from './content.types';

interface Token {
  kind: 'text' | 'em' | 'outline';
  value: string;
}

@Component({
  selector: 'app-frag',
  template: `@for (tok of tokens(); track $index) {
    @switch (tok.kind) {
      @case ('em') { <em>{{ tok.value }}</em> }
      @case ('outline') { <span> </span><span class="outline">{{ tok.value }}</span> }
      @default { {{ tok.value }} }
    }
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FragComponent {
  readonly parts = input.required<FragPart[]>();
  readonly tokens = computed<Token[]>(() =>
    this.parts().map((p): Token => {
      if (typeof p === 'string') return { kind: 'text', value: p };
      if ('em' in p) return { kind: 'em', value: p.em };
      return { kind: 'outline', value: p.outline };
    })
  );
}
