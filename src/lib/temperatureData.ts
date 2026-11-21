import data from "@/data/temperature.json";

// Dados gerados pelo script `npm run data`. O TypeScript lê o formato direto
// do JSON, então os tipos acompanham o arquivo sem precisar escrevê-los à mão.
export const temperatureData = data;

export type YearSummary = (typeof data.years)[number];

const baselineMean = data.comparison.baseline.years.meanTemp;

// Diferença de um ano para a média de 1961 a 1990. Positivo: mais quente
// que a base. Negativo: mais frio.
export function getYearAnomaly(year: YearSummary): number {
  return year.meanTemp - baselineMean;
}

// Ano em que a série começa, para textos como "de 1950 até hoje".
export const seriesStartYear = Number(data.meta.startDate.slice(0, 4));

// Tamanho da série em palavras, para a abertura e a descrição da página.
// Conta os anos completos nos dados (hoje, 1950 a 2025) e põe "Mais de" na
// frente quando já há meses do ano seguinte, ou seja, quando o último dia
// dos dados não é 31 de dezembro.
const hasPartialYear = !data.meta.endDate.endsWith("-12-31");
export const seriesLengthText = `${hasPartialYear ? "Mais de " : ""}${data.years.length} anos`;
