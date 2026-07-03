export type Lang = 'pt' | 'en';

export type FragPart = string | { em: string } | { outline: string };

export interface NavDict {
  about: string;
  skills: string;
  xp: string;
  edu: string;
  blog: string;
  contact: string;
  certs: string;
  projects: string;
}

export interface HeroDict {
  eyebrow: string;
  role: string;
  l1: string;
  l2: string;
  l3: string;
  l4: string;
  foot1l: string;
  foot1v: string;
  foot2l: string;
  foot2v: string;
  foot3l: string;
  foot3v: string;
  foot4: string;
  metaTitle: string;
  metaSub: string;
}

export interface Stat {
  n: string;
  sup: string;
  l: string;
}

export interface AboutDict {
  num: string;
  title: string;
  lead: FragPart[];
  p1: string;
  p2: string;
  stats: Stat[];
}

export interface SkillGroup {
  cat: string;
  items: string[];
}

export interface SkillsDict {
  num: string;
  title: string;
  groups: SkillGroup[];
}

export interface WorkDict {
  num: string;
  title: string;
  /** CTA de cada card ("Ver projeto"). */
  cta: string;
  /** CTA para a página geral de projetos ("Ver todos os projetos"). */
  all: string;
  /** Estado vazio (sem projetos em destaque). */
  empty: string;
}

export interface XpRole {
  from: string;
  to: string;
  role: string;
}

export interface XpCompany {
  name: string;
  cnpj: string;
  from: string;
  to: string;
  roles: XpRole[];
}

export interface XpDict {
  num: string;
  title: string;
  totalLabel: string;
  cnpjLabel: string;
  presentLabel: string;
  companies: XpCompany[];
}

export interface EduItem {
  status: 'ongoing' | 'done';
  title: string;
  kind: string;
  institution: string;
  cnpj: string;
  date: string;
  workload: string;
  validation?: string;
  url?: string;
}

export interface EduDict {
  num: string;
  title: string;
  statusOngoing: string;
  statusDone: string;
  dateOngoingLabel: string;
  dateDoneLabel: string;
  kindLabel: string;
  workloadLabel: string;
  cnpjLabel: string;
  validationLabel: string;
  documentLabel: string;
  items: EduItem[];
}

export interface BlogDict {
  num: string;
  title: string;
  /** CTA de cada post ("Ler"). */
  cta: string;
  /** CTA para a página geral do blog ("Ver todos os posts"). */
  all: string;
  /** Estado vazio (sem posts em destaque). */
  empty: string;
}

/** Textos da página geral do blog (`/blog`) e da tela de detalhe do post. */
export interface BlogPageDict {
  title: string;
  lead: string;
  searchPlaceholder: string;
  allTags: string;
  results: string;
  empty: string;
  loading: string;
  error: string;
  readMore: string;
  backToBlog: string;
  backToHome: string;
  notFound: string;
}

export interface ContactItem {
  l: string;
  v: string;
  href: string;
}

export interface ContactDict {
  num: string;
  title: string;
  big: FragPart[];
  items: ContactItem[];
}

/** Textos da página geral de projetos (`/projetos`). */
export interface ProjectsPageDict {
  num: string;
  title: string;
  lead: string;
  searchPlaceholder: string;
  allCategories: string;
  allTags: string;
  results: string;
  empty: string;
  loading: string;
  error: string;
  visit: string;
  repo: string;
  readArticle: string;
  client: string;
  role: string;
  statusLive: string;
  statusArchived: string;
  back: string;
}

export interface CertsDict {
  num: string;
  title: string;
  lead: string;
  back: string;
  statHours: string;
  statCourses: string;
  statTopics: string;
  byTopicTitle: string;
  searchPlaceholder: string;
  allPlatforms: string;
  allTopics: string;
  allLanguages: string;
  results: string;
  empty: string;
  loading: string;
  error: string;
  viewPdf: string;
  validate: string;
}

export interface FootDict {
  l: string;
  r: string;
}

export interface LoaderDict {
  top1: string;
  top2: string;
  foot1: string;
  foot2: string;
}

/** Metadados de SEO de uma página, já no idioma do dicionário ativo. */
export interface SeoEntry {
  title: string;
  desc: string;
}

export interface SeoDict {
  home: SeoEntry;
  certs: SeoEntry;
  blog: SeoEntry;
  projects: SeoEntry;
}

export interface Dict {
  nav: NavDict;
  hero: HeroDict;
  about: AboutDict;
  skills: SkillsDict;
  work: WorkDict;
  xp: XpDict;
  edu: EduDict;
  blog: BlogDict;
  blogPage: BlogPageDict;
  contact: ContactDict;
  certs: CertsDict;
  projectsPage: ProjectsPageDict;
  foot: FootDict;
  loader: LoaderDict;
  seo: SeoDict;
}

export type Content = Record<Lang, Dict>;
