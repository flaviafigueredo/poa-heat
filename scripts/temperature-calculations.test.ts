import { describe, expect, it } from "vitest";
import {
  averageSummaries,
  buildComparison,
  buildDecades,
  buildSummers,
  buildTrend,
  buildYears,
  getEndDate,
  getTodayInPortoAlegre,
  isLeapYear,
  pickPeriod,
  roundTo,
  summarize,
  toDailyRecords,
  type DailyRecord,
  type SummerSummary,
  type YearSummary,
} from "./temperature-calculations.ts";

// Cria um dia com valores padrão, para cada teste mudar só o que importa.
function makeDay(overrides: Partial<DailyRecord> = {}): DailyRecord {
  return {
    date: "2000-01-01",
    year: 2000,
    month: 1,
    min: 15,
    max: 25,
    mean: 20,
    ...overrides,
  };
}

// Cria um dia para cada data entre `start` e `end` (as duas incluídas, no
// formato AAAA-MM-DD). Ano e mês saem da própria data, como na API.
function makeDaysBetween(
  start: string,
  end: string,
  overrides: Partial<DailyRecord> = {},
): DailyRecord[] {
  const days: DailyRecord[] = [];
  const last = new Date(`${end}T00:00:00Z`);

  for (
    const current = new Date(`${start}T00:00:00Z`);
    current <= last;
    current.setUTCDate(current.getUTCDate() + 1)
  ) {
    days.push(
      makeDay({
        date: current.toISOString().slice(0, 10),
        year: current.getUTCFullYear(),
        month: current.getUTCMonth() + 1,
        ...overrides,
      }),
    );
  }

  return days;
}

function makeDaysOfYear(year: number, overrides: Partial<DailyRecord> = {}) {
  return makeDaysBetween(`${year}-01-01`, `${year}-12-31`, overrides);
}

// Cria o resumo de um ano ou verão com zeros, para cada teste mudar só o que
// importa.
function makeYear(year: number, overrides: Partial<YearSummary> = {}): YearSummary {
  return { year, meanTemp: 0, daysAbove30: 0, daysAbove35: 0, warmNights: 0, ...overrides };
}

function makeSummer(
  summer: number,
  overrides: Partial<SummerSummary> = {},
): SummerSummary {
  return { summer, meanTemp: 0, daysAbove30: 0, daysAbove35: 0, warmNights: 0, ...overrides };
}

// Lista de anos consecutivos de `first` a `last`, com os valores de cada ano
// escolhidos pela função `overridesFor`.
function makeYears(
  first: number,
  last: number,
  overridesFor: (year: number) => Partial<YearSummary> = () => ({}),
) {
  return Array.from({ length: last - first + 1 }, (_, index) =>
    makeYear(first + index, overridesFor(first + index)),
  );
}

function makeSummers(
  first: number,
  last: number,
  overridesFor: (summer: number) => Partial<SummerSummary> = () => ({}),
) {
  return Array.from({ length: last - first + 1 }, (_, index) =>
    makeSummer(first + index, overridesFor(first + index)),
  );
}

describe("summarize", () => {
  it("calcula a média das temperaturas médias dos dias", () => {
    const days = [makeDay({ mean: 10 }), makeDay({ mean: 20 })];

    expect(summarize(days).meanTemp).toBe(15);
  });

  it("só conta máxima acima de 30 e de 35, sem contar o valor igual", () => {
    const days = [
      makeDay({ max: 30 }),
      makeDay({ max: 30.1 }),
      makeDay({ max: 35 }),
      makeDay({ max: 35.1 }),
    ];

    const result = summarize(days);

    expect(result.daysAbove30).toBe(3);
    expect(result.daysAbove35).toBe(1);
  });

  it("conta mínima de 20 ou mais como noite quente, incluindo o 20", () => {
    const days = [makeDay({ min: 19.9 }), makeDay({ min: 20 }), makeDay({ min: 24 })];

    expect(summarize(days).warmNights).toBe(2);
  });
});

