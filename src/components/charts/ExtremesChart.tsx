import { max } from "d3-array";
import { scaleBand, scaleLinear } from "d3-scale";
import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import { ChartHover, type HoverPoint } from "./ChartHover";
import styles from "./ExtremesChart.module.css";
import type { ChartLayout, ChartSize } from "./ResponsiveChart";

const { comparison, decades, meta } = temperatureData;
const { baseline } = comparison;

type Decade = (typeof decades)[number];

// Os dois painéis do gráfico, um para cada limite de calor. Cada um tem a
// própria escala: os dias acima de 30 °C passam de 40 por ano, e os acima de
// 35 °C não chegam a 10. No mesmo eixo, as barras de 35 °C ficariam achatadas.
// Quanto mais forte o calor, mais clara a cor, como na paleta de temperatura.
const panels = [
  {
    key: "daysAbove30",
    title: `Dias acima de ${meta.thresholds.hotDay} °C, média por ano`,
    hoverLabel: `dias acima de ${meta.thresholds.hotDay} °C, média por ano`,
    color: "var(--temp-hot-1)",
    baselineValue: baseline.years.daysAbove30,
  },
  {
    key: "daysAbove35",
    title: `Dias acima de ${meta.thresholds.veryHotDay} °C, média por ano`,
    hoverLabel: `dias acima de ${meta.thresholds.veryHotDay} °C, média por ano`,
    color: "var(--temp-hot-3)",
    baselineValue: baseline.years.daysAbove35,
  },
] as const;

// Altura reservada para o título de cada painel, espaço entre os painéis e
// faixa de baixo para os rótulos das décadas.
const titleHeight = 32;
const panelGap = 28;
const bottomMargin: Record<ChartLayout, number> = { narrow: 36, wide: 40, extraWide: 40 };
const leftMargin = 32;
const rightMargin = 4;

// Aviso embaixo da barra da década em andamento. No celular, a barra é
// estreita e o aviso precisa ser curto; a legenda traz o texto completo.
const partialLabel: Record<ChartLayout, string> = {
  narrow: "parcial",
  wide: "em andamento",
  extraWide: "em andamento",
};

// Primeiro e último ano de uma década, como "1950 a 1959". Na década em
// andamento, o último ano é o último ano completo nos dados.
export function getDecadeRange(decade: Decade): string {
  return `${decade.decade} a ${decade.decade + decade.yearCount - 1}`;
}

