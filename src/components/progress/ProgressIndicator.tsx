"use client";

import { useEffect, useState } from "react";
import styles from "./ProgressIndicator.module.css";

type Section = { label: string; element: HTMLElement };

// Indicador discreto de progresso da leitura. Na tela larga, um pontinho por
// seção na margem direita, com o atual destacado; clicar leva até a seção.
// No celular, uma linha fina no topo que enche conforme a leitura avança.
// Os dois só aparecem depois da abertura.
//
// As seções são achadas pelo atributo `data-progress-label`, que cada uma
// leva com o próprio nome. Assim não há lista escrita à mão para manter.
export function ProgressIndicator() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>("[data-progress-label]")];
    const found = elements.map((element) => ({
      label: element.dataset.progressLabel!,
      element,
    }));
    if (found.length === 0) return;

    // A cada rolagem, no máximo uma conta por quadro da tela
    // (requestAnimationFrame), para não pesar no celular.
    let frame = 0;
    function update() {
      frame = 0;
      const viewport = window.innerHeight;
      const start = found[0].element.offsetTop;
      const end = document.documentElement.scrollHeight - viewport;

      // Aparece quando a primeira seção depois da abertura chega à metade
      // da tela.
      setIsVisible(window.scrollY + viewport / 2 >= start);

      // Progresso de 0 a 1, contado do começo do capítulo 1 até o fim da
      // página.
      setProgress(Math.min(Math.max((window.scrollY - start) / (end - start), 0), 1));

      // Seção atual: a última cujo topo já passou da metade da tela.
      let current = -1;
      found.forEach((section, index) => {
        if (section.element.getBoundingClientRect().top <= viewport / 2) current = index;
      });
      setActiveIndex(current);
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    // Primeira leitura no próximo quadro da tela, junto com a lista de
    // seções. Depois, a cada rolagem ou mudança de tamanho da janela.
    frame = requestAnimationFrame(() => {
      setSections(found);
      update();
    });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Leva até a seção. Quem desativou animações vai direto, sem rolagem suave.
  function goTo(element: HTMLElement) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  if (sections.length === 0) return null;

  return (
    <>
      {/* Celular: linha fina no topo. É só visual; a navegação pelo teclado
          e pelo leitor de tela fica com os botões da tela larga e com os
          títulos das seções. */}
      <div
        className={styles.bar}
        data-visible={isVisible}
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      {/* Tela larga: um botão por seção. */}
      <nav className={styles.dots} data-visible={isVisible} aria-label="Seções da matéria">
        <ol className={styles.list}>
          {sections.map((section, index) => (
            <li key={section.label}>
              <button
                type="button"
                className={styles.dot}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => goTo(section.element)}
                // Escondido, o indicador também sai da ordem do teclado.
                tabIndex={isVisible ? 0 : -1}
              >
                <span className={styles.label}>{section.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
