"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

type RevealProps = {
  className?: string;
  children: ReactNode;
};

// Marca o conteúdo com `data-reveal` ("static", "hidden" ou "visible"). Cada
// gráfico decide no próprio CSS como animar a partir desse atributo. O
// conteúdo em si pode vir do servidor: este componente só liga o observador.
export function Reveal({ className, children }: RevealProps) {
  const [ref, reveal] = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={className} data-reveal={reveal}>
      {children}
    </div>
  );
}