describe("isLeapYear e roundTo", () => {
  it("reconhece ano bissexto, inclusive as exceções dos séculos", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it("arredonda para o número de casas pedido", () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(1.23556, 2)).toBe(1.24);
    expect(roundTo(2.5, 0)).toBe(3);
  });
});

describe("toDailyRecords", () => {
  it("junta as listas da API num objeto por dia, com ano e mês da data", () => {
    const records = toDailyRecords({
      time: ["2024-02-29", "2024-03-01"],
      temperature_2m_min: [18, 19],
      temperature_2m_max: [31, 32],
      temperature_2m_mean: [24, 25],
    });

    expect(records).toEqual([
      { date: "2024-02-29", year: 2024, month: 2, min: 18, max: 31, mean: 24 },
      { date: "2024-03-01", year: 2024, month: 3, min: 19, max: 32, mean: 25 },
    ]);
  });

  it("para com erro quando as listas têm tamanhos diferentes", () => {
    expect(() =>
      toDailyRecords({
        time: ["2024-01-01", "2024-01-02"],
        temperature_2m_min: [18],
        temperature_2m_max: [31, 32],
        temperature_2m_mean: [24, 25],
      }),
    ).toThrow("tamanhos diferentes");
  });

  it("para com erro, citando a data, quando um dia vem sem valor", () => {
    expect(() =>
      toDailyRecords({
        time: ["2024-01-01", "2024-01-02"],
        temperature_2m_min: [18, 19],
        temperature_2m_max: [31, null],
        temperature_2m_mean: [24, 25],
      }),
    ).toThrow("2024-01-02");
  });
});

describe("getEndDate", () => {
  it("devolve o último dia do mês anterior", () => {
    expect(getEndDate(new Date("2026-11-12T15:00:00Z"))).toBe("2026-10-31");
  });

  it("volta para dezembro do ano anterior quando o mês é janeiro", () => {
    expect(getEndDate(new Date("2026-01-15T15:00:00Z"))).toBe("2025-12-31");
  });

  it("devolve 29 de fevereiro quando o mês anterior é fevereiro de ano bissexto", () => {
    expect(getEndDate(new Date("2024-03-10T15:00:00Z"))).toBe("2024-02-29");
  });

  it("usa o mês de Porto Alegre, não o de UTC", () => {
    // 01h em UTC do dia 1º de dezembro ainda é 22h de 30 de novembro em Porto
    // Alegre, então o último mês completo continua sendo outubro.
    expect(getEndDate(new Date("2026-12-01T01:00:00Z"))).toBe("2026-10-31");
  });
});

describe("getTodayInPortoAlegre", () => {
  it("devolve a data no formato AAAA-MM-DD", () => {
    expect(getTodayInPortoAlegre(new Date("2026-11-12T15:00:00Z"))).toBe("2026-11-12");
  });

  it("usa o dia de Porto Alegre, que vira três horas depois de UTC", () => {
    expect(getTodayInPortoAlegre(new Date("2026-12-01T01:00:00Z"))).toBe("2026-11-30");
  });
});

describe("buildYears", () => {
  it("calcula os números de um ano completo", () => {
    const days = makeDaysOfYear(2023);
    days[0].max = 36;
    days[1].min = 21;

    expect(buildYears(days)).toEqual([
      { year: 2023, meanTemp: 20, daysAbove30: 1, daysAbove35: 1, warmNights: 1 },
    ]);
  });

  it("descarta o ano incompleto, como o ano corrente", () => {
    const days = [...makeDaysOfYear(2023), ...makeDaysBetween("2024-01-01", "2024-06-30")];

    expect(buildYears(days).map((item) => item.year)).toEqual([2023]);
  });

  it("aceita 366 dias num ano bissexto e descarta o bissexto com 365", () => {
    const complete = makeDaysOfYear(2024);
    const missingLastDay = makeDaysBetween("2020-01-01", "2020-12-30");

    expect(complete).toHaveLength(366);
    expect(buildYears([...complete, ...missingLastDay]).map((item) => item.year)).toEqual([
      2024,
    ]);
  });

  it("devolve vazio quando não há nenhum dia", () => {
    expect(buildYears([])).toEqual([]);
  });
});

