import { extent } from "d3-array";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { DataTable } from "@/components/charts/DataTable";
import { ExtremesChart, getDecadeRange } from "@/components/charts/ExtremesChart";
import { ResponsiveChart, type ChartSize } from "@/components/charts/ResponsiveChart";
import { formatNumber } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import { Chapter } from "./Chapter";
import { HighlightNumber } from "./HighlightNumber";
import { Prose } from "./Prose";

const { comparison, decades, meta, years } = temperatureData;
const { baseline, recent } = comparison;
// Limites já com a unidade. O espaço que não quebra linha mantém o número
// e o "°C" sempre juntos.
const hotDay = `${meta.thresholds.hotDay} °C`;
const veryHotDay = `${meta.thresholds.veryHotDay} °C`;

const baselineLabel = `${baseline.startYear} a ${baseline.endYear}`;
const baselineBetween = `entre ${baseline.startYear} e ${baseline.endYear}`;
const recentLabel = `${recent.years.startYear} a ${recent.years.endYear}`;
const formatDays = (value: number) => formatNumber(value, { fractionDigits: 1 });

// Faixa dos dias acima de 35 por ano nas décadas antes de 2010, quando
// eles ainda eram raros, e os números das décadas seguintes.
const splitDecade = 2010;
const [rareMin, rareMax] = extent(
  decades.filter((decade) => decade.decade < splitDecade),
  (decade) => decade.daysAbove35,
) as [number, number];
const recentDecades = decades.filter((decade) => decade.decade >= splitDecade);
const partialDecade = decades.find((decade) => !decade.complete);
// "Mais que dobrou" só vale se todas as décadas recentes passaram do dobro
// da maior década anterior.
const hasDoubled = recentDecades.every((decade) => decade.daysAbove35 >= rareMax * 2);

// Os anos com mais dias acima de 35, do maior para o menor. Em empate,
// o ano mais antigo vem primeiro.
const topYearCount = 4;
const topYearCountText = "quatro";
const topYears = years
  .toSorted((a, b) => b.daysAbove35 - a.daysAbove35 || a.year - b.year)
  .slice(0, topYearCount);
const topYearsSince = Math.min(...topYears.map((year) => year.year));
const topYearsText = new Intl.ListFormat("pt-BR").format(
  topYears.map((year) => `${year.year} (${year.daysAbove35} dias)`),
);

// O gráfico tem dois painéis empilhados, então é mais alto que o padrão.
const extremesChartSizes = {
  narrow: { layout: "narrow", width: 360, height: 420 },
  wide: { layout: "wide", width: 720, height: 460 },
  extraWide: { layout: "extraWide", width: 1200, height: 480 },
} satisfies Record<ChartSize["layout"], ChartSize>;

export function ExtremesChapter() {
  return (
    <Chapter
      kicker="Capítulo 2 · Os extremos"
      title="O calor forte ficou mais comum"
      highlight={
        <HighlightNumber
          value={recent.years.daysAbove35}
          fractionDigits={1}
          suffix=" dias"
          caption={`por ano acima de ${veryHotDay} de ${recentLabel}, contra ${formatDays(baseline.years.daysAbove35)} ${baselineBetween}`}
        />
      }
      figure={<ExtremesFigure />}
    >
      <Prose>
        <p>
          A média do ano mistura tudo e esconde os dias mais quentes. Aqui a conta é
          outra: em quantos dias por ano a temperatura máxima passou de {hotDay} e de{" "}
          {veryHotDay}.
        </p>
        <p>
          Os dias acima de {veryHotDay} foram raros por muito tempo: entre{" "}
          {formatDays(rareMin)} e {formatDays(rareMax)} por ano, em média, até os anos{" "}
          {splitDecade - 10}. Depois, o número {hasDoubled ? "mais que dobrou" : "subiu"}:{" "}
          {new Intl.ListFormat("pt-BR").format(
            recentDecades.map(
              (decade) =>
                `${formatDays(decade.daysAbove35)} nos anos ${decade.decade}${decade.complete ? "" : " (até agora)"}`,
            ),
          )}
          .
        </p>
        <p>
          Os {topYearCountText} anos com mais dias acima de {veryHotDay} são todos de{" "}
          {topYearsSince} para cá: {topYearsText}.
        </p>
        <p>
          Os dias acima de {hotDay} também aumentaram, mas menos: eram{" "}
          {formatDays(baseline.years.daysAbove30)} por ano {baselineBetween} e foram{" "}
          {formatDays(recent.years.daysAbove30)} de {recentLabel}.
        </p>
        {partialDecade && (
          <p>
            A década de {partialDecade.decade} ainda não terminou. A barra dela mostra a
            média dos {partialDecade.yearCount} anos que já passaram, de{" "}
            {getDecadeRange(partialDecade)}, e ainda pode mudar.
          </p>
        )}
      </Prose>
    </Chapter>
  );
}

// Gráfico do capítulo, com legenda, descrição em texto e tabela.
function ExtremesFigure() {
  return (
    <ChartFigure
      legend={
        <ChartLegend
          items={[
            { kind: "bar", color: "var(--temp-hot-1)", label: `acima de ${hotDay}` },
            { kind: "bar", color: "var(--temp-hot-3)", label: `acima de ${veryHotDay}` },
            ...(partialDecade
              ? [
                  {
                    kind: "bar" as const,
                    color: "var(--temp-hot-3)",
                    label: `década em andamento (${getDecadeRange(partialDecade)})`,
                    dashed: true,
                  },
                ]
              : []),
            { kind: "line", color: "var(--color-text)", label: `média de ${baselineLabel}`, dashed: true },
          ]}
        />
      }
      description={
        <>
          Média de dias por ano com máxima acima de {hotDay} e acima de {veryHotDay}{" "}
          em Porto Alegre, por década, de {decades[0].decade} até hoje. Os dias acima de{" "}
          {veryHotDay} ficaram entre {formatDays(rareMin)} e {formatDays(rareMax)} por
          ano até os anos {splitDecade - 10} e subiram depois. A linha tracejada é a média
          de {baselineLabel}. Fonte: Open-Meteo (ERA5-Land).
        </>
      }
      table={
        <DataTable
          summary="Ver os números década a década"
          caption={`Média de dias por ano acima de ${hotDay} e de ${veryHotDay} em Porto Alegre, por década`}
          columns={["Década", `Dias acima de ${hotDay} por ano`, `Dias acima de ${veryHotDay} por ano`]}
          rows={decades.map((decade) => ({
            key: decade.decade,
            cells: [
              decade.complete
                ? getDecadeRange(decade)
                : `${getDecadeRange(decade)} (em andamento)`,
              formatDays(decade.daysAbove30),
              formatDays(decade.daysAbove35),
            ],
          }))}
        />
      }
    >
      <ResponsiveChart
        sizes={extremesChartSizes}
        render={(size) => <ExtremesChart {...size} />}
      />
    </ChartFigure>
  );
}
