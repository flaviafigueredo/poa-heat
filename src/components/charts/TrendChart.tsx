import { extent, greatest } from "d3-array";
import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { formatNumber, formatTemperature } from "@/lib/format";
import { getAnomalyColor } from "@/lib/temperatureColor";
import { getYearAnomaly, temperatureData, type YearSummary } from "@/lib/temperatureData";
import type { CSSProperties } from "react";
import { ChartHover, type HoverPoint } from "./ChartHover";
import styles from "./TrendChart.module.css";
import type { ChartLayout, ChartSize } from "./ResponsiveChart";

const { comparison, years } = temperatureData;
const { baseline } = comparison;
const trendLine = comparison.trend.meanTemp.line;

// Espaço em volta da área do gráfico, para os rótulos dos eixos e o rótulo
// da faixa de 1961 a 1990 no topo.
const margin = { top: 32, right: 8, bottom: 28, left: 44 };

// Anos marcados no eixo horizontal. No celular, menos anos, para os rótulos
// não se encostarem.
const decadeTicks = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const xTicks: Record<ChartLayout, number[]> = {
  narrow: [1950, 1975, 2000, 2025],
  wide: decadeTicks,
  extraWide: decadeTicks,
};

const dotRadius: Record<ChartLayout, number> = { narrow: 2.5, wide: 3.5, extraWide: 4 };

// Gráfico da temperatura média de cada ano, com a linha de tendência e a
// faixa da base de 1961 a 1990. Roda no servidor: o SVG sai pronto no HTML.
// A camada de hover (ChartHover) é a única parte que roda no navegador.
export function TrendChart({ layout, width, height }: ChartSize) {
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;

  // Escalas: convertem ano em posição horizontal e °C em posição vertical.
  // O topo do SVG é y = 0, por isso a escala vertical vai de baixo para cima.
  const x = scaleLinear()
    .domain([years[0].year, years.at(-1)!.year])
    .range([plotLeft, plotRight]);

  const [minTemp, maxTemp] = extent(years, (year) => year.meanTemp) as [number, number];
  // `nice` arredonda as pontas do eixo para números redondos, e a folga de
  // 0,15 °C evita que o ponto mais alto encoste no topo.
  const y = scaleLinear()
    .domain([minTemp - 0.15, maxTemp + 0.15])
    .range([plotBottom, plotTop])
    .nice();

  const yTicks = y.ticks(layout === "narrow" ? 4 : 5);

  // Geradores do D3: recebem os anos e devolvem o texto do atributo `d` do
  // <path>, que é a "receita" de desenho da linha e da área.
  const linePath = line<YearSummary>()
    .x((year) => x(year.year))
    .y((year) => y(year.meanTemp))(years)!;

  const areaPath = area<YearSummary>()
    .x((year) => x(year.year))
    .y0(plotBottom)
    .y1((year) => y(year.meanTemp))(years)!;

  const warmest = greatest(years, (year) => year.meanTemp)!;

  const hoverPoints: HoverPoint[] = years.map((year) => {
    const anomaly = getYearAnomaly(year);
    return {
      x: x(year.year),
      y: y(year.meanTemp),
      color: getAnomalyColor(anomaly),
      title: String(year.year),
      rows: [
        { label: "média do ano", value: formatTemperature(year.meanTemp) },
        {
          label: "diferença para a média de 1961 a 1990",
          value: formatTemperature(anomaly, { signed: true }),
        },
      ],
    };
  });

  // Ids precisam ser únicos na página. Como o gráfico aparece duas vezes
  // (celular e tela larga), o layout entra no nome.
  const gradientId = `trend-area-${layout}`;

  return (
    <ChartHover
      width={width}
      height={height}
      plotTop={plotTop}
      plotBottom={plotBottom}
      points={hoverPoints}
      label="Temperatura média de cada ano. Use as setas para andar pelos anos."
    >
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          {/* Degradê da área: um laranja bem fraco embaixo da linha, que some
              até o fundo. */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={0}
            x2={0}
            y1={plotTop}
            y2={plotBottom}
          >
            <stop offset="0%" className={styles.areaStopTop} />
            <stop offset="100%" className={styles.areaStopBottom} />
          </linearGradient>
        </defs>

        {/* Faixa da base de comparação, de 1961 a 1990. Começa e termina no
            meio do caminho entre dois anos, para cobrir os pontos inteiros. */}
        <rect
          className={styles.baselineBand}
          x={x(baseline.startYear - 0.5)}
          y={plotTop}
          width={x(baseline.endYear + 0.5) - x(baseline.startYear - 0.5)}
          height={plotBottom - plotTop}
        />
        <text
          className={styles.bandLabel}
          x={(x(baseline.startYear) + x(baseline.endYear)) / 2}
          y={plotTop - 10}
          textAnchor="middle"
        >
          base: {baseline.startYear} a {baseline.endYear}
        </text>

        {/* Grade horizontal e rótulos do eixo vertical. */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line className={styles.grid} x1={plotLeft} x2={plotRight} y1={y(tick)} y2={y(tick)} />
            {/* Número alinhado pela direita, logo antes do gráfico: mesmo com
                as letras maiores das telas largas, ele nunca encosta nos dados. */}
            <text
              className={styles.axisLabel}
              x={plotLeft - 8}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
            >
              {formatTemperature(tick, { fractionDigits: Number.isInteger(tick) ? 0 : 1 })}
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

        <path className={styles.area} d={areaPath} fill={`url(#${gradientId})`} />

        {/* Média de 1961 a 1990, a referência das cores dos pontos. */}
        <line
          className={styles.baselineLine}
          x1={plotLeft}
          x2={plotRight}
          y1={y(baseline.years.meanTemp)}
          y2={y(baseline.years.meanTemp)}
        />

        {/* `pathLength="1"` faz o navegador tratar a linha como se tivesse
            comprimento 1. Assim a animação de desenho funciona com qualquer
            formato de linha (ver o CSS). */}
        <path className={styles.line} d={linePath} pathLength={1} />

        {years.map((year, index) => (
          <circle
            key={year.year}
            className={styles.dot}
            cx={x(year.year)}
            cy={y(year.meanTemp)}
            r={dotRadius[layout]}
            fill={getAnomalyColor(getYearAnomaly(year))}
            // Posição do ponto na série, de 0 a 1. O CSS usa para fazer cada
            // ponto aparecer quando a linha passa por ele.
            style={{ "--progress": index / (years.length - 1) } as CSSProperties}
          />
        ))}

        <line
          className={styles.trend}
          x1={x(trendLine.startYear)}
          x2={x(trendLine.endYear)}
          y1={y(trendLine.startValue)}
          y2={y(trendLine.endValue)}
        />

        {/* Anotação do ano mais quente da série. Perto da borda direita, o
            texto termina no ponto em vez de ficar centralizado nele, para
            não sair do gráfico. */}
        <text
          className={styles.annotation}
          x={x(warmest.year)}
          y={y(warmest.meanTemp) - 12}
          textAnchor={x(warmest.year) > width * 0.8 ? "end" : "middle"}
        >
          {warmest.year}: {formatNumber(warmest.meanTemp, { fractionDigits: 1 })}
          {" "}°C
        </text>
      </svg>
    </ChartHover>
  );
}
