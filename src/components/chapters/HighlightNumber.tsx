import type { ComponentProps } from "react";
import { CountUp } from "@/components/charts/CountUp";
import styles from "./HighlightNumber.module.css";

type HighlightNumberProps = ComponentProps<typeof CountUp> & {
  // Frase curta que dá sentido ao número, logo abaixo dele.
  caption: string;
};

// Número grande que abre cada capítulo, com a legenda embaixo.
export function HighlightNumber({ caption, ...countUpProps }: HighlightNumberProps) {
  return (
    <p className={styles.highlight}>
      <span className={styles.value}>
        <CountUp {...countUpProps} />
      </span>
      <span className={styles.caption}>{caption}</span>
    </p>
  );
}
