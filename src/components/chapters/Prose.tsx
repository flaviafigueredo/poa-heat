import type { ReactNode } from "react";
import styles from "./Prose.module.css";

// Bloco de texto corrido dos capítulos, com largura confortável de leitura.
export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
