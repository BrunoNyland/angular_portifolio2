import { Lang } from '../../content/content.types';

const MONTHS: Record<Lang, string[]> = {
  pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Formata 'YYYY-MM' (ou 'YYYY-MM-DD') como 'Mai 2026' / 'May 2026'. */
export function formatMonthYear(date: string, lang: Lang): string {
  const m = date.match(/^(\d{4})-(\d{2})/);
  if (!m) return date;
  const month = MONTHS[lang][parseInt(m[2], 10) - 1] ?? '';
  return `${month} ${m[1]}`.trim();
}
