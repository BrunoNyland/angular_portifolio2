import { Injectable, signal } from '@angular/core';

/**
 * Estado de layout compartilhado entre o shell (App/Nav, persistentes) e as
 * páginas roteadas (Home). Desacopla o Nav — que vive no shell — da Home, que
 * é montada/desmontada pelo router.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Seção visível no momento (ex.: 'sec-about'); escrita pela Home, lida pelo Nav. */
  readonly activeSection = signal('sec-hero');

  /** Fragmento de seção a rolar após navegar de volta para a home (fluxo cross-route). */
  readonly pendingFragment = signal<string | null>(null);

  /** Verdadeiro quando o loader inicial terminou e o shell está pronto. */
  readonly appReady = signal(false);

  /**
   * Verdadeiro enquanto a página de certificados está montada. Permite ao Nav
   * destacar o item correto sem depender do slug da URL — que muda conforme o
   * idioma (/certificados ⇄ /certificates) via replaceState, sem renavegar.
   */
  readonly onCertificates = signal(false);

  /** Verdadeiro enquanto a página de projetos está montada. */
  readonly onProjects = signal(false);
}
