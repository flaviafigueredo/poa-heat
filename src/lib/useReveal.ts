"use client";

import { useEffect, useRef, useState } from "react";

// Estado da animação de entrada de um elemento:
// - "static": nada a animar. É o estado do HTML gerado no build, então quem
//   ainda não carregou o JavaScript já vê o gráfico pronto.
// - "hidden": o elemento ainda está fora da tela e espera para aparecer.
// - "visible": o elemento entrou na tela e a animação roda.
export type RevealState = "static" | "hidden" | "visible";

// Fração do elemento que precisa estar na tela para a animação começar.
const visibleThreshold = 0.35;

// Observa quando o elemento entra na tela, para animar só nesse momento.
// Quem ativou `prefers-reduced-motion` fica sempre em "static". Se o
// elemento já estiver na tela quando a página carrega, também fica em
// "static": esconder e mostrar de novo algo que a pessoa já está vendo
// pareceria um defeito.
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let isFirstCheck = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // `isIntersecting` fica verdadeiro com qualquer pedacinho na tela.
        // A fração visível garante que a pessoa veja a animação acontecer.
        if (entry.intersectionRatio >= visibleThreshold) {
          if (!isFirstCheck) {
            setState("visible");
          }
          observer.disconnect();
        } else if (isFirstCheck) {
          setState("hidden");
        }
        isFirstCheck = false;
      },
      { threshold: visibleThreshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, state] as const;
}
