// Contas do script de dados: transformam os dias da API em totais por ano,
// por verão e por década, e comparam a base com o período recente.
//
// Ficam num arquivo separado, sem acesso à rede nem ao disco, para dar para
// testar cada conta sozinha com valores conhecidos.

export const timezone = "America/Sao_Paulo";

// Limites usados nos capítulos. "Passou de 30 °C" é máxima acima de 30;
// "noite que não baixou de 20 °C" é mínima igual ou acima de 20.
export const thresholds = {
  hotDay: 30,
  veryHotDay: 35,
  warmNight: 20,
};

// Base de comparação dos capítulos: a referência climática clássica, anterior
// à maior parte do aquecimento. O período recente não é fixo: são sempre os
// últimos `recentLength` anos (ou verões) completos, então ele anda sozinho
// quando o workflow traz um ano novo.
export const baseline = { startYear: 1961, endYear: 1990 };
export const recentLength = 10;

// Formato da resposta da API. Os nomes com underline são os que a API usa;
// logo abaixo eles viram camelCase no tipo `DailyRecord`.
export type ArchiveResponse = {
  latitude: number;
  longitude: number;
  elevation: number;
  daily: {
    time: string[];
    temperature_2m_min: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_mean: (number | null)[];
  };
};

export type DailyRecord = {
  date: string;
  year: number;
  month: number;
  min: number;
  max: number;
  mean: number;
};

export type PeriodSummary = {
  meanTemp: number;
  daysAbove30: number;
  daysAbove35: number;
  warmNights: number;
};

export type YearSummary = PeriodSummary & { year: number };
export type SummerSummary = PeriodSummary & { summer: number };

// Último dia do último mês completo, no fuso de Porto Alegre.
// Ex.: rodando em 12/11/2026, devolve "2026-10-31". O parâmetro `now` existe
// para os testes escolherem o "hoje"; no script ele é sempre o momento atual.
export function getEndDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  // Dia 0 de um mês é o último dia do mês anterior. Como o `month` do
  // Intl vai de 1 a 12 e o do Date vai de 0 a 11, `month - 1` aponta para o
  // mês atual, e o dia 0 dele cai no fim do mês passado.
  const lastDay = new Date(Date.UTC(year, month - 1, 0));
  return lastDay.toISOString().slice(0, 10);
}

// Data de hoje no fuso de Porto Alegre, no formato AAAA-MM-DD. O
// `toISOString` usaria o horário UTC, que vira o dia às 21h de Brasília.
// O formato "en-CA" já escreve a data como AAAA-MM-DD.
export function getTodayInPortoAlegre(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(now);
}

