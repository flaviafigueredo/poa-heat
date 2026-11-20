import { ChartFigure } from "@/components/charts/ChartFigure";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { DataTable } from "@/components/charts/DataTable";
import { ResponsiveChart, type ChartSize } from "@/components/charts/ResponsiveChart";
import { getSummerChartHeight, SummerChart, summerDays } from "@/components/charts/SummerChart";
import { formatNumber, formatTemperature } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import { Chapter } from "./Chapter";
import { HighlightNumber } from "./HighlightNumber";
import { Prose } from "./Prose";

const { comparison, meta } = temperatureData;
const { baseline, recent } = comparison;

// Limites já com a unidade. O espaço que não quebra linha mantém o número
// e o "°C" sempre juntos.
const hotDay = `${meta.thresholds.hotDay} °C`;
const veryHotDay = `${meta.thresholds.veryHotDay} °C`;

const baselineBetween = `entre ${baseline.startYear} e ${baseline.endYear}`;
const recentLabel = `${recent.summers.startYear} a ${recent.summers.endYear}`;
const formatDays = (value: number) => formatNumber(value, { fractionDigits: 1 });

// Média em palavras do dia a dia: 5,9 vira "5 ou 6", e 2 vira só "2".
// Ninguém vive 5,9 dias; "5 ou 6" é o jeito como se fala de um verão típico.
function describeTypical(value: number): string {
  const low = Math.floor(value);
  const high = Math.ceil(value);
  return low === high ? String(low) : `${low} ou ${high}`;
}

// O verão leva o ano de janeiro: o verão de 2026 vai de dezembro de 2025 a
// fevereiro de 2026.
const firstRecentSummer = recent.summers.startYear;

// Medidas do gráfico: a largura segue o padrão dos outros capítulos, e a
// altura sai do número de linhas de quadradinhos em cada tela.
const summerChartSizes = {
  narrow: { layout: "narrow", width: 360, height: getSummerChartHeight("narrow", 360) },
  wide: { layout: "wide", width: 720, height: getSummerChartHeight("wide", 720) },
  extraWide: {
    layout: "extraWide",
    width: 1200,
    height: getSummerChartHeight("extraWide", 1200),
  },
} satisfies Record<ChartSize["layout"], ChartSize>;

export function SummerChapter() {
  return (
    <Chapter
      kicker="Capítulo 4 · O teu verão vs o dos teus pais"
      title="Um verão de hoje, comparado com o de uma geração atrás"
      highlight={
        <HighlightNumber
          value={recent.summers.daysAbove35}
          fractionDigits={1}
          suffix=" dias"
          caption={`acima de ${veryHotDay} por verão, de ${recentLabel}, contra ${formatDays(baseline.summers.daysAbove35)} ${baselineBetween}`}
        />
      }
      figure={<SummerFigure />}
    >
      <Prose>
        <p>
          Um verão típico hoje tem {describeTypical(recent.summers.daysAbove35)} dias acima
          de {veryHotDay}. No verão dos teus pais, eram{" "}
          {describeTypical(baseline.summers.daysAbove35)}.
        </p>
        <p>
          Aqui, verão são os meses de dezembro, janeiro e fevereiro. &ldquo;Hoje&rdquo; é a
          média dos últimos 10 verões, de {recentLabel} (o de {firstRecentSummer} começou em
          dezembro de {firstRecentSummer - 1}). &ldquo;O verão dos teus pais&rdquo; é a média{" "}
          {baselineBetween}.
        </p>
        <p>
          Os outros números do verão contam a mesma história, com menos força. A média do
          verão foi de {formatTemperature(baseline.summers.meanTemp)} para{" "}
          {formatTemperature(recent.summers.meanTemp)}, e os dias acima de {hotDay}, de{" "}
          {formatNumber(baseline.summers.daysAbove30)} para{" "}
          {formatNumber(recent.summers.daysAbove30)}.
        </p>
        <p>
          São poucos dias num verão de {summerDays}. Mas, como mostrou o capítulo 2, são
          justamente os dias de calor forte que ficaram mais comuns.
        </p>
      </Prose>
    </Chapter>
  );
}

// Gráfico do capítulo, com legenda, descrição em texto e tabela.
function SummerFigure() {
  return (
    <ChartFigure
      legend={
        <ChartLegend
          items={[
            { kind: "bar", color: "var(--temp-hot-3)", label: `dia acima de ${veryHotDay}` },
            { kind: "bar", color: "var(--color-grid)", label: "outro dia do verão" },
          ]}
        />
      }
      description={
        <>
          Cada quadradinho é um dia de um verão típico em Porto Alegre, de dezembro a
          fevereiro. Os acesos são os dias acima de {veryHotDay}: em média{" "}
          {formatDays(recent.summers.daysAbove35)} por verão de {recentLabel}, contra{" "}
          {formatDays(baseline.summers.daysAbove35)} {baselineBetween}. Como são médias, o
          último quadradinho aceso fica preenchido só em parte. Fonte: Open-Meteo
          (ERA5-Land).
        </>
      }
      table={
        <DataTable
          summary="Ver os números do verão"
          caption="Média por verão em Porto Alegre, nos últimos 10 verões e entre 1961 e 1990"
          columns={["Número do verão", `De ${recentLabel}`, `De ${baseline.startYear} a ${baseline.endYear}`]}
          rows={[
            {
              key: "daysAbove35",
              cells: [
                `Dias acima de ${veryHotDay}`,
                formatDays(recent.summers.daysAbove35),
                formatDays(baseline.summers.daysAbove35),
              ],
            },
            {
              key: "daysAbove30",
              cells: [
                `Dias acima de ${hotDay}`,
                formatDays(recent.summers.daysAbove30),
                formatDays(baseline.summers.daysAbove30),
              ],
            },
            {
              key: "meanTemp",
              cells: [
                "Temperatura média",
                formatTemperature(recent.summers.meanTemp),
                formatTemperature(baseline.summers.meanTemp),
              ],
            },
          ]}
        />
      }
    >
      <ResponsiveChart
        sizes={summerChartSizes}
        render={(size) => <SummerChart {...size} />}
      />
    </ChartFigure>
  );
}
