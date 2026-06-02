export interface Certificate {
  name: string;
  nameEn: string;
  platform: string;
  /** Carga horária como string livre, ex.: "5h", "60h (3 Courses)", "2hs". */
  workload: string;
  /** "Português" | "Inglês". */
  language: string;
  topics: string[];
  specializations: string[];
  validationUrl: string;
  /** "MM-YYYY" ou "YYYY". */
  date: string;
  /** Nome do arquivo dentro de /public/certificates/. */
  pdf: string;
}

/**
 * Extrai a quantidade de horas de uma string de carga horária.
 * "60h (3 Courses)" → 60, "2hs" → 2, "30h" → 30, "464 horas" → 464.
 */
export function parseWorkload(workload: string): number {
  const match = workload.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