// Junta as quatro listas paralelas da API (datas, mínimas, máximas e médias)
// numa lista de objetos, um por dia. Se faltar qualquer valor, para tudo:
// é melhor não atualizar o JSON do que publicar uma série com buracos.
export function toDailyRecords(daily: ArchiveResponse["daily"]): DailyRecord[] {
  const { time } = daily;
  const mins = daily.temperature_2m_min;
  const maxes = daily.temperature_2m_max;
  const means = daily.temperature_2m_mean;

  if (
    mins.length !== time.length ||
    maxes.length !== time.length ||
    means.length !== time.length
  ) {
    throw new Error("A API devolveu listas de tamanhos diferentes.");
  }

  return time.map((date, index) => {
    const min = mins[index];
    const max = maxes[index];
    const mean = means[index];

    if (min === null || max === null || mean === null) {
      throw new Error(`Dia sem valor na resposta da API: ${date}.`);
    }

    return {
      date,
      year: Number(date.slice(0, 4)),
      month: Number(date.slice(5, 7)),
      min,
      max,
      mean,
    };
  });
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Calcula os números de um grupo de dias (um ano ou um verão).
export function summarize(days: DailyRecord[]): PeriodSummary {
  const totalMean = days.reduce((sum, day) => sum + day.mean, 0);

  return {
    meanTemp: roundTo(totalMean / days.length, 2),
    daysAbove30: days.filter((day) => day.max > thresholds.hotDay).length,
    daysAbove35: days.filter((day) => day.max > thresholds.veryHotDay).length,
    warmNights: days.filter((day) => day.min >= thresholds.warmNight).length,
  };
}

// Agrupa os dias por ano e calcula os números de cada um. Só entram anos com
// todos os dias: um ano pela metade (como o ano corrente) pareceria mais
// frio ou mais quente só por faltar uma estação inteira.
export function buildYears(records: DailyRecord[]): YearSummary[] {
  const daysByYear = Map.groupBy(records, (record) => record.year);

  return [...daysByYear]
    .filter(([year, days]) => days.length === (isLeapYear(year) ? 366 : 365))
    .map(([year, days]) => ({ year, ...summarize(days) }));
}

// Verão meteorológico: dezembro, janeiro e fevereiro. O verão leva o ano de
// janeiro e fevereiro, então o verão de 2025 junta dezembro de 2024 com
// janeiro e fevereiro de 2025.
export function buildSummers(records: DailyRecord[]): SummerSummary[] {
  const summerDays = records.filter((record) =>
    [12, 1, 2].includes(record.month),
  );

  const daysBySummer = Map.groupBy(summerDays, (record) =>
    record.month === 12 ? record.year + 1 : record.year,
  );

  // Verão completo tem 31 dias de dezembro, 31 de janeiro e 28 ou 29 de
  // fevereiro. Isso descarta o verão de 1950 (falta dezembro de 1949) e o
  // verão que ainda está acontecendo.
  return [...daysBySummer]
    .filter(([summer, days]) => days.length === (isLeapYear(summer) ? 91 : 90))
    .map(([summer, days]) => ({ summer, ...summarize(days) }));
}

// Média de cada número num grupo de anos ou verões. Os dias viram média por
// ano (ex.: 6,8 dias acima de 35 °C por ano), por isso também têm decimais.
export function averageSummaries(items: PeriodSummary[]): PeriodSummary {
  const average = (pick: (item: PeriodSummary) => number) =>
    roundTo(items.reduce((sum, item) => sum + pick(item), 0) / items.length, 2);

  return {
    meanTemp: average((item) => item.meanTemp),
    daysAbove30: average((item) => item.daysAbove30),
    daysAbove35: average((item) => item.daysAbove35),
    warmNights: average((item) => item.warmNights),
  };
}

// Pega os itens de um período e confere se todos estão lá. Uma média com
// anos faltando compararia períodos de tamanhos diferentes sem avisar.
export function pickPeriod<T>(
  items: T[],
  getYear: (item: T) => number,
  startYear: number,
  endYear: number,
): T[] {
  const selected = items.filter((item) => {
    const year = getYear(item);
    return year >= startYear && year <= endYear;
  });

  const expected = endYear - startYear + 1;
  if (selected.length !== expected) {
    throw new Error(
      `Período ${startYear}-${endYear} com ${selected.length} itens, esperava ${expected}.`,
    );
  }

  return selected;
}

// Reta de tendência por mínimos quadrados: a reta que passa mais perto de
// todos os pontos. Devolve a inclinação em °C por década (a inclinação sai
// em °C por ano e é multiplicada por 10, que é mais fácil de ler) e o valor
// da reta no primeiro e no último ano, que é o que o gráfico precisa para
// desenhá-la.
export function buildTrend(points: { x: number; y: number }[]) {
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;

  let numerator = 0;
  let denominator = 0;
  for (const { x, y } of points) {
    numerator += (x - meanX) * (y - meanY);
    denominator += (x - meanX) ** 2;
  }

  // A reta de mínimos quadrados sempre passa pelo ponto médio (meanX, meanY).
  // Com a inclinação e esse ponto, dá para calcular a reta em qualquer ano.
  const slope = numerator / denominator;
  const valueAt = (x: number) => roundTo(meanY + slope * (x - meanX), 2);
  const startYear = points[0].x;
  const endYear = points.at(-1)!.x;

  return {
    perDecade: roundTo(slope * 10, 3),
    line: {
      startYear,
      startValue: valueAt(startYear),
      endYear,
      endValue: valueAt(endYear),
    },
  };
}

// Compara a base de 1961 a 1990 com os últimos anos e verões completos.
// Anos e verões têm janelas próprias: o verão de 2026 já terminou em
// fevereiro, então os verões recentes ficam um ano à frente dos anos.
export function buildComparison(years: YearSummary[], summers: SummerSummary[]) {
  const lastYear = years.at(-1)!.year;
  const lastSummer = summers.at(-1)!.summer;
  const recentYears = { startYear: lastYear - recentLength + 1, endYear: lastYear };
  const recentSummers = {
    startYear: lastSummer - recentLength + 1,
    endYear: lastSummer,
  };

  return {
    baseline: {
      ...baseline,
      years: averageSummaries(
        pickPeriod(years, (item) => item.year, baseline.startYear, baseline.endYear),
      ),
      summers: averageSummaries(
        pickPeriod(summers, (item) => item.summer, baseline.startYear, baseline.endYear),
      ),
    },
    recent: {
      years: {
        ...recentYears,
        ...averageSummaries(
          pickPeriod(years, (item) => item.year, recentYears.startYear, recentYears.endYear),
        ),
      },
      summers: {
        ...recentSummers,
        ...averageSummaries(
          pickPeriod(
            summers,
            (item) => item.summer,
            recentSummers.startYear,
            recentSummers.endYear,
          ),
        ),
      },
    },
    trend: {
      meanTemp: buildTrend(years.map((item) => ({ x: item.year, y: item.meanTemp }))),
    },
  };
}

// Médias por década, usadas no gráfico dos extremos. A década em andamento
// entra com `complete: false` e o número de anos que já tem, para a página
// mostrar o aviso de "década em andamento".
export function buildDecades(years: YearSummary[]) {
  const yearsByDecade = Map.groupBy(years, (item) => Math.floor(item.year / 10) * 10);

  return [...yearsByDecade].map(([decade, items]) => ({
    decade,
    yearCount: items.length,
    complete: items.length === 10,
    ...averageSummaries(items),
  }));
}