describe("buildSummers", () => {
  it("junta dezembro ao verão do ano seguinte", () => {
    // Dezembro de 2023 (31 dias, média 30) e janeiro e fevereiro de 2024
    // (60 dias, média 20): o verão de 2024 só tem a média certa se o
    // dezembro de 2023 entrar nele.
    const days = [
      ...makeDaysBetween("2023-12-01", "2023-12-31", { mean: 30 }),
      ...makeDaysBetween("2024-01-01", "2024-02-29", { mean: 20 }),
    ];

    expect(buildSummers(days)).toEqual([
      { summer: 2024, meanTemp: 23.41, daysAbove30: 0, daysAbove35: 0, warmNights: 0 },
    ]);
  });

  it("aceita 90 dias em verão sem 29 de fevereiro", () => {
    const days = makeDaysBetween("2024-12-01", "2025-02-28");

    expect(days).toHaveLength(90);
    expect(buildSummers(days).map((item) => item.summer)).toEqual([2025]);
  });

  it("descarta o verão sem dezembro, como o de 1950", () => {
    const days = makeDaysBetween("2024-01-01", "2024-02-29");

    expect(buildSummers(days)).toEqual([]);
  });

  it("descarta o verão que ainda está acontecendo", () => {
    const days = makeDaysBetween("2024-12-01", "2025-01-31");

    expect(buildSummers(days)).toEqual([]);
  });

  it("ignora os meses fora do verão", () => {
    // Um ano inteiro não tem nenhum verão completo: faltam o dezembro
    // anterior e o fevereiro seguinte.
    expect(buildSummers(makeDaysOfYear(2024))).toEqual([]);
  });
});

describe("pickPeriod", () => {
  it("devolve só os itens do período, com os dois anos das pontas incluídos", () => {
    const items = makeYears(1999, 2004);

    const selected = pickPeriod(items, (item) => item.year, 2000, 2003);

    expect(selected.map((item) => item.year)).toEqual([2000, 2001, 2002, 2003]);
  });

  it("para com erro quando falta um ano no período", () => {
    const items = [makeYear(2000), makeYear(2002)];

    expect(() => pickPeriod(items, (item) => item.year, 2000, 2002)).toThrow(
      "Período 2000-2002 com 2 itens, esperava 3.",
    );
  });
});

describe("buildTrend", () => {
  it("acha a inclinação e os pontos da reta em dados que formam uma reta", () => {
    // y = 10 + 0,02 por ano, de 2000 a 2009.
    const points = Array.from({ length: 10 }, (_, index) => ({
      x: 2000 + index,
      y: 10 + 0.02 * index,
    }));

    expect(buildTrend(points)).toEqual({
      perDecade: 0.2,
      line: { startYear: 2000, startValue: 10, endYear: 2009, endValue: 10.18 },
    });
  });

  it("calcula a reta de mínimos quadrados em pontos que não são uma reta", () => {
    // Conta feita à mão: média de x = 1,5, média de y = 1,25 e inclinação
    // = 4,5 / 5 = 0,9 por ano.
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 3 },
    ];

    expect(buildTrend(points)).toEqual({
      perDecade: 9,
      line: { startYear: 0, startValue: -0.1, endYear: 3, endValue: 2.6 },
    });
  });

  it("devolve inclinação negativa quando a temperatura cai", () => {
    const points = [
      { x: 2000, y: 20 },
      { x: 2001, y: 19.95 },
      { x: 2002, y: 19.9 },
    ];

    expect(buildTrend(points).perDecade).toBe(-0.5);
  });

  it("devolve inclinação zero quando todos os valores são iguais", () => {
    const points = [
      { x: 2000, y: 15 },
      { x: 2001, y: 15 },
      { x: 2002, y: 15 },
    ];

    expect(buildTrend(points).perDecade).toBe(0);
  });
});

