export type Lang = 'pt' | 'en';

export type FragPart = string | { em: string } | { outline: string };

export interface NavDict {
  about: string;
  skills: string;
  work: string;
  xp: string;
  edu: string;
  blog: string;
  contact: string;
  certs: string;
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

export interface WorkItem {
  t: string;
  y: string;
  k: string;
  tags: string[];
  ph: string;
}

export interface WorkDict {
  num: string;
  title: string;
  items: WorkItem[];
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

export interface BlogItem {
  tag: string;
  date: string;
  t: string;
  x: string;
}

export interface BlogDict {
  num: string;
  title: string;
  items: BlogItem[];
  cta: string;
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
  contact: ContactDict;
  certs: CertsDict;
  foot: FootDict;
  loader: LoaderDict;
  seo: SeoDict;
}

export type Content = Record<Lang, Dict>;
