import { describe, expect, it } from "vitest";
import {
  anomalyColors,
  anomalyThresholds,
  getAnomalyColor,
} from "./temperatureColor";

// Os limites dividem a faixa em 7 intervalos. Cada teste confere que um valor
// dentro do intervalo recebe a cor certa.
//
// Intervalos (escala threshold, limite inferior incluído):
//   anomalia < -0.7   → cold-3
//   -0.7  ≤ a < -0.4  → cold-2
//   -0.4  ≤ a < -0.15 → cold-1
//   -0.15 ≤ a < 0.15  → neutral
//   0.15  ≤ a < 0.4   → hot-1
//   0.4   ≤ a < 0.7   → hot-2
//   0.7   ≤ a          → hot-3

describe("getAnomalyColor", () => {
  it("devolve a cor mais fria para anomalia bem abaixo de -0,7", () => {
    expect(getAnomalyColor(-1.5)).toBe("var(--temp-cold-3)");
  });

  it("passa para cold-2 no limite exato de -0,7", () => {
    expect(getAnomalyColor(-0.7)).toBe("var(--temp-cold-2)");
  });

  it("passa para cold-1 no limite exato de -0,4", () => {
    expect(getAnomalyColor(-0.4)).toBe("var(--temp-cold-1)");
  });

  it("passa para neutro no limite exato de -0,15", () => {
    expect(getAnomalyColor(-0.15)).toBe("var(--temp-neutral)");
  });

  it("devolve neutro para anomalia zero", () => {
    expect(getAnomalyColor(0)).toBe("var(--temp-neutral)");
  });

  it("passa para hot-1 no limite exato de 0,15", () => {
    expect(getAnomalyColor(0.15)).toBe("var(--temp-hot-1)");
  });

  it("passa para hot-2 no limite exato de 0,4", () => {
    expect(getAnomalyColor(0.4)).toBe("var(--temp-hot-2)");
  });

  it("passa para hot-3 no limite exato de 0,7", () => {
    expect(getAnomalyColor(0.7)).toBe("var(--temp-hot-3)");
  });

  it("devolve a cor mais quente para anomalia bem acima de 0,7", () => {
    expect(getAnomalyColor(1.5)).toBe("var(--temp-hot-3)");
  });
});

describe("constantes exportadas", () => {
  it("tem 6 limites e 7 cores, um a mais que os limites", () => {
    expect(anomalyThresholds).toHaveLength(6);
    expect(anomalyColors).toHaveLength(7);
  });

  it("os limites estão em ordem crescente", () => {
    for (let i = 1; i < anomalyThresholds.length; i++) {
      expect(anomalyThresholds[i]).toBeGreaterThan(anomalyThresholds[i - 1]);
    }
  });
});
