import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import styles from "./SummerChart.module.css";
import type { ChartLayout, ChartSize } from "./ResponsiveChart";

const { comparison, meta } = temperatureData;
const { baseline, recent } = comparison;

// Dias de um verão: dezembro (31), janeiro (31) e fevereiro (28). O ano
// bissexto tem um dia a mais, que não muda a leitura do gráfico.
export const summerDays = 90;

// Quantos quadradinhos por linha em cada tela. 90 dias cabem certinho em
// 6 linhas de 15 (celular), 3 de 30 (larga) ou 2 de 45 (extralarga).
const columns: Record<ChartLayout, number> = { narrow: 15, wide: 30, extraWide: 45 };

// Altura da linha do rótulo acima de cada grade e espaço entre as grades.
const labelHeight = 54;
const groupGap = 32;

// Altura do gráfico para uma largura e um layout: dois grupos, cada um com
// rótulo e grade.
export function getSummerChartHeight(layout: ChartLayout, width: number): number {
  const pitch = width / columns[layout];
  const rows = Math.ceil(summerDays / columns[layout]);
  return Math.ceil(2 * (labelHeight + rows * pitch) + groupGap);
}

const groups = [
  {
    key: "recent",
    label: `O teu verão (${recent.summers.startYear} a ${recent.summers.endYear})`,
    value: recent.summers.daysAbove35,
  },
  {
    key: "baseline",
    label: `O verão dos teus pais (${baseline.startYear} a ${baseline.endYear})`,
    value: baseline.summers.daysAbove35,
  },
] as const;

// Gráfico de quadradinhos: cada quadradinho é um dia do verão, e os acesos
// são os dias acima de 35 °C num verão típico de cada período. Como o valor
// é uma média (5,9, por exemplo), o último quadradinho aceso é preenchido só
// pela fração, sem arredondar o dado. Roda no servidor; não tem parte no
// navegador além da animação de entrada, feita no CSS.
export function SummerChart({ layout, width, height }: ChartSize) {
  const cols = columns[layout];
  const pitch = width / cols;
  // O quadradinho ocupa 80% do passo; o resto é o espaço entre eles.
  const cell = pitch * 0.8;
  const rows = Math.ceil(summerDays / cols);
  const groupHeight = labelHeight + rows * pitch;

  return (
    <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {groups.map((group, groupIndex) => {
        const top = groupIndex * (groupHeight + groupGap);
        const fullDays = Math.floor(group.value);
        const fraction = group.value - fullDays;

        return (
          <g key={group.key} transform={`translate(0 ${top})`}>
            {/* Rótulo em duas linhas, para caber no celular: o período em
                cima e o número embaixo. */}
            <text className={styles.label} x={0} y={16}>
              {group.label}
            </text>
            <text className={styles.labelValue} x={0} y={40}>
              {formatNumber(group.value, { fractionDigits: 1 })} dias acima de{" "}
              {meta.thresholds.veryHotDay}&nbsp;°C
            </text>

            {Array.from({ length: summerDays }, (_, day) => {
              const x = (day % cols) * pitch;
              const y = labelHeight + Math.floor(day / cols) * pitch;
              // Dias inteiros acesos e, logo depois, o dia da fração.
              const litWidth = day < fullDays ? cell : day === fullDays ? cell * fraction : 0;

              return (
                <g key={day}>
                  <rect className={styles.day} x={x} y={y} width={cell} height={cell} rx={2} />
                  {litWidth > 0 && (
                    <rect
                      className={styles.hotDay}
                      // Ordem do dia aceso, para eles acenderem um de cada
                      // vez (ver o CSS).
                      style={{ "--index": day } as CSSProperties}
                      x={x}
                      y={y}
                      width={litWidth}
                      height={cell}
                      rx={2}
                    />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
