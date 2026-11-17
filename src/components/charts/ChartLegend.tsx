import styles from "./ChartLegend.module.css";

// Cada item da legenda tem uma marca no mesmo formato da marca do gráfico:
// ponto para pontos, traço para linhas.
export type LegendItem =
  | { kind: "dot"; color: string; label: string }
  | { kind: "line"; color: string; label: string; dashed?: boolean };

// Legenda acima do gráfico. O texto fica sempre na cor de texto; só a marca
// ao lado leva a cor do dado.
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className={styles.legend}>
      {items.map((item) => (
        <li key={item.label} className={styles.item}>
          <svg className={styles.key} viewBox="0 0 16 10" aria-hidden="true">
            {item.kind === "dot" ? (
              <circle cx={8} cy={5} r={4} fill={item.color} />
            ) : (
              <line
                x1={1}
                x2={15}
                y1={5}
                y2={5}
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray={item.dashed ? "3 3" : undefined}
              />
            )}
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