// Gráfico de barras dos dias de calor por década, em dois painéis empilhados
// que dividem o mesmo eixo de décadas. Roda no servidor: o SVG sai pronto no
// HTML. Só a camada de hover (ChartHover) roda no navegador.
export function ExtremesChart({ layout, width, height }: ChartSize) {
  const plotLeft = leftMargin;
  const plotRight = width - rightMargin;
  const panelHeight =
    (height - bottomMargin[layout] - titleHeight * 2 - panelGap) / 2;

  // `scaleBand` divide a largura em faixas iguais, uma por década, e devolve
  // onde cada barra começa e a largura dela. O `padding` é o espaço entre as
  // barras, como fração da faixa.
  const x = scaleBand<number>()
    .domain(decades.map((decade) => decade.decade))
    .range([plotLeft, plotRight])
    .padding(layout === "narrow" ? 0.25 : 0.35);

  const panelLayouts = panels.map((panel, index) => {
    const top = titleHeight + index * (panelHeight + panelGap + titleHeight);
    const bottom = top + panelHeight;
    // A folga de 25% no topo deixa espaço para o número em cima da barra
    // mais alta.
    const highest = max(decades, (decade) => decade[panel.key])!;
    const y = scaleLinear()
      .domain([0, highest * 1.25])
      .range([bottom, top])
      .nice();
    return { ...panel, top, bottom, y };
  });

  const firstPanel = panelLayouts[0];
  const lastPanel = panelLayouts.at(-1)!;

  const hoverPoints: HoverPoint[] = decades.map((decade) => ({
    x: x(decade.decade)! + x.bandwidth() / 2,
    title: decade.complete
      ? getDecadeRange(decade)
      : `${getDecadeRange(decade)} (década em andamento)`,
    rows: panels.map((panel) => ({
      label: panel.hoverLabel,
      value: formatNumber(decade[panel.key], { fractionDigits: 1 }),
    })),
  }));

  return (
    <ChartHover
      width={width}
      height={height}
      plotTop={firstPanel.top}
      plotBottom={lastPanel.bottom}
      points={hoverPoints}
      label="Dias de calor forte em cada década. Use as setas para andar pelas décadas."
    >
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {panelLayouts.map((panel) => (
          <g key={panel.key}>
            <text className={styles.panelTitle} x={0} y={panel.top - 20}>
              {panel.title}
            </text>

            {/* Grade horizontal e rótulos do eixo vertical. Poucas marcas,
                porque cada barra já traz o próprio número. */}
            {panel.y.ticks(3).map((tick) => (
              <g key={tick}>
                <line
                  className={styles.grid}
                  x1={plotLeft}
                  x2={plotRight}
                  y1={panel.y(tick)}
                  y2={panel.y(tick)}
                />
                {/* Número alinhado pela direita, logo antes do gráfico: mesmo com
                    as letras maiores das telas largas, ele nunca encosta nos dados. */}
                <text
                  className={styles.axisLabel}
                  x={plotLeft - 8}
                  y={panel.y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Barras. O `--index` é a ordem da década, para as barras
                crescerem uma depois da outra, da mais antiga para a mais
                recente (ver o CSS). */}
            {decades.map((decade, index) => {
              const barTop = panel.y(decade[panel.key]);
              return (
                <rect
                  key={decade.decade}
                  className={decade.complete ? styles.bar : `${styles.bar} ${styles.barPartial}`}
                  style={{ "--index": index } as CSSProperties}
                  x={x(decade.decade)}
                  y={barTop}
                  width={x.bandwidth()}
                  height={panel.bottom - barTop}
                  rx={2}
                  fill={panel.color}
                  stroke={panel.color}
                />
              );
            })}

            {/* Média de 1961 a 1990, a base de comparação. Fica por cima das
                barras para dar para ver quais décadas passaram dela. A
                primeira linha, mais grossa e na cor do fundo, separa o
                tracejado das barras claras. */}
            <line
              className={styles.baselineHalo}
              x1={plotLeft}
              x2={plotRight}
              y1={panel.y(panel.baselineValue)}
              y2={panel.y(panel.baselineValue)}
            />
            <line
              className={styles.baselineLine}
              x1={plotLeft}
              x2={plotRight}
              y1={panel.y(panel.baselineValue)}
              y2={panel.y(panel.baselineValue)}
            />

            {/* Número em cima de cada barra. Vem depois da linha da base
                para ficar por cima dela quando as duas se cruzam. */}
            {decades.map((decade, index) => (
              <text
                key={decade.decade}
                className={styles.valueLabel}
                style={{ "--index": index } as CSSProperties}
                x={x(decade.decade)! + x.bandwidth() / 2}
                y={panel.y(decade[panel.key]) - 6}
                textAnchor="middle"
              >
                {formatNumber(decade[panel.key], { fractionDigits: 1 })}
              </text>
            ))}
          </g>
        ))}

        {/* Rótulos das décadas, embaixo do último painel. */}
        {decades.map((decade) => {
          const center = x(decade.decade)! + x.bandwidth() / 2;
          return (
            <g key={decade.decade}>
              <text
                className={styles.axisLabel}
                x={center}
                y={lastPanel.bottom + 18}
                textAnchor="middle"
              >
                {decade.decade}
              </text>
              {!decade.complete && (
                <text
                  className={styles.partialLabel}
                  x={center}
                  y={lastPanel.bottom + 32}
                  textAnchor="middle"
                >
                  {partialLabel[layout]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </ChartHover>
  );
}
