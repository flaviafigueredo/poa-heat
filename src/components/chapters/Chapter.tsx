import { useId, type ReactNode } from "react";
import styles from "./Chapter.module.css";

type ChapterProps = {
  // Rótulo curto acima do título, como "Capítulo 1 · A tendência".
  kicker: string;
  title: string;
  // Número em destaque e a legenda dele (ver HighlightNumber).
  highlight: ReactNode;
  // O gráfico do capítulo (ver ChartFigure).
  figure: ReactNode;
  // O texto corrido do capítulo (ver Prose).
  children: ReactNode;
};

// Estrutura comum dos capítulos 1 a 4, na ordem do design: título, número em
// destaque, texto e gráfico. Sem caixa em volta: a seção se organiza só com
// espaço e tipografia. Em telas largas, texto e gráfico ficam lado a lado
// (ver o CSS).
export function Chapter({ kicker, title, highlight, figure, children }: ChapterProps) {
  const titleId = useId();

  return (
    <section className={styles.chapter} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <div className={styles.textColumn}>
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {highlight}
          {children}
        </div>
        <div className={styles.figureColumn}>{figure}</div>
      </div>
    </section>
  );
}
