import { portfolioUrl, repositoryUrl } from "@/lib/site";
import styles from "./Footer.module.css";

// Rodapé curto, depois do <main>: quem fez e onde está o código. Fontes e
// metodologia não entram aqui: ficam no capítulo 5, porque fazem parte da
// matéria.
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.line}>
          {/* O leitor de tela lê "Feito com amor por", em vez do nome do
              emoji ("coração laranja"). */}
          Feito com{" "}
          <span role="img" aria-label="amor">
            🧡
          </span>{" "}
          por <a href={portfolioUrl}>Flávia Figueredo</a>
        </p>
        <p className={styles.line}>
          <a href={repositoryUrl}>Código no GitHub</a>
        </p>
      </div>
    </footer>
  );
}
