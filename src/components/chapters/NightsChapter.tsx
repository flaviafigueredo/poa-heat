import { extent, greatest, least, mean } from "d3-array";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { DataTable } from "@/components/charts/DataTable";
import { biggestJump, NightsChart } from "@/components/charts/NightsChart";
import { ResponsiveChart } from "@/components/charts/ResponsiveChart";
import { formatNumber } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import { Chapter } from "./Chapter";
import { HighlightNumber } from "./HighlightNumber";
import { Prose } from "./Prose";

const { comparison, decades, meta, years } = temperatureData;
const { baseline, recent } = comparison;

// Limite com a unidade. O espaço que não quebra linha mantém o número e o
// "°C" sempre juntos.
const warmNight = `${meta.thresholds.warmNight} °C`;

const baselineLabel = `${baseline.startYear} a ${baseline.endYear}`;
const baselineBetween = `entre ${baseline.startYear} e ${baseline.endYear}`;
const recentLabel = `${recent.years.startYear} a ${recent.years.endYear}`;
const formatWhole = (value: number) => formatNumber(value);

// Antes e depois do salto: a média por ano dos anos anteriores à década do
// salto e a faixa das médias das décadas completas que vieram depois.
const jumpDecade = biggestJump.decade.decade;
const meanBefore = mean(
  years.filter((year) => year.year < jumpDecade),
  (year) => year.warmNights,
)!;
const [afterMin, afterMax] = extent(
  decades.filter((decade) => decade.complete && decade.decade >= jumpDecade),
  (decade) => decade.warmNights,
) as [number, number];

// Os anos com menos e mais noites quentes desde o salto, para mostrar quanto
// o número varia de um ano para outro.
const yearsSinceJump = years.filter((year) => year.year >= jumpDecade);
const fewestSince = least(yearsSinceJump, (year) => year.warmNights)!;
const mostSince = greatest(yearsSinceJump, (year) => year.warmNights)!;

const partialDecade = decades.find((decade) => !decade.complete);

// A partir de 1979, a reanálise passa a receber muito mais dados de
// satélite. Se o maior salto cair na década seguinte, o texto avisa que
// parte dele pode vir dessa mudança nos dados (ver analysis-care.md).
const satelliteEraDecade = 1980;

export function NightsChapter() {
  return (
    <Chapter
      kicker="Capítulo 3 · As noites"
      title="As noites quentes deram um salto"
      highlight={
        <HighlightNumber
          value={recent.years.warmNights}
          suffix=" noites"
          caption={`por ano com mínima de ${warmNight} ou mais, de ${recentLabel}, contra ${formatWhole(baseline.years.warmNights)} ${baselineBetween}`}
        />
      }
      figure={<NightsFigure />}
    >
      <Prose>
        <p>
          Agora a conta é das noites: em quantas a temperatura não baixou de {warmNight}.
          É a noite em que a casa não refresca, mesmo depois que o sol se põe.
        </p>
        <p>
          Até os anos {jumpDecade - 10}, eram cerca de {formatWhole(meanBefore)} noites
          assim por ano. Nos anos {jumpDecade}, o número subiu para{" "}
          {formatWhole(biggestJump.decade.warmNights)}. Desde então, a média de cada
          década ficou entre {formatWhole(afterMin)} e {formatWhole(afterMax)}.
        </p>
        <p>
          Ou seja, não foi uma subida contínua. Foi um salto, seguido de um número mais
          ou menos estável. De um ano para outro, ele ainda varia bastante: desde{" "}
          {jumpDecade}, foi de {fewestSince.warmNights} noites em {fewestSince.year} a{" "}
          {mostSince.warmNights} em {mostSince.year}.
        </p>
        {jumpDecade === satelliteEraDecade && (
          <p>
            Um cuidado: o salto coincide com o fim dos anos 1970, quando a reanálise
            passou a receber muito mais dados de satélite. Por isso, parte dele pode vir
            da mudança na forma de medir, e não só do clima. A seção sobre os dados, no
            fim da página, explica.
          </p>
        )}
        {partialDecade && (
          <p>
            A década de {partialDecade.decade} ainda não terminou. O degrau tracejado
            mostra a média dos {partialDecade.yearCount} anos que já passaram.
          </p>
        )}
      </Prose>
    </Chapter>
  );
}

// Gráfico do capítulo, com legenda, descrição em texto e tabela.
function NightsFigure() {
  return (
    <ChartFigure
      legend={
        <ChartLegend
          items={[
            { kind: "dot", color: "var(--temp-neutral)", label: "cada ano" },
            { kind: "line", color: "var(--temp-hot-2)", label: "média da década" },
            ...(partialDecade
              ? [
                  {
                    kind: "line" as const,
                    color: "var(--temp-hot-2)",
                    label: "década em andamento",
                    dashed: true,
                  },
                ]
              : []),
            {
              kind: "line",
              color: "var(--color-text-muted)",
              label: `média de ${baselineLabel}`,
              dashed: true,
            },
          ]}
        />
      }
      description={
        <>
          Noites por ano com temperatura mínima de {warmNight} ou mais em Porto Alegre,
          de {years[0].year} a {years.at(-1)!.year}, com a média de cada década. A média
          era de cerca de {formatWhole(meanBefore)} até os anos {jumpDecade - 10}, subiu
          para {formatWhole(biggestJump.decade.warmNights)} nos anos {jumpDecade} e
          depois ficou entre {formatWhole(afterMin)} e {formatWhole(afterMax)}. A linha
          tracejada cinza é a média de {baselineLabel}. Fonte: Open-Meteo (ERA5-Land).
        </>
      }
      table={
        <DataTable
          summary="Ver os números ano a ano"
          caption={`Noites por ano com mínima de ${warmNight} ou mais em Porto Alegre`}
          columns={["Ano", "Noites quentes"]}
          rows={years.map((year) => ({
            key: year.year,
            cells: [String(year.year), String(year.warmNights)],
          }))}
        />
      }
    >
      <ResponsiveChart render={(size) => <NightsChart {...size} />} />
    </ChartFigure>
  );
}
