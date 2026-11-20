import { scaleBand } from "d3-scale";
import type { CSSProperties } from "react";
import { formatTemperature } from "@/lib/format";
import { getAnomalyColor } from "@/lib/temperatureColor";
import { getYearAnomaly, temperatureData } from "@/lib/temperatureData";
import { ChartHover, type HoverPoint } from "./ChartHover";
import type { ChartSize } from "./ResponsiveChart";
import styles from "./StripesChart.module.css";

const { comparison, years } = temperatureData;
const { baseline } = comparison;

// Faixa de baixo, para os anos e a marca da base de 1961 a 1990.
const bottomMargin = 34;

// Nas telas largas as listras são mais altas, para o painel ter a mesma
// altura do painel dos recordes, ao lado.
export const stripesChartSizes = {
  narrow: { layout: "narrow", width: 360, height: 170 },
  wide: { layout: "wide", width: 760, height: 330 },
  extraWide: { layout: "extraWide", width: 1100, height: 400 },
} satisfies Record<ChartSize["layout"], ChartSize>;

// Listras do calor: uma listra por ano, colorida pela diferença para a
// média de 1961 a 1990 (a mesma régua de cores dos pontos do capítulo 1).
// Sem eixo vertical: a informação está na cor, e o balão dá o valor exato.
export function StripesChart({ width, height }: ChartSize) {
  const plotBottom = height - bottomMargin;

  // Uma faixa por ano, sem espaço entre elas, para as listras se encostarem.
  const x = scaleBand<number>()
    .domain(years.map((year) => year.year))
    .range([0, width]);

  const firstYear = years[0].year;
  const lastYear = years.at(-1)!.year;
  const baselineStart = x(baseline.startYear)!;
  const baselineEnd = x(baseline.endYear)! + x.bandwidth();

  const hoverPoints: HoverPoint[] = years.map((year) => ({
    x: x(year.year)! + x.bandwidth() / 2,
    title: String(year.year),
    rows: [
      {
        label: "diferença para a média de 1961 a 1990",
        value: formatTemperature(getYearAnomaly(year), { signed: true }),
      },
      { label: "média do ano", value: formatTemperature(year.meanTemp) },
    ],
  }));

  return (
    <ChartHover
      width={width}
      height={height}
      plotTop={0}
      plotBottom={plotBottom}
      points={hoverPoints}
      label="Listras do calor, uma por ano. Use as setas para andar pelos anos."
    >
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {/* `index` dá a ordem da listra, para elas aparecerem da mais antiga
            para a mais recente (ver o CSS). Cada listra é um pouco mais larga
            que a faixa, para não sobrar fresta entre elas no navegador. */}
        {years.map((year, index) => (
          <rect
            key={year.year}
            className={styles.stripe}
            style={{ "--index": index } as CSSProperties}
            x={x(year.year)}
            y={0}
            width={x.bandwidth() + 0.5}
            height={plotBottom}
            fill={getAnomalyColor(getYearAnomaly(year))}
          />
        ))}

        {/* Marca da base de 1961 a 1990: um colchete embaixo das listras. */}
        <path
          className={styles.bracket}
          d={`M${baselineStart},${plotBottom + 6} v4 H${baselineEnd} v-4`}
        />
        <text
          className={styles.axisLabel}
          x={(baselineStart + baselineEnd) / 2}
          y={plotBottom + 26}
          textAnchor="middle"
        >
          base: {baseline.startYear} a {baseline.endYear}
        </text>

        <text className={styles.axisLabel} x={0} y={plotBottom + 26}>
          {firstYear}
        </text>
        <text className={styles.axisLabel} x={width} y={plotBottom + 26} textAnchor="end">
          {lastYear}
        </text>
      </svg>
    </ChartHover>
  );
}
