import { useId, type ReactNode } from "react";
import styles from "./Dashboard.module.css";

type PanelProps = {
  // Lugar do painel na grade (ver as áreas em Dashboard.module.css).
  area: "stripes" | "records" | "year" | "summers";
  title: string;
  // Frase curta dizendo o que o painel mostra.
  description: ReactNode;
  children: ReactNode;
};

// Moldura comum dos painéis do "Explore os dados". O `data-glow` marca o
// painel para a luz que segue o cursor (ver GlowGrid).
export function Panel({ area, title, description, children }: PanelProps) {
  const titleId = useId();

  return (
    <article
      className={`${styles.panel} ${styles[area]}`}
      aria-labelledby={titleId}
      data-glow
    >
      <h3 id={titleId} className={styles.panelTitle}>
        {title}
      </h3>
      <p className={styles.panelDescription}>{description}</p>
      {children}
    </article>
  );
}
