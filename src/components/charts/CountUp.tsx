"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";

type CountUpProps = {
  value: number;
  fractionDigits?: number;
  signed?: boolean;
  // Texto depois do número, como " °C".
  suffix?: string;
};

const durationMs = 1400;

// Número que conta de zero até o valor final quando entra na tela. O HTML do
// build já traz o valor final, então sem JavaScript (ou com animações
// desativadas) a pessoa vê direto o número certo.
export function CountUp({ value, fractionDigits = 0, signed = false, suffix = "" }: CountUpProps) {
  const [ref, reveal] = useReveal<HTMLSpanElement>();
  // Fração da animação já percorrida, de 0 a 1. Fica `null` até o primeiro
  // quadro da animação.
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (reveal !== "visible") return;

    // A cada quadro, calcula quanto do tempo já passou.
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = Math.min((now - start) / durationMs, 1);
      setProgress(elapsed);
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [reveal]);

  // Fora da tela, esperando a vez, o número fica em zero. Na animação, a
  // curva "ease out" começa rápido e desacelera perto do fim, como um
  // ponteiro que assenta no número. Nos outros casos, mostra o valor final.
  let shown = value;
  if (reveal === "hidden" || (reveal === "visible" && progress === null)) {
    shown = 0;
  } else if (reveal === "visible" && progress !== null) {
    shown = value * (1 - (1 - progress) ** 3);
  }

  const finalText = `${formatNumber(value, { fractionDigits, signed })}${suffix}`;

  return (
    <span ref={ref}>
      {/* O leitor de tela lê só o valor final, não cada passo da contagem. */}
      <span className="visually-hidden">{finalText}</span>
      <span aria-hidden="true">
        {formatNumber(shown, { fractionDigits, signed })}
        {suffix}
      </span>
    </span>
  );
}
