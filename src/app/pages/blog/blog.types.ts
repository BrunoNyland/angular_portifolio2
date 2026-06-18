import { SafeHtml } from '@angular/platform-browser';
import { Lang } from '../../content/content.types';

/** Texto localizado por idioma. */
export type Localized = Record<Lang, string>;

/**
 * Metadados de um post, vindos do índice `/public/blog/posts.json`. São leves
 * (sem o corpo) para a home e a página de índice carregarem tudo de uma vez; o
 * corpo Markdown é baixado sob demanda na página de detalhe.
 */
export interface BlogPostMeta {
  slug: Localized;
  /** 'YYYY-MM' (ou 'YYYY-MM-DD') — base para ordenação e formatação por idioma. */
  date: string;
  tag: Localized;
  featured?: boolean;
  title: Localized;
  excerpt: Localized;
}

/** Forma do arquivo de índice `posts.json`. */
export interface BlogIndexFile {
  posts: BlogPostMeta[];
}

/** Post com o corpo Markdown já renderizado e sanitizado para exibição. */
export interface BlogPost {
  meta: BlogPostMeta;
  html: SafeHtml;
}
