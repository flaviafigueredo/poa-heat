"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./Dashboard.module.css";

// Grade do painel final com a luz que segue o cursor. A cada movimento do
// mouse (ou toque), passa para cada painel a posição do ponteiro em relação
// a ele, nas variáveis --glow-x e --glow-y. O desenho da luz é todo no CSS
// (ver Dashboard.module.css). Como todos os painéis recebem a posição, a
// borda dos vizinhos também acende quando o cursor passa perto deles.
export function GlowGrid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function updateGlow(event: PointerEvent<HTMLDivElement>) {
    const grid = ref.current;
    if (!grid) return;

    for (const panel of grid.querySelectorAll<HTMLElement>("[data-glow]")) {
      const box = panel.getBoundingClientRect();
      panel.style.setProperty("--glow-x", `${event.clientX - box.left}px`);
      panel.style.setProperty("--glow-y", `${event.clientY - box.top}px`);
    }
    grid.dataset.glowActive = "true";
  }

  return (
    <div
      ref={ref}
      className={styles.grid}
      onPointerMove={updateGlow}
      onPointerDown={updateGlow}
      onPointerLeave={(event) => {
        // No toque, a luz fica onde o dedo tocou por último.
        if (event.pointerType === "mouse" && ref.current) {
          ref.current.dataset.glowActive = "false";
        }
      }}
    >
      {children}
    </div>
  );
}
