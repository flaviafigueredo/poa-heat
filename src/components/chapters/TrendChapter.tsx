import { greatest, least } from "d3-array";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { DataTable } from "@/components/charts/DataTable";
import { ResponsiveChart } from "@/components/charts/ResponsiveChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { formatTemperature } from "@/lib/format";
import { getYearAnomaly, temperatureData } from "@/lib/temperatureData";
import { Chapter } from "./Chapter";
import { HighlightNumber } from "./HighlightNumber";
import { Prose } from "./Prose";

const { comparison, years } = temperatureData;
const { baseline, recent } = comparison;
const trendLine = comparison.trend.meanTemp.line;

// Todos os números do texto vêm do JSON: quando o workflow mensal trouxer um
// ano novo, o capítulo se atualiza sozinho.
const recentDifference = recent.years.meanTemp - baseline.years.meanTemp;
const trendRise = trendLine.endValue - trendLine.startValue;
const firstYear = years[0].year;
const lastYear = years.at(-1)!.year;
const warmest = greatest(years, (year) => year.meanTemp)!;
const coldest = least(years, (year) => year.meanTemp)!;

// Quantos anos ficaram acima da média de 1961 a 1990, antes e depois de 2000.
const splitYear = 2000;
const yearsBefore = years.filter((year) => year.year < splitYear);
const yearsSince = years.filter((year) => year.year >= splitYear);
const countAbove = (list: typeof years) =>
  list.filter((year) => getYearAnomaly(year) > 0).length;

const baselineLabel = `${baseline.startYear} a ${baseline.endYear}`;

export function TrendChapter() {
  return (
    <Chapter
      kicker="Capítulo 1 · A tendência"
      title="A cidade esquentou, devagar"
      highlight={
        <HighlightNumber
          value={recentDifference}
          fractionDigits={1}
          signed
          suffix={" °C"}
          caption={`na temperatura média de ${recent.years.startYear} a ${recent.years.endYear}, comparada com a de ${baselineLabel}`}
        />
      }
      figure={<TrendFigure />}
    >
      <Prose>
        <p>
          Cada ponto do gráfico é a temperatura média de um ano inteiro em Porto Alegre:
          dias e noites, verão e inverno, tudo junto num número só.
        </p>
        <p>
          De um ano para o outro, esse número sobe e desce bastante. Por isso o gráfico
          tem uma linha de tendência, a reta que passa mais perto de todos os pontos e
          mostra a direção geral. De {firstYear} a {lastYear}, ela subiu{" "}
          {formatTemperature(trendRise)}.
        </p>
        <p>
          Para comparar, a base é a média de {baselineLabel}, uma referência clássica nos
          estudos de clima. Desde {splitYear}, {countAbove(yearsSince)} dos{" "}
          {yearsSince.length} anos ficaram acima dela. De {firstYear} a {splitYear - 1},
          foram {countAbove(yearsBefore)} de {yearsBefore.length}.
        </p>
        <p>
          Parece pouco, e é mesmo uma subida lenta. Mas uma média que muda pouco pode
          esconder mudanças grandes nos dias mais quentes, como mostra o próximo capítulo.
        </p>
      </Prose>
    </Chapter>
  );
}

// Gráfico do capítulo, com legenda, descrição em texto e tabela.
function TrendFigure() {
  return (
    <ChartFigure
      legend={
        <ChartLegend
          items={[
            { kind: "dot", color: "var(--temp-hot-2)", label: `ano mais quente que a média de ${baselineLabel}` },
            { kind: "dot", color: "var(--temp-cold-2)", label: "ano mais frio que essa média" },
            { kind: "line", color: "var(--color-text-muted)", label: `média de ${baselineLabel}`, dashed: true },
            { kind: "line", color: "var(--color-text)", label: "tendência" },
          ]}
        />
      }
      description={
        <>
          Temperatura média de cada ano em Porto Alegre, de {firstYear} a {lastYear}. O
          ano mais frio foi {coldest.year}, com {formatTemperature(coldest.meanTemp)}, e o
          mais quente foi {warmest.year}, com {formatTemperature(warmest.meanTemp)}. A
          linha de tendência vai de {formatTemperature(trendLine.startValue)} para{" "}
          {formatTemperature(trendLine.endValue)}. Quanto mais forte a cor do ponto, mais
          longe o ano ficou da média de {baselineLabel}. Fonte: Open-Meteo (ERA5-Land).
        </>
      }
      table={
        <DataTable
          summary="Ver os números ano a ano"
          caption={`Temperatura média de cada ano em Porto Alegre e diferença para a média de ${baselineLabel}`}
          columns={["Ano", "Média do ano", `Diferença para ${baselineLabel}`]}
          rows={years.map((year) => ({
            key: year.year,
            cells: [
              String(year.year),
              formatTemperature(year.meanTemp),
              formatTemperature(getYearAnomaly(year), { signed: true }),
            ],
          }))}
        />
      }
    >
      <ResponsiveChart render={(size) => <TrendChart {...size} />} />
    </ChartFigure>
  );
}
