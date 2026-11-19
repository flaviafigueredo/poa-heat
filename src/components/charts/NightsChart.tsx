import { max } from "d3-array";
import { scaleLinear } from "d3-scale";
import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import { ChartHover, type HoverPoint } from "./ChartHover";
import styles from "./NightsChart.module.css";
import type { ChartLayout, ChartSize } from "./ResponsiveChart";

const { comparison, decades, years } = temperatureData;
const { baseline } = comparison;

type Decade = (typeof decades)[number];

const margin = { top: 28, right: 8, bottom: 28, left: 36 };

const decadeTicks = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const xTicks: Record<ChartLayout, number[]> = {
  narrow: [1950, 1975, 2000, 2025],
  wide: decadeTicks,
  extraWide: decadeTicks,
};

const dotRadius: Record<ChartLayout, number> = { narrow: 2.5, wide: 3.5, extraWide: 4 };

// Média de noites quentes da década de um ano, para o balão.
const decadeOf = (year: number) =>
  decades.find((decade) => year >= decade.decade && year < decade.decade + 10)!;

// A maior subida de uma década completa para a seguinte. É o salto que o
// gráfico anota (com os dados de hoje, dos anos 1970 para os 1980).
const completeDecades = decades.filter((decade) => decade.complete);
export const biggestJump = completeDecades.slice(1).reduce(
  (best, decade, index) => {
    const change = decade.warmNights - completeDecades[index].warmNights;
    return change > best.change ? { decade, change } : best;
  },
  { decade: completeDecades[1], change: -Infinity },
);

// Gráfico das noites com mínima de 20 °C ou mais: um ponto por ano e a média
// de cada década em degraus. Os degraus mostram que o número subiu de uma vez
// e depois ficou estável, o que os pontos sozinhos, que variam muito de um
// ano para outro, escondem. Roda no servidor; só o ChartHover roda no
// navegador.
export function NightsChart({ layout, width, height }: ChartSize) {
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;

  const firstYear = years[0].year;
  const lastYear = years.at(-1)!.year;

  const x = scaleLinear().domain([firstYear, lastYear]).range([plotLeft, plotRight]);

  // O eixo começa em zero para o salto aparecer no tamanho real, sem
  // exagero.
  const y = scaleLinear()
    .domain([0, max(years, (year) => year.warmNights)! * 1.08])
    .range([plotBottom, plotTop])
    .nice();

  // Cada década vira um degrau que cobre os anos dela, de meio ano antes do
  // primeiro a meio ano depois do último, sem passar das bordas do gráfico.
  const stepStart = (decade: Decade) => Math.max(x(decade.decade - 0.5), plotLeft);
  const stepEnd = (decade: Decade) =>
    Math.min(x(decade.decade + decade.yearCount - 0.5), plotRight);

  // Linha em degraus das décadas completas. Como o fim de um degrau e o
  // começo do seguinte têm o mesmo x, ligar os pontos em sequência já
  // desenha as subidas e descidas verticais.
  const stepPath = completeDecades
    .map((decade, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${stepStart(decade)},${y(decade.warmNights)} L${stepEnd(decade)},${y(decade.warmNights)}`;
    })
    .join(" ");

  // A década em andamento ganha um degrau tracejado à parte, ligado ao
  // último degrau completo.
  const partialDecade = decades.find((decade) => !decade.complete);
  const lastComplete = completeDecades.at(-1)!;
  const partialPath = partialDecade
    ? `M${stepEnd(lastComplete)},${y(lastComplete.warmNights)} L${stepStart(partialDecade)},${y(partialDecade.warmNights)} L${stepEnd(partialDecade)},${y(partialDecade.warmNights)}`
    : null;

  const jump = biggestJump.decade;
  const jumpCenter = (stepStart(jump) + stepEnd(jump)) / 2;

  const hoverPoints: HoverPoint[] = years.map((year) => {
    const decade = decadeOf(year.year);
    return {
      x: x(year.year),
      y: y(year.warmNights),
      color: "var(--temp-neutral)",
      title: String(year.year),
      rows: [
        { label: "noites com mínima de 20 °C ou mais", value: String(year.warmNights) },
        {
          label: decade.complete
            ? `média da década de ${decade.decade}`
            : `média da década de ${decade.decade} até agora`,
          value: formatNumber(decade.warmNights, { fractionDigits: 1 }),
        },
      ],
    };
  });

  return (
    <ChartHover
      width={width}
      height={height}
      plotTop={plotTop}
      plotBottom={plotBottom}
      points={hoverPoints}
      label="Noites quentes em cada ano. Use as setas para andar pelos anos."
    >
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {/* Grade horizontal e rótulos do eixo vertical. */}
        {y.ticks(layout === "narrow" ? 4 : 5).map((tick) => (
          <g key={tick}>
            <line className={styles.grid} x1={plotLeft} x2={plotRight} y1={y(tick)} y2={y(tick)} />
            <text className={styles.axisLabel} x={0} y={y(tick)} dy="0.32em">
              {tick}
            </text>
          </g>
        ))}

        {/* Rótulos do eixo horizontal. */}
        {xTicks[layout].map((tick) => (
          <text
            key={tick}
            className={styles.axisLabel}
            x={x(tick)}
            y={plotBottom + 20}
            textAnchor={tick === xTicks[layout].at(-1) && layout === "narrow" ? "end" : "middle"}
          >
            {tick}
          </text>
        ))}

        {/* Média de 1961 a 1990, a base de comparação. */}
        <line
          className={styles.baselineLine}
          x1={plotLeft}
          x2={plotRight}
          y1={y(baseline.years.warmNights)}
          y2={y(baseline.years.warmNights)}
        />

        {/* Um ponto por ano. O `--progress` é a posição do ano na série, de
            0 a 1, para os pontos aparecerem em ordem (ver o CSS). */}
        {years.map((year, index) => (
          <circle
            key={year.year}
            className={styles.dot}
            cx={x(year.year)}
            cy={y(year.warmNights)}
            r={dotRadius[layout]}
            style={{ "--progress": index / (years.length - 1) } as CSSProperties}
          />
        ))}

        {/* Degraus por cima dos pontos. A primeira linha, mais grossa e na
            cor do fundo, separa os degraus dos pontos que passam por baixo. */}
        <path className={styles.stepHalo} d={stepPath} />
        <path className={styles.step} d={stepPath} />
        {partialPath && (
          <>
            <path className={styles.stepHalo} d={partialPath} />
            <path className={`${styles.step} ${styles.stepPartial}`} d={partialPath} />
          </>
        )}

        {/* Anotação do maior salto entre duas décadas. */}
        <text
          className={styles.annotation}
          x={jumpCenter}
          y={y(jump.warmNights) - 12}
          textAnchor="middle"
        >
          {formatNumber(biggestJump.change, { fractionDigits: 1, signed: true })} noites por ano
          nos anos {jump.decade}
        </text>
      </svg>
    </ChartHover>
  );
}
