import { describe, expect, it } from "vitest";
import { formatDate, formatNumber, formatTemperature } from "./format";

describe("formatNumber", () => {
  it("formata inteiro no padrão brasileiro, com ponto de milhar", () => {
    expect(formatNumber(1234)).toBe("1.234");
  });

  it("mostra as casas decimais pedidas, com vírgula", () => {
    expect(formatNumber(19.261, { fractionDigits: 1 })).toBe("19,3");
    expect(formatNumber(19.261, { fractionDigits: 2 })).toBe("19,26");
  });

  it("completa com zeros quando o número tem menos casas que o pedido", () => {
    expect(formatNumber(5, { fractionDigits: 2 })).toBe("5,00");
  });

  it("mostra sinal de + nos positivos quando signed é true", () => {
    expect(formatNumber(0.5, { fractionDigits: 1, signed: true })).toBe("+0,5");
  });

  it("mostra sinal de - nos negativos, com e sem signed", () => {
    expect(formatNumber(-0.5, { fractionDigits: 1 })).toBe("-0,5");
    expect(formatNumber(-0.5, { fractionDigits: 1, signed: true })).toBe("-0,5");
  });

  it("não mostra sinal no zero, mesmo com signed", () => {
    expect(formatNumber(0, { signed: true })).toBe("0");
  });
});

describe("formatTemperature", () => {
  it("junta o número com a unidade, separada por espaço que não quebra", () => {
    const result = formatTemperature(19.3);
    // O espaço entre o número e "°C" é um non-breaking space (U+00A0).
    expect(result).toBe("19,3 °C");
  });

  it("usa uma casa decimal por padrão", () => {
    expect(formatTemperature(20)).toBe("20,0 °C");
  });

  it("aceita signed para diferenças de temperatura", () => {
    expect(formatTemperature(0.5, { signed: true })).toBe("+0,5 °C");
  });

  it("aceita fractionDigits diferente do padrão", () => {
    expect(formatTemperature(19.26, { fractionDigits: 2 })).toBe("19,26 °C");
  });
});

describe("formatDate", () => {
  it("escreve a data por extenso em português", () => {
    expect(formatDate("2026-11-16")).toBe("16 de novembro de 2026");
  });

  it("coloca º no primeiro dia do mês", () => {
    expect(formatDate("1950-01-01")).toBe("1º de janeiro de 1950");
  });

  it("não coloca º nos outros dias", () => {
    expect(formatDate("2026-12-31")).toBe("31 de dezembro de 2026");
  });

  it("lida com 29 de fevereiro de ano bissexto", () => {
    expect(formatDate("2024-02-29")).toBe("29 de fevereiro de 2024");
  });
});
