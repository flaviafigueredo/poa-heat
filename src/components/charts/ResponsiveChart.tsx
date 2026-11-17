import type { ReactNode } from "react";
import styles from "./ResponsiveChart.module.css";

export type ChartLayout = "narrow" | "wide" | "extraWide";

export type ChartSize = {
  layout: ChartLayout;
  width: number;
  height: number;
};

type ChartSizes = Record<ChartLayout, ChartSize>;

// Medidas padrão, em unidades do viewBox. Elas ficam perto do tamanho real
// em pixels de cada tela, então texto e pontos saem do tamanho certo sem
// encolher nem crescer demais. A versão extralarga é mais achatada: numa
// coluna de quase 2000px, a proporção da versão larga deixaria o gráfico
// mais alto que a tela.
export const defaultChartSizes = {
  narrow: { layout: "narrow", width: 360, height: 300 },
  wide: { layout: "wide", width: 720, height: 380 },
  extraWide: { layout: "extraWide", width: 1200, height: 420 },
} satisfies ChartSizes;

type ResponsiveChartProps = {
  sizes?: ChartSizes;
  render: (size: ChartSize) => ReactNode;
};

// Desenha o gráfico uma vez para cada faixa de tela (celular, larga e
// extralarga), e o CSS mostra só a certa. Assim todas saem prontas no HTML
// do build, sem esperar o JavaScript medir a tela, e cada uma tem rótulos e
// espaçamento pensados para o seu tamanho.
export function ResponsiveChart({ sizes = defaultChartSizes, render }: ResponsiveChartProps) {
  return (
    <>
      <div className={styles.narrow}>{render(sizes.narrow)}</div>
      <div className={styles.wide}>{render(sizes.wide)}</div>
      <div className={styles.extraWide}>{render(sizes.extraWide)}</div>
    </>
  );
}
