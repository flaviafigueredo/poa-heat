// Busca a temperatura diária de Porto Alegre na Open-Meteo, calcula os totais
// por ano e por verão e salva tudo em src/data/temperature.json.
//
// Roda com `npm run data`. O Node 24 executa TypeScript direto, sem compilar
// antes, por isso os imports abaixo terminam em `.ts`. As contas ficam em
// `temperature-calculations.ts`; este arquivo só busca, junta e grava.

import { mkdir, writeFile } from "node:fs/promises";
import { portoAlegre } from "../src/lib/portoAlegre.ts";
import {
  buildComparison,
  buildDecades,
  buildSummers,
  buildYears,
  getEndDate,
  getTodayInPortoAlegre,
  thresholds,
  timezone,
  toDailyRecords,
  type ArchiveResponse,
} from "./temperature-calculations.ts";

const apiUrl = "https://archive-api.open-meteo.com/v1/archive";
const model = "era5_land";
const startDate = "1950-01-01";
const outputPath = new URL("../src/data/temperature.json", import.meta.url);

async function fetchDaily(endDate: string): Promise<ArchiveResponse> {
  const params = new URLSearchParams({
    latitude: String(portoAlegre.lat),
    longitude: String(portoAlegre.lng),
    daily: "temperature_2m_min,temperature_2m_max,temperature_2m_mean",
    timezone,
    start_date: startDate,
    end_date: endDate,
    models: model,
  });

  const response = await fetch(`${apiUrl}?${params}`);

  // Em caso de erro, a API devolve um JSON com o motivo. Mostrar esse texto
  // ajuda a entender a falha quando o script rodar sozinho no GitHub Actions.
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Open-Meteo respondeu ${response.status}: ${body}`);
  }

  return (await response.json()) as ArchiveResponse;
}

async function main() {
  const endDate = getEndDate();
  console.log(`Buscando dados de ${startDate} até ${endDate}...`);

  const response = await fetchDaily(endDate);
  const records = toDailyRecords(response.daily);
  const years = buildYears(records);
  const summers = buildSummers(records);
  const comparison = buildComparison(years, summers);
  const decades = buildDecades(years);

  const data = {
    meta: {
      source: "Open-Meteo Historical Weather API",
      sourceUrl: "https://open-meteo.com/",
      license: "CC BY 4.0",
      model,
      requestedLocation: { lat: portoAlegre.lat, lng: portoAlegre.lng },
      // Ponto da grade que a API usou de fato. Ele aparece na metodologia.
      gridPoint: {
        lat: response.latitude,
        lng: response.longitude,
        elevation: response.elevation,
      },
      startDate,
      endDate,
      updatedAt: getTodayInPortoAlegre(),
      thresholds,
      summerMonths: [12, 1, 2],
    },
    comparison,
    years,
    summers,
    decades,
  };

  // `recursive: true` cria a pasta src/data se ela ainda não existir.
  await mkdir(new URL(".", outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`);

  console.log(
    `Pronto: ${records.length} dias, ${years.length} anos completos e ${summers.length} verões salvos.`,
  );
}

await main();
