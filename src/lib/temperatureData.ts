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
