import { describe, expect, it } from "vitest";
import { summarize, type DailyRecord } from "./temperature-calculations.ts";

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
