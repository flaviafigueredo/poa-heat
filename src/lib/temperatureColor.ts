import { scaleThreshold } from "d3-scale";

// Converte a diferença para a média de 1961 a 1990 numa das sete cores da
// paleta de temperatura (definida em globals.css). Perto de zero fica cinza;
// quanto mais longe, mais forte o azul (mais frio) ou o laranja (mais
// quente). Os limites cobrem a faixa real dos dados, que vai de cerca de
// -0,8 °C a +1,1 °C.
//
// `scaleThreshold` funciona como uma régua com marcas: cada valor cai no
// intervalo entre duas marcas e recebe a cor daquele intervalo.
//
// Os limites e as cores ficam exportados para a legenda das Listras do
// painel final mostrar a régua inteira.
export const anomalyThresholds = [-0.7, -0.4, -0.15, 0.15, 0.4, 0.7];
export const anomalyColors = [
  "var(--temp-cold-3)",
  "var(--temp-cold-2)",
  "var(--temp-cold-1)",
  "var(--temp-neutral)",
  "var(--temp-hot-1)",
  "var(--temp-hot-2)",
  "var(--temp-hot-3)",
];

const anomalyColor = scaleThreshold<number, string>()
  .domain(anomalyThresholds)
  .range(anomalyColors);

export function getAnomalyColor(anomaly: number): string {
  return anomalyColor(anomaly);
}
