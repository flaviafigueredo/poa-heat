import { greatest, max } from "d3-array";
import { scaleBand, scaleLinear } from "d3-scale";
import type { CSSProperties } from "react";
import { formatNumber, formatTemperature } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import { ChartHover, type HoverPoint } from "./ChartHover";
import type { ChartLayout, ChartSize } from "./ResponsiveChart";
import styles from "./SummersChart.module.css";

const { comparison, meta, summers } = temperatureData;
const { baseline } = comparison;

const margin = { top: 24, right: 0, bottom: 24, left: 24 };

export const summersChartSizes = {
  narrow: { layout: "narrow", width: 360, height: 210 },
  wide: { layout: "wide", width: 760, height: 250 },
  extraWide: { layout: "extraWide", width: 1100, height: 270 },
} satisfies Record<ChartSize["layout"], ChartSize>;

// Anos marcados embaixo das barras. No celular, menos, para não encostarem.
const xTicks: Record<ChartLayout, number[]> = {
  narrow: [1960, 1990, 2020],
  wide: [1960, 1970, 1980, 1990, 2000, 2010, 2020],
  extraWide: [1960, 1970, 1980, 1990, 2000, 2010, 2020],
};

// O verão leva o ano de janeiro: o de 2022 vai de dezembro de 2021 a
// fevereiro de 2022.
export function describeSummer(summer: number): string {
  return `verão de ${summer} (dez. de ${summer - 1} a fev. de ${summer})`;
}

// Barras com os dias acima de 35 °C em cada verão, com a média de 1961 a
// 1990 marcada. Roda no servidor; só o ChartHover roda no navegador.
export function SummersChart({ layout, width, height }: ChartSize) {
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;

  const x = scaleBand<number>()
    .domain(summers.map((summer) => summer.summer))
    .range([plotLeft, plotRight])
    .padding(0.25);

  const y = scaleLinear()
    .domain([0, max(summers, (summer) => summer.daysAbove35)!])
    .range([plotBottom, plotTop])
    .nice();

  const hottest = greatest(summers, (summer) => summer.daysAbove35)!;
  const hottestX = x(hottest.summer)! + x.bandwidth() / 2;

  const hoverPoints: HoverPoint[] = summers.map((summer) => ({
    x: x(summer.summer)! + x.bandwidth() / 2,
    title: describeSummer(summer.summer),
    rows: [
      {
        label: `dias acima de ${meta.thresholds.veryHotDay} °C`,
        value: String(summer.daysAbove35),
      },
      { label: "média do verão", value: formatTemperature(summer.meanTemp) },
    ],
  }));

  return (
    <ChartHover
      width={width}
      height={height}
      plotTop={plotTop}
      plotBottom={plotBottom}
      points={hoverPoints}
      label="Dias acima de 35 °C em cada verão. Use as setas para andar pelos verões."
    >
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {/* Grade horizontal e rótulos do eixo vertical. */}
        {y.ticks(3).map((tick) => (
          <g key={tick}>
            <line className={styles.grid} x1={plotLeft} x2={plotRight} y1={y(tick)} y2={y(tick)} />
            <text className={styles.axisLabel} x={0} y={y(tick)} dy="0.32em">
              {tick}
            </text>
          </g>
        ))}

        {xTicks[layout].map((tick) => (
          <text
            key={tick}
            className={styles.axisLabel}
            x={x(tick)! + x.bandwidth() / 2}
            y={plotBottom + 18}
            textAnchor="middle"
          >
            {tick}
          </text>
        ))}

        {/* `--index` é a ordem do verão, para as barras subirem da mais
            antiga para a mais recente (ver o CSS). */}
        {summers.map((summer, index) => (
          <rect
            key={summer.summer}
            className={styles.bar}
            style={{ "--index": index } as CSSProperties}
            x={x(summer.summer)}
            y={y(summer.daysAbove35)}
            width={x.bandwidth()}
            height={plotBottom - y(summer.daysAbove35)}
          />
        ))}

        {/* Média de 1961 a 1990. Sem contorno escuro por baixo: com barras
            tão finas, ele parecia cortar cada barra ao meio. O tracejado
            aparece nos espaços entre elas. */}
        <line
          className={styles.baselineLine}
          x1={plotLeft}
          x2={plotRight}
          y1={y(baseline.summers.daysAbove35)}
          y2={y(baseline.summers.daysAbove35)}
        />

        {/* Anotação do verão com mais dias acima de 35 °C. Perto da borda
            direita, o texto termina na barra para não sair do gráfico. */}
        <text
          className={styles.annotation}
          x={hottestX}
          y={y(hottest.daysAbove35) - 8}
          textAnchor={hottestX > width * 0.8 ? "end" : "middle"}
        >
          {hottest.summer}: {formatNumber(hottest.daysAbove35)} dias
        </text>
      </svg>
    </ChartHover>
  );
}
