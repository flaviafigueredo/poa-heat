"use client";

import { useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import styles from "./ChartHover.module.css";

// Um ponto que o balão pode mostrar. Os textos chegam prontos do servidor,
// já formatados: aqui só se escolhe qual ponto mostrar.
export type HoverPoint = {
  x: number;
  y: number;
  color: string;
  title: string;
  rows: { label: string; value: string }[];
};

type ChartHoverProps = {
  width: number;
  height: number;
  // Faixa vertical da área do gráfico, onde a linha guia é desenhada.
  plotTop: number;
  plotBottom: number;
  points: HoverPoint[];
  // Explica para leitores de tela como usar o teclado neste gráfico.
  label: string;
  children: ReactNode;
};

// Camada interativa por cima de um gráfico SVG feito no servidor. Ao passar
// o mouse, tocar ou usar as setas do teclado, mostra uma linha guia vertical
// no ponto mais próximo e um balão com os valores dele.
export function ChartHover({
  width,
  height,
  plotTop,
  plotBottom,
  points,
  label,
  children,
}: ChartHoverProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : points[activeIndex];

  // Acha o ponto mais próximo do cursor no eixo horizontal. A posição do
  // mouse vem em pixels da tela e é convertida para as unidades do viewBox,
  // porque o SVG pode estar maior ou menor que o tamanho desenhado.
  function handlePointer(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const pointerX = ((event.clientX - box.left) / box.width) * width;

    let nearest = 0;
    for (let index = 1; index < points.length; index++) {
      if (Math.abs(points[index].x - pointerX) < Math.abs(points[nearest].x - pointerX)) {
        nearest = index;
      }
    }
    setActiveIndex(nearest);
  }

  // Setas andam um ponto; Home e End vão para o primeiro e o último.
  function handleKeyDown(event: KeyboardEvent<SVGRectElement>) {
    const last = points.length - 1;
    const current = activeIndex ?? last;
    const next = {
      ArrowLeft: Math.max(current - 1, 0),
      ArrowRight: Math.min(current + 1, last),
      Home: 0,
      End: last,
    }[event.key];

    if (next !== undefined) {
      event.preventDefault();
      setActiveIndex(next);
    }
  }

  // O balão fica ao lado da linha guia, nunca em cima do ponto ativo: à
  // direita dela na metade esquerda do gráfico, e à esquerda na metade
  // direita. Assim ele sempre tem espaço e não sai do gráfico.
  const horizontalPosition = active ? active.x / width : 0;
  const tooltipSide = horizontalPosition > 0.5 ? "left" : "right";

  return (
    <div className={styles.wrapper}>
      {children}

      <svg className={styles.overlay} viewBox={`0 0 ${width} ${height}`}>
        {active && (
          <g aria-hidden="true">
            <line
              className={styles.guide}
              x1={active.x}
              x2={active.x}
              y1={plotTop}
              y2={plotBottom}
            />
            <circle
              className={styles.activeDot}
              cx={active.x}
              cy={active.y}
              r={6}
              fill={active.color}
            />
          </g>
        )}

        {/* Retângulo transparente que recebe o mouse, o toque e o foco do
            teclado. Ele cobre o gráfico todo, então não é preciso acertar
            em cima de um ponto pequeno. */}
        <rect
          className={styles.hitArea}
          x={0}
          y={0}
          width={width}
          height={height}
          tabIndex={0}
          role="application"
          aria-label={label}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={(event) => {
            // No toque, o balão fica aberto depois que o dedo sai da tela.
            if (event.pointerType === "mouse") setActiveIndex(null);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setActiveIndex((current) => current ?? points.length - 1)}
          onBlur={() => setActiveIndex(null)}
        />
      </svg>

      {active && (
        <div
          className={styles.tooltip}
          data-side={tooltipSide}
          style={{ left: `${horizontalPosition * 100}%` }}
          aria-live="polite"
        >
          <p className={styles.tooltipTitle}>{active.title}</p>
          <dl className={styles.tooltipRows}>
            {active.rows.map((row) => (
              <div key={row.label} className={styles.tooltipRow}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
