import { useId } from "react";
import { siteTitle } from "@/lib/site";
import { seriesLengthText, seriesStartYear } from "@/lib/temperatureData";
import { GlobeLoader } from "./GlobeLoader";
import styles from "./Opening.module.css";
import { Starfield } from "./Starfield";

// A abertura é feita de camadas empilhadas, de trás para a frente:
// estrelas, globo, um véu escuro que garante a leitura do texto, e o texto.
export function Opening() {
  // Id único gerado pelo React, para ligar a seção ao título sem risco de
  // repetir o mesmo id se o componente aparecer mais de uma vez.
  const titleId = useId();

  return (
    <section className={styles.opening} aria-labelledby={titleId}>
      <Starfield />

      {/* Para leitores de tela, o globo inteiro vira uma imagem com descrição.
          O canvas e o marcador lá dentro ficam ocultos para eles. A descrição
          não fala do zoom porque quem desativa animações não vê o movimento. */}
      <div
        className={styles.globeSlot}
        role="img"
        aria-label="Globo terrestre em 3D, visto do espaço, com Porto Alegre, no sul do Brasil, marcada com um ponto."
      >
        <GlobeLoader />
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.text}>
        <p className={styles.kicker}>Clima · Porto Alegre</p>
        <h1 id={titleId} className={styles.title}>
          {siteTitle}
        </h1>
        <p className={styles.dek}>
          {seriesLengthText} de temperatura diária, de {seriesStartYear} até hoje,
          mostram o que mudou nos dias e nas noites da cidade.
        </p>
      </div>
    </section>
  );
}
