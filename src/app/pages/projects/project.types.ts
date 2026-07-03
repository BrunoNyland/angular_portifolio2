import { Lang } from '../../content/content.types';

/** Texto localizado por idioma. */
export type Localized = Record<Lang, string>;

/** Estado de um projeto publicado. */
export type ProjectStatus = 'live' | 'archived';

/**
 * Metadados de um projeto, vindos do índice `/public/projects-content/projects.json`.
 * São leves o bastante para a home e a página de índice carregarem tudo de uma vez.
 */
export interface Project {
  slug: Localized;
  /** 'YYYY' — base para ordenação e exibição. */
  year: string;
  category: Localized;
  tags: string[];
  /** URL pública do projeto (abre em nova aba). */
  url: string;
  /** URL do repositório (opcional). */
  repo?: string;
  /** Cliente / para quem foi feito (opcional). */
  client?: Localized;
  /** Papel desempenhado (opcional). */
  role?: Localized;
  status: ProjectStatus;
  /** Nome do arquivo de imagem dentro de `/projects-content/`. */
  image: string;
  imageAlt: Localized;
  featured?: boolean;
  title: Localized;
  /** Resumo curto, exibido nos cards. */
  excerpt: Localized;
  /** Descrição longa, exibida na página de listagem / expansão. */
  description: Localized;
}

/** Forma do arquivo de índice `projects.json`. */
export interface ProjectsIndexFile {
  projects: Project[];
}