describe("averageSummaries", () => {
  it("tira a média de cada número, com duas casas", () => {
    const result = averageSummaries([
      makeYear(2000, { meanTemp: 10, daysAbove35: 1, warmNights: 60 }),
      makeYear(2001, { meanTemp: 11, daysAbove35: 1, warmNights: 61 }),
      makeYear(2002, { meanTemp: 12.5, daysAbove35: 2, warmNights: 62 }),
    ]);

    expect(result).toEqual({
      meanTemp: 11.17,
      daysAbove30: 0,
      daysAbove35: 1.33,
      warmNights: 61,
    });
  });
});

describe("buildDecades", () => {
  it("agrupa por década e marca como completa a que tem 10 anos", () => {
    const years = makeYears(1990, 1999, () => ({ meanTemp: 19 }));

    expect(buildDecades(years)).toEqual([
      {
        decade: 1990,
        yearCount: 10,
        complete: true,
        meanTemp: 19,
        daysAbove30: 0,
        daysAbove35: 0,
        warmNights: 0,
      },
    ]);
  });

  it("marca a década em andamento como incompleta e diz quantos anos ela tem", () => {
    const years = [
      ...makeYears(1990, 1999),
      ...makeYears(2020, 2022, (year) => ({ meanTemp: year - 2000, daysAbove35: 3 })),
    ];

    const [, current] = buildDecades(years);

    expect(current).toEqual({
      decade: 2020,
      yearCount: 3,
      complete: false,
      meanTemp: 21,
      daysAbove30: 0,
      daysAbove35: 3,
      warmNights: 0,
    });
  });

  it("mantém as décadas em ordem", () => {
    const years = makeYears(1990, 2005);

    expect(buildDecades(years).map((item) => item.decade)).toEqual([1990, 2000]);
  });
});

describe("buildComparison", () => {
  // Anos de 1950 a 2025 e verões de 1951 a 2026, com valores diferentes na
  // base (1961 a 1990), nos 10 últimos e no resto, para cada janela ser
  // reconhecida pelo número que sai.
  const years = makeYears(1950, 2025, (year) => ({
    meanTemp: year >= 1961 && year <= 1990 ? 19 : year >= 2016 ? 19.5 : 18,
  }));
  const summers = makeSummers(1951, 2026, (summer) => ({
    daysAbove35: summer >= 1961 && summer <= 1990 ? 2 : summer >= 2017 ? 6 : 0,
  }));

  it("calcula a média da base de 1961 a 1990", () => {
    const { baseline } = buildComparison(years, summers);

    expect(baseline.startYear).toBe(1961);
    expect(baseline.endYear).toBe(1990);
    expect(baseline.years.meanTemp).toBe(19);
    expect(baseline.summers.daysAbove35).toBe(2);
  });

  it("usa os 10 últimos anos e os 10 últimos verões completos", () => {
    const { recent } = buildComparison(years, summers);

    expect(recent.years.startYear).toBe(2016);
    expect(recent.years.endYear).toBe(2025);
    expect(recent.years.meanTemp).toBe(19.5);
    expect(recent.summers.startYear).toBe(2017);
    expect(recent.summers.endYear).toBe(2026);
    expect(recent.summers.daysAbove35).toBe(6);
  });

  it("anda a janela sozinha quando chega um ano novo", () => {
    const withNewYear = [...years, makeYear(2026, { meanTemp: 21 })];

    const { recent } = buildComparison(withNewYear, summers);

    expect(recent.years.startYear).toBe(2017);
    expect(recent.years.endYear).toBe(2026);
    expect(recent.years.meanTemp).toBe(19.65);
  });

  it("traz a reta de tendência da média dos anos, do primeiro ao último", () => {
    const { trend } = buildComparison(years, summers);

    expect(trend.meanTemp.line.startYear).toBe(1950);
    expect(trend.meanTemp.line.endYear).toBe(2025);
  });

  it("para com erro quando a base não tem todos os anos", () => {
    const withoutFirstBaselineYear = years.filter((item) => item.year !== 1961);

    expect(() => buildComparison(withoutFirstBaselineYear, summers)).toThrow(
      "Período 1961-1990",
    );
  });
});
