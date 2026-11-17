import type { ReactNode } from "react";
import styles from "./ChartFigure.module.css";
import { Reveal } from "./Reveal";

type ChartFigureProps = {
  // Legenda das cores ou marcas, acima do gráfico.
  legend?: ReactNode;
  // Descrição em texto do que o gráfico mostra, abaixo dele.
  description: ReactNode;
  // Tabela com os números, para quem não vê o gráfico ou quer os valores.
  table?: ReactNode;
  children: ReactNode;
};

// Moldura comum a todos os gráficos: legenda, gráfico com animação de
// entrada, descrição em texto e tabela. O desenho do gráfico fica oculto
// para leitores de tela; para eles, a descrição e a tabela contam o mesmo.
export function ChartFigure({ legend, description, table, children }: ChartFigureProps) {
  return (
    <figure className={styles.figure}>
      {legend}
      <Reveal>{children}</Reveal>
      <figcaption className={styles.caption}>{description}</figcaption>
      {table}
    </figure>
  );
}
