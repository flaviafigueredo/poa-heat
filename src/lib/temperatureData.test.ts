import { describe, expect, it } from "vitest";
import data from "@/data/temperature.json";
import {
  getYearAnomaly,
  seriesLengthText,
  seriesStartYear,
  temperatureData,
} from "./temperatureData";

describe("seriesStartYear", () => {
  it("começa em 1950, quando a série ERA5-Land tem início", () => {
    expect(seriesStartYear).toBe(1950);
  });
});

describe("seriesLengthText", () => {
  it("contém o número de anos completos dos dados", () => {
    expect(seriesLengthText).toContain(`${data.years.length} anos`);
  });

  it("começa com 'Mais de' porque os dados vão além do último ano completo", () => {
    // Os dados atuais terminam antes de 31 de dezembro, então há um ano
    // parcial. Se isso mudar no futuro, o teste avisa.
    expect(data.meta.endDate.endsWith("-12-31")).toBe(false);
    expect(seriesLengthText).toMatch(/^Mais de /);
  });

  it("segue o formato esperado", () => {
    expect(seriesLengthText).toMatch(/^(Mais de )?\d+ anos$/);
  });
});

describe("getYearAnomaly", () => {
  const baselineMean = data.comparison.baseline.years.meanTemp;

  it("devolve a anomalia do primeiro ano com um valor fixo conferido à mão", () => {
    const firstYear = temperatureData.years[0];
    // 1950 tem meanTemp 18.94 e a base (1961-1990) tem 19.26, conferido
    // no JSON. A anomalia é -0.32 °C.
    expect(getYearAnomaly(firstYear)).toBeCloseTo(-0.32, 2);
  });

  it("devolve valor positivo para um ano mais quente que a base", () => {
    const hotYear = temperatureData.years.find(
      (year) => year.meanTemp > baselineMean,
    );
    expect(hotYear).toBeDefined();

    expect(getYearAnomaly(hotYear!)).toBeGreaterThan(0);
  });

  it("devolve valor negativo para um ano mais frio que a base", () => {
    const coldYear = temperatureData.years.find(
      (year) => year.meanTemp < baselineMean,
    );
    expect(coldYear).toBeDefined();

    expect(getYearAnomaly(coldYear!)).toBeLessThan(0);
  });
});
