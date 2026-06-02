import { Certificate, parseWorkload } from './certificate.types';

describe('parseWorkload', () => {
  it('extrai horas do formato simples "Nh"', () => {
    expect(parseWorkload('5h')).toBe(5);
    expect(parseWorkload('30h')).toBe(30);
    expect(parseWorkload('60h')).toBe(60);
  });

  it('ignora sufixos como "(3 Courses)"', () => {
    expect(parseWorkload('60h (3 Courses)')).toBe(60);
    expect(parseWorkload('38h (3 Courses)')).toBe(38);
  });

  it('lida com variações "hs" e "horas"', () => {
    expect(parseWorkload('2hs')).toBe(2);
    expect(parseWorkload('48hs')).toBe(48);
    expect(parseWorkload('464 horas')).toBe(464);
  });

  it('retorna 0 quando não há número', () => {
    expect(parseWorkload('')).toBe(0);
    expect(parseWorkload('—')).toBe(0);
  });
});

describe('agregação de estatísticas', () => {
  const courses: Pick<Certificate, 'workload' | 'topics'>[] = [
    { workload: '10h', topics: ['Angular', 'TypeScript'] },
    { workload: '20h', topics: ['Angular'] },
    { workload: '5h', topics: ['Python'] },
  ];

  it('soma a carga horária total', () => {
    const total = courses.reduce((s, c) => s + parseWorkload(c.workload), 0);
    expect(total).toBe(35);
  });

  it('atribui horas cheias a cada tópico (um curso conta em vários temas)', () => {
    const map = new Map<string, number>();
    for (const c of courses) {
      const h = parseWorkload(c.workload);
      for (const tp of c.topics) map.set(tp, (map.get(tp) ?? 0) + h);
    }
    expect(map.get('Angular')).toBe(30); // 10h + 20h
    expect(map.get('TypeScript')).toBe(10);
    expect(map.get('Python')).toBe(5);
  });
});
